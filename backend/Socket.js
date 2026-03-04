const MessageModel = require("./db/models/message.model.js");
const activeUsers = new Map();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Track active users
        socket.on('registerUser', (userId) => {
            activeUsers.set(userId, socket.id);
        });

        socket.on('sendMessage', async (data) => {
            // console.log('data', data)
            const newMessage = await MessageModel.create(data);
            const receiverSocketId = activeUsers.get(data.recieverId);
            if (receiverSocketId) {
                // console.log('receiverSocketId', receiverSocketId)
                io.to(receiverSocketId).emit('receiveMessage', newMessage);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            for (const [userId, sockId] of activeUsers.entries()) {
                if (sockId === socket.id) {
                    activeUsers.delete(userId);
                    break;
                }
            }
        });

    });
};
