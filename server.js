const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const http = require("http");
const path = require("path");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("assets"));
app.use(express.static("."));

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

// socket.io

let users = {};

io.on("connection", (socket) => {
  console.log("a user connected");
  // number circled
  socket.on("number-circled", (room, pos, aimedVal) => {
    if (room) {
      console.log(aimedVal, pos);
      io.to(room).emit("number-circled-x", pos, aimedVal);
    }
  });

  // join room
  socket.on("join-room", (room, userName) => {
    if (!users[room]) {
      users[room] = [userName]
    } else {
      users[room] = [...users[room], userName]
    }

    if (users[room].length <= 2) {
      socket.join(room);
      console.log(userName, " joined the room", room);
    } else {
      console.log("room full");
      socket.emit('room-full');
    }
    io.to(room).emit("friend-joined", userName, users[room].length, users[room]);
  });

  socket.on("game-start", (room, gameMap) => {
    socket.to(room).emit("game-started", gameMap);
  });
});

server.listen(port, () => {
  console.log("listening on port", port);
});
