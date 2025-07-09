export const emit_user_notification = async (io, userId, notificationData) => {
 if (!io) return;

  io.to(userId).emit('send_notification_user', {
    message: `${notificationData.title}: ${notificationData.message}`,
    title: notificationData.title,
    notification: {
      id: notificationData.id,
      title: notificationData.title,
      message: notificationData.message,
      read: false,
      createdAt: notificationData.createdAt,
      type: 'notification',
    },
  });
}



export const emit_system_announcement = (io, announcement) => {
  io.emit('system_announcement', {
    data: announcement,
    timestamp: new Date().toISOString()
  });
};