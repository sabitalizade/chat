const express = require('express');
const app =express();
const socketio = require('socket.io');
const http =require('http');
const router = require('./router');
const {addUser,removeUser,getUser,getUsersInRoom}=require('./users')
const cors= require('cors')

const port =  process.env.PORT || 5000;

const server=http.createServer(app);
const io = socketio(server)

// router midleware

io.on('connection',(socket)=>{
    
    socket.on('join',({name,room},callback)=>{
        const {error,user}=addUser({id:socket.id,name,room})
        if(error){
            return callback(error)
        }
        socket.emit('massage',{user:'admin', text:`${user.name}, welcome to the room ${user.room}`});
        socket.broadcast.to(user.room).emit('message'.anchor,{user:'admin',text:`${user.name}, has joined`})
        socket.join(user.room);
        
        io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})
        callback();   
    })

    socket.on('sendMessage',(message,callback)=>{
            const user = getUser(socket.id);
            
            io.to(user.room).emit('message',{user:user.name,text:message});
            
            io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})

            callback()
    })
    
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',{user:'admin',text: `${user.name},has lefted`})
        }
    })
})

app.use(router);
app.use(cors);

server.listen(port,(err)=>{
    console.log(`App started http://localhost:${port}`);
})