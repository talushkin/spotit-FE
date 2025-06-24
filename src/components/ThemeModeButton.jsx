import React from "react";
import Button from "@mui/material/Button";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export default function ThemeModeButton({ isDarkMode, toggleDarkMode }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
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
          "&:hover": {
            backgroundColor: "#222",
            color: "white",
          },
        }}
        startIcon={
          <Brightness4Icon
            sx={{ color: "white" }}
          />
        }
      >
        Dark
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
          "&:hover": {
            backgroundColor: "#eee",
            color: "black",
          },
        }}
        startIcon={
          <Brightness7Icon
            sx={{ color: "black" }}
          />
        }
      >
        Light
      </Button>
    </div>
  );
}