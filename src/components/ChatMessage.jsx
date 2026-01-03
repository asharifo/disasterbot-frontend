import { Bot, User } from "lucide-react";
import "../css/ChatMessage.css"

export default function ChatMessage({ message, isBot, timestamp }) {
  return (
    <div className={`chat-message ${isBot ? "bot" : "user"}`}>
      {/* Avatar */}
      <div className={`avatar ${isBot ? "bot" : "user"}`}>
        {isBot ? <Bot className="icon" /> : <User className="icon" />}
      </div>

      {/* Text bubble and time */}
      <div className={`message-container ${isBot ? "bot" : "user"}`}>
        <div className={`bubble ${isBot ? "bot" : "user"}`}>
          <p className="text">{message}</p>
        </div>
        <span className="timestamp">
          {timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
