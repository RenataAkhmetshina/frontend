"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "../styles/globals.css";

export default function RootLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    window.location.href = "/signin";
  };

  return (
    <html lang="ru">
      <body>
        <header style={styles.header}>
          <nav style={styles.nav}>
            <Link href="/" style={styles.logo}>
              Flashcard Learning App
            </Link>
            <div>
              {isAuthenticated ? (
                <>
                  <Link href="/profile" style={styles.link}>Profile</Link>
                  <button onClick={handleLogout} style={styles.logoutBtn}>Log out</button>
                </>
              ) : (
                <Link href="/signin" style={styles.link}>Sign in</Link>
              )}
            </div>
          </nav>
        </header>
        <main style={styles.main}>{children}</main>
      </body>
    </html>
  );
}

const styles = {
  header: { background: "#e27396", color: "#fff", padding: "1rem 2rem" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { color: "#fff", fontSize: "1.5rem", fontWeight: "bold", textDecoration: "none" },
  link: { color: "#fff", marginLeft: "1rem", textDecoration: "none" },
  logoutBtn: { background: "none", border: "none", color: "#a0dce1", marginLeft: "1rem", cursor: "pointer", fontSize: "1rem" },
  main: { padding: "2rem", maxWidth: "1400px", margin: "0 auto" }
};