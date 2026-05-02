import React, { useState } from "react";
import "./Inventory.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faBox,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const medicines = [
    { name: "Augmentin 625 Duo Tablet", company: "Sun Pharma", category: "Tablet", price: 204.5, stock: 145, expiry: "12/2025" },
    { name: "Paracetamol 500mg", company: "Generic", category: "Tablet", price: 15, stock: 12, expiry: "05/2024" },
    { name: "Cetirizine 10mg Tablet", company: "Cipla", category: "Tablet", price: 22.5, stock: 45, expiry: "07/2024" },
    { name: "Shelcal 500 Tablet", company: "GSK", category: "Tablet", price: 119, stock: 5, expiry: "10/2026" },
    { name: "Azithromycin 250mg", company: "Sun Pharma", category: "Tablet", price: 85, stock: 22, expiry: "08/2024" },
    { name: "Dolo 650", company: "Micro Labs", category: "Tablet", price: 30, stock: 60, expiry: "04/2024" },
    { name: "Pantoprazole 40mg", company: "Dr Reddy", category: "Tablet", price: 55, stock: 18, expiry: "11/2024" },
    { name: "Cough Syrup", company: "Cipla", category: "Syrup", price: 90, stock: 20, expiry: "09/2025" },
  ];

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const isExpiringSoon = (date) => {
    const [month, year] = date.split("/");
    const exp = new Date(year, month - 1);
    const today = new Date();
    const diff = (exp - today) / (1000 * 60 * 60 * 24);
    return diff < 90;
  };

  const filtered = medicines.filter((m) => {
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategories.length === 0 || selectedCategories.includes(m.category)) &&
      (selectedBrands.length === 0 || selectedBrands.includes(m.company))
    );
  });

  const selectedCount = selectedCategories.length + selectedBrands.length;
  return (
    <div className="inventory-page">

      {/* SEARCH */}
      <div className="search-bar">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        <input
          placeholder="Search medicines, salts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FILTER BUTTON */}
      <div className="filter-btn" onClick={() => setShowFilter(true)}>
  Filter {selectedCount > 0 && `(${selectedCount})`}
</div>

      {/* DRAWER */}
      {showFilter && (
        <div className="drawer-overlay" onClick={() => setShowFilter(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>

            <h3>Filters</h3>

            <p className="section">Category</p>
            {["Tablet", "Syrup"].map((c) => (
              <label key={c}>
<input
  type="checkbox"
  checked={selectedCategories.includes(c)}
  onChange={() => toggleCategory(c)}
/>                {c}
              </label>
            ))}

            <p className="section">Brand</p>
            {["Cipla", "Sun Pharma", "Dr Reddy", "Micro Labs"].map((b) => (
              <label key={b}>
<input
  type="checkbox"
  checked={selectedBrands.includes(b)}
  onChange={() => toggleBrand(b)}
/>                {b}
              </label>
            ))}

            <button onClick={() => setShowFilter(false)}>Apply</button>
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="list">
        {filtered.map((m, i) => {
          const danger = isExpiringSoon(m.expiry);

          return (
            <div key={i} className={`med-card ${danger ? "danger" : "safe"}`}>

              <div className="top">
                <div>
                  <h3>{m.name}</h3>
                  <p className="company">{m.company}</p>
                </div>

                <div className="right">
                  <h3 className="price">₹{m.price.toFixed(2)}</h3>
                  <span className="per">Per strip</span>
                </div>
              </div>

              <div className="bottom">
                <div className="stock">
                  <FontAwesomeIcon icon={faBox} />
                  {m.stock} Strips
                </div>

                <div className={`expiry ${danger ? "red" : "green"}`}>
                  <FontAwesomeIcon icon={faClock} />
                  Exp: {m.expiry}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}