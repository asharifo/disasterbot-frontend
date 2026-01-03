import "./css/App.css";
import DisasterDimensions from "./pages/DisasterDimensions";
import Chatbot from "./pages/Chatbot.jsx";
import { Routes, Route } from "react-router-dom";
import MoreInfo from "./pages/MoreInfo";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatbotLayout from "./components/ChatbotLayout";

function App() {
  return (
    <>
      <NavBar />
      <main className="content">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<DisasterDimensions />} />
          <Route path="/more-info" element={<MoreInfo />} />

          {/* Chatbot route tree */}
          <Route path="/chatbot">
            {/* Public auth pages */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Protected chatbot workspace */}
            <Route element={<ChatbotLayout />}>
              <Route index element={<Chatbot />} />
            </Route>
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;
