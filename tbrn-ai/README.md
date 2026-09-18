# Nova — TBRN AI v0.2

Standalone test interface plus protected Firebase Functions AI backend.

## Implemented
- TBRN-branded chat UI and quick actions
- Protected server-side OpenAI call (API key is a Firebase secret, never browser code)
- GPT-5.6 Terra Responses API
- Optional OpenAI file-search grounding via TBRN_VECTOR_STORE_ID
- Source filename extraction from file-search annotations
- Firebase Hosting /api rewrite to the europe-west2 function
- Health endpoint and knowledge connection status
- Explicit Nova claims-assessment guardrails

## Before deployment
From the Firebase project CLI:
1. cd functions && npm install
2. firebase functions:secrets:set OPENAI_API_KEY
3. Set TBRN_VECTOR_STORE_ID to the approved OpenAI vector store ID when the knowledge index exists.
4. firebase deploy --only functions,hosting

Do not upload live sensitive claim data until authentication, access controls, retention and audit controls are implemented.

## API
POST /api/tbrn-ai
Content-Type: application/json
{ "message": "..." }

GET /api/health

## Next milestone
Authentication/role controls, approved knowledge ingestion tooling, conversation persistence, then controlled claim-file attachments.
