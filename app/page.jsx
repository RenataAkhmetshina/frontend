"use client";

import { useEffect, useState } from "react";
import { FLASHCARD_SERVICE_URL, fetchWithAuth } from "./lib/api";
import Link from "next/link";
import Sidebar from "./components/Sidebar";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  async function loadCategories() {
    try {
      const res = await fetchWithAuth(`${FLASHCARD_SERVICE_URL}/api/categories`);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Authorization is required");
        }
        throw new Error("Could not load categories");
      }
      const data = await res.json();
      setCategories(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    const categoryName = prompt("Enter new category name:");
    if (!categoryName) return;

    try {
      const res = await fetchWithAuth(`${FLASHCARD_SERVICE_URL}/api/categories`, {
        method: "POST",
        body: JSON.stringify({ category_name: categoryName }),
      });

      if (res.ok) {
        loadCategories();
      } else {
        alert("Failed to create category");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorites = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  if (loading) return <div>Loading...</div>;

  if (error === "Authorization is required") {
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <h2>Welcome to Flashcard Learning App</h2>
        <p>Please Sign in</p>
        <Link href="/signin" style={styles.signInBtn}>
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Sidebar 
        onCreate={handleCreateCategory} 
        onToggleFavorites={handleToggleFavorites}
        showFavoritesOnly={showFavoritesOnly}
      />

      <div style={styles.content}>
        <h1>{showFavoritesOnly ? "Favorite Categories" : "Your categories"}</h1>
        <div style={styles.grid}>
          {categories.length === 0 ? (
            <p>No categories yet. Create a category</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.category_id} style={styles.card}>
                <h3>{cat.category_name}</h3>
                <Link href={`/category/${cat.category_id}`}>Open flashcards</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", gap: "2rem", marginTop: "1rem" },
  content: { flex: 1 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginTop: "1rem" },
  card: { border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", background: "#fff" },
  signInBtn: { display: "inline-block", background: "#0070f3", color: "#fff", padding: "0.5rem 1rem", borderRadius: "5px", textDecoration: "none", marginTop: "1rem" }
};