export default function Sidebar({ onCreate, onToggleFavorites, showFavoritesOnly }) {
  return (
    <div className="w-60 border-r p-4 flex flex-col gap-4" style={{ minWidth: "240px" }}>
      <button
        onClick={onCreate}
        className="border p-2 rounded hover:bg-gray-100 transition-colors text-left"
      >
        + Category
      </button>

      <button 
        onClick={onToggleFavorites}
        className={`border p-2 rounded transition-colors text-left ${showFavoritesOnly ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
      >
        {showFavoritesOnly ? "← All Categories" : "Favorites"}
      </button>
    </div>
  );
}