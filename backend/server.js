require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')

const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const messageRoutes = require('./routes/messageRoutes')

const app = express()
app.use(cors())
app.use(express.json())

connectDB()

let onlineUsers = new Map();

app.use('/api/v1/auth', userRoutes)
app.use('/api/v1/messages', messageRoutes)

app.get('/', (req, res) => {
    res.send("Real time chat application Backend is up and running!!!")
})

const server = http.createServer(app)
const io = new Server(server, {
    cors:{
        origin: '*',
        methods: ['GET', 'POST']
    }
})

io.on('connection', (socket)=>{
    console.log('Socket connected :: ', socket.id)

    socket.on("sendMessage", (data) => {
        io.to(data.room || "global").emit("receiveMessage", data)
    })

    socket.on("typing", (user) => {
        socket.broadcast.emit("showTyping", user)
    })

    socket.on("stopTyping", () => {
        socket.broadcast.emit("hideTyping")
    })

    socket.on("joinUser", (user) => {
        onlineUsers.set(socket.id, user);
        io.emit("onlineUsers", Array.from(onlineUsers.values()))
    })

    socket.on("joinRoom", (room) => {
        socket.join(room);
    })

    socket.on('disconnect', ()=>{
        onlineUsers.delete(socket.id)
        io.emit("onlineUsers", Array.from(onlineUsers.values()))
        console.log('Socket disconnected :: ', socket.id)
    })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, ()=>{
    console.log(`Server is running on PORT :: ${PORT}`)
})