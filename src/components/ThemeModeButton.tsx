import React, { useState, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

interface ThemeModeButtonProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function ThemeModeButton({ isDarkMode, toggleDarkMode }: ThemeModeButtonProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "60px", alignItems: "center" }}>
      <Button
        variant={isDarkMode ? "contained" : "outlined"}
        onClick={() => !isDarkMode && toggleDarkMode()}
        sx={{
          backgroundColor: "black",
          color: "white",
          borderColor: "black",
          fontWeight: "bold",
          width: "60px",
          minWidth: "40px",
          minHeight: "40px",
          maxHeight: "48px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            backgroundColor: "#222",
            color: "white",
          },
        }}
      >
        <Brightness4Icon sx={{ color: "white", margin: 0, display: "block" }} />
      </Button>
      <Button
        variant={!isDarkMode ? "contained" : "outlined"}
        onClick={() => isDarkMode && toggleDarkMode()}
        sx={{
          backgroundColor: "white",
          color: "black",
          borderColor: "black",
          borderWidth: "0px",
          fontWeight: "bold",
          width: "60px",
          minWidth: "40px",
          minHeight: "40px",
          maxHeight: "48px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            backgroundColor: "#aaaaaa",
            color: "black",
          },
        }}
      >
        <Brightness7Icon sx={{ color: "black", margin: 0, display: "block" }} />
      </Button>
    </div>
  );
}