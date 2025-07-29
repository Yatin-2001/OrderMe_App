# kafka_consumer.py
from kafka import KafkaConsumer
import json
import threading
import logging
from kafka.handlers import handle_event

EVENT_TOPICS = [
    'add-order',
    'add-payment',
    'add-shipment',
    'update-order',
    'update-payment',
    'order_cancelled',
    'update-shipment',

    # events realted to product inventory...
    'add-product',
    'update-product',
    'delete-product'
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
            topic = message.topic
            data = json.loads(message.value.decode('utf-8'))
            
            try:
                handle_event(topic, data)

                logging.info(f"[✓] RAG Service upserted event from topic: {message.topic}")
            except Exception as e:
                logging.error(f"[✗] Failed to process message: {e}")

    thread = threading.Thread(target=consume)
    thread.start()
