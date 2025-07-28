from qdrant_client.models import Record, FieldCondition, MatchValue
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

class Coordinates(BaseModel):
    lat: float
    lng: float

class UserAddress(BaseModel):
    name: str
    address: str
    pincode: str
    coordinates: Coordinates

class ProductInfo(BaseModel):
    name: str
    product_id: str
    description: str
    price: float

class PaymentInfo(BaseModel):
    payment_id: str
    status: str  # INITIATED, SUCCESS, FAILED
    method: str  # COD, UPI, CARD

class ShipmentStatus(BaseModel):
    shipment_id: str
    status: str  # PENDING, CANCELLED, SHIPPED, DELIVERED, FAILED, etc.
    scheduledDay: datetime
    isPickupRequired: Optional[bool]
    pickupScheduleDay: datetime

class OrderVector(BaseModel):
    order_id: str
    user_id: str
    email: str
    userAddress: UserAddress
    status: str
    products: List[ProductInfo]
    payment: PaymentInfo
    shipment_status: ShipmentStatus
    total_amount: float
    isRefundInitiated: bool = False
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
