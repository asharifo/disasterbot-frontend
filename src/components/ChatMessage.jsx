import { Bot, User } from "lucide-react";
import "../css/ChatMessage.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// !!! Display sources above timestamp 
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              p: ({ children }) => <p className="text">{children}</p>,
              code: ({ inline, children, ...props }) =>
                inline ? (
                  <code className="inline-code">{children}</code>
                ) : (
                  <pre className="code-block">
                    <code {...props}>{children}</code>
                  </pre>
                ),
            }}
          >
            {message}
          </ReactMarkdown>
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
