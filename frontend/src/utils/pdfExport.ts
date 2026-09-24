import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportReportToPDF(
  containerId: string,
  fileName: string = 'Market_Research_Report.pdf',
  onProgress?: (status: string) => void
): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Report element with ID #${containerId} not found.`);
  }

  // Save user's current scroll position and scroll to top for html2canvas alignment
  const savedScrollX = window.scrollX;
  const savedScrollY = window.scrollY;
  window.scrollTo(0, 0);
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    onProgress?.('Preparing document pages...');

    // Query all individual report pages within the container
    const pageElements = Array.from(
      container.querySelectorAll<HTMLElement>('[id^="report-page-"]')
    );

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    let addedPagesCount = 0;

    if (pageElements.length === 0) {
      // Fallback if individual page wrappers are missing
      onProgress?.('Capturing full report...');
      const canvas = await html2canvas(container, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const imgHeight = (canvas.height * pdfWidth) / (canvas.width || 1);
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      addedPagesCount++;
    } else {
      // Process page by page for crisp, crash-free 20-page PDF rendering
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        onProgress?.(`Processing page ${i + 1} of ${pageElements.length}...`);

        try {
          // Temporarily scroll page element into view to guarantee visibility
          pageEl.scrollIntoView({ block: 'start', inline: 'nearest' });
          await new Promise((resolve) => setTimeout(resolve, 40));

          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: 0,
            windowWidth: 1200,
            onclone: (clonedDoc, clonedEl) => {
              if (clonedEl) {
                clonedEl.style.transform = 'none';
                clonedEl.style.boxShadow = 'none';
                clonedEl.style.margin = '0 auto';
                clonedEl.style.backgroundColor = '#ffffff';
                clonedEl.style.color = '#0f172a';
                clonedEl.style.opacity = '1';
                clonedEl.style.display = 'block';

                // Inline computed styles to resolve Tailwind CSS v4 custom variables for html2canvas
                const elements = clonedEl.querySelectorAll<HTMLElement>('*');
                elements.forEach((el) => {
                  try {
                    const style = window.getComputedStyle(el);
                    if (style.color && style.color !== 'rgba(0, 0, 0, 0)') {
                      el.style.color = style.color;
                    }
                    if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                      el.style.backgroundColor = style.backgroundColor;
                    }
                    if (style.borderColor && style.borderColor !== 'rgba(0, 0, 0, 0)') {
                      el.style.borderColor = style.borderColor;
                    }
                  } catch (e) {
                    // Ignore elements that cannot be inspected
                  }
                });
              }

              // Fix Recharts responsiveness inside html2canvas headless iframe
              const chartContainers = clonedDoc.querySelectorAll('.recharts-responsive-container');
              chartContainers.forEach((c: any) => {
                c.style.width = '620px';
                c.style.height = '240px';
              });

              const svgs = clonedDoc.querySelectorAll('svg');
              svgs.forEach((svg) => {
                const parent = svg.parentElement;
                const parentW = parent ? parent.clientWidth : 600;
                const parentH = parent ? parent.clientHeight : 240;
                svg.setAttribute('width', `${parentW || 600}`);
                svg.setAttribute('height', `${parentH || 240}`);
              });
            },
          });

          if (!canvas || canvas.width === 0 || canvas.height === 0) {
            console.warn(`Page ${i + 1} canvas generation resulted in empty dimensions.`);
            continue;
          }

          const imgData = canvas.toDataURL('image/png');

          if (addedPagesCount > 0) {
            pdf.addPage();
          }

          const imgHeight = (canvas.height * pdfWidth) / canvas.width;
          const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;

          pdf.addImage(
            imgData,
            'PNG',
            0,
            Math.max(0, yOffset),
            pdfWidth,
            Math.min(pdfHeight, imgHeight)
          );

          addedPagesCount++;
        } catch (pageErr) {
          console.warn(`Error capturing page ${i + 1}:`, pageErr);
        }
      }
    }

    onProgress?.('Generating PDF download file...');

    // Trigger download via jsPDF save with direct Blob fallback
    try {
      pdf.save(fileName);
    } catch (saveErr) {
      console.warn('pdf.save standard call failed, executing blob fallback:', saveErr);
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 1000);
    }
  } finally {
    // Always restore the user's scroll position
    window.scrollTo(savedScrollX, savedScrollY);
  }
}


