#!/usr/bin/env bash
# Pull the phi3:mini model into the Ollama container.
# Run once after `docker compose up` to download the model (~2.3 GB).
#
# Usage (from the project root):
#   bash scripts/init-ollama.sh

set -euo pipefail

echo "Pulling phi3:mini into Ollama container…"
docker compose exec ollama ollama pull phi3:mini
echo "Done — phi3:mini is ready."
