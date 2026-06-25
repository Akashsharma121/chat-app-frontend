const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={`bubble-row ${isOwn ? 'bubble-row-own' : ''}`}>
      <div className={`bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
        <p className="bubble-text">{message.message}</p>
        <span className="bubble-time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
