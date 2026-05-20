"""
Async chat function that calls the local Ollama inference server.

Ollama must be reachable at http://ollama:11434 (Docker internal network).
The phi3:mini model must have been pulled beforehand with init-ollama.sh.
"""

import logging

import httpx

logger = logging.getLogger(__name__)

# ─── Constants ────────────────────────────────────────────────────────────────

OLLAMA_MODEL: str = "llama3.2:1b"
# host.docker.internal → Ollama natif sur Mac (Metal GPU, ~2-5s par réponse)
# Ollama doit être installé sur le Mac et le modèle téléchargé avec :
#   ollama pull llama3.2:1b
OLLAMA_URL:   str = "http://host.docker.internal:11434/api/chat"
TIMEOUT_S:    int = 30


# ─── Public API ───────────────────────────────────────────────────────────────


async def chat(messages: list[dict], system_prompt: str) -> str:
    """
    Send a conversation to Ollama and return the assistant's reply.

    Args:
        messages:      List of {role, content} dicts representing the
                       conversation history (user / assistant turns).
        system_prompt: Contextual prompt built by context_builder.

    Returns:
        The assistant's text response, or a user-friendly fallback
        message when Ollama is unreachable or exceeds the timeout.
    """
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            *messages,
        ],
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_S) as client:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["message"]["content"]

    except httpx.TimeoutException:
        logger.warning("Ollama request timed out after %ds", TIMEOUT_S)
        return (
            "Je mets un peu de temps à répondre, le modèle est peut-être "
            "en cours de chargement. Réessaie dans quelques secondes ! 🤖"
        )

    except httpx.ConnectError:
        logger.warning("Cannot connect to Ollama at %s", OLLAMA_URL)
        return (
            "Je ne suis pas encore prêt — le service IA démarre. "
            "Réessaie dans un instant ! 🤖"
        )

    except Exception:
        logger.exception("Unexpected error while calling Ollama")
        return (
            "Une erreur inattendue s'est produite. "
            "Réessaie dans un moment. 🤖"
        )
