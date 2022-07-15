const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});
const path = require('path');
const clients = new Map();

io.on('connection', (socket) => {
    const { query } = socket.handshake;
    const { userId, userName } = query;
    clients.set(userId, {
        userName,
        client: socket
    });
    console.log(userName + ' connected');
    console.log(typeof io.sockets);

    socket.on('peerConnect', (data) => {
        clients.values().forEach(({client}) => {
            client.emit(data);
        })
    })

    socket.on('disconnect', () => {
        console.log(`${userName} disconnect`);
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
    const list = [];
    clients.forEach((value, key) => {
        list.push({userId: key, userName: value.userName})
    })
    res.send(list);
})

server.listen(9000, function () {
    console.log('server started')
})