from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, Filter, FieldCondition, MatchValue
from sentence_transformers import SentenceTransformer
import uuid

client = QdrantClient(host="localhost", port=6333)
model = SentenceTransformer("all-MiniLM-L6-v2")

def embed_text(text: str):
    return model.encode(text).tolist()

def upsert_vector(collection_name, id_str, payload, text):
    vector = embed_text(text)
    point = PointStruct(
        id=id_str,
        vector=vector,
        payload=payload
    )
    client.upsert(collection_name=collection_name, points=[point])

def delete_vector(collection_name, id_str):
    client.delete(collection_name=collection_name, points_selector={
        "points": [id_str]
    })

def update_payload(collection_name, id_str, payload_update):
    client.set_payload(collection_name, payload=payload_update, points=[id_str])


def get_existing_payload(collection_name, point_id):
    try:
        response = client.retrieve(collection_name=collection_name, ids=[point_id])
        if response and len(response) > 0:
            return response[0].payload
        return None
    except Exception as e:
        print(f"[ERROR] Fetching payload failed for {point_id}: {e}")
        return None
