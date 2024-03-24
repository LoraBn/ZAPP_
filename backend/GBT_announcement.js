// server.js
const express = require("express");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const { sendAnnouncement } = require("./controller");

const app = express();
const Port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Set up routes...
const routes = require("./routes");
app.use("/api", routes);

// Maintain a mapping of socket ID to owner
const socketOwnerMap = {};

const server = app.listen(Port, () => {
  console.log("Server is listening on port:", Port);
});

const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);

io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("user_info", (userInfo) => {
    socket.userType = userInfo.type;
    socket.owner = userInfo.owner; // Set owner information
    socketOwnerMap[socket.id] = userInfo.owner; // Update socketOwnerMap
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
    delete socketOwnerMap[socket.id]; // Remove socket from map on disconnect
  });
});

// Function to broadcast announcements to specific user types under the same owner
const broadcastAnnouncement = (io, announcement, owner) => {
  io.sockets.clients().forEach((socket) => {
    if (socket.owner === owner && (socket.userType === "customer" || socket.userType === "employee")) {
      socket.emit("announcement", announcement);
    }
  });
};

// Example usage:
const announcementObj = { message: "New announcement!" };
const owner = "example_owner_id"; // Set the owner ID
broadcastAnnouncement(io, announcementObj, owner);
