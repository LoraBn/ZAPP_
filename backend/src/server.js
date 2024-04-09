const express = require("express");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

const Port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const server = app.listen(Port, () => {
  console.log("Server is listening on port:", Port);
});

const io = new Server(server, { 
  cors: { 
    origin: ["http://3.75.158.163", "http://3.125.183.140", "http://35.157.117.28"]
  } 
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const OwnerRoutes = require("./Routes/ownerRoutes");
const globalRoutes = require("./Routes/globalRoutes");
const employeeRoutes = require("./Routes/employeeRoutes");
const customerRoutes = require("./Routes/customerRoutes");

app.use("/api/", globalRoutes);
app.use("/api/owner", OwnerRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/customer", customerRoutes);

module.exports = app;
