const io = require("socket.io").listen(3000);
io.on('connection', (socket) => {
    socket.on('chatdata', (data) => {
        socket.broadcast.emit('chat', { url: data.url, text: data.data });
    });
});