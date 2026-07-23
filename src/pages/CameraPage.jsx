import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { ASPECT_RATIO_CONFIG } from '../constants/ratio';
import useCameraStream from '../hooks/useCameraStream';
import usePhotoCapture from '../hooks/usePhotoCapture';

import { Scan, RefreshCw, ChevronDown, ArrowRight } from 'lucide-react';

const CameraPage = () => {
  const sessionIdRef = useRef(null); //세션 ID를 보관

  const [aspectRatio, setAspectRatio] = useState('3/4');

  const navigate = useNavigate();
  const ratioConfig = ASPECT_RATIO_CONFIG[aspectRatio]; //비율 설정

  const {
    videoRef,
    isCameraOn,
    cameraError,
    facingMode,
    startCamera: openCamera,//훅이 반환한 startCamera를 openCamera라는 이름으로 꺼냄
    stopCamera,
    switchCamera,
  } = useCameraStream();

  const {
    photos,
    latestPhoto,
    captureError,
    capturePhoto,
    resetPhotos,
  } = usePhotoCapture({
    videoRef,
    isCameraOn,
    sessionIdRef,
    targetRatio: ratioConfig.value, //훅에 ratio 값 전달
  })


  useEffect(() => { //카메라 자동 시작
    const startCamera = async () => {
      const didStart = await openCamera();

      if (!didStart) {
        return;
      }

      sessionIdRef.current = crypto.randomUUID();
      resetPhotos();
    };

    startCamera();
  }, [openCamera, resetPhotos]);

  const completeCapture = () => { //토너먼트로 넘어가는 함수
    const sessionId = sessionIdRef.current;

    if (!sessionId || photos.length === 0) {
      return;
    }

    stopCamera();
    navigate(`/tournament/${sessionId}`);
  }
  const aspectRatioClass = ratioConfig.className;
  const cameraPositionClass = ratioConfig.position;
  const changeAspectRatio = () => {
    setAspectRatio(ratioConfig.next);
  }

  return (
    <main className = "relative mx-auto h-dvh w-full max-w-md overflow-hidden">
      <header className = "absolute inset-x-0 top-0 z-20 flex h-14 items-end justify-between px-4 pb-1">
        <button
          type="button"
          className = "rounded-full bg-primary px-8 py-1.5 text-sm font-semibold text-white"
          >
            풍경
          </button>

        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-xl bg-gray-100/90 text-lg"
          aria-label="카메라 설정 열기"
        >
          <ChevronDown
            size={20}
            strokeWidth={2.3}
          />
        </button>
      </header>

      <section 
        className = {`absolute left-0 z-0 ${cameraPositionClass} w-full overflow-hidden bg-black ${aspectRatioClass}`}
        >
          <video
          ref={videoRef} //videoRef 연결
          autoPlay
          playsInline //전체화면으로 열리는 것을 방지
          muted //음소거
          className = "h-full w-full object-cover"
          style={{
            transform:
              facingMode === 'user' //전면 카메라일 경우
                ? 'scaleX(-1)' //좌우반전(거울처럼 보이게)
                : 'none',
          }}
          />

      </section>

      <section className="absolute inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-20 grid h-24 grid-cols-3 items-center px-6">
          <button
            type="button"
            onClick={changeAspectRatio} 
            className="relative flex size-12 items-center justify-center rounded-full bg-gray-100/90 ring-1 ring-black/5"
          >
            <Scan
              size={28}
              strokeWidth={2.2}
              aria-hidden="true"
            />
            <span className="absolute text-xs font-semibold">
              {aspectRatio.replace('/', ':')}
            </span>
          </button>
      
          <button
            type="button"
            onClick={capturePhoto}
            disabled={!isCameraOn}
            className="flex size-20 border-4 border-gray-300 bg-white items-center justify-center justify-self-center rounded-full shadow-lg"
            aria-label="사진 촬영 버튼"
          >
          </button>

        <button
          type="button"
          onClick={switchCamera}
          className="flex size-12 items-center justify-center justify-self-end rounded-full bg-gray-100/90 ring-1 ring-black/5"
          aria-label="카메라 방향 전환"
        >
          <RefreshCw
            size={24}
            strokeWidth={2}
            aria-hidden="true"
          />
        </button>
      </section>

      {(cameraError || captureError) && (
        <p>{cameraError || captureError}</p>
      )} 
      

      <footer className="absolute inset-x-0 bottom-0 z-20 grid h-[calc(6rem+env(safe-area-inset-bottom))] grid-cols-3 items-center px-6 pb-[env(safe-area-inset-bottom)]">
        <div className="relative justify-self-start size-12 overflow-hidden rounded-xl bg-surface text-right">
          {latestPhoto && ( //latestPhoto가 없으면 렌더링 하지 않고
            <img //있으면 <img> 렌더링
              src={latestPhoto.previewUrl} 
              alt="최근 촬영한 사진"
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 p-1 text-white/90 font-light">
            <p>{photos.length}/16</p>
          </div>
        </div>

        <p className="self-end pb-6 text-center text-sm font-medium">
          {16-photos.length}장 남았어요.
        </p>

        <button
          type="button"
          onClick={completeCapture}
          className="flex w-24 h-12 items-center justify-center justify-self-end rounded-4xl bg-white/90 ring-1 ring-primary/50"
          aria-label="촬영 완료"
        >
          <ArrowRight
            size={28}
            strokeWidth={2}
          />
        </button>
      </footer>
      
    </main>
  );
};

export default CameraPage;


/*
useState → 카메라가 켜졌는지, 오류 메시지가 있는지 저장
useRef → video 태그와 카메라 stream 기억
useEffect → 페이지를 벗어날 때 카메라 종료

getUserMedia()로 MediaStream 객체를 받아온 것이 streamRef.current에 저장됨

cameraError → 권한 요청 또는 카메라 스트림 실행 실패
captureError → 촬영, Blob 생성, IndexedDB 저장 실패
*/