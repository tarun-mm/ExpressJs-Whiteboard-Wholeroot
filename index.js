const express = require('express')
const http = require('http')
const cors = require('cors')
const {Server} = require('socket.io')

const app = express()

app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "https://whole-root.azurewebsites.net/",
        methods: ["GET", "POST"],
    }
})

io.on("connection", socket => {
    console.log(`Connected: ${socket.id}`)

    socket.on("join-room", data =>{
        socket.join(data.roomId)
        console.log(`${data.user} joined room ${data.roomId}`)
    })

    socket.on("send-canvas", data => {
        console.log(data)
        socket.to(data.roomId).emit("recieve-canvas", data.image)
    })

    socket.on("disconnect", () => {
        console.log(`user disconnected: ${socket.id}`)
    })
})

server.listen(5000, () => {
    console.log("SERVER RUNNING")
})