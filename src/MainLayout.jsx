import React, { useState } from "react";
import Home from "./Home";
import Inventory from "./Inventory";
import Scan from "./Scan";
// import Reports from "./Reports";
import BottomNav from "./BottomNav";

export default function MainLayout() {
  const [screen, setScreen] = useState("home");

  const renderScreen = () => {
    if (screen === "home") return <Home />;
    if (screen === "inventory") return <Inventory />;
    if (screen === "scan") return <Scan />;
    // if (screen === "reports") return <Reports />;
  };

  return (
    <div className="layout">
      <div className="content">{renderScreen()}</div>

      <BottomNav active={screen} setScreen={setScreen} />
    </div>
  );
}