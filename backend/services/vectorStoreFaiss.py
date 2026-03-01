"""
Vector Store Service
Manages vector embeddings using FAISS (local development) or OpenSearch (production)
"""

import json
import logging
import os
import pickle
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

# Try to import FAISS; if not available, use mock fallback
try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    logging.warning("FAISS not available; using mock vector store")

logger = logging.getLogger(__name__)

VECTOR_STORE_DIR = Path(__file__).parent.parent / "data" / "vector_store"
INDEX_FILE = VECTOR_STORE_DIR / "faiss_index.bin"
METADATA_FILE = VECTOR_STORE_DIR / "metadata.pkl"


class LocalVectorStore:
    """Local FAISS-based vector store for development and testing."""

    def __init__(self, dimension: int = 512):
        """Initialize vector store."""
        self.dimension = dimension
        self.index = None
        self.metadata = {}
        self.id_counter = 0

        # Ensure directory exists
        VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)

        # Load or initialize index
        self._load_or_create_index()

    def _load_or_create_index(self) -> None:
        """Load existing index or create new one."""
        try:
            if not FAISS_AVAILABLE:
                logger.info("FAISS not available, using mock index")
                self.index = None
                return

            if INDEX_FILE.exists() and METADATA_FILE.exists():
                logger.info(f"Loading FAISS index from {INDEX_FILE}")
                self.index = faiss.read_index(str(INDEX_FILE))
                with open(METADATA_FILE, "rb") as f:
                    self.metadata = pickle.load(f)
                self.id_counter = max([m.get("id", 0) for m in self.metadata.values()], default=0) + 1
            else:
                logger.info(f"Creating new FAISS index with dimension {self.dimension}")
                self.index = faiss.IndexFlatL2(self.dimension)
                self.metadata = {}
                self.id_counter = 0
        except Exception as e:
            logger.error(f"Error loading index: {e}, initializing new")
            if FAISS_AVAILABLE:
                self.index = faiss.IndexFlatL2(self.dimension)
            self.metadata = {}
            self.id_counter = 0

    def add_document(self, content: str, embedding: List[float], metadata: Dict[str, Any]) -> int:
        """Add document to vector store."""
        try:
            if not FAISS_AVAILABLE:
                # Mock: just store metadata
                doc_id = self.id_counter
                self.metadata[doc_id] = {
                    "id": doc_id,
                    "content": content,
                    "metadata": metadata,
                }
                self.id_counter += 1
                return doc_id

            doc_id = self.id_counter
            embedding_array = np.array([embedding], dtype=np.float32)

            self.index.add(embedding_array)
            self.metadata[doc_id] = {
                "id": doc_id,
                "content": content,
                "metadata": metadata,
            }
            self.id_counter += 1

            return doc_id
        except Exception as e:
            logger.error(f"Error adding document: {e}")
            raise

    def search(self, embedding: List[float], k: int = 3) -> List[Dict[str, Any]]:
        """Search for similar documents."""
        try:
            if not FAISS_AVAILABLE or self.index is None:
                # Mock: return all documents (up to k)
                docs = list(self.metadata.values())[:k]
                return [
                    {
                        "id": doc["id"],
                        "content": doc["content"],
                        "metadata": doc["metadata"],
                        "distance": 0.0,
                    }
                    for doc in docs
                ]

            embedding_array = np.array([embedding], dtype=np.float32)
            distances, indices = self.index.search(embedding_array, k)

            results = []
            for idx, distance in zip(indices[0], distances[0]):
                if idx == -1:  # Invalid index
                    continue

                if idx in self.metadata:
                    doc = self.metadata[idx]
                    results.append(
                        {
                            "id": doc["id"],
                            "content": doc["content"],
                            "metadata": doc["metadata"],
                            "distance": float(distance),
                        }
                    )

            return results
        except Exception as e:
            logger.error(f"Error searching: {e}")
            return []

    def save(self) -> None:
        """Persist index to disk."""
        try:
            if not FAISS_AVAILABLE:
                logger.info("FAISS not available, skipping save")
                return

            if self.index is not None:
                logger.info(f"Saving FAISS index to {INDEX_FILE}")
                faiss.write_index(self.index, str(INDEX_FILE))

            with open(METADATA_FILE, "wb") as f:
                pickle.dump(self.metadata, f)

            logger.info("Vector store saved successfully")
        except Exception as e:
            logger.error(f"Error saving index: {e}")
            raise

    def delete_document(self, doc_id: int) -> bool:
        """Delete document from metadata (note: FAISS L2 doesn't support deletion)."""
        try:
            if doc_id in self.metadata:
                del self.metadata[doc_id]
                self.save()
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return False

    def clear(self) -> None:
        """Clear all indexed documents from vector store."""
        try:
            self.metadata = {}
            self.id_counter = 0
            self.index = None
            self._load_or_create_index()
            self.save()
            logger.info("Vector store cleared successfully")
        except Exception as e:
            logger.error(f"Error clearing vector store: {e}")

    def get_size(self) -> int:
        """Get number of documents in store."""
        return len(self.metadata)


# Global instance
_vector_store: Optional[LocalVectorStore] = None


def get_vector_store(dimension: int = 512) -> LocalVectorStore:
    """Get or create the global vector store instance."""
    global _vector_store
    if _vector_store is None:
        _vector_store = LocalVectorStore(dimension=dimension)
    return _vector_store


def add_documents(documents: List[Dict[str, Any]]) -> List[int]:
    """Add multiple documents to the vector store."""
    store = get_vector_store()
    doc_ids = []

    for doc in documents:
        try:
            doc_id = store.add_document(
                content=doc.get("content", ""),
                embedding=doc.get("embedding", [0.0] * 512),
                metadata=doc.get("metadata", {}),
            )
            doc_ids.append(doc_id)
        except Exception as e:
            logger.error(f"Error adding document: {e}")

    store.save()
    logger.info(f"Added {len(doc_ids)} documents to vector store")
    return doc_ids


def search(embedding: List[float], k: int = 3) -> List[Dict[str, Any]]:
    """Search the vector store."""
    store = get_vector_store()
    return store.search(embedding, k=k)


def get_stats() -> Dict[str, Any]:
    """Get vector store statistics."""
    store = get_vector_store()
    return {
        "total_documents": store.get_size(),
        "embedding_dimension": store.dimension,
        "index_file": str(INDEX_FILE),
        "faiss_available": FAISS_AVAILABLE,
    }
