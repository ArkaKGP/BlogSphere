import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    if (isLoggedIn && user && user._id) {
      const serverUrl =
        import.meta.env.VITE_BASE_URL ||
        import.meta.env.REACT_APP_BASE_URL ||
        'http://localhost:5000';

      const newSocket = io(serverUrl, {
        query: {
          userId: user._id,
        },
      });

      setSocket(newSocket);

      newSocket.on('getOnlineUsers', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        newSocket.close();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isLoggedIn, user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
