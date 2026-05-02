import React from "react";
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxes,
  faTriangleExclamation,
  faChartLine,
  faPlus,
  faQrcode,
  faHouse,
  faBox,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  return (
    <div className="home-wrapper">

      {/* HEADER */}
      <div className="home-header">
        <h3>Pharmacy Sidekick</h3>
      </div>

      {/* CONTENT */}
      <div className="home-content">
        <h1>Overview</h1>
        <p className="subtitle">Your pharmacy's daily performance.</p>

        {/* CARD 1 */}
        <div className="card">
          <div className="card-top">
            <span>TOTAL STOCK VALUE</span>
            <div className="icon green">
              <FontAwesomeIcon icon={faBoxes} />
            </div>
          </div>
          <h2>₹12,45,000</h2>
          <p className="success">+2.4% vs last month</p>
        </div>

        {/* CARD 2 */}
        <div className="card">
          <div className="card-top">
            <span>EXPIRING SOON</span>
            <div className="icon red">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
          </div>
          <h2>42 items</h2>
          <p className="danger">Action required within 30 days</p>
        </div>

        {/* CARD 3 */}
        <div className="card">
          <div className="card-top">
            <span>TOTAL SALES</span>
            <div className="icon blue">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
          </div>
          <h2>₹45,200</h2>
          <p>Across all transactions</p>
        </div>

        {/* QUICK ACTIONS */}
        <h2 className="section-title">Quick Actions</h2>

        <div className="quick-grid">
          <div className="quick-card">
            <div className="quick-icon main">
            <FontAwesomeIcon icon={faQrcode} />
            </div>
            <p>Sell Item</p>
          </div>

          <div className="quick-card">
            <div className="quick-icon">
              <FontAwesomeIcon icon={faQrcode} />
            </div>
            <p>Stock In</p>
          </div>
        </div>
      </div>

 
    </div>
  );
}