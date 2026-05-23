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
    <div style={{ display: "flex", width: "100%", minHeight: "80vh", gap: "2rem" }}>
      
      <Sidebar 
        onCreate={() => setIsModalOpen(true)} 
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        showFavoritesOnly={showFavoritesOnly}
      />

      <div style={{ flex: 1 }}>
        <h1 className="text-3xl font-bold mb-6" style={{ margin: "0 0 1.5rem 0" }}>
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
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                style={{ 
                  padding: "1.5rem", 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "space-between",
                  minHeight: "140px",
                  position: "relative",
                  boxSizing: "border-box"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                  <Link 
                    href={`/category/${category.category_id}`}
                    style={{ textDecoration: "none", display: "inline-block" }}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors" style={{ margin: 0, cursor: "pointer" }}>
                      {category.category_name}
                    </h3>
                  </Link>
                  
                  <button
                    onClick={(e) => toggleFavorite(category.category_id, e)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    style={{ 
                      fontSize: "1.5rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "0 0 0 8px",
                      color: isFav ? "#ffc107" : "#ccc",
                      lineHeight: 1
                    }}
                    title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    {isFav ? "♥" : "♡"}
                  </button>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <Link 
                    href={`/category/${category.category_id}`} 
                    className="text-blue-500 hover:text-blue-700 hover:underline"
                    style={{ fontSize: "0.875rem", textDecoration: "none" }}
                  >
                    Click to view flashcards →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {displayedCategories.length === 0 && (
          <p className="text-gray-500 mt-6 text-center italic" style={{ textAlign: "center", fontStyle: "italic", color: "#9aa0a6" }}>
            {showFavoritesOnly ? "No favorite categories yet." : "No categories found."}
          </p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-96" style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "0.5rem", width: "24rem" }}>
            <h2 className="text-xl font-bold mb-4" style={{ margin: "0 0 1rem 0" }}>Create New Category</h2>
            <CreateCategory refresh={() => { loadCategories(); setIsModalOpen(false); }} />
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="mt-4 text-sm text-gray-500 hover:underline w-full text-center"
              style={{ marginTop: "1rem", background: "none", border: "none", width: "100%", textAlign: "center", color: "#6b7280", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}