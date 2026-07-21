import { Link } from 'react-router';

const HomePage = () => {
  
  return (
    <main className="mx-auto max-w-md bg-gray-100 p-8">
      <h1>PicCup 홈</h1>
        <div>
          <Link to="/camera"
            className="bg-primary font-sans text-white"
          >
            카메라 열기
          </Link>
        </div>
        <div>
          <Link to="/category"
            className="bg-primary font-sans text-white"
          >
            카테고리 열기
          </Link>
        </div>
    </main>
  );
};

export default HomePage;