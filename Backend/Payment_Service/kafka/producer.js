const { Kafka } = require('kafkajs');
const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });

const producer = kafka.producer();
await producer.connect();

const sendEvent = async (topic, payload) => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }],
  });
};

module.exports = { sendEvent };