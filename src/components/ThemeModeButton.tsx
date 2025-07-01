import React from "react";
import Button from "@mui/material/Button";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

interface ThemeModeButtonProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function ThemeModeButton({ isDarkMode, toggleDarkMode }: ThemeModeButtonProps) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", width: "100px" }}>
      <Button
        variant={isDarkMode ? "contained" : "outlined"}
        onClick={() => !isDarkMode && toggleDarkMode()}
        sx={{
          backgroundColor: "black",
          color: "white",
          borderColor: "black",
          flex: 1,
          fontWeight: "bold",
          gap: "0.5rem",
          width: "100px",
          "&:hover": {
            backgroundColor: "#222",
            color: "white",
          },
        }}
        startIcon={
          <Brightness4Icon
            sx={{ color: "white", margin: "0 auto", display: "block" }}
          />
        }
      >
      </Button>
      <Button
        variant={!isDarkMode ? "contained" : "outlined"}
        onClick={() => isDarkMode && toggleDarkMode()}
        sx={{
          backgroundColor: "white",
          color: "black",
          borderColor: "black",
          flex: 1,
          fontWeight: "bold",
          gap: "0.5rem",
          width: "100px",
          "&:hover": {
            backgroundColor: "#eee",
            color: "black",
          },
        }}
        startIcon={
          <Brightness7Icon
            sx={{ color: "black", margin: "0 auto", display: "block" }}
          />
        }
      >
      </Button>
    </div>
  );
}