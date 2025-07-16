import io from 'socket.io-client';
import { addSocketNotification } from '../redux/slices/notificationSlice';
import store from '../redux/store';

const socket = io(process.env.REACT_APP_API_URL, {
  withCredentials: true
});

export const initSocket = (userId) => {
  socket.on('connect', () => {
    socket.emit('join', userId);
  });

  socket.on('new-notification', (notification) => {
    store.dispatch(addSocketNotification(notification));
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
};

export default socket;