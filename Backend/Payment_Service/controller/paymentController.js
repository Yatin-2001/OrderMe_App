const Payment = require('../model/payments');
const { sendEvent } = require('../kafka/producer.js');

var processPayment = async (data) => {
  try {
    const { orderId, userId, amount, paymentMethod } = data;

    const payment = new Payment({ orderId, userId, amount, paymentMethod });
    await payment.save();

    await sendEvent('payment-success', { orderId });

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

    res.json({msg: "COD payment processed"});

  } catch(err) {
    res.status(500).json({error: "COD payment updation failed!!! Please try again..."});

  }
  
}

async function processRefund({ orderId }) {
  try{
    console.log(`Processing refund for Order ${orderId}`);

    const payment = await Payment.findOne({ orderId: orderId });

    if(!payment){ 
      console.log(`Payment was not made for the order, so no refund initiated!!!`);
      res.json({msg: 'Refund processed'})
    }

    if(payment.paymentMethod === "COD" && payment.isCODPayed === true){
      console.log(`Payment was COD so refund will be given by the Shipment collector!!!`);
      res.json({msg: 'Refund will processed during pickup'})

    } else if(payment.paymentMethod === "COD") {
      console.log(`Payment was COD but user did not pay, so no refund initiated`);
      res.json({msg: 'Refund processed'})
    }

    console.log(`Refund initiated of amount: ${payment.amount}; to the original Payment method: ${payment.paymentMethod}`)

    await sendEvent('refund-success', { orderId });

    res.json({msg: 'Refund processed'})
  
  } catch(err) {
    console.log(`Refund failed dur to error: ${err}`);

    await sendEvent('refund-failed', { orderId });

    res.status(500).json({error: 'Refund could not be processed'})

  }
}

module.exports = { getPaymentByOrderId, processPayment, processCODPayment, processRefund };

