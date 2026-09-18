# TBRN AI knowledge source folder

Only approved, non-sensitive TBRN reference material should be placed here for ingestion into the protected OpenAI vector store.

Recommended categories:
- Claims procedures and workflows
- Evidence requirements
- Approved correspondence/templates
- Contractor rules and service definitions
- Estimating guidance
- VAT and recovery guidance
- Internal terminology

Do not commit live claim files, customer personal data, passwords, API keys or other secrets to this repository.

The production knowledge index is referenced by the Firebase Functions parameter TBRN_VECTOR_STORE_ID. Nova is instructed to state when a TBRN-specific answer is not supported by indexed material.
