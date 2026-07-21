import { Route, Routes } from "react-router";
import CameraPage from "./pages/CameraPage";
import HomePage from "./pages/HomePage";
import TournamentPage from "./pages/TournamentPage";
import CategoryPage from "./pages/CategoryPage";

const App = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={<HomePage />} 
      />
      <Route 
        path="/camera" 
        element={<CameraPage />} 
      />
      <Route
        path="/tournament/:sessionId" //:는 변수라는 뜻
        element={<TournamentPage />}
      />
      <Route
        path="/category" //:는 변수라는 뜻
        element={<CategoryPage />}
      />
    </Routes>
  )
}

export default App