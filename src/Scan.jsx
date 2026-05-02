import React, { useState, useEffect, useRef } from "react";
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
  const [mode, setMode] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [qty, setQty] = useState(1);
  const [showOCR, setShowOCR] = useState(false);

  const scannerRef = useRef(null);

  // 🔥 START SCANNER
  useEffect(() => {
    if (!mode) return;

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    let found = false;

    scanner.start(
      { facingMode: "environment" },
      { fps: 10 },
      async (text) => {
        found = true;
        await scanner.stop();

        // Try QR parsing
        const parsed = parseQR(text);

        setScannedData({
          name: "Scanned Medicine",
          barcode: text,
          ...parsed,
        });
      }
    );

    // ⏱ fallback timer
    setTimeout(() => {
      if (!found) setShowOCR(true);
    }, 4000);

    return () => scanner.stop().catch(() => {});
  }, [mode]);

  // 🔍 QR PARSER
  const parseQR = (text) => {
    return {
      expiry: text.match(/(\d{2}\/\d{4})/)?.[0] || "",
      batch: text.match(/B\.?No\.?\s*([A-Z0-9]+)/i)?.[1] || "",
    };
  };

  // 📷 OCR CAPTURE
  const handleOCR = async () => {
    const video = document.querySelector("video");

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0);

    // 🧠 preprocess
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const avg =
        (imgData.data[i] +
          imgData.data[i + 1] +
          imgData.data[i + 2]) /
        3;
      imgData.data[i] = avg;
      imgData.data[i + 1] = avg;
      imgData.data[i + 2] = avg;
    }
    ctx.putImageData(imgData, 0, 0);

    const result = await Tesseract.recognize(canvas, "eng");

    const text = result.data.text;

    setScannedData({
      name: text.split("\n")[0],
      expiry:
        text.match(/EXP\.?\s*([A-Z]{3}\s?\d{4}|\d{2}\/\d{4})/i)?.[1] ||
        "",
      batch:
        text.match(/B\.?No\.?\s*([A-Z0-9]+)/i)?.[1] || "",
      price:
        text.match(/(?:MRP|₹)\s*([\d.]+)/i)?.[1] || "",
    });
  };

  // 🟢 STOCK
  const handleStock = () => {
    const inv = JSON.parse(localStorage.getItem("inv")) || [];

    inv.push({ ...scannedData, stock: qty });

    localStorage.setItem("inv", JSON.stringify(inv));
    reset();
  };

  // 🔴 SELL
  const handleSell = () => {
    let inv = JSON.parse(localStorage.getItem("inv")) || [];

    const item = inv.find((i) => i.barcode === scannedData.barcode);

    if (!item) return alert("Item not found");

    item.stock -= qty;
    if (item.stock < 0) item.stock = 0;

    localStorage.setItem("inv", JSON.stringify(inv));
    reset();
  };

  const reset = () => {
    setMode(null);
    setScannedData(null);
    setQty(1);
    setShowOCR(false);
  };

  return (
    <div className="scan-page">

      {/* HOME */}
      {!mode && (
        <>
          <div className="scan-icon">
            <FontAwesomeIcon icon={faQrcode} />
          </div>

          <h1>Scan Medicine</h1>
          <p className="subtitle">Choose action</p>

          <div className="scan-card" onClick={() => setMode("stock")}>
            <div className="card-icon">
              <FontAwesomeIcon icon={faClipboardCheck} />
            </div>
            <h2>Stock In</h2>
            <p>Add or update inventory</p>
          </div>

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
        <>
          <div id="reader" className="scanner-box" />

          {showOCR && (
            <button className="ocr-btn" onClick={handleOCR}>
              Read Text Instead
            </button>
          )}
        </>
      )}

      {/* MODAL */}
      {scannedData && (
        <div className="modal">
          <div className="modal-card">

            <h2>{scannedData.name}</h2>

            <p>Expiry: {scannedData.expiry || "N/A"}</p>
            <p>Batch: {scannedData.batch || "N/A"}</p>
            <p>MRP: {scannedData.price || "N/A"}</p>

            <div className="qty-buttons">
              {[1,2,3,5,10].map((n) => (
                <button key={n} onClick={() => setQty(n)}>
                  {n}
                </button>
              ))}
            </div>

            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />

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