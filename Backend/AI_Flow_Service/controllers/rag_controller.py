# controllers/rag_controller.py
from flask import jsonify
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from embeddings import get_order_embedding
from models import OrderVector
import numpy as np

qdrant = QdrantClient(host='localhost', port=6333)
COLLECTION_NAME = "order_vectors"

def handle_query(query: str, email: str):
    dummy_order = OrderVector(
        order_id="dummy",
        user_id="dummy",
        email=email,
        userAddress={
            "name": "",
            "address": "",
            "pincode": "",
            "coordinates": {"lat": 0.0, "lng": 0.0}
        },
        status="CREATED",
        products=[],
        payment={
            "payment_id": "",
            "status": "INITIATED",
            "method": "COD"
        },
        shipment_status={
            "shipment_id": "",
            "status": "PENDING",
            "scheduledDay": "2024-01-01T00:00:00Z",
            "isPickupRequired": False,
            "pickupScheduleDay": "2024-01-01T00:00:00Z"
        },
        total_amount=0.0
    )
    embedding = get_order_embedding(dummy_order)

    hits = qdrant.search(
        collection_name=COLLECTION_NAME,
        query_vector=embedding,
        limit=3,
        query_filter=Filter(
            must=[
                FieldCondition(key="email", match=MatchValue(value=email))
            ]
        )
    )
    return jsonify({"results": [hit.payload for hit in hits]})
