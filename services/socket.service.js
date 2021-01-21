const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null
var gSocketBySessionIdMap = {}

function emit({ type, data }) {
    gIo.emit(type, data);
}

function connectSockets(http, session) {

    gIo = require("socket.io")(http, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "DELETE", "PUT"],
            allowedHeaders: ["my-custom-header"],
            credentials: true
        }
    });
    const sharedSession = require('express-socket.io-session');

    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    gIo.on('connection', socket => {
        // console.log('socket.handshake', socket.handshake)
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })

        //initial connection
        socket.on('join board', boardId => {
            if (socket.currBoard) {
                socket.leave(socket.currBoard)
            }
            socket.join(boardId)
            // logger.debug('Session ID is', socket.handshake.sessionID)
            socket.currBoard = boardId
            console.log('Joining board', socket.currBoard)
        })
        //topic =board._id
        //currBoard = user current board

        // socket.on('chat newMsg', msg => {
        //     // emits to all sockets:
        //     // gIo.emit('chat addMsg', msg)
        //     // emits only to sockets in the same room
        //     gIo.to(socket.currBoard).emit('chat addMsg', msg)
        // })
        socket.on('update board', board => {
            console.log('******** board is here!!!!! ***********');
            console.log('socket.currBoard is:', socket.currBoard);
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            socket.to(socket.currBoard).emit('update board', board)
        })

    })
}

// Send to all sockets BUT not the current socket 
function broadcast({ type, data }) {
    const store = asyncLocalStorage.getStore()
    const { sessionId } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map', gSocketBySessionIdMap)
    excludedSocket.broadcast.emit(type, data)
}

module.exports = {
    connectSockets,
    emit,
    broadcast
}



