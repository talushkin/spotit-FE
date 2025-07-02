import React, { useState, useEffect } from "react";
import type { Genre } from "../utils/storage";


// Simple genre list item
function GenreListItem({ item, onSelect }: { item: Genre; onSelect: (item: Genre) => void }) {
  const songCount = item.songs?.length || 0;
  return (
    <li
      className="nav-item flex items-center justify-start nowrap"
      style={{
        backgroundColor: "#222",
        color: "#fff",
        borderRadius: "8px",
        margin: "4px 0",
        cursor: "pointer",
        listStyle: "none",
        display: "flex",
        alignItems: "center",
        padding: "8px 12px"
      }}
      onClick={() => onSelect(item)}
    >
      {item.genre} <span className="text-gray-500 ml-2" style={{ color: "#bbb", marginLeft: 8 }}>({songCount})</span>
    </li>
  );
}

interface NavItemListProps {
  genres: Genre[];
  onSelect: (item: Genre) => void;
}

export default function NavItemList({ genres = [], onSelect }: NavItemListProps) {
  //console.log("NavItemList rendered with pages:", genres);
  return (
    <ul>
      {genres.map((item) => (
        <GenreListItem key={item._id} item={item} onSelect={onSelect} />
      ))}
    </ul>
  );
}

