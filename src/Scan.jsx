import React, { useState, useEffect, useRef } from "react";
import "./Scan.css";
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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 🎥 CAMERA START (MediaPipe-style loop)
  useEffect(() => {
    if (!mode) return;

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    }).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    });

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, [mode]);

  // 📷 CAPTURE + OCR
  const captureAndScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 🔥 ROI (bottom strip)
    const roiY = canvas.height * 0.6;
    const roiHeight = canvas.height * 0.3;

    ctx.drawImage(
      video,
      0,
      roiY,
      canvas.width,
      roiHeight,
      0,
      0,
      canvas.width,
      roiHeight
    );

    // 🔥 preprocess (grayscale + threshold)
    const img = ctx.getImageData(0, 0, canvas.width, roiHeight);

    for (let i = 0; i < img.data.length; i += 4) {
      const avg =
        (img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3;

      const val = avg > 140 ? 255 : 0;

      img.data[i] = val;
      img.data[i + 1] = val;
      img.data[i + 2] = val;
    }

    ctx.putImageData(img, 0, 0);

    const result = await Tesseract.recognize(canvas, "eng", {
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./₹",
    });

    const text = result.data.text;

    const data = {
      name: text.split("\n")[0] || "Medicine",
      batch:
        text.match(/(?:B\.?No|Batch|BN)\.?\s*([A-Z0-9]+)/i)?.[1] || "",
      mfg:
        text.match(/MFG\.?\s*([A-Z0-9\/]+)/i)?.[1] || "",
      exp:
        text.match(/EXP\.?\s*([A-Z0-9\/]+)/i)?.[1] || "",
      mrp:
        text.match(/(?:MRP|₹)\s*([\d.]+)/i)?.[1] || "",
    };

    // 🔔 FEEDBACK
    navigator.vibrate(100);
    new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    ).play();

    setScannedData(data);
  };

  // 🟢 STOCK
  const handleStock = () => {
    const inv =
      JSON.parse(localStorage.getItem("anurag_inventory")) || [];

    inv.push({
      ...scannedData,
      stock: qty,
      dateAdded: new Date(),
    });

    localStorage.setItem("anurag_inventory", JSON.stringify(inv));
    reset();
  };

  // 🔴 SELL
  const handleSell = () => {
    let inv =
      JSON.parse(localStorage.getItem("anurag_inventory")) || [];

    const item = inv.find((i) => i.batch === scannedData.batch);

    if (!item) return alert("Item not found");

    item.stock -= qty;
    if (item.stock < 0) item.stock = 0;

    localStorage.setItem("anurag_inventory", JSON.stringify(inv));
    reset();
  };

  const reset = () => {
    setMode(null);
    setScannedData(null);
    setQty(1);
  };

  return (
    <div className="scan-page">

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
          </div>

          <div className="scan-card" onClick={() => setMode("sell")}>
            <div className="card-icon">
              <FontAwesomeIcon icon={faCashRegister} />
            </div>
            <h2>Quick Sell</h2>
          </div>
        </>
      )}

      {/* CAMERA */}
      {mode && !scannedData && (
        <div className="scanner-container">
          <video ref={videoRef} className="video" />
          <canvas ref={canvasRef} />

          <div className="roi-box"></div>

          <button className="scan-btn" onClick={captureAndScan}>
            Capture & Scan
          </button>
        </div>
      )}

      {/* MODAL */}
      {scannedData && (
        <div className="modal">
          <div className="modal-card">

            <h2>{scannedData.name}</h2>

            <p>Batch: {scannedData.batch || "N/A"}</p>
            <p>MFG: {scannedData.mfg || "N/A"}</p>
            <p>EXP: {scannedData.exp || "N/A"}</p>
            <p>MRP: ₹{scannedData.mrp || "N/A"}</p>

            <div className="qty-buttons">
              {[1,2,3,5,10].map(n => (
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