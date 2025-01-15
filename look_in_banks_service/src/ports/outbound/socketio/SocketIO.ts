import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import Config from '@config/index';

export default class WebSocket {
    private static instance: WebSocket;
    private io: SocketIOServer;
    // Don't delete this variable, it avoids memory leak
    private heartbeatInterval: NodeJS.Timeout;
    private clients: Map<string, NodeJS.Timeout>;
    private config = new Config().getConfig();
    private allowedOrigins = [
        "http://localhost:5173",
        "https://storage.googleapis.com",
        "https://livechat-henna.vercel.app"
    ];

    private constructor(server: HttpServer) {
        this.io = new SocketIOServer(server);
        
        this.clients = new Map();          

        this.io.on('connection', (socket) => {
            // console.log(`New WebSocket connection from ${socket.handshake.address}`);

            this.clients.set(socket.id, this.createHeartbeatTimeout(socket));

            socket.on("join_room", (data) => {
                const { room, token } = data;
                
                if (String(room).startsWith(this.config.websocket.receiverPrefix)) {
                  if (!token) {
                    socket.emit("error", "Autenticação necessária");
                    // console.log("Usuário não entrou na sala")
                    return;
                  }
            
                  jwt.verify(token, this.config.jwtSecret, (err, decoded) => {
                    if (err) {
                      socket.emit("error", "Token inválido");
                    //   console.log("Usuário não entrou na sala")
                      return;
                    }

                    // console.log(decoded)

                    if (decoded.id !== Number(room.split('-')[1])) {
                        socket.emit("error", "Você não tem permissão para entrar nesta sala");
                        console.log("Usuário não entrou na sala")
                        return;
                    }
            
                    socket.join(room);
                    // console.log(`Usuário ${decoded.id} entrou na sala ${room}`);
                    socket.emit("joined_room", room);
                  });
                } else {
                  socket.join(room);
                  console.log(`Usuário entrou na sala ${room}`);
                  socket.emit("joined_room", room);
                }
            });
            
        
            socket.on('leave_room', (room) => {
                socket.leave(room);
                // console.log(`Socket ${socket.id} left room ${room}`);
            });
        
            socket.on('message', (message) => {
                // console.log(`Received message: ${message}`);
                socket.send(`Hello, you sent -> ${message}`);
            });

            socket.on('disconnect', () => {
                // console.log('Client disconnected');
                this.clients.delete(socket.id);
            });

            socket.on('heartbeat', () => {
                // console.log(`Received heartbeat from ${socket.id}`);
                clearTimeout(this.clients.get(socket.id));
                this.clients.set(socket.id, this.createHeartbeatTimeout(socket));
            });
        });

        this.startHeartbeat();
    }

    static getInstance(server: HttpServer): WebSocket {
        if (!WebSocket.instance) {
            WebSocket.instance = new WebSocket(server);
        }
        return WebSocket.instance;
    }

    private startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.io.emit('heartbeat');
        }, 30000);
    }

    private createHeartbeatTimeout(socket: any): NodeJS.Timeout {
        return setTimeout(() => {
            // console.log(`Disconnecting client ${socket.id} due to missed heartbeat`);
            socket.disconnect(true);
            this.clients.delete(socket.id);
        }, 35000);
    }

    public sendMessageToRoom(room: string, message: string) {
        this.io.to(room).emit('message', message);
    }
}