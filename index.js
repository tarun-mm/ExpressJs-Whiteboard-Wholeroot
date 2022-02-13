const express = require('express')
const http = require('http')
const cors = require('cors')
const {Server} = require('socket.io')

const app = express()

app.use(cors())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
})


let rooms = new Map();

io.on("connection", socket => {
    console.log(`Connected: ${socket.id}`)

    socket.on("join-room", data =>{

        let isJoined = false
        if (data.isTeacher === true){
            socket.join(data.roomId)
            rooms.set(data.roomId, {teacher: data.user, memberCount: 1});
            console.log(`${data.user} joined room ${data.roomId} ${data.isTeacher}`)
            isJoined = true;
        }else{
            console.log(rooms.keys())
    
            if (rooms.has(data.roomId)){
                console.log(`${data.user} joined room ${data.roomId} ${data.isTeacher} ${rooms.get(data.roomId).memberCount}`)
                socket.join(data.roomId)
                rooms.set(data.roomId, {...rooms.get(data.roomId), memberCount: rooms.get(data.roomId).memberCount + 1})
                isJoined = true;
            }
        }
        console.log(isJoined)
        socket.emit("join-result", {isJoined: isJoined, teacher: rooms.get(data.roomId).teacher})
    })


    socket.on("leave-room", data => {
        socket.leave(data.roomId)
        console.log('left')
        rooms.set({...rooms.get(data.roomId), memberCount: rooms.get(data.roomId).memberCount - 1})
        if (rooms.get(data.roomId).memberCount == 0){
            rooms.delete(data.roomId)
            console.log(`${data.roomId} was deleted`)
        }

        socket.emit("leave-result", true);
    })

    socket.on("send-canvas", data => {
        socket.to(data.roomId).emit("recieve-canvas", data.image)
    })

    socket.on("disconnect", () => {
        console.log(`user disconnected: ${socket.id}`)
    })
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log("SERVER RUNNING")
})