const joinRooms = async (rooms,io) => {
    io.on("connection", (socket) => {
  
      rooms.forEach(room => {
        socket.join(room);
        console.log("joined room",room)
      });
  
      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        rooms.forEach(room => {
            socket.leave(room);
            console.log("left room",room)
          });
      });
    });
  }

  module.exports = {joinRooms}