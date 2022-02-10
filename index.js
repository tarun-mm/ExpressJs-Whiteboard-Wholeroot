const express = require('express')
const http = require('http')
const cors = require('cors')

const app = express()
const socketIO = require('socket.io')
const server = http.createServer(app)
const io = socketIO(server);

app.use(cors())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

app.get("/", (req, res) => {
res.send("server");
});

// const io = new Server(server, {
//     cors: {
//         origin: "https://whole-root.azurewebsites.net/",
//         methods: ["GET", "POST"],
//     }
// })

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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log("SERVER RUNNING")
})