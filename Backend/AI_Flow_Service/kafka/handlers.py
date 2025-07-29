from utils.qdrant_utils import upsert_vector, delete_vector, get_existing_payload
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
        existing = get_existing_payload("orders", order_id)
        if not existing:
            print(f"[WARN] No existing order found for ID {order_id}")
            return
        existing["status"] = data["status"]
        upsert_vector("orders", order_id, existing, stringify(existing))

    elif topic == "add-payment":
        order_id = data["orderId"]
        existing = get_existing_payload("orders", order_id)
        if not existing:
            print(f"[WARN] No existing order found for ID {order_id} while adding payment")
            return
        existing.update({
            "payment_id": data["paymentId"],
            "payment_status": data["status"],
            "payment_method": data["paymentMethod"],
            "payment_amount": data["amount"]
        })
        upsert_vector("orders", order_id, existing, stringify(existing))

    elif topic == "update-payment":
        order_id = data["orderId"]
        existing = get_existing_payload("orders", order_id)
        if not existing:
            print(f"[WARN] No existing order found for ID {order_id} while updating payment")
            return
        existing["payment_status"] = data["status"]
        existing["isCODPayed"] = data.get("isCODPayed")
        upsert_vector("orders", order_id, existing, stringify(existing))

    elif topic == "add-shipment":
        order_id = data["orderId"]
        existing = get_existing_payload("orders", order_id)
        if not existing:
            print(f"[WARN] No existing order found for ID {order_id} while adding shipment")
            return
        existing.update({
            "shipment_id": data["shipmentId"],
            "shipment_scheduled_day": data["scheduledDay"]
        })
        upsert_vector("orders", order_id, existing, stringify(existing))

    elif topic == "update-shipment":
        order_id = data["orderId"]
        existing = get_existing_payload("orders", order_id)
        if not existing:
            print(f"[WARN] No existing order found for ID {order_id} while updating shipment")
            return
        existing["shipment_status"] = data["status"]
        existing["isPickupRequired"] = data.get("isPickupRequired", False)
        existing["pickupScheduleDay"] = data.get("pickupSchedule")
        upsert_vector("orders", order_id, existing, stringify(existing))

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
        existing = get_existing_payload("products", product_id)
        if not existing:
            print(f"[WARN] No existing product found for ID {product_id}")
            return
        existing.update({
            "name": data["name"],
            "description": data["description"],
            "price": data["price"]
        })
        text = f"{data['name']} - {data['description']}"
        upsert_vector("products", product_id, existing, text)

    elif topic == "delete-product":
        product_id = data["productId"]
        delete_vector("products", product_id)

    else:
        print(f"[WARN] Unknown topic: {topic}")
