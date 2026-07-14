import { Link } from 'react-router';

const HomePage = () => {
  return (
    <main>
      <h1>PicCup 홈</h1>

      <Link to="/prototype/camera">
        카메라 프로토타입 열기
      </Link>
    </main>
  );
};

export default HomePage;