import "./App.css";
import DisasterDimensions from "./pages/DisasterDimensions";
import Chatbot from "./pages/Chatbot";
import { Routes, Route } from "react-router-dom";
import MoreInfo from "./pages/MoreInfo";
import NavBar from "./components/NavBar";

function App() {
  return (
    <>
      <NavBar />
      <main className="content">
        <Routes>
          <Route path="/" element={<DisasterDimensions />} />

          <Route path="/chatbot">
            {/* public login route */}
            <Route path="login" element={<Login />} />
            {/* protected area */}
            <Route element={<ChatbotLayout />}>
              <Route index element={<Chatbot />} />
            </Route>
          </Route>

          <Route path="/more-info" element={<MoreInfo />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
