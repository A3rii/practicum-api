import app from './app.js';
import 'dotenv/config';
import http from 'http';
import { initializeSocket } from './listeners/socketManager.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

initializeSocket(server);
// Start the server for both HTTP and WebSocket
server.listen(PORT, () => {
  console.log(`App is listening on http://127.0.0.1:${PORT}`);
});
