# controllers/ingest_controller.py
from flask import jsonify
from qdrant_ops import upsert_order_to_qdrant

def ingest_order_data(order_data: dict):
    try:
        upsert_order_to_qdrant(order_data)
        return jsonify({"message": "Order ingested to vector DB"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
