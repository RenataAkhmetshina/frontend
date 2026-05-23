"use client";

import { API } from "../lib/api";
import { getToken } from "../lib/auth";
import { useState } from "react";

export default function CreateCategory({ refresh }) {
  const [name, setName] = useState("");

  const create = async () => {
    await fetch(`${API}/categories`, {
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
    <div className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New category"
        className="border p-2"
      />
      <button onClick={create}>Add</button>
    </div>
  );
}