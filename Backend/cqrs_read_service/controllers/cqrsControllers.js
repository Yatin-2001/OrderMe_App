const User = require('../models/user');
const Shipment = require('../models/shipment');
const Product = require('../models/product');
const Order = require('../models/order');
const Payment = require('../models/payment');

// Kafka consumer controllers
async function addOrder(data){

    var { email, orderId, items, address } = data;

    try{

        var user = User.findOne({ email: email });

        const order = await Order.create({ orderId, items, userAddress: address });

        user.orderList.unshift(order.orderId);

        user.save();

    } catch (err) {
        console.log(`Order could not be created in CQRS DB. \nReason: ${err}`);

    }

}

async function updateOrder(data){
    var { orderId, status } = data;

    try{

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    status: status
                }
            }
        );

    } catch (err) {
        console.log(`Order status could not be updated in CQRS DB. \nReason: ${err}`);

    }

}



async function addPayment(data){

    var { orderId, paymentId, status, amount, paymentMethod } = data;

    try{

        var order = Order.findOne({ orderId: orderId });

        const payment = await Payment.create({ paymentId, orderId, status, amount, paymentMethod });

        order.paymentId = payment.paymentId;

        order.save();

    } catch (err) {
        console.log(`Payment could not be added in CQRS DB. \nReason: ${err}`);

    }

}

async function updatePayment(data){

    var { paymentId, status, isCODPayed  } = data;

    try{

        await Payment.findByIdAndUpdate(
            paymentId,
            {
                $set: {
                    status: status,
                    isCODPayed: isCODPayed
                }
            }
        );

    } catch(err) {
        console.log(`Updation of payment details failed due to: ${err}`);
    }

}



async function addShipment(data){
    var { orderId, shipmentId, scheduledDay } = data;

    try{

        var order = Order.findOne({ orderId: orderId });

        const shipment = await Shipment.create({ shipmentId, orderId, scheduledDay });

        order.shipmentId = shipment.shipmentId;

        order.save();

    } catch (err) {
        console.log(`Shipment could not be added in CQRS DB. \nReason: ${err}`);

    }
}

async function updateShipment(data){
    
    var { shipmentId, status, isPickupRequired, pickupSchedule } = data;

    try{

        await Shipment.findByIdAndUpdate(
            shipmentId,
            {
                $set: {
                    status: status,
                    isPickupRequired: isPickupRequired,
                    pickupSchedule: pickupSchedule

                }
            }
        );

    } catch (err) {
        console.log(`Shipment details could not be updated in CQRS DB. \nReason: ${err}`);

    }

}



async function addProduct(data){
    
    var { productId, name, description, price } = data;

    try{

        await Product.create({productId, name, description, price});

    } catch(err) {
        console.log(`Could not add the product due to error: ${err}`)
    }

}

async function updateProduct(data){
    
    var { productId, name, description, price } = data;

    try{

        await Product.findByIdAndUpdate(
            productId,
            {
                $set: {
                    name,
                    description, 
                    price
                }
            }
        );

    } catch(err) {
        console.log(`Could not update the product due to error: ${err}`)
    }

}

async function deleteProduct(data){
    
    var { productId } = data;

    try{

        await Product.findByIdAndDelete(productId);

    } catch(err) {
        console.log(`Could not delete Product due to error: ${err}`);
    }

}


// API related controllers:-
async function getUserHistory(req, res) {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const retObj = {
            userId: user.userId,
            name: user.name,
            email: user.email
        };

        const orderArr = [];

        for (const orderId of user.orderList) {
            const order = await Order.findOne({ orderId: orderId });
            if (!order) continue;

            const itemList = [];

            for (const item of order.items) {
                const product = await Product.findOne({ productId: item.productId });
                if (!product) continue;

                itemList.push({
                    ...product.toObject(),
                    quantity: item.quantity
                });
            }

            const payment = await Payment.findOne({ paymentId: paymentId });
            const shipment = await Shipment.findOne({ shipmentId: order.shipmentId });

            const { items, paymentId, shipmentId, ...orderData } = order.toObject();

            const orderObj = {
                ...orderData,
                items: itemList,
                payment: payment,
                shipment: shipment
            };

            orderArr.push(orderObj);
        }

        retObj.orders = orderArr;

        res.json({ history: retObj });

    } catch (err) {
        res.status(500).json({ error: `Could not get the history of the user due to: ${err.message}` });
    
    }
}

// Other functions to help process the User recommendations and other chatbot related questions.



module.exports = { addOrder, updateOrder, addPayment, updatePayment, addShipment, updateShipment, addProduct, updateProduct, deleteProduct, getUserHistory };