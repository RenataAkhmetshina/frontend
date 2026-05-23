"use client";

import { FLASHCARD_SERVICE_URL } from "../lib/api"; 
import { getToken } from "../lib/auth";
import { useState } from "react";

export default function CreateCategory({ refresh, onClose }) {
  const [name, setName] = useState("");

  const create = async () => {
    if (!name.trim()) return; 
    
    await fetch(`${FLASHCARD_SERVICE_URL}/api/categories`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ category_name: name }),
    });

    setName("");
    refresh();
  };

  return (
    <div style={styles.container}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name..."
        style={styles.input}
        onFocus={(e) => {
          e.target.style.borderColor = "#dedede";
          e.target.style.boxShadow = "0 0 0 3px rgba(233, 233, 233, 0.15)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#dee0e1";
          e.target.style.boxShadow = "none";
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") create(); 
        }}
      />

      <div style={styles.buttonContainer}>
        <button 
          onClick={onClose} 
          style={styles.cancelButton}
          onMouseEnter={(e) => e.currentTarget.style.color = "#0f172a"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
        >
          Cancel
        </button>
        
        <button 
          onClick={create} 
          style={styles.addButton}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ff84ab"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e27396"}
        >
          Add
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    width: "100%",
    boxSizing: "border-box"
  },
  input: {
    width: "100%",
    padding: "0.75rem 0.85rem",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    color: "#334155",
    boxSizing: "border-box"
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "0.75rem",
    width: "100%"
  },
  cancelButton: {
    background: "none",
    border: "none",
    padding: "0.65rem 1rem",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#64748b",
    cursor: "pointer",
    transition: "color 0.2s ease",
    fontFamily: "inherit"
  },
  addButton: {
    backgroundColor: "#f27ca1",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.65rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    fontFamily: "inherit"
  }
};