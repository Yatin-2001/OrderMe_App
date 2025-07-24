const { Kafka } = require('kafkajs');
import { Notification } from '../models/Notification.js';
import { io, userSockets } from '../socket.js';

const kafka = new Kafka({ brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'notification-group' });

export const startNotificationConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'notifications', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      const { userId, title, message: msg, type = 'INFO' } = payload;

      const notification = await Notification.create({
        userId, title, message: msg, type
      });

      if (userSockets[userId]) {
        io.to(userSockets[userId]).emit('notification', notification);
        notification.status = 'SENT';
        await notification.save();
      }
    },
  });
};
