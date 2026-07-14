import { Route, Routes } from "react-router";
import CameraPrototypePage from "./pages/CameraPrototypePage";
import HomePage from "./pages/HomePage";

const App = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={<HomePage />} 
      />
      <Route 
        path="/prototype/camera" 
        element={<CameraPrototypePage />} 
      />
    </Routes>
  )
}

export default App