import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "../css/ChatMessage.css";
import "highlight.js/styles/github-dark.css";

export default function ChatMessage({ message, isBot, timestamp }) {
  return (
    <div className={`chat-message ${isBot ? "bot" : "user"}`}>
      <div className={`avatar ${isBot ? "bot" : "user"}`}>
        {isBot ? <Bot className="icon" /> : <User className="icon" />}
      </div>

      <div className={`message-container ${isBot ? "bot" : "user"}`}>
        <div className={`bubble ${isBot ? "bot" : "user"}`}>
          {isBot ? (
            <div className="text markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                }}
              >
                {message}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text">{message}</p>
          )}
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
