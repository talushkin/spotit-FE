import React from "react";
import { FormControl, InputLabel, MenuItem, Select as MuiSelect } from "@mui/material";
import langs from "../langs.json"; // Adjust path if needed

export default function LanguageSelector({ language, handleLanguageChange }) {
    
  return (
    <div>
      <FormControl sx={{ maxWidth: "150px", marginRight: "8px" }}>
        <InputLabel id="language-select-label"></InputLabel>
        <MuiSelect
          labelId="language-select-label"
          value={language}
          onChange={handleLanguageChange}
          sx={{
            backgroundColor: "darkgreen",
            color: "white",
            "& .MuiSvgIcon-root": {
              color: "white",
            },
          }}
        >
          {langs.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              {lang.label}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    </div>
  );
}