import { NavLink } from "react-router-dom";
import "../css/NavBar.css";

function NavBar() {
  const getLinkClass = ({ isActive }) =>
    isActive ? "navbar_link active" : "navbar_link";
  return (
    <nav className="navbar">
       {/*<a href="#top" className="logo">
        <img src="https://www.undp.org/sites/g/files/zskgke326/files/2025-04/undp-logo-blue.4f32e17f.svg"
          alt="UNDP logo" />
      </a> */} 
      <ul className="navbar_list">
        <li className="navbar_item">
          <NavLink to="/" className={getLinkClass}>
            Dimensions
          </NavLink>
        </li>
        <li className="navbar_item">
          <NavLink to="/chatbot" className={getLinkClass}>
            Chatbot
          </NavLink>
        </li>
        <li className="navbar_item">
          <NavLink to="/more-info" className={getLinkClass}>
            More Info
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar