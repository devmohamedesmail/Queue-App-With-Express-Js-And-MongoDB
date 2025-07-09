export const emit_queue_update = (io, roomId, statusData) => {
    io.to(roomId).emit('queue_status_updated', {
        roomId,
        data: statusData,
        timestamp: new Date().toISOString()
    });
};


export const emit_queue_user_update = (io, userId, statusData) => {
    io.to(userId).emit('user_position_updated', {
        roomId,
        data: statusData,
        timestamp: new Date().toISOString()
    });
}


export const emit_queue_new_entry = (io, roomId, statusData) => {
    io.to(roomId).emit('queue_new_entry', {
        data: statusData,
        timestamp: new Date().toISOString()
    });
}