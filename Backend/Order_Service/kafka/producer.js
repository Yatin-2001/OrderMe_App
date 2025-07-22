// kafka/producer.js
const { Kafka } = require('kafkajs');
const kafka = new Kafka({ brokers: ['localhost:9092'] });

const producer = kafka.producer();
await producer.connect();

const sendEvent = async (topic, payload) => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }],
  });
};

module.exports = { sendEvent };
