const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    maxHttpBufferSize: 1e8
});
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

const users = new Map(); // Store username mappings

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('user joined', (username) => {
        users.set(socket.id, username);
        io.emit('user joined', {
            userId: socket.id,
            username: username,
            timestamp: new Date(),
            message: `${username} joined the chat`
        });
    });

    socket.on('chat message', (data) => {
        io.emit('chat message', {
            message: data,
            userId: socket.id,
            username: users.get(socket.id),
            timestamp: new Date()
        });
    });

    socket.on('image message', (data) => {
        io.emit('image message', {
            image: data,
            userId: socket.id,
            username: users.get(socket.id),
            timestamp: new Date()
        });
    });

    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        if (username) {
            io.emit('user left', {
                userId: socket.id,
                username: username,
                timestamp: new Date(),
                message: `${username} left the chat`
            });
            users.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});