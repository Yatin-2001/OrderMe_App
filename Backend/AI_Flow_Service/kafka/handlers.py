from utils.qdrant_utils import upsert_vector, delete_vector
from datetime import datetime

def stringify(data: dict):
    return " | ".join(f"{k}: {v}" for k, v in data.items())

def handle_event(topic: str, data: dict):
    if topic == "add-order":
        order_id = data["orderId"]
        payload = {
            "type": "order",
            "order_id": order_id,
            "email": data["email"],
            "status": "CREATED",
            "products": data["items"],
            "address": data["address"]
        }
        upsert_vector("orders", order_id, payload, stringify(payload))

    elif topic == "update-order":
        order_id = data["orderId"]
        payload = {"status": data["status"]}
        upsert_vector("orders", order_id, payload, f"Order updated to {data['status']}")

    elif topic == "add-payment":
        order_id = data["orderId"]
        payment_id = data["paymentId"]
        payload = {
            "type": "payment",
            "order_id": order_id,
            "payment_id": payment_id,
            "status": data["status"],
            "method": data["paymentMethod"],
            "amount": data["amount"]
        }
        upsert_vector("orders", order_id, payload, stringify(payload))

    elif topic == "update-payment":
        order_id = data["orderId"]
        payload = {"payment_status": data["status"]}
        upsert_vector("orders", order_id, payload, f"Payment updated to {data['status']}")

    elif topic == "add-shipment":
        order_id = data["orderId"]
        payload = {
            "type": "shipment",
            "shipment_id": data["shipmentId"],
            "order_id": order_id,
            "scheduledDay": data["scheduledDay"]
        }
        upsert_vector("orders", order_id, payload, stringify(payload))

    elif topic == "update-shipment":
        order_id = data["orderId"]
        payload = {
            "shipment_status": data["status"],
            "isPickupRequired": data.get("isPickupRequired", False),
            "pickupScheduleDay": data.get("pickupSchedule")
        }
        upsert_vector("orders", order_id, payload, stringify(payload))

    elif topic == "add-product":
        product_id = data["productId"]
        payload = {
            "type": "product",
            "product_id": product_id,
            "name": data["name"],
            "description": data["description"],
            "price": data["price"]
        }
        text = f"{data['name']} - {data['description']}"
        upsert_vector("products", product_id, payload, text)

    elif topic == "update-product":
        product_id = data["productId"]
        payload = {
            "name": data["name"],
            "description": data["description"],
            "price": data["price"]
        }
        text = f"{data['name']} - {data['description']}"
        upsert_vector("products", product_id, payload, text)

    elif topic == "delete-product":
        product_id = data["productId"]
        delete_vector("products", product_id)

    else:
        print(f"Unknown topic: {topic}")
