import { useEffect, useRef, useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MessageBubble from './MessageBubble';

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const ChatWindow = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load conversation history when selected user changes
  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      try {
        const res = await API.get(`/messages/${selectedUser._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // Listen for real-time incoming messages and typing events
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (data) => {
      if (selectedUser && data.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    const handleTyping = ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) setIsTyping(true);
    };

    const handleStopTyping = ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) setIsTyping(false);
    };

    socket.on('getMessage', handleIncoming);
    socket.on('userTyping', handleTyping);
    socket.on('userStopTyping', handleStopTyping);

    return () => {
      socket.off('getMessage', handleIncoming);
      socket.off('userTyping', handleTyping);
      socket.off('userStopTyping', handleStopTyping);
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!socket || !selectedUser) return;

    socket.emit('typing', { senderId: user._id, receiverId: selectedUser._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { senderId: user._id, receiverId: selectedUser._id });
    }, 1200);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;

    const messageText = text;
    setText('');

    const optimisticMessage = {
      senderId: user._id,
      receiverId: selectedUser._id,
      message: messageText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      await API.post(`/messages/send/${selectedUser._id}`, { message: messageText });
      socket?.emit('sendMessage', {
        senderId: user._id,
        receiverId: selectedUser._id,
        message: messageText,
      });
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (!selectedUser) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-mark">◈</div>
        <p>Pick someone from the list to start a conversation.</p>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="avatar-wrap">
          <div className="avatar">{getInitials(selectedUser.username)}</div>
          {isOnline && <span className="online-dot" />}
        </div>
        <div>
          <p className="chat-header-name">{selectedUser.username}</p>
          <p className="chat-header-status">{isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      <div className="chat-body">
        {messages.map((m, idx) => (
          <MessageBubble key={m._id || idx} message={m} isOwn={m.senderId === user._id} />
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message"
          value={text}
          onChange={handleTextChange}
        />
        <button type="submit" className="send-btn" disabled={!text.trim()}>
          ↑
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
