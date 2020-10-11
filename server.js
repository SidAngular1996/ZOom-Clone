const express=require('express');
const app=express();
const server=require('http').Server(app);
const {v4:uuidv4}=require('uuid')
// uuid is used for generating unique id for each person
const { ExpressPeerServer } = require('peer')
const peerServer=ExpressPeerServer(server , {
    debug:true
})
//peer is used to wrap webRtc which gives a real time env
const io =require('socket.io')(server)
app.set('view engine','ejs')
app.use(express.static('public'))

app.use('/peerjs',peerServer)
app.get('/',(req,res)=>{
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room',(req,res)=>{
    res.render('room',{roomId:req.params.room})
})

io.on('connection', socket => {
    socket.on('join-room' , (roomId,userId)=>{
        console.log('joined room')
        socket.join(roomId)
        //broadcast other users that a user has joined
        socket.to(roomId).broadcast.emit('user-connected',userId)

        //listen to enter when message entered
        socket.on('message',message=>{
            // to same roomid
            io.to(roomId).emit('createMessage',message)
        })
    })
})
//socket.emit join room and server.js accept it from socket.on

server.listen(3030);