"use client";

import { useEffect, useState } from "react";
import { USER_SERVICE_URL, fetchWithAuth } from "../lib/api";

const getUserIdFromToken = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return payload.user_id; 
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  const userId = getUserIdFromToken();

  const fetchProfile = async () => {
    if (!userId) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetchWithAuth(`${USER_SERVICE_URL}/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setEmail(data.email || "");
        setBio(data.bio || "");
      } else {
        setError("Failed to load profile details.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error fetching user profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateMessage("");

    try {
      const res = await fetchWithAuth(`${USER_SERVICE_URL}/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
          email: email,
          bio: bio,
        }),
      });

      if (res.ok) {
        setUpdateMessage("Profile updated successfully");
        setIsEditing(false);
        setUser((prev) => ({ ...prev, email, bio }));
      } else {
        const data = await res.json();
        setUpdateMessage(`Error: ${data.error || "Update failed"}`);
      }
    } catch (err) {
      console.error(err);
      setUpdateMessage("Failed to update profile due to a network error.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure you want to delete your account? This will wipe ALL your personal data permanently"
    );

    if (!confirmed) return;

    try {
      const res = await fetchWithAuth(`${USER_SERVICE_URL}/api/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Account deleted successfully.");
        localStorage.removeItem("token");
        window.location.href = "/signin"; 
      } else {
        const data = await res.json();
        alert(`Deletion failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error processing account deletion.");
    }
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading your profile...</div>;
  if (error) return <div style={{ padding: "2rem", color: "red", textAlign: "center" }}>{error}</div>;

  return (
    <div style={styles.cardContainer}>
      <h1 style={styles.title}>Account Profile</h1>

      <div style={styles.infoBox}>
        <div style={styles.row}>
          <span style={styles.label}>Username:</span>
          <span style={styles.value}>{user?.username}</span>
        </div>

        {!isEditing ? (
          <>
            <div style={styles.row}>
              <span style={styles.label}>Email Address:</span>
              <span style={styles.value}>{user?.email || "Not specified"}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>About Me (Bio):</span>
              <span style={styles.value} className="italic text-gray-600">
                {user?.bio || "No information added yet."}
              </span>
            </div>
            
            <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
              Edit Details
            </button>
          </>
        ) : (
          <form onSubmit={handleUpdate} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>Bio:</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={styles.textarea}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" style={styles.saveBtn}>
                Save Changes
              </button>
              <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {updateMessage && (
          <p style={{ 
            marginTop: "1rem", 
            color: updateMessage.includes("Error") ? "red" : "green",
            fontWeight: "500"
          }}>
            {updateMessage}
          </p>
        )}
      </div>

      <div style={styles.dangerZone}>
        <h3 style={styles.dangerTitle}>Danger Zone</h3>
        <p style={styles.dangerText}>
          Once you delete your account, there is no going back. Your profile and active flashcard sets will be deleted.
        </p>
        <button onClick={handleDeleteAccount} style={styles.deleteBtn}>
          Delete Account Completely
        </button>
      </div>
    </div>
  );
}

const styles = {
  cardContainer: {
    maxWidth: "600px",
    margin: "2rem auto",
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb"
  },
  title: { fontSize: "2rem", fontWeight: "700", marginBottom: "1.5rem", color: "#111827" },
  infoBox: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  row: { display: "flex", flexDirection: "column", gap: "0.25rem", borderBottom: "1px solid #f3f4f6", paddingBottom: "0.75rem" },
  label: { fontSize: "0.875rem", fontWeight: "600", color: "#4b5563" },
  value: { fontSize: "1.125rem", color: "#1f2937" },
  form: { display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" },
  formGroup: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  fieldLabel: { fontSize: "0.9rem", fontWeight: "600", color: "#374151" },
  input: { padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "1rem" },
  textarea: { padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "1rem", resize: "vertical" },
  editBtn: { alignSelf: "flex-start", padding: "0.5rem 1.25rem", background: "#c5cc82", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500" },
  saveBtn: { padding: "0.5rem 1.25rem", background: "#c5cc82", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500" },
  cancelBtn: { padding: "0.5rem 1.25rem", background: "#e27396", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500" },
  dangerZone: { marginTop: "3rem", paddingTop: "1.5rem", borderTop: "2px dashed #a0dce1" },
  dangerTitle: { color: "#a0dce1", fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" },
  dangerText: { color: "#4b5563", fontSize: "0.9rem", marginBottom: "1rem" },
  deleteBtn: { padding: "0.6rem 1.25rem", background: "#b3dee2", color: "#e27396", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600", transition: "background 0.2s" }
};