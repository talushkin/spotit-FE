import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RecipeList from "./Pages/RecipeList";
import RecipeDetail from "./Pages/RecipeDetail";
import AddRecipe from "./Pages/AddRecipe";
import HomePage from "./Pages/HomePage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipes/:category" element={<RecipeList />} />
        <Route path="/recipes/:category/:title" element={<RecipeDetail />} />
        <Route path="/recipes/:category/add" element={<AddRecipe />} />
      </Routes>
    </Router>
  );
}
