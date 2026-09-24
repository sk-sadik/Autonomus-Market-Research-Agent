from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    startup_idea: str
    search_results: List[Dict[str, Any]]     # raw Tavily / web search results
    competitor_data: Dict[str, Any]         # structured pricing/positioning
    review_summaries: Dict[str, Any]        # sentiment synthesis
    chart_data: Dict[str, Any]              # data ready for matplotlib
    report_draft: str                       # final report prose
    job_status: str                         # pending | running | complete | failed
    thread_id: str
    current_node: Optional[str]
    error: Optional[str]
