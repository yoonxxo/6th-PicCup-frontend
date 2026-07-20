import { Link } from 'react-router';

const HomePage = () => {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1>PicCup 홈</h1>

      <Link to="/prototype/camera"
        className="bg-primary font-sans text-white"
      >
        카메라 프로토타입 열기
      </Link>
    </main>
  );
};

export default HomePage;