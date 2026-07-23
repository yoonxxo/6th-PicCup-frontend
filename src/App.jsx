import { Route, Routes } from "react-router";
import { useEffect } from "react";

import { deleteExpiredTrashPhotos } from "./libs/photoDB";

import CameraPage from "./pages/CameraPage";
import HomePage from "./pages/HomePage";
import TournamentPage from "./pages/TournamentPage";
import CategoryPage from "./pages/CategoryPage";

const App = () => {
  useEffect(() => {
    const cleanExpiredTrash = async () => {
      try {
        const deletedCount = await deleteExpiredTrashPhotos();

        if (deletedCount > 0) {
          console.log(`${deletedCount}장의 만료된 휴지통 사진을 영구 삭제했습니다.`);
        }
      } catch (error) {
        console.error('만료된 휴지통 사진 삭제 실패:',error);
      }
    };

    cleanExpiredTrash();
  }, []);

  return (
    <main className="min-h-dvh">
      <div className="mx-auto min-h-dvh w-full max-w-md bg-background">
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
      </div>
    </main>
    
  )
}

export default App