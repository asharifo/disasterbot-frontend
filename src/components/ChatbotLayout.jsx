import { Outlet } from "react-router-dom";

function ChatbotLayout() {
  return (
    <section className="chatbot-layout">
      <Outlet />
    </section>
  );
}

export default ChatbotLayout;