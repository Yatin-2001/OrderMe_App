# qdrant_ops.py
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct
from embeddings import get_order_embedding
from models import OrderVector
import uuid
from datetime import datetime

qdrant = QdrantClient(host='localhost', port=6333)
COLLECTION_NAME = "order_vectors"

def upsert_order_to_qdrant(order_data: dict):
    order = OrderVector(**order_data)
    vector = get_order_embedding(order)

    point = PointStruct(
        id=str(uuid.uuid4()),
        vector=vector,
        payload=order.dict()
    )

    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=[point]
    )
