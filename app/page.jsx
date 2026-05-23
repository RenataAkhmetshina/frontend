"use client";

import { useEffect, useState } from "react";
import { FLASHCARD_SERVICE_URL, fetchWithAuth } from "./lib/api";
import Sidebar from "./components/Sidebar"; 
import CreateCategory from "./components/CreateCategory";
import Link from "next/link";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]); 
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await fetchWithAuth(`${FLASHCARD_SERVICE_URL}/api/categories`); 
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await fetchWithAuth(`${FLASHCARD_SERVICE_URL}/api/categories/favorites/`); 
      if (res.ok) {
        const data = await res.json();
        setFavorites(data || []);
      }
    } catch (err) {
      console.error("Failed to load favorites", err);
    }
  };

  useEffect(() => {
    loadCategories();
    loadFavorites();
  }, []);

  const toggleFavorite = async (categoryId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const isFav = favorites.some(fav => fav.category_id === categoryId);
    const url = `${FLASHCARD_SERVICE_URL}/api/categories/${categoryId}/favorites`;

    if (isFav) {
      try {
        const res = await fetchWithAuth(url, { method: "DELETE" });
        if (res.ok) {
          setFavorites(prev => prev.filter(fav => fav.category_id !== categoryId));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const res = await fetchWithAuth(url, { method: "PUT" });
        if (res.ok) {
          setFavorites(prev => [...prev, { category_id: categoryId }]);
        } else if (res.status === 403 || res.status === 401) {
          alert("Please log in to add favorites!");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const displayedCategories = showFavoritesOnly
    ? categories.filter(cat => favorites.some(fav => fav.category_id === cat.category_id))
    : categories;

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "80vh", gap: "2rem", padding: "1rem" }}>
      
      <Sidebar 
        onCreate={() => setIsModalOpen(true)} 
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        showFavoritesOnly={showFavoritesOnly}
      />

      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: "700", margin: "0 0 1.5rem 0", color: "#111827" }}>
          {showFavoritesOnly ? "Favorite Categories" : "All Categories"}
        </h1>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "1.5rem",
          width: "100%"
        }}>
          {displayedCategories.map((category) => {
            const isFav = favorites.some(fav => fav.category_id === category.category_id);

            return (
              <div 
                key={category.category_id}
                style={{ 
                  padding: "1.5rem", 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "space-between",
                  minHeight: "160px", 
                  position: "relative",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)";
                }}
              >
                <div style={{ width: "100%" }}>
                  <Link 
                    href={`/category/${category.category_id}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <h3 style={{ 
                      margin: 0, 
                      cursor: "pointer", 
                      fontSize: "1.3rem", 
                      fontWeight: "700", 
                      color: "#1e293b",
                      lineHeight: "1.4"
                    }}>
                      {category.category_name}
                    </h3>
                  </Link>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem", width: "100%" }}>
                  <Link 
                    href={`/category/${category.category_id}`} 
                    style={{ 
                      flex: 1, 
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#c5cc82", 
                      color: "#ffffff",
                      padding: "0.55rem 0.75rem",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c5cc82"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#c5cc82"}
                  >
                    View Cards →
                  </Link>

                  <button
                    onClick={(e) => toggleFavorite(category.category_id, e)}
                    style={{ 
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      backgroundColor: isFav ? "#fdf2f8" : "#f8fafc", 
                      color: isFav ? "#e27396" : "#b0b0b0", 
                      border: isFav ? "1px solid #fbcfe8" : "1px solid #e2e8f0",
                      padding: "0.55rem 0.75rem",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isFav ? "#fce7f3" : "#f1f5f9";
                      if (!isFav) e.currentTarget.style.color = "#334155";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isFav ? "#fdf2f8" : "#f8fafc";
                      if (!isFav) e.currentTarget.style.color = "#64748b";
                    }}
                    title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <span style={{ fontSize: "1rem", lineHeight: 1 }}>
                      {isFav ? "♥" : "♡"}
                    </span>
                    <span>{isFav ? "Saved" : "Save"}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {displayedCategories.length === 0 && (
          <p style={{ textAlign: "center", fontStyle: "italic", color: "#9ca3af", marginTop: "1.5rem" }}>
            {showFavoritesOnly ? "No favorite categories yet." : "No categories found."}
          </p>
        )}
      </div>

      {isModalOpen && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: "rgba(15, 23, 42, 0.6)", 
          backdropFilter: "blur(4px)", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          zIndex: 100 
        }}>
          <div style={{ 
            backgroundColor: "#ffffff", 
            padding: "2rem", 
            borderRadius: "16px", 
            width: "26rem", 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", 
            boxSizing: "border-box" 
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", margin: "0 0 1.25rem 0", color: "#0f172a" }}>
              Create New Category
            </h2>
            
            <CreateCategory 
              refresh={() => { loadCategories(); setIsModalOpen(false); }} 
              onClose={() => setIsModalOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}