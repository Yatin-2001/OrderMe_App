# kafka_consumer.py
from kafka import KafkaConsumer
from qdrant_ops import upsert_order_to_qdrant
import json
import threading
import logging

EVENT_TOPICS = [
    'order_created',
    'order_paid',
    'order_shipped',
    'order_delivered',
    'order_failed',
    'order_cancelled',
    'refund_initiated'
]

def start_rag_consumer():
    consumer = KafkaConsumer(
        *EVENT_TOPICS,
        bootstrap_servers='localhost:9092',
        group_id='rag_vector_service_group',
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )

    def consume():
        for message in consumer:
            event_data = message.value
            try:
                upsert_order_to_qdrant(event_data)
                logging.info(f"[✓] RAG Service upserted event from topic: {message.topic}")
            except Exception as e:
                logging.error(f"[✗] Failed to process message: {e}")

    thread = threading.Thread(target=consume)
    thread.start()
