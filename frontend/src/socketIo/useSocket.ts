import  { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:4000';

function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);


  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { socket };
}

export default useSocket;