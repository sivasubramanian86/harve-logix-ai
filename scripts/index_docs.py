#!/usr/bin/env python3
"""
Document Ingestion Pipeline
Loads documents, generates embeddings, and indexes them in the vector store

Usage:
    python scripts/index_docs.py --input docs/ --output data/vector_store
    python scripts/index_docs.py --seed-data (loads example agricultural data)
"""

import argparse
import json
import logging
import sys
import hashlib
from pathlib import Path
from typing import Any, Dict, List

# Add backend to path so Python can locate modules under the backend directory
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

# import via explicit package path now that `backend/services` is a proper package
from services.vectorStoreFaiss import get_vector_store

logging.basicConfig(level=logging.INFO)
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


def load_documents_from_directory(directory: Path) -> List[Dict[str, Any]]:
    """Load all text files from a directory."""
    documents = []
    
    if not directory.exists():
        logger.warning(f"Directory {directory} does not exist")
        return documents

    for file_path in directory.rglob("*.txt"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            documents.append({
                "content": content,
                "metadata": {
                    "source": str(file_path.relative_to(directory)),
                    "type": "text",
                }
            })
            logger.info(f"Loaded {file_path}")
        except Exception as e:
            logger.error(f"Error loading {file_path}: {e}")

    logger.info(f"Loaded {len(documents)} documents")
    return documents


def load_documents_from_json(file_path: Path) -> List[Dict[str, Any]]:
    """Load documents from a JSON file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        if isinstance(data, list):
            return data
        elif isinstance(data, dict) and "documents" in data:
            return data["documents"]
        else:
            logger.warning("JSON format not recognized")
            return []
    except Exception as e:
        logger.error(f"Error loading JSON: {e}")
        return []


def create_seed_data() -> List[Dict[str, Any]]:
    """Create example agricultural knowledge base for seeding."""
    return [
        {
            "content": "Tomato crop phenology stages: Stage 0-2 (seedling, 0-14 days), Stage 3-5 (vegetative, 15-40 days), Stage 6-8 (flowering and fruit set, 41-70 days), Stage 9-10 (maturity and harvest, 71-100 days). Optimal harvest window is when 85-95% of fruits show red color.",
            "metadata": {
                "crop_type": "tomato",
                "topic": "phenology",
                "region": "India",
                "source": "agricultural_knowledge_base"
            }
        },
        {
            "content": "Water requirement for tomato: 300-400 mm per season. Optimal irrigation schedule: 10-15 days interval during flowering and fruit development. Drip irrigation can save 30-40% water compared to flood irrigation. Soil moisture should be maintained at 70-80% of field capacity.",
            "metadata": {
                "crop_type": "tomato",
                "topic": "irrigation",
                "region": "India",
                "source": "agricultural_knowledge_base"
            }
        },
        {
            "content": "Tomato diseases and management: Early blight (Alternaria) - spray mancozeb 75% WP 2.5g/L. Leaf curl virus - control whiteflies with neem oil spray. Powdery mildew - use sulfur dust or potassium bicarbonate. Bacterial wilt - remove infected plants immediately.",
            "metadata": {
                "crop_type": "tomato",
                "topic": "disease_management",
                "region": "India",
                "source": "agricultural_knowledge_base"
            }
        },
        {
            "content": "Onion crop phenology: Days to maturity 120-150 days. Planted in October-November in India, harvested in February-March. Optimal harvest when 50-60% of leaves have fallen and bulbs are firm. Storage at 15-20°C with 65-70% humidity can preserve for 4-6 months.",
            "metadata": {
                "crop_type": "onion",
                "topic": "phenology",
                "region": "India",
                "source": "agricultural_knowledge_base"
            }
        },
        {
            "content": "Capsicum cultivation: Temperature range 20-30°C optimal. Requires 120-150 days to maturity. Irrigation: 300-450 mm season total. Recommended spacing: 45-60 cm between rows, 30-45 cm between plants. Yield: 20-30 tons/hectare.",
            "metadata": {
                "crop_type": "capsicum",
                "topic": "cultivation",
                "region": "India",
                "source": "agricultural_knowledge_base"
            }
        },
        {
            "content": "Harvest timing decision factors: Crop phenology (ripeness %), weather forecast (avoid rain 24h before harvest), market prices (current vs 2-day forecast), processor orders (buyer demand). Optimal window is when all three factors align favorably (ripeness >85%, dry weather, prices rising, buyer demand high).",
            "metadata": {
                "crop_type": "generic",
                "topic": "harvest_decision",
                "region": "India",
                "source": "agricultural_knowledge_base"
            }
        },
        {
            "content": "Market price dynamics for vegetables in India: Tomato seasonal peak: May-June (high prices ₹30-40/kg during off-season). Onion seasonal peak: April-May. Capsicum: year-round demand, premium in winter. eNAM (e-National Agriculture Market) provides real-time prices.",
            "metadata": {
                "crop_type": "generic",
                "topic": "market_prices",
                "region": "India",
                "source": "agricultural_knowledge_base"
            }
        },
    ]


def ingest_documents(
    documents: List[Dict[str, Any]],
    progress_callback=None
) -> int:
    """
    Ingest documents: embed and index them.

    Args:
        documents: List of documents to ingest
        progress_callback: Optional callback function (count, total)

    Returns:
        Number of documents indexed
    """
    store = get_vector_store()
    indexed_count = 0

    for i, doc in enumerate(documents):
        try:
            # Generate embedding
            embedding = generate_mock_embedding(doc["content"])

            # Add to store
            doc_id = store.add_document(
                content=doc["content"],
                embedding=embedding,
                metadata=doc["metadata"]
            )

            indexed_count += 1
            logger.info(f"Indexed document {i+1}/{len(documents)} (id={doc_id})")

            if progress_callback:
                progress_callback(i + 1, len(documents))

        except Exception as e:
            logger.error(f"Error indexing document {i}: {e}")

    # Save to disk
    store.save()
    logger.info(f"Ingestion complete: {indexed_count}/{len(documents)} documents indexed")

    return indexed_count


def main():
    """CLI interface for document ingestion."""
    parser = argparse.ArgumentParser(description="Index documents into vector store")
    parser.add_argument("--input", type=Path, help="Input directory with documents")
    parser.add_argument("--json", type=Path, help="Load documents from JSON file")
    parser.add_argument("--seed-data", action="store_true", help="Load seed agricultural data")
    parser.add_argument("--output", type=Path, default="backend/data/vector_store", help="Output directory")
    parser.add_argument("--clear", action="store_true", help="Clear existing index before ingesting")

    args = parser.parse_args()

    # Load documents
    documents = []

    if args.seed_data:
        logger.info("Loading seed data...")
        documents = create_seed_data()

    if args.json:
        logger.info(f"Loading documents from {args.json}...")
        documents.extend(load_documents_from_json(args.json))

    if args.input:
        logger.info(f"Loading documents from {args.input}...")
        documents.extend(load_documents_from_directory(args.input))

    if not documents:
        logger.warning("No documents to ingest")
        return

    logger.info(f"Total documents to ingest: {len(documents)}")

    # Clear index if requested
    if args.clear:
        logger.info("Clearing existing vector store...")
        store = get_vector_store()
        store.clear()  # Call new clear method
        logger.info("Vector store cleared")

    # Ingest
    try:
        count = ingest_documents(documents)
        logger.info(f"Successfully indexed {count} documents")
        print(f"\n[OK] Indexed {count} documents to agricultural knowledge base")
    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
