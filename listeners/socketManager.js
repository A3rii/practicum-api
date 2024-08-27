import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allows all origins (you can specify specific domains if needed)
      methods: ['GET', 'POST'], // Allowed HTTP methods
      allowedHeaders: ['Content-Type'], // Allowed headers
      credentials: true, // Allows cookies and credentials
    },
  });

  // WebSocket server logic
  io.on('connection', (socket) => {
    io.emit('a user connected');
    console.log('user connected');

    socket.on('clientMessage', (msg) => {
      console.log(`Message from client: ${msg}`);
      io.emit('broadcastMessage', msg); // Broadcast the message to all clients
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return io;
};

//  Realtime notification for lessors
export const sendBookingNotification = (booking) => {
  const bookingNotifications = [];
  if (io) {
    console.log('Sending booking notification:', booking);
    bookingNotifications.push(booking);
    io.emit('bookingNotification', bookingNotifications); // Emit the notification to all connected clients
  } else {
    console.error('Socket.IO not initialized');
  }
};

// Realtime for super admin
export const sendRegisterNotification = (register) => {
  const registerNotifications = [];
  if (io) {
    console.log('register notification:', register);
    registerNotifications.push(register);
    io.emit('registerNotification', registerNotifications); // Emit the notification to all connected
  } else {
    console.error('Socket.IO not initialized');
  }
};
