import { Camera, House, Image, Menu, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import useCategoryStore from '../store/useCategoryStore';

const CategoryPage = () => {
  const navigate = useNavigate();

  const setSelectedCategory = useCategoryStore(
    (state) => state.setSelectedCategory,
  );

  const startTestCapture = () => {
    setSelectedCategory({
      id: 1,
      name: '테스트 카테고리',
    });

    navigate('/camera');
  };

  return (
    <main className="flex min-h-dvh flex-col">
        <div className="flex-1 px-4 pt-6">
            <header className="flex items-center justify-between px-2">
                <h1 className="text-3xl font-bold tracking-tight">
                PicCup
                </h1>

                <button
                type="button"
                className="flex size-10 items-center justify-center"
                aria-label="메뉴 열기"
                >
                <Menu size={24} />
                </button>
            </header>
      
      <section className="mt-10">
        <h2 className="text-3xl font-semibold">
          카테고리 선택
        </h2>

        <p className="mt-2 text-sm font-light text-text-secondary">
          선택하면 바로 촬영이 시작됩니다.
        </p>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-1">
        <button
          type="button"
          className="flex aspect-square items-center justify-center rounded-2xl border-2 border-border text-text-secondary bg-gray-50"
        >
          <Plus size={24} />
        </button>
        <button
          type="button"
          onClick={startTestCapture}
          className="relative aspect-square overflow-hidden rounded-2xl text-left"
        >
          <img
            src="/images/dokyo.webp"
            alt="도쿄 여행"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <p className="text-lg font-semibold opacity-95">도쿄 여행</p>
          </div>
        </button>
        <button
          type="button"
          onClick={startTestCapture}
          className="relative aspect-square overflow-hidden rounded-2xl text-left"
        >
          <img
            src="/images/landscape.jpg"
            alt="풍경"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <p className="text-lg font-semibold opacity-95">풍경</p>
          </div>
        </button>
        <button
          type="button"
          onClick={startTestCapture}
          className="relative aspect-square overflow-hidden rounded-2xl text-left"
        >
          <img
            src="/images/cat.jpg"
            alt="고양이"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <p className="text-lg font-semibold opacity-95">고양이</p>
          </div>
        </button>
        <button
          type="button"
          onClick={startTestCapture}
          className="relative aspect-square overflow-hidden rounded-2xl text-left"
        >
          <img
            src="/images/friend.webp"
            alt="친구들"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <p className="text-lg font-semibold opacity-95">친구들</p>
          </div>
        </button>
      </section>
    </div>

      <nav className="pointer-events-none fixed inset-x-0 bottom-8 z-50 mx-auto flex w-full max-w-md items-center justify-between px-10">
        <button
          type="button"
          className="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-white/95 shadow-lg ring-1 ring-black/5"
          aria-label="앨범"
        >
          <Image size={24} />
        </button>

        <button
          type="button"
          className="pointer-events-auto flex h-14 w-28 items-center justify-center rounded-full bg-white/95 shadow-lg ring-1 ring-black/5"
          aria-label="홈"
        >
          <House size={24} />
        </button>

        <button
          type="button"
          className="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-primary/95 text-white shadow-lg ring-1 ring-black/5"
          aria-label="카메라"
        >
            <Camera size={24}/>
        </button>
      </nav>
    </main>
  );
};

export default CategoryPage;