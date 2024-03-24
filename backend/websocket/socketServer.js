const { Server } = require("socket.io");

class WebSocketServer {
    constructor() {
        if (WebSocketServer.instance){
            return WebSocketServer.instance;
        }

        WebSocketServer.instance = this;
}

start(httpServer) {
    this.httpServer = httpServer;
    this.server = new Server(httpServer);

    this.onConnect()
}

onConnect() {
    this.server.on("connection", (client) => {
        this.onClientMessage(client);
        this.onClientError(client);
        this.onClientClose(client);
        this.sendInitialDataToClient(client);
        this.onChannelJoin(client);
    })
}
}

const webSocketServer = new WebSocketServer(); // Create an instance

module.exports = webSocketServer; // Export the instance