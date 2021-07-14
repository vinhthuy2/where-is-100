const io = require("socket.io")(9999, {
  cors: ["http//:localhost:5500"],
});

let users = [];
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  // number circled
  socket.on("number-circled", (room,pos,aimedVal) => {
    if (room) {
      console.log(aimedVal , pos);
      io
        .to(room)
        .emit("number-circled-x",pos,aimedVal);
    }
  });

  // join room
  socket.on("join-room", (room, userName) => {
    users.push(userName);

    if (users.length<=2) {
      socket.join(room);
      console.log(userName, " joined the room");      
    } else {
      console.log('room full');
      users = [userName]
    }
    io.to(room).emit("friend-joined", userName, users.length, users)
  });

  socket.on('game-start', (room, gameMap) => {
    socket.to(room).emit('game-started', gameMap)
  })

  socket.on;
});
