"""
Retriever Service
Handles retrieval-augmented generation (RAG) context fetching
"""

import logging
import hashlib
from typing import Any, Dict, List, Optional

from services.vectorStoreFaiss import search, get_stats

logger = logging.getLogger(__name__)


def generate_mock_embedding(text: str, dimension: int = 512) -> List[float]:
    """Generate deterministic mock embedding from text"""
    hash_obj = hashlib.sha256(text.encode())
    hash_bytes = hash_obj.digest()
    
    embedding = []
    for i in range(dimension):
        byte_val = hash_bytes[i % len(hash_bytes)]
        embedding.append((byte_val - 128) / 256.0)
    
    return embedding


def retrieve_context(
    embedding: Optional[List[float]] = None,
    query: Optional[str] = None,
    k: int = 3,
    min_distance: float = 0.0,
    max_distance: float = float("inf"),
) -> List[Dict[str, Any]]:
    """
    Retrieve relevant context for a query embedding or text query.

    Args:
        embedding: Query embedding vector (optional if query provided)
        query: Query text (optional if embedding provided)
        k: Number of results to return
        min_distance: Minimum distance threshold
        max_distance: Maximum distance threshold

    Returns:
        List of retrieved documents with content and metadata
    """
    try:
        # If query is provided, generate embedding from it
        if query and not embedding:
            embedding = generate_mock_embedding(query)
        
        if not embedding:
            logger.warning("No embedding or query provided")
            return []
        
        results = search(embedding, k=k)

        # Filter by distance threshold
        filtered = [
            doc for doc in results
            if min_distance <= doc.get("distance", 0) <= max_distance
        ]

        logger.info(f"Retrieved {len(filtered)} documents (filtered from {len(results)})")
        return filtered

    except Exception as e:
        logger.error(f"Retrieval error: {e}")
        return []


def format_context_for_prompt(documents: List[Dict[str, Any]]) -> str:
    """
    Format retrieved documents into a context string for the LLM prompt.

    Args:
        documents: Retrieved documents

    Returns:
        Formatted context string
    """
    if not documents:
        return ""

    context_parts = ["### Retrieved Context:\n"]

    for i, doc in enumerate(documents, 1):
        content = doc.get("content", "")
        metadata = doc.get("metadata", {})
        distance = doc.get("distance", 0)

        context_parts.append(f"\n[Document {i}] (relevance: {1 / (1 + distance):.2f})")
        if metadata.get("source"):
            context_parts.append(f"Source: {metadata['source']}")
        if metadata.get("crop_type"):
            context_parts.append(f"Crop: {metadata['crop_type']}")
        if metadata.get("region"):
            context_parts.append(f"Region: {metadata['region']}")

        context_parts.append(f"\n{content}\n")

    return "\n".join(context_parts)


def build_rag_prompt(
    user_prompt: str,
    documents: List[Dict[str, Any]],
    system_prompt: Optional[str] = None,
) -> Dict[str, str]:
    """
    Build a RAG-enhanced prompt with context.

    Args:
        user_prompt: Original user prompt
        documents: Retrieved context documents
        system_prompt: Optional system prompt

    Returns:
        Dictionary with 'system_prompt' and 'user_prompt'
    """
    context = format_context_for_prompt(documents)

    enhanced_user_prompt = f"""{context}

Based on the context above, please answer the following:

{user_prompt}"""

    enhanced_system_prompt = (system_prompt or "") + "\n\nYou have access to retrieved context documents. Use them to provide accurate, grounded responses."

    return {
        "system_prompt": enhanced_system_prompt,
        "user_prompt": enhanced_user_prompt,
    }


def get_retriever_stats() -> Dict[str, Any]:
    """Get statistics about the retriever and vector store."""
    return {
        "vector_store": get_stats(),
    }
