import React from "react";
import { FormControl, InputLabel, MenuItem, Select as MuiSelect } from "@mui/material";
import langs from "../langs.json"; // Adjust path if needed

export default function LanguageSelector({ language, handleLanguageChange }) {
  // Languages that use RTL direction
  const rtlLangs = ["he", "ar", "fa", "ur"];

  const handleChange = (event) => {
    const prevLang = language;
    const nextLang = event.target.value;
    handleLanguageChange(event);

    const prevIsRTL = rtlLangs.includes(prevLang);
    const nextIsRTL = rtlLangs.includes(nextLang);

    // Only reload if RTL/LTR direction changes
    if (prevIsRTL !== nextIsRTL) {
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  return (
    <div>
      <FormControl sx={{ width: "100%", marginRight: "8px" }}>
        <InputLabel id="language-select-label"></InputLabel>
        <MuiSelect
          labelId="language-select-label"
          value={language}
          onChange={handleChange}
          sx={{
            backgroundColor: "darkgreen",
            color: "white",
            width: "100%",
            "& .MuiSvgIcon-root": {
              color: "white",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "darkgreen",
                color: "white",
                "& .MuiMenuItem-root": {
                  color: "white",
                },
              },
            },
          }}
        >
          {langs.map((lang) => (
            <MenuItem
              key={lang.code}
              value={lang.code}
              sx={{
                backgroundColor: "darkgreen",
                color: "white",
                "&:hover": {
                  backgroundColor: "#145214",
                },
                "&.Mui-selected": {
                  backgroundColor: "#145214",
                  color: "white",
                },
              }}
            >
              {lang.label}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    </div>
  );
}