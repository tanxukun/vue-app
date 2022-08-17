const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});
const rooms = new Map();

io.on('connection', (socket) => {
    const { query } = socket.handshake;
    const { userId, userName, roomId } = query;

    socket.join(roomId);

    const roomUsers = rooms.get(roomId) || [];
    roomUsers.push({userId, userName, streams: [], clientId: socket.id});
    rooms.set(roomId, roomUsers);
    
    console.log(userName + ' connected');

    socket.on('disconnect', () => {
        console.log(`${userName} disconnect`);
        const roomUsers = rooms.get(roomId) || [];
        const findIndex = roomUsers.findIndex(item => item.userId === userId);
        if(findIndex > -1) {
            roomUsers.splice(findIndex, 1);
            rooms.set(roomId, roomUsers);
        }
        socket.leave(roomId);
        socket.broadcast.to(roomId).emit('user update', {type: 'leave', userId, userName})
    })

    socket.emit('joined');
    socket.broadcast.to(roomId).emit('user update', {type: 'join', userId, userName})

    socket.on('pc message', ({userId, data}) => {
        console.log('receive peerConnect', userId, data);
        socket.broadcast.to(roomId).emit('pc message', {userId, data})
    })
    socket.on('stream off', ({userId, device}) => {
        console.log('receive stream off', userId, device);
        const roomUsers = rooms.get(roomId);
        const user = roomUsers.find(item => item.userId === userId);
        const set = new Set(user.streams);
        set.delete(device);
        user.streams = [...set];
        socket.broadcast.to(roomId).emit('stream off', {userId, device})
    })
    socket.on('stream on', ({userId, device, trackId}) => {
        console.log('receive stream on', userId, device, trackId);
        const roomUsers = rooms.get(roomId);
        const user = roomUsers.find(item => item.userId === userId);
        const set = new Set(user.streams);
        set.add(device);
        user.streams = [...set];
        socket.broadcast.to(roomId).emit('stream on', {userId, device, trackId})
    })
    socket.on('pull request', ({clientId}) => {
        socket.broadcast.to(clientId).emit('pull request', {userId})
    })
})

app.use('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT');
    res.header("Content-Type", "application/json;charset=utf-8");
    res.header('Access-Control-Allow-Credentials', true);
    next();
})

app.get('/getUserList', (req, res) => {
    const {roomId} = req.query;
    const roomUsers = rooms.get(roomId);
    res.send(roomUsers || []);
})

server.listen(9000, function () {
    console.log('server started')
})