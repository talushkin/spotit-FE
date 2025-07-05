import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
// Removed createSelector import
import { Autocomplete, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { Song, Genre } from "../utils/storage";

interface RecipeOption {
    title: string;
    genre: string;
    originalTitle: string;
    imageUrl?: string;
}

interface SearchBarProps {
    desktop: boolean;
    isDarkMode: boolean;
    genres: Genre[];
    allSongs: Song[];
    setAllSongs: (songs: Song[]) => void;
    setSelectedSong: (song: Song) => void;
    setIsPlaying?: (playing: boolean) => void;
    onAddSongToList?: (song: Song, location?: number) => void;
    onSearchMiss?: (title: string) => void;
    setSearchActive?: (active: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    desktop,
    isDarkMode,
    genres,
    allSongs,
    setAllSongs,
    setSelectedSong,
    onAddSongToList,
    onSearchMiss,
    setSearchActive,
    setIsPlaying
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredSuggestions, setFilteredSuggestions] = useState<RecipeOption[]>([]);
    const [searchActiveInternal, setSearchActiveInternal] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const [translatedOptions, setTranslatedOptions] = useState<RecipeOption[]>([]);

    // UseSelector directly, no createSelector (no transformation needed)
    const searchOptions = useSelector((state: any) => state.data.searchOptions || []);

    useEffect(() => {
        setTranslatedOptions(
            allSongs.map((r: Song) => ({
                title: r.title,
                genre: r.genre ?? "",
                originalTitle: r.title,
                imageUrl: r.imageUrl || r.image || undefined,
            }))
        );
    }, [searchOptions]);

    useEffect(() => {
        // Log Redux searchOptions after fetch
        console.log('found searchOptions:', searchOptions);
        //add searchOptions to translatedOptions
        const options = searchOptions.map((opt: any) => ({  
            title: opt.title,
            genre: opt.genre || "",
            originalTitle: opt.title,
            imageUrl: opt.imageUrl || opt.image || undefined,
        }));
        if (options) {setTranslatedOptions(options);}
    }, [searchOptions]);

    useEffect(() => {
        if (searchInputRef.current && searchQuery === "") {
            searchInputRef.current.value = "";
        }
    }, [searchQuery]);

    // Debounce timer for onSearchMiss
    const searchMissTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleSearchChange = (_event: React.SyntheticEvent<Element, Event>, value: string) => {
        console.log("Search input changed:", value);
        setSearchQuery(value);
        if (!value) {
            //setFilteredSuggestions([]);
            console.log("Search cleared, no suggestions.");
            if (searchMissTimeout.current) clearTimeout(searchMissTimeout.current);
            return;
        }
        const filtered = translatedOptions.filter((opt: RecipeOption) =>
            (opt.title || '').toLowerCase().includes(value.toLowerCase())
        );
        if (filtered) {setFilteredSuggestions(filtered);}
        if (onSearchMiss) {
            if (searchMissTimeout.current) clearTimeout(searchMissTimeout.current);
            if (filtered.length === 0) {
                searchMissTimeout.current = setTimeout(() => {
                    onSearchMiss(value);
                }, 500);
            }
        }
    };

    const handleSelect = (_event: React.SyntheticEvent<Element, Event>, value: string | null) => {
        if (!value) return;
        const option = translatedOptions.find((opt: RecipeOption) => opt.title === value);
        if (option) {
            // Build song object from option and searchOptions (Redux)
            const reduxSong = searchOptions.find((s: Song) => s.title === option.title);
            const song: Song = reduxSong && reduxSong.title && reduxSong.artist && reduxSong.url
                ? reduxSong
                : {
                    title: option.title,
                    artist: (reduxSong && typeof reduxSong.artist === 'string') ? reduxSong.artist : '',
                    url: (reduxSong && typeof reduxSong.url === 'string') ? reduxSong.url : '',
                };
            if (song.title && song.artist && song.url) {
                setSearchActiveInternal(false);
                setShowMobileSearch(false);
                setSearchQuery("");
                //setFilteredSuggestions([]);
                if (setSearchActive) setSearchActive(false);
                if (searchInputRef.current) {
                    searchInputRef.current.blur();
                }
                if (onAddSongToList) {
                    onAddSongToList(song, 1);
                }
                setSelectedSong(song);
                if (setIsPlaying) setIsPlaying(true);
            }
        }
    };

    const handleKeyDown = (event: any) => {
        if (event.key === "Escape" && (searchActiveInternal || (setSearchActive && setSearchActive))) {
            setSearchActiveInternal(false);
            if (setSearchActive) setSearchActive(false);
            setSearchQuery("");
            setFilteredSuggestions([]);
            if (searchInputRef.current) {
                searchInputRef.current.blur();
            }
        }
    };

    return (
        <div style={{ flex: 0, maxWidth: "100%" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <span
                    style={{
                        display: !desktop && !showMobileSearch ? "inline-flex" : "none",
                        alignItems: "center",
                        cursor: "pointer",
                        color: "white",
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: "50%",
                        padding: "8px",
                        marginLeft: "8px",
                    }}
                    onClick={() => {
                        setShowMobileSearch(true);
                        if (setSearchActive) setSearchActive(true);
                        setTimeout(() => {
                            if (searchInputRef.current) searchInputRef.current.focus();
                        }, 0);
                    }}
                >
                    <SearchIcon sx={{ fontSize: 28 }} />
                </span>
                <Autocomplete
                    freeSolo
                    options={translatedOptions.map((opt) => opt.title)}
                    onInputChange={handleSearchChange}
                    onChange={handleSelect}
                    renderOption={(props, optionTitle) => {
                        const option = translatedOptions.find(opt => opt.title === optionTitle);
                        return (
                            <li {...props} style={{ display: 'flex', alignItems: 'center' }}>
                                {option?.imageUrl && (
                                    <img src={option.imageUrl} alt={option.title} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, marginRight: 8 }} />
                                )}
                                <span>{optionTitle}</span>
                            </li>
                        );
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            inputRef={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e, e.target.value)}
                            label="Search"
                            placeholder="Song name"
                            variant="outlined"
                            sx={{
                                minWidth: "50px",
                                maxWidth: "100%",
                                borderRadius: "8px",
                                borderWidth: "0px",
                                backgroundColor: isDarkMode ? "#222" : "#f5f5f5",
                                backgroundImage: "none",
                                backgroundSize: undefined,
                                backgroundRepeat: undefined,
                                "& .MuiInputBase-input": { color: "white" },
                                "& .MuiInputLabel-root": { color: "white" },
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderWidth: 0,
                                    borderColor: "white !important",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "white !important",
                                    borderWidth: "2px",
                                    borderRadius: "8px",
                                },
                                "&.Mui-focused .MuiInputBase-input": {
                                    color: "white",
                                },
                                "&.Mui-focused .MuiInputLabel-root": {
                                    color: "white",
                                },
                                display: desktop || showMobileSearch ? "block" : "none",
                                transition: "width 0.3s",
                            }}
                            InputProps={{
                                ...params.InputProps,
                            }}
                            onFocus={() => {
                                setSearchActiveInternal(true);
                                if (setSearchActive) setSearchActive(true);
                            }}
                            onBlur={() => {
                                setTimeout(() => {
                                    setSearchActiveInternal(false);
                                    if (setSearchActive) setSearchActive(false);
                                    setShowMobileSearch(false);
                                }, 100);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    )}
                    sx={{
                        width:
                            desktop || showMobileSearch
                                ? { xs: "90vw", sm: "70vw" }
                                : "0",
                        maxWidth: "95%",
                        transition: "width 0.3s ease",
                        backgroundColor: isDarkMode ? "#222" : "#f5f5f5",
                        backgroundImage: "none",
                        backgroundSize: undefined,
                        backgroundRepeat: undefined,
                        borderRadius: "8px",
                        marginRight: "32px",
                        position: "relative",
                        "& .MuiInputBase-input": {
                            color: "white",
                        },
                        "& .MuiInputLabel-root": {
                            color: "white",
                        },
                        "&:focus-within .MuiOutlinedInput-notchedOutline": {
                            borderColor: "white",
                            borderWidth: "2px",
                        },
                        "&:focus-within .MuiInputBase-input": {
                            color: "white",
                        },
                        "&:focus-within .MuiInputLabel-root": {
                            color: "white",
                        },
                        "&:focus-within": {
                            width: "95vw",
                            maxWidth: "95vw",
                            zIndex: 10,
                            position: "relative",
                            left: "unset",
                            right: "unset",
                            margin: "0 auto",
                            borderRadius: "8px",
                            borderWidth: "0px",
                        },
                        boxSizing: "border-box",
                        display: desktop || showMobileSearch ? "block" : "none",
                    }}
                />
            </div>
        </div>
    );
};

export default SearchBar;
