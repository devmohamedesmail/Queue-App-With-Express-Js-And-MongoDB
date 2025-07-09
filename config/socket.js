export default function setupSocket(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 New connection: ${socket.id}`);

        // انضمام المستخدم لغرفته الخاصة
        socket.on('join_user_room', ({ userId }) => {
            socket.join(userId);
            console.log(`✅ User ${userId} joined their personal notification room`);
        });

        // انضمام لغرف عامة
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`📥 Socket ${socket.id} joined room: ${roomId}`);
        });


        // user notifications
        socket.on('send_notification_user', (roomId) => {
            socket.join(roomId);
        })

        socket.on('disconnect', () => {
            console.log(`❌ Disconnected: ${socket.id}`);
        });
    });
}