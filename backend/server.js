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

    socket.on('disconnect', ()=>{
        console.log('Socket disconnected :: ', socket.id)
    })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, ()=>{
    console.log(`Server is running on PORT :: ${PORT}`)
})