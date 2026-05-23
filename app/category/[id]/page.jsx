"use client";

import { useEffect, useState, use } from "react";
import { FLASHCARD_SERVICE_URL, fetchWithAuth } from "../../lib/api"; 
import { getToken } from "../../lib/auth"; 
import Link from "next/link";

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function CategoryPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = params.id;

  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); 
  const [currentCardId, setCurrentCardId] = useState(null);
  const [cardTitle, setCardTitle] = useState("");
  const [cardContent, setCardContent] = useState(""); 
  const [cardImage, setCardImage] = useState(""); 

  useEffect(() => {
    const token = getToken(); 
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.user_id) {
        setCurrentUserId(parseInt(decoded.user_id));
        console.log("Успешно вошли как User ID:", decoded.user_id); 
      }
    }
  }, []);

  async function loadFlashcards() {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${FLASHCARD_SERVICE_URL}/api/flashcards?category_id=${id}&page=${page}`);
      if (!res.ok) {
        throw new Error("Failed to load flashcards");
      }
      const data = await res.json();
      
      setFlashcards(data || []);
      setHasMore(data && data.length === 5);
      setFlippedCards({});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadFlashcards();
    }
  }, [id, page]);

  const toggleFlip = (cardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const openCreateModal = () => {
    setModalMode("create");
    setCardTitle("");
    setCardContent("");
    setCardImage(""); 
    setIsModalOpen(true);
  };

  const openEditModal = (card, e) => {
    e.stopPropagation(); 
    setModalMode("edit");
    setCurrentCardId(card.flashcard_id);
    setCardTitle(card.title || "");
    setCardContent(card.text || ""); 
    setCardImage(card.image || ""); 
    setIsModalOpen(true);
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    
    const payload = {
      title: cardTitle,
      text: cardContent, 
      image: cardImage,       
      category_id: parseInt(id),
      flashcard_id: modalMode === "edit" ? parseInt(currentCardId) : 0
    };

    const url = modalMode === "create" 
      ? `${FLASHCARD_SERVICE_URL}/api/flashcards`
      : `${FLASHCARD_SERVICE_URL}/api/flashcards/${currentCardId}`;
      
    const method = modalMode === "create" ? "POST" : "PUT";

    try {
      const res = await fetchWithAuth(url, {
        method: method,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        loadFlashcards();
      } else {
        const errData = await res.json();
        if (res.status === 404 || res.status === 401) {
            alert("You can only modify your own flashcards!");
        } else {
            alert(errData.error || "Operation failed");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = async (cardId, e) => {
    e.stopPropagation(); 
    if (!confirm("Are you sure you want to delete this flashcard?")) return;

    try {
      const res = await fetchWithAuth(`${FLASHCARD_SERVICE_URL}/api/flashcards/${cardId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        loadFlashcards();
      } else {
        if (res.status === 404 || res.status === 401) {
            alert("You can only delete your own flashcards!");
        } else {
            alert("Failed to delete flashcard");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={styles.topNav}>
        <Link href="/" style={styles.backLink}>← Back to Categories</Link>
        <button onClick={openCreateModal} style={styles.addBtn}>+ Add Flashcard</button>
      </div>
      
      <h1 style={{ marginTop: "1rem" }}>Category Flashcards</h1>
      
      {loading ? (
        <div>Loading flashcards...</div>
      ) : error ? (
        <div style={{ color: "red" }}>Error: {error}</div>
      ) : flashcards.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No flashcards in this category yet.</p>
      ) : (
        <>
          <div style={styles.grid}>
            {flashcards.map((card) => {
              const isFlipped = !!flippedCards[card.flashcard_id];
              const isAuthor = String(card.user_id) === String(currentUserId);


              const frontStyle = {
                ...styles.cardFront,
                ...(card.image 
                  ? { 
                      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url(${card.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    } 
                  : {}
                )
              };

              const backStyle = {
                ...styles.cardBack,
                ...(card.image 
                  ? { 
                      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.78), rgba(248, 248, 248, 0.79)), url(${card.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    } 
                  : {}
                )
              };

              return (
                <div key={card.flashcard_id} style={styles.cardContainer}>
                    <div 
                    onClick={() => toggleFlip(card.flashcard_id)} 
                    style={{
                        ...styles.cardInner,
                        transform: isFlipped ? "rotateY(180deg)" : "none"
                    }}
                    >
                    
                    <div style={frontStyle}>
                        <span style={styles.badgeFront}>Question</span>
                        <h3 style={styles.cardText}>{card.title}</h3>
                        <span style={styles.hint}>Click to see answer</span>
                    </div>

                    <div style={backStyle}>
                        <span style={styles.badgeBack}>Answer</span>
                        <p style={styles.cardText}>{card.text}</p>
                        <span style={styles.hint}>Click to see question</span>
                    </div>
                    </div>

                    {isAuthor ? (
                    <div style={styles.cardActions}>
                        <button onClick={(e) => openEditModal(card, e)} style={styles.editBtn}>Edit</button>
                        <button onClick={(e) => handleDeleteCard(card.flashcard_id, e)} style={styles.deleteBtn}>Delete</button>
                    </div>
                    ) : (
                    <div style={styles.cardActions}>
                        <span style={{ fontSize: "0.85rem", color: "#888", fontStyle: "italic" }}>View only</span>
                    </div>
                    )}
                </div>
              );
            })}
            </div>

          <div style={styles.pagination}>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              style={styles.pageBtn}
            >
              Previous
            </button>
            <span style={{ alignSelf: "center" }}>Page {page}</span>
            <button 
              disabled={!hasMore} 
              onClick={() => setPage(p => p + 1)}
              style={styles.pageBtn}
            >
              Next
            </button>
          </div>
        </>
      )}

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>{modalMode === "create" ? "Create Flashcard" : "Edit Flashcard"}</h2>
            <form onSubmit={handleSaveCard} style={styles.form}>
              <input 
                type="text" 
                placeholder="Flashcard Title / Question" 
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                required
                style={styles.input}
              />
              <textarea 
                placeholder="Description / Answer" 
                value={cardContent}
                onChange={(e) => setCardContent(e.target.value)}
                required
                style={{ ...styles.input, height: "100px", resize: "none" }}
              />
              <input 
                type="url" 
                placeholder="Image URL (optional)" 
                value={cardImage}
                onChange={(e) => setCardImage(e.target.value)}
                style={styles.input}
              />
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.saveBtn}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  topNav: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  backLink: { color: "#e27396", textDecoration: "underline" },
  addBtn: { background: "#eb9ab2", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "5px", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "2rem", marginTop: "1rem" },
  cardContainer: { height: "280px", perspective: "1000px", display: "flex", flexDirection: "column", justifyContent: "space-between" },
  cardInner: { width: "100%", height: "220px", position: "relative", transformStyle: "preserve-3d", transition: "transform 0.6s", cursor: "pointer" },
  cardFront: { position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden", border: "1px solid #ccc", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", background: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxSizing: "border-box" },
  cardBack: { position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden", border: "1px solid #ccc", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", transform: "rotateY(180deg)", boxSizing: "border-box" },
  cardText: { textAlign: "center", wordBreak: "break-word", margin: "10px 0" },
  hint: { fontSize: "0.8rem", color: "#999", marginTop: "auto" },
  badgeFront: { fontSize: "0.75rem", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold", color: "#555" },
  badgeBack: { fontSize: "0.75rem", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold", color: "#555" },
  cardActions: { display: "flex", gap: "0.5rem", justifyContent: "flex-end", height: "35px", marginTop: "5px" },
  editBtn: { background: "#dfedae", color: "#000", border: "none", padding: "0.25rem 0.75rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" },
  deleteBtn: { background: "#a0dce1", color: "#fff", border: "none", padding: "0.25rem 0.75rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" },
  pagination: { display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem" },
  pageBtn: { padding: "0.5rem 1rem", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" },
  modalContent: { background: "#fff", padding: "2rem", borderRadius: "8px", width: "400px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
  form: { display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" },
  input: { padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", fontSize: "1rem" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "0.5rem" },
  cancelBtn: { background: "#6c757d", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" },
  saveBtn: { background: "#0070f3", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }
};