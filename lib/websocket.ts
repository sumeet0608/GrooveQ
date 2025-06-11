import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = async (): Promise<Socket> => {
  if (!socket) {
    // Make sure the socket server is initialized
    await fetch('/api/socket');
    
    socket = io({
      path: '/api/socket/io',
    });
  }
  
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};