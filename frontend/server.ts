import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { generateMarketResearchWithGemini, consultAgentWithGemini } from './src/utils/geminiServer';
import { createFallbackReport } from './src/utils/fallbackReport';
import { PRESET_IDEAS } from './src/data/presetIdeas';

dotenv.config();

const FASTAPI_BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://127.0.0.1:8000';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get pre-configured preset research ideas
  app.get('/api/preset-ideas', (req, res) => {
    res.json({ success: true, presets: PRESET_IDEAS });
  });

  // Endpoint to run autonomous market research agent via Python FastAPI + LangGraph Backend
  app.post('/api/research/analyze', async (req, res) => {
    try {
      const { title, description, targetIndustry, targetRegion, targetPriceRange, businessModel, depthLevel } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
      }

      const startupIdea = `${title}: ${description} (${targetIndustry}, ${businessModel}, ${targetRegion})`;
      console.log(`[Frontend Server] Forwarding research request to Python backend: "${startupIdea}"`);

      // 1. Kickoff LangGraph pipeline job on FastAPI backend
      try {
        const startRes = await fetch(`${FASTAPI_BACKEND_URL}/research`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea: startupIdea }),
        });

        if (startRes.ok) {
          const { job_id } = await startRes.json();
          console.log(`[Frontend Server] Python backend job created: ${job_id}. Polling status...`);

          // 2. Poll Python backend job until completion (up to 45s)
          let finalJob: any = null;
          for (let i = 0; i < 30; i++) {
            await new Promise((r) => setTimeout(r, 1500));
            const pollRes = await fetch(`${FASTAPI_BACKEND_URL}/research/${job_id}`);
            if (pollRes.ok) {
              const statusData = await pollRes.json();
              if (statusData.status === 'complete' || statusData.status === 'failed') {
                finalJob = statusData;
                break;
              }
            }
          }

          if (finalJob && finalJob.status === 'complete') {
            console.log(`[Frontend Server] Python pipeline complete. PDF available at: ${finalJob.report_pdf_path}`);
            // Generate full report structure for frontend UI view while embedding the real backend PDF download link
            const input = {
              title,
              description,
              targetIndustry: targetIndustry || 'General Technology',
              targetRegion: targetRegion || 'Global',
              targetPriceRange: targetPriceRange || 'Unspecified',
              businessModel: businessModel || 'B2B',
              depthLevel: depthLevel || 'exhaustive_20_page',
            };
            const report = await generateMarketResearchWithGemini(input);
            report.pdfDownloadUrl = `${FASTAPI_BACKEND_URL}${finalJob.report_pdf_path}`;
            return res.json({ success: true, report, jobId: job_id, pdfUrl: report.pdfDownloadUrl });
          }
        }
      } catch (backendError) {
        console.warn(`[Frontend Server] Python backend integration warning: ${backendError}. Using local fallback.`);
      }

      // Fallback if Python backend is offline
      const input = {
        title,
        description,
        targetIndustry: targetIndustry || 'General Technology',
        targetRegion: targetRegion || 'Global',
        targetPriceRange: targetPriceRange || 'Unspecified',
        businessModel: businessModel || 'B2B',
        depthLevel: depthLevel || 'exhaustive_20_page',
      };

      try {
        const report = await generateMarketResearchWithGemini(input);
        return res.json({ success: true, report });
      } catch (geminiErr: any) {
        console.warn('[Gemini API Warning]', geminiErr?.message || geminiErr, '- Generating local research report fallback.');
        const fallbackReport = createFallbackReport(input);
        return res.json({ success: true, report: fallbackReport });
      }
    } catch (error: any) {
      console.error('[Research Agent Error]', error);
      const fallbackReport = createFallbackReport({
        title: req.body?.title || 'Market Research Idea',
        description: req.body?.description || 'Technology Solution',
        targetIndustry: 'Technology',
        targetRegion: 'Global',
        businessModel: 'B2B',
        depthLevel: 'exhaustive_20_page',
      });
      return res.json({ success: true, report: fallbackReport });
    }
  });

  // Agent Chatbot Consultation Endpoint
  app.post('/api/agent/consult', async (req, res) => {
    try {
      const { agentType, prompt, report } = req.body;
      if (!agentType || !prompt) {
        return res.status(400).json({ error: 'agentType and prompt are required.' });
      }

      if (process.env.GEMINI_API_KEY) {
        try {
          const reply = await consultAgentWithGemini({ agentType, prompt, report });
          return res.json({ success: true, reply });
        } catch (geminiErr) {
          console.warn('[Gemini Agent Consult Warning]', geminiErr, '- Falling back to client agent helper.');
        }
      }

      // If GEMINI_API_KEY is not configured or failed, client helper will handle dynamic response
      return res.json({ success: false, fallback: true });
    } catch (err: any) {
      console.error('[Agent Consult Error]', err);
      return res.json({ success: false, fallback: true });
    }
  });

  // Proxy /reports downloads directly to Python backend
  app.get('/api/reports/:filename', async (req, res) => {
    try {
      const pdfRes = await fetch(`${FASTAPI_BACKEND_URL}/reports/${req.params.filename}`);
      if (!pdfRes.ok) return res.status(404).send('PDF not found');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
      const buffer = await pdfRes.arrayBuffer();
      return res.send(Buffer.from(buffer));
    } catch (e) {
      return res.status(500).send('Error fetching PDF report');
    }
  });

  // Get all research jobs stored in MongoDB
  app.get('/api/jobs', async (req, res) => {
    try {
      const jobsRes = await fetch(`${FASTAPI_BACKEND_URL}/research-jobs`);
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        return res.json({ success: true, jobs: data.jobs || [] });
      }
      return res.json({ success: false, jobs: [] });
    } catch (e) {
      return res.json({ success: false, jobs: [], error: String(e) });
    }
  });

  // Vite middleware for development vs static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Autonomus Market Research Agent Server listening on http://localhost:${PORT}`);
  });
}

startServer();
