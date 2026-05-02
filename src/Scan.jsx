import React, { useState, useEffect } from "react";
import "./Scan.css";
import { Html5Qrcode } from "html5-qrcode";
import Tesseract from "tesseract.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQrcode,
  faClipboardCheck,
  faCashRegister,
} from "@fortawesome/free-solid-svg-icons";

export default function Scan() {
  const [mode, setMode] = useState(null); // stock / sell
  const [scannedData, setScannedData] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!mode) return;

    const scanner = new Html5Qrcode("reader");

    scanner.start(
      { facingMode: "environment" },
      { fps: 10 },
      async (text) => {
        await scanner.stop();

        // 📦 barcode
        const barcode = text;

        // 📷 OCR capture
        const video = document.querySelector("video");
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        const result = await Tesseract.recognize(canvas, "eng");
        const extracted = result.data.text;

        const expiryMatch = extracted.match(/\b\d{2}\/\d{4}\b/);
        const priceMatch = extracted.match(/₹?\d+(\.\d+)?/);

        setScannedData({
          name: "Scanned Medicine",
          barcode,
          expiry: expiryMatch?.[0] || "",
          price: priceMatch?.[0] || "",
        });
      }
    );

    return () => scanner.stop().catch(() => {});
  }, [mode]);

  // 🟢 STOCK IN
  const handleStock = () => {
    const inv = JSON.parse(localStorage.getItem("inv")) || [];

    inv.push({
      ...scannedData,
      stock: qty,
    });

    localStorage.setItem("inv", JSON.stringify(inv));

    reset();
  };

  // 🔴 SELL
  const handleSell = () => {
    let inv = JSON.parse(localStorage.getItem("inv")) || [];

    const item = inv.find((i) => i.barcode === scannedData.barcode);

    if (!item) {
      alert("Item not found in inventory");
      return;
    }

    item.stock -= qty;

    if (item.stock < 0) item.stock = 0;

    localStorage.setItem("inv", JSON.stringify(inv));

    reset();
  };

  const reset = () => {
    setMode(null);
    setScannedData(null);
    setQty(1);
  };

  return (
    <div className="scan-page">

      {/* TOP ICON */}
      {!mode && (
        <>
          <div className="scan-icon">
            <FontAwesomeIcon icon={faQrcode} />
          </div>

          <h1>Scan Medicine</h1>
          <p className="subtitle">Choose action</p>

          {/* STOCK CARD */}
          <div className="scan-card" onClick={() => setMode("stock")}>
            <div className="card-icon">
              <FontAwesomeIcon icon={faClipboardCheck} />
            </div>
            <h2>Stock In</h2>
            <p>Add or update inventory</p>
          </div>

          {/* SELL CARD */}
          <div className="scan-card" onClick={() => setMode("sell")}>
            <div className="card-icon">
              <FontAwesomeIcon icon={faCashRegister} />
            </div>
            <h2>Quick Sell</h2>
            <p>Fast checkout</p>
          </div>
        </>
      )}

      {/* CAMERA */}
      {mode && !scannedData && (
        <div id="reader" className="scanner-box" />
      )}

      {/* MODAL */}
      {scannedData && (
        <div className="modal">
          <div className="modal-card">

            <h2>{scannedData.name}</h2>

            <p>Expiry: {scannedData.expiry || "N/A"}</p>
            <p>MRP: {scannedData.price || "N/A"}</p>

            {/* QUICK BUTTONS */}
            <div className="qty-buttons">
              {[1,2,3,5,10].map((n) => (
                <button key={n} onClick={() => setQty(n)}>
                  {n}
                </button>
              ))}
            </div>

            {/* INPUT */}
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />

            {/* ACTION BUTTON */}
            <button
              className="submit"
              onClick={mode === "stock" ? handleStock : handleSell}
            >
              {mode === "stock" ? "Add to Inventory" : "Confirm Sale"}
            </button>

            <button className="cancel" onClick={reset}>
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
  );
}