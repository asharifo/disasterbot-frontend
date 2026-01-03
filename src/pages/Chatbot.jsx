import "../css/Chatbot.css";
import { useEffect, useState, useRef } from "react";
import PromptCarousel from "../components/PromptCarousel";
import InputForm from "../components/InputForm";
import ChatMessage from "../components/ChatMessage";
import TypingIndicator from "../components/TypingIndicator";

const prompts = [
  "What are the recommended evacuation routes for wildfires in my region?",
  "How should I prepare my family for a possible tsunami warning?",
  "What emergency kit items are essential for earthquake evacuation?",
  "When will authorities issue evacuation orders for hurricanes?",
  "Provide recent flood frequency statistics in my country.",
  "What is the average annual number of earthquakes in my region?",
  "Show historical data on landslide incidents locally.",
  "Which natural disasters pose the greatest risk here?",
  "How can I develop a family evacuation plan for cyclones?",
  "Where can I find approved shelters during severe storms?",
  "Who coordinates local disaster response efforts?",
  "What communication channels are used for evacuation alerts?",
];

const countries = [
  "Kazakhstan",
  "Kyrgyzstan",
  "Tajikistan",
  "Turkmenistan",
  "Uzbekistan",
];

function Chatbot() {
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currCountry, setCurrCountry] = useState("");
  const [showSelector, setShowSelector] = useState(true);
  const messagesRef = useRef(null);

  const handleSendMessage = async (messageText) => {
  if (!hasStartedChat) setHasStartedChat(true);

  const userMessage = {
    id: Date.now().toString(),
    text: messageText,
    isBot: false,
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, userMessage]);
  setIsTyping(true);

  try {
    const resp = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: messageText,
        country: currCountry
      })
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const data = await resp.json();
    const botMessage = {
      id: (Date.now() + 1).toString(),
      text: data.answer ?? "No answer returned.",
      isBot: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
  } catch (error) {
    const errorMessage = {
      id: (Date.now() + 2).toString(),
      text: "Sorry, something went wrong. Please try again.",
      isBot: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
};

  // Auto-scroll to new message
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSelectCountry = (country) => {
    setCurrCountry(country);
    setShowSelector(false);
  };

  return (
    <div className="chatbot-ui">
      <div className={`country-overlay ${!showSelector ? "hidden" : ""}`}>
        <div className="country-buttons">
          {countries.map((c) => (
            <button
              key={c}
              className="country-button"
              onClick={() => handleSelectCountry(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <aside className={`country-aside ${showSelector ? "" : "visible"}`}>
        {countries.map((c) => (
          <button
            key={c}
            className={
              c === currCountry ? "aside-button selected" : "aside-button"
            }
            onClick={() => setCurrCountry(c)}
          >
            {c}
          </button>
        ))}
      </aside>

      <div className="chatbot-elements">
        <div className="chatbot-box">
          {!hasStartedChat ? (
            <div className="introText">
              <h1>DisasterBot</h1>
              <h2>AI-Enabled Information on Disaster Risk and Response</h2>
              <h3>Ask me anything—or click an example to get started</h3>
              <div className="carousel-container">
                <PromptCarousel
                  prompts={prompts}
                  onPromptSelect={handleSendMessage}
                />
              </div>
            </div>
          ) : (
            <div ref={messagesRef} className="messages">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isBot={message.isBot}
                  timestamp={message.timestamp}
                />
              ))}
            </div>
          )}
        </div>
        {isTyping && (
          <div className="bubbles-container">
            <TypingIndicator />
          </div>
        )}
        <div className="input-form">
          <InputForm onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
