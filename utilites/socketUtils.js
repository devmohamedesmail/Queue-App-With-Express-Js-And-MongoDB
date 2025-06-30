
export const emitQueueUpdate = (io, roomId, queueData) => {
  io.to(roomId).emit('queue_updated', {
    roomId,
    data: queueData,
    timestamp: new Date().toISOString()
  });
};


export const emitNewQueueEntry = (io, roomId, entryData) => {
  io.to(roomId).emit('queue_entry_added', {
    roomId,
    data: entryData,
    timestamp: new Date().toISOString()
  });
};


export const emitQueueStatusChange = (io, roomId, statusData) => {
  io.to(roomId).emit('queue_status_updated', {
    roomId,
    data: statusData,
    timestamp: new Date().toISOString()
  });
};


export const emitUserPositionUpdate = (io, userId, positionData) => {
  io.to(userId).emit('position_updated', {
    data: positionData,
    timestamp: new Date().toISOString()
  });
};


export const emitUserNotification = (io, userId, notification) => {
  io.to(userId).emit('notification', {
    data: notification,
    timestamp: new Date().toISOString()
  });
};


export const broadcastAnnouncement = (io, announcement) => {
  io.emit('system_announcement', {
    data: announcement,
    timestamp: new Date().toISOString()
  });
};
