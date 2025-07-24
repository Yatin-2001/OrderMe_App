import { Notification } from '../models/Notification.js';

export const getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
  res.json(notifications);
};

export const markNotificationRead = async (req, res) => {
  const { id } = req.params;
  await Notification.findByIdAndUpdate(id, { status: 'READ' });
  res.json({ success: true });
};
