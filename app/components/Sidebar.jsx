export default function Sidebar({ onCreate, onToggleFavorites, showFavoritesOnly }) {
  return (
    <div style={styles.sidebar}>
      <button onClick={onCreate} style={styles.linkButton}>
        <span style={styles.icon}>＋</span> New Category
      </button>

      <button onClick={onToggleFavorites} style={styles.linkButton}>
        {showFavoritesOnly ? (
          <>
            <span style={styles.icon}>←</span> All Categories
          </>
        ) : (
          <>
            <span style={{ ...styles.icon, color: "#efcfe3" }}>♥</span> Favorites
          </>
        )}
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    minWidth: "240px",
    display: "flex",
    flexDirection: "col",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "1rem 0",
    borderRight: "1px solid #e5e7eb",
  },
  linkButton: {
    background: "none",
    border: "none",
    padding: "0.6rem 0.5rem",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "1.5rem",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    borderRadius: "6px",
    transition: "background 0.2s, color 0.2s",
    fontFamily: "inherit",
  },
  icon: {
    fontSize: "2rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    color: "#4b5563",
  },
};