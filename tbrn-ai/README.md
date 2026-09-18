# Nova — TBRN AI v0.1

Standalone test interface. It deliberately does not modify or depend on the live TBRN Hub.

## Current milestone
- TBRN-branded chat UI
- Quick actions for claim review, correspondence, cost assessment, contractor search and Hub search
- Multi-file attachment UI
- Knowledge/status panel
- Safe disconnected state when no backend is configured

## Next backend contract
POST /api/tbrn-ai (multipart/form-data)
- message: string
- files: optional attachments
Returns: { "answer": "...", "sources": ["..."] }

GET /api/health
Returns HTTP 200 when the protected AI service is available.

## Security
Never place an OpenAI API key in this static repository or browser JavaScript. The model call must run server-side. Do not upload live sensitive claim material until authentication, access control, retention and audit controls are implemented.

## Planned grounding
Approved TBRN procedures/templates -> protected file-search/vector index -> model response with source names. Dynamic contractor coverage should be queried from the authoritative Hub/Firebase data rather than embedded in the model prompt.
