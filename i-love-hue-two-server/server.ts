import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { MainController } from './controllers/main.controller';

const app = express();

// initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

// initialize game controller
const mainController = new MainController(wss);

//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});
