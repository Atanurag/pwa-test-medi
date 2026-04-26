import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Html5Qrcode } from 'html5-qrcode';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faBox,
  faQrcode,
  faMoneyBill,
  faRightFromBracket,
  faPlus,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {
  faCapsules,
  faTriangleExclamation,
  faMoneyBillTrendUp,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';

const USER = 'anurag';
const PASS = 'anurag';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');

  const [inventory, setInventory] = useState([]);
  const [udhari, setUdhari] = useState([]);
  const [todaySales, setTodaySales] = useState(0);

  const [scanMode, setScanMode] = useState(null);
  const [scannedCode, setScannedCode] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', expiry: '' });

  useEffect(() => {
    const s = localStorage.getItem('session');
    if (s) setUser(s);

    setInventory(JSON.parse(localStorage.getItem('inv')) || []);
    setUdhari(JSON.parse(localStorage.getItem('udhari')) || []);
    setTodaySales(Number(localStorage.getItem('sales')) || 0);
  }, []);

  useEffect(() => {
    localStorage.setItem('inv', JSON.stringify(inventory));
    localStorage.setItem('udhari', JSON.stringify(udhari));
    localStorage.setItem('sales', todaySales);
  }, [inventory, udhari, todaySales]);

  const login = (u, p) => {
    if (u === USER && p === PASS) {
      localStorage.setItem('session', u);
      setUser(u);
    } else alert('Invalid credentials');
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // 📷 Scan Handler
  const handleScan = (code) => {
    setScannedCode(code);
    const item = inventory.find((i) => i.barcode === code);

    if (scanMode === 'sell') {
      if (!item) return alert('Item not found');
      if (item.stock <= 0) return alert('Out of stock');

      item.stock -= 1;
      setTodaySales((s) => s + item.price);
      setInventory([...inventory]);
      navigator.vibrate?.(100);
      setScanMode(null);
    }

    if (scanMode === 'stock') {
      if (item) {
        item.stock += 1;
        setInventory([...inventory]);
        setScanMode(null);
      }
    }
  };

  const addNewItem = () => {
    setInventory([
      ...inventory,
      {
        barcode: scannedCode,
        name: form.name,
        price: Number(form.price),
        expiry: form.expiry,
        stock: 1,
      },
    ]);
    setForm({ name: '', price: '', expiry: '' });
    setScanMode(null);
  };

  if (!user) return <Login login={login} />;

  return (
    <div className="app">
      <Header logout={logout} />

      {view === 'home' && (
        <Dashboard
          inventory={inventory}
          udhari={udhari}
          todaySales={todaySales}
        />
      )}

      {view === 'inventory' && <Inventory inventory={inventory} />}

      {view === 'scan' && (
        <Scanner onScan={handleScan} mode={scanMode} setMode={setScanMode} />
      )}

      {view === 'udhari' && <Udhari udhari={udhari} setUdhari={setUdhari} />}

      {scanMode === 'stock' && scannedCode && (
        <NewItemForm form={form} setForm={setForm} add={addNewItem} />
      )}

      <Nav view={view} setView={setView} />
    </div>
  );
}

// 🔐 LOGIN
function Login({ login }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');

  return (
    <div className="center">
      <div className="card">
        <h2>Pharmacy Login</h2>
        <input placeholder="Username" onChange={(e) => setU(e.target.value)} />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setP(e.target.value)}
        />
        <button onClick={() => login(u, p)}>Login</button>
      </div>
    </div>
  );
}

// 🧭 HEADER
function Header({ logout }) {
  return (
    <div className="header">
      <h3>Pharmacy</h3>
      <button onClick={logout}>
        <FontAwesomeIcon icon={faRightFromBracket} />
      </button>
    </div>
  );
}

// 📊 DASHBOARD
function Dashboard({ inventory, udhari, todaySales }) {
  const stockValue = inventory.reduce((s, i) => s + i.price * i.stock, 0);
  const expiring = inventory.filter(
    (i) => (new Date(i.expiry) - new Date()) / (1000 * 60 * 60 * 24) < 90
  ).length;
  const udh = udhari.reduce((s, u) => s + u.amount, 0);

  return (
    <div className="dashboard">
      <Card icon={faCapsules} title="Stock Value" value={`₹${stockValue}`} />
      <Card
        icon={faTriangleExclamation}
        title="Expiring Soon"
        value={expiring}
        warn
      />
      <Card icon={faMoneyBillTrendUp} title="Udhari" value={`₹${udh}`} />
      <Card
        icon={faChartLine}
        title="Today Sales"
        value={`₹${todaySales}`}
        success
      />
    </div>
  );
}

function Card({ icon, title, value, warn, success }) {
  return (
    <div
      className={`card-pro ${warn ? 'warn' : ''} ${success ? 'success' : ''}`}
    >
      <div className="card-top">
        <FontAwesomeIcon icon={icon} />
        <span>{title}</span>
      </div>
      <h2>{value}</h2>
    </div>
  );
}

// 📦 INVENTORY
function Inventory({ inventory }) {
  return inventory.map((i, idx) => {
    const days = (new Date(i.expiry) - new Date()) / (1000 * 60 * 60 * 24);

    return (
      <div
        key={idx}
        className={`item ${days < 30 ? 'danger' : days < 90 ? 'warn' : ''}`}
      >
        <div>
          <strong>{i.name}</strong>
          <p>₹{i.price}</p>
        </div>
        <div>Stock: {i.stock}</div>
      </div>
    );
  });
}

// 📷 SCANNER
function Scanner({ onScan, mode, setMode }) {
  useEffect(() => {
    if (!mode) return;

    const scanner = new Html5Qrcode('reader');

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (text) => {
        scanner.stop();
        onScan(text);
      }
    );

    return () => scanner.stop().catch(() => {});
  }, [mode]);

  return (
    <div className="scan-screen">
      {!mode && (
        <div className="scan-main-card">
          <div className="scan-header">
            <FontAwesomeIcon icon={faQrcode} />
            <h2>Scan Medicine</h2>
            <p>Choose action</p>
          </div>

          <div className="scan-actions">
            <div className="scan-action-card" onClick={() => setMode('stock')}>
              <FontAwesomeIcon icon={faPlus} />
              <span>Stock In</span>
              <small>Add new or increase stock</small>
            </div>

            <div
              className="scan-action-card sell"
              onClick={() => setMode('sell')}
            >
              <FontAwesomeIcon icon={faQrcode} />
              <span>Quick Sell</span>
              <small>Instant sale</small>
            </div>
          </div>
        </div>
      )}

      {mode && (
        <div className="scanner-live">
          <div className="scanner-top">
            <button onClick={() => setMode(null)}>Cancel</button>
            <span>{mode === 'stock' ? 'Stock Mode' : 'Sell Mode'}</span>
          </div>

          <div id="reader" className="scanner-box" />
        </div>
      )}
    </div>
  );
}

// ➕ NEW ITEM
function NewItemForm({ form, setForm, add }) {
  return (
    <div className="modal">
      <div className="card">
        <h3>New Medicine</h3>
        <input
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Price"
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          type="date"
          onChange={(e) => setForm({ ...form, expiry: e.target.value })}
        />
        <button onClick={add}>
          <FontAwesomeIcon icon={faCheck} /> Save
        </button>
      </div>
    </div>
  );
}

// 💰 UDHARI
function Udhari({ udhari, setUdhari }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const add = () => {
    if (!name || !amount) return;
    setUdhari([...udhari, { name, amount: Number(amount) }]);
    setName('');
    setAmount('');
  };

  return (
    <div className="udhari-screen">
      <div className="udhari-card">
        <h3>Add Entry</h3>

        <input
          placeholder="Customer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button onClick={add}>
          <FontAwesomeIcon icon={faPlus} /> Add Entry
        </button>
      </div>

      <div className="udhari-list">
        {udhari.map((u, i) => (
          <div key={i} className="udhari-item">
            <div>
              <strong>{u.name}</strong>
              <p>₹{u.amount}</p>
            </div>

            <button
              className="settle"
              onClick={() => setUdhari(udhari.filter((_, x) => x !== i))}
            >
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 📱 NAV
function Nav({ view, setView }) {
  return (
    <div className="nav">
      <button
        className={view === 'home' ? 'active' : ''}
        onClick={() => setView('home')}
      >
        <FontAwesomeIcon icon={faHouse} />
        <span>Home</span>
      </button>

      <button
        className={view === 'inventory' ? 'active' : ''}
        onClick={() => setView('inventory')}
      >
        <FontAwesomeIcon icon={faBox} />
        <span>Inventory</span>
      </button>

      <button
        className={view === 'scan' ? 'active' : ''}
        onClick={() => setView('scan')}
      >
        <FontAwesomeIcon icon={faQrcode} />
        <span>Scan</span>
      </button>

      <button
        className={view === 'udhari' ? 'active' : ''}
        onClick={() => setView('udhari')}
      >
        <FontAwesomeIcon icon={faMoneyBill} />
        <span>Udhari</span>
      </button>
    </div>
  );
}
