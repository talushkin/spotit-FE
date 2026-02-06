// Log songList and index whenever songList changes

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSearchOptions } from "./store/dataSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,useParams
} from "react-router-dom";
import HomePage from "./Pages/HomePage";
import WatchPage from "./Pages/WatchPage";
import "./styles.css";
import { CircularProgress, Box } from "@mui/material";
import { Provider } from "react-redux";
import * as storage from "./utils/storage";
import store from "./store/store";
import type { Song, Genre } from "./utils/storage"; // adjust path as needed

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);


// (Removed unused DataState and initialState)

function App() {
  const dispatch = useDispatch();
  const [songs, setSongs] = useState<any>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); // Set initial theme to dark
  // Song list state (array of songs)
  const [songList, setSongList] = useState<any[]>([
  ]);

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await storage.loadData(false);
      setSongs(data);
      // Support both { site: { genres: Genre[] } } and { site: { site: { genres: Genre[] } } }
      let genres: Genre[] | undefined = undefined;
      if (data && 'site' in data && data.site) {
        // If data.site.site exists, use that
        if ('site' in data.site && data.site.site && 'genres' in data.site.site) {
          genres = (data.site.site as any).genres;
        } else if ('genres' in data.site) {
          genres = (data.site as any).genres;
        }
      }
      if (genres && genres.length > 0) {
        let initialGenre = genres[0];
        setSelectedGenre(initialGenre);
        const initialSong = initialGenre.songs[0] || null;
        setSelectedSong(initialSong); // Set initial selected song if available
        setSongList(initialSong ? [initialSong] : []); // Start list with the player song only
        // Set search options to all songs from all genres in Redux
        const allSongs = genres.flatMap((g) => g.songs || []);
        //dispatch(setSearchOptions(allSongs));
      } else {
        dispatch(setSearchOptions([]));
        setSongList([]);
      }

      setLoading(false);
    };
    fetchData();
  }, [params.category, params.title]);

  // useEffect(() => {
  //   document.title = "spotIt";
  //   document.body.dir = "ltr";
  //   setSelectedSong(songList[0] || null); // Set initial selected song if available
  // }, []);

  // Log songList and index whenever songList changes
  useEffect(() => {
    console.log('songList updated:', songList.map((s: any, i: number) => ({ index: i, ...s })));
  }, [songList]);
  

  // Handler to add a song to the song list (to be passed to CaseCard)
  const handleAddSongToList = (song: any, location?: number) => {
    console.log("Adding song to list:", song, "at location:", location);
    //console.log("Current song:", selectedSong);
    setSongList((prev) => {
      if (prev.some((s) => s.title === song.title && s.artist === song.artist)) return prev;
      if (location === 1) {
        // Add to top (first position) but keep only one instance at the top
        console.log("Adding song to top of list and start playing",song.title);
        const filtered = prev.filter((s: any) => !(s.title === song.title && s.artist === song.artist));
        const newList = [song, ...filtered];
        setSelectedSong(song); // Set the newly added song as selected
        return newList;
      } else if (location === -1) {
        // Add to bottom (last position)
        console.log("Adding song to bottom of list",song.title);
        return [...prev, song];
      } else {
        console.log("Adding song to bottom of list",song.title);
        // Default: add to bottom
        return [...prev, song];
      }
    });
  };

  return (
    <>
      {loading && (
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 2000,
            background: isDarkMode ? "#333" : "#fffce8",
          }}
        >
          <CircularProgress size={64} />
        </Box>
      )}

      {!loading && songs && (
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                songs={songs}
                setSongs={setSongs}
                selectedSong={selectedSong}
                setSelectedSong={setSelectedSong}
                setSelectedGenre={setSelectedGenre}
                selectedGenre={selectedGenre}
                songList={songList}
                setSongList={setSongList}
                onAddSongToList={handleAddSongToList}
              />
            }
          />
          <Route
            path="/watch/:videoId"
            element={<WatchPageRoute />}
          />
        </Routes>
      )}
    </>
  );

// Route component to extract videoId param using useParams
function WatchPageRoute() {
  const { videoId } = useParams();
  if (!videoId || typeof videoId !== 'string') return null;
  return <WatchPage videoId={videoId} />;
}
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
        <Router>
          <App />
        </Router>
    </Provider>
  </React.StrictMode>
);