const express = require("express");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

const Port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("HELLO");
});

const server = app.listen(Port, () => {
  console.log("Server is listening on port:", Port);
});

const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);

// app.use(function(req, res, next) {
//     req.io = io;
//     next();
// });

io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

const OwnerRoutes = require("./Routes/ownerRoutes")(io);
const globalRoutes = require("./Routes/globalRoutes");
const employeeRoutes = require("./Routes/employeeRoutes")(io);
const customerRoutes = require("./Routes/customerRoutes");

app.use("/api/", globalRoutes);
app.use("/api/owner", OwnerRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/customer", customerRoutes);
