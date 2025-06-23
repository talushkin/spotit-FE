import React from "react";
import Button from "@mui/material/Button";
import Brightness4Icon from "@mui/icons-material/Brightness4";

export default function themeModeButton({ toggleDarkMode }) {
  return (
    <Button
      variant="contained"
      onClick={toggleDarkMode}
      sx={{
        backgroundColor: "darkgreen",
        "&:hover": {
          backgroundColor: "green",
          "& .MuiSvgIcon-root": {
            color: "black",
          },
        },
      }}
    >
      <Brightness4Icon sx={{ color: "black" }} />
    </Button>
  );
}