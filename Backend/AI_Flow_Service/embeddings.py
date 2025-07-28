from models import OrderVector
import numpy as np

def get_order_embedding(order: OrderVector):
    base_string = (
        f"{order.email} "
        + " ".join([p.name + " " + p.description for p in order.products])
        + f" {order.userAddress.name} {order.userAddress.address} "
        + f"{order.status} {order.payment.status} {order.shipment_status.status}"
    )
    np.random.seed(hash(base_string) % 123456)
    return np.random.rand(768).tolist()
