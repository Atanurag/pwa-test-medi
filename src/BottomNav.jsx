import React from "react";
import "./BottomNav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faBox,
  faQrcode,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";

export default function BottomNav({ active, setScreen }) {
  return (
    <div className="bottom-nav">
      <NavItem
        icon={faHouse}
        label="Home"
        active={active === "home"}
        onClick={() => setScreen("home")}
      />

      <NavItem
        icon={faBox}
        label="Inventory"
        active={active === "inventory"}
        onClick={() => setScreen("inventory")}
      />

      <NavItem
        icon={faQrcode}
        label="Scan"
        active={active === "scan"}
        onClick={() => setScreen("scan")}
      />

      <NavItem
        icon={faFileLines}
        label="Reports"
        active={active === "reports"}
        onClick={() => setScreen("reports")}
      />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      <FontAwesomeIcon icon={icon} />
      <span>{label}</span>
    </div>
  );
}