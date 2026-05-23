"use client";

import { useEffect, useState } from "react";
import { FLASHCARD_SERVICE_URL, fetchWithAuth } from "../../lib/api"; 
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CategoryPage() {
  const { id } = useParams(); 
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadFlashcards() {
      try {
        const res = await fetchWithAuth(`${FLASHCARD_SERVICE_URL}/api/flashcards?category_id=${id}`);
        
        if (!res.ok) {
          throw new Error("Failed to load flashcards for this category");
        }
        
        const data = await res.json();
        setFlashcards(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadFlashcards();
  }, [id]);

  if (loading) return <div>Loading flashcards...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div>
      <Link href="/" style={{ color: "#0070f3", textDecoration: "underline" }}>
        ← Back to Categories
      </Link>
      
      <h1 style={{ marginTop: "1rem" }}>Category Flashcards</h1>
      
      {flashcards.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No flashcards in this category yet.</p>
      ) : (
        <div style={styles.grid}>
          {flashcards.map((card) => (
            <div key={card.id} style={styles.card}>
              <h4>{card.question}</h4>
              <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                <i>Click to see answer (coming soon)</i>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem", marginTop: "1rem" },
  card: { border: "1px solid #ccc", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", background: "#fff" }
};