const Payment = require('../model/payments');
const { sendEvent } = require('../kafka/producer.js');

var processPayment = async (data) => {
  try {
    const { orderId, userId, amount, paymentMethod, warehouseId, userAddress } = data;

    const payment = new Payment({ orderId, userId, amount, paymentMethod });
    await payment.save();

    // SAGA attern call to shipment to create a shipment...
    await sendEvent('shipment-initiate', {
      orderId: orderId,
      userId: userId,
      userAddress: userAddress,
      warehouseId: warehouseId,
      paymentMethod: paymentMethod
    });

    await sendEvent('payment-success', { orderId });

    await sendEvent('add-payment', {
      orderId: orderId,
      paymentId: payment._id, 
      orderId: orderId, 
      status: (paymentMethod === COD) ? 'INITIATED' : 'SUCCESS',
      amount: amount, 
      paymentMethod: paymentMethod
    });

    res.status(201).json(payment);

  } catch (err) {
    await sendEvent('payment-failed', { orderId });
    res.status(500).json({ error: err.message });

  }
};

var getPaymentByOrderId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function processCODPayment({ orderId }) {
  try{
    console.log(`COD marked paid for Order ${orderId}`);

    const payment = await Payment.findOne({ orderId: orderId });

    payment.isCODPayed = true;
    payment.save();

    await sendEvent('payment-success', { orderId });

    await sendEvent('update-payment', {
      orderId: orderId,
      paymentId: payment._id, 
      status: 'SUCCESS',
      isCODPayed: true
    });

    res.json({msg: "COD payment processed"});

  } catch(err) {
    res.status(500).json({error: "COD payment updation failed!!! Please try again..."});

  }
  
}

async function processRefund() {
  try{
    console.log(`Processing refund for Order ${orderId}`);

    const payment = await Payment.findOne({ orderId: orderId });

    if(!payment){ 
      console.log(`Payment was not made for the order, so no refund initiated!!!`);
      res.json({msg: 'Refund processed'})
    }

    if(payment.paymentMethod === "COD" && payment.isCODPayed === true){
      console.log(`Payment was COD so refund was given by the Shipment collector!!!`);

    } else {
      console.log(`Refund initiated of amount: ${payment.amount}; to the original Payment method: ${payment.paymentMethod}`)
    
    }

    await sendEvent('refund-success', { orderId });

    res.json({msg: 'Refund processed'})
  
  } catch(err) {
    console.log(`Refund failed dur to error: ${err}`);

    await sendEvent('refund-failed', { orderId });

    res.status(500).json({error: 'Refund could not be processed'})

  }
}

module.exports = { getPaymentByOrderId, processPayment, processCODPayment, processRefund };
