import { useEffect, useRef, useState } from 'react';
import { savePhoto } from '../libs/photoDB';
import { useNavigate } from 'react-router';

const CameraPage = () => {
  const videoRef = useRef(null); //실제 <video> DOM 요소를 참조
  const streamRef = useRef(null); // getUserMedia로 받은 MediaStream 객체를 보관
  const sessionIdRef = useRef(null); //세션 ID를 보관

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [photos, setPhotos] = useState([]);
  const [aspectRatio, setAspectRatio] = useState('3/4');

  const navigate = useNavigate();

  const startCamera = async () => {
    try { //try 성공하면 그대로 진행, 실패하면 catch로 이동
      setErrorMessage('');
    
      const stream = await navigator.mediaDevices.getUserMedia({ //여기서 getUserMedia가 promise를 반환. await로 기다려서 stream에 MediaStream을 넣음
        video: { //getUserMedia()가 성공하면(권한허용) 결과값을 돌려주고 실패하면 error를 던져줌
          facingMode: 'environment', //후면카메라 우선
        },
        audio: false,
      });

      sessionIdRef.current = crypto.randomUUID(); //세션 ID를 랜덤으로 생성하여 sessionIdRef에 저장
      setPhotos([]); //새로운 세션이 시작되면 이전에 촬영한 사진들을 초기화

      streamRef.current = stream; //MediaStream 객체를 streamRef.current에 저장.

      if (videoRef.current) { //<video> 태그가 존재하면
        videoRef.current.srcObject = stream; 
      } //<video> 태그의 srcObject에 stream 연결. 실시간 데이터는 src가 아니라 srcObject

      setIsCameraOn(true); //카메라 켜짐 상태로
    } catch (error) {
      console.error('카메라 실행 오류:', error);
      setErrorMessage(`카메라 실행 실패: ${error.message}`);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !isCameraOn) {
        return; //아무 작업도 하지 않고 함수 종료
    }

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        setErrorMessage("카메라가 준비되지 않았습니다.");
        return;
    }

    const canvas = document.createElement('canvas');
    //canvas는 그림을 그릴 수 있는 HTML 요소 (사진 생성을 위한 임시 도화지)

    const targetRatio = { //사용자가 선택한 비율을 숫자로 바꾼 값
      '3/4': 3 / 4,
      '9/16': 9 / 16,
      '1/1': 1,
    }[aspectRatio]

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const videoRatio = videoWidth / videoHeight; //실제 카메라 영상의 비율
    
    /*원본 영상에서 자르기 시작할 위치*/
    let sourceX = 0; 
    let sourceY = 0;
    /*원본 영상에서 실제로 잘라낼 영역의 크기*/
    let sourceWidth = videoWidth;
    let sourceHeight = videoHeight;

    if (videoRatio > targetRatio) { //목표비율보다 넓으면 좌우 자르기
      sourceWidth = videoHeight * targetRatio;
      sourceX = (videoWidth - sourceWidth) / 2;
    } else { //목표비율보다 길면 위아래 자르기
      sourceHeight = videoWidth / targetRatio;
      sourceY = (videoHeight - sourceHeight) / 2;
    }

    canvas.width = Math.round(sourceWidth);
    canvas.height = Math.round(sourceHeight);

    const context = canvas.getContext('2d');
    //context는 canvas에 그림을 그릴 수 있는 2D 컨텍스트 객체

    if (!context) {
        setErrorMessage("사진을 촬영할 수 없습니다.");
        return;
    }

    context.drawImage(
        video, //video의 현재 프래임을 가져와서

        sourceX, //원본에서 가져올 영역
        sourceY,
        sourceWidth,
        sourceHeight,

        0, // canvas의 왼쪽 상단 좌표 (0, 0)에서 시작하여
        0, 
        canvas.width, //canvas의 너비와 높이로 그리기
        canvas.height,
      ); 
    

    canvas.toBlob( //canvas를 사진 Blob(저장할 수 있는 이미지 데이터)으로 변환
        async (blob) => { //콜백 함수로 blob을 받아옴
            if (!blob) {
                setErrorMessage("사진 생성에 실패했습니다.");
                return;
            }

            try {
              const photo = {
                id: crypto.randomUUID(), 
                sessionId: sessionIdRef.current, //세션 ID를 photo 객체에 저장
                blob,
                status: 'active',
                createdAt: new Date().toISOString(), //촬영한 시간을 문자열로 저장
            };

              await savePhoto(photo); //IndexedDB에 photo 객체 저장

              const previewPhoto = {
                  ...photo, // 기존 photo 객체의 속성을 모두 복사
                  previewUrl: URL.createObjectURL(blob), //Blob을 브라우저에서 볼 수 있는 URL로 변환
              }; //previewUrl은 임시주소이기 때문에 IndexedDB에 저장하지 않는다.

              setPhotos((prevPhotos) => [
                  ...prevPhotos, 
                  previewPhoto,
              ]); // 기존 photos 배열에 화면 표시용 previewPhoto 객체 추가

            } catch (error) {
                console.error('사진 저장 실패:', error);
                setErrorMessage(`사진 저장 실패: ${error.message}`);
            }
        },
        'image/jpeg',
        0.95,
    );
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => { //카메라 스트림의 모든 트랙을 순회
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) { //video 태그에 연결돼 있던 카메라 스트림 제거
      videoRef.current.srcObject = null; 
    }

    setIsCameraOn(false);
  };

  const completeCapture = () => {
    const sessionId = sessionIdRef.current;

    if (!sessionId || photos.length === 0) {
      return;
    }

    stopCamera();
    navigate(`/tournament/${sessionId}`);
  }

  useEffect(() => {
    return () => { //컴포넌트가 언마운트될 때 카메라 종료
      if (streamRef.current) { //종료할 스트림이 존재하지 않으면 필요없음
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const latestPhoto = photos[ photos.length -1 ];
  const aspectRatioClass = {
    '3/4': 'aspect-[3/4]',
    '9/16': 'aspect-[9/16]',
    '1/1': 'aspect-square',
  }[aspectRatio];
  const changeAspectRatio = () => {
    if (aspectRatio === '3/4') {
      setAspectRatio('9/16');
    } else if (aspectRatio === '9/16') {
      setAspectRatio('1/1');
    } else {
      setAspectRatio('3/4');
    }
  };
  const cameraPositionClass = {
    '1/1': 'bottom-48',
    '3/4': 'bottom-20',
    '9/16': 'bottom-20',
  }[aspectRatio];

  return (
    <main className = "relative mx-auto h-dvh w-full max-w-md overflow-hidden bg-background">
      <header className = "absolute inset-x-0 top-0 z-20 flex h-14 items-end justify-between px-4 pb-3">
        <button
          type="button"
          className = "rounded-full bg-primary px-8 py-1.5 text-sm font-semibold text-white"
          >
            풍경
          </button>

        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg bg-surface text-lg"
          aria-label="카메라 설정 열기"
        >
          ⌄
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
          />

      </section>

      <section className="absolute inset-x-0 bottom-20 z-20 grid h-24 grid-cols-3 items-center px-6">
          <button
            type="button"
            onClick={changeAspectRatio} 
            className="justify-self-start rounded-full bg-surface px-3 py-2 text-sm"
          >
            {aspectRatio.replace('/', ':')}
          </button>
      
        {! isCameraOn ? (
          <button
            type="button"
            onClick={startCamera}
            className="flex size-14 border-4 bg-primary items-center justify-center justify-self-center rounded-full"
            aria-label="카메라 시작"
          >
          </button>
        ) : (
          <button
            type="button"
            onClick={capturePhoto}
            className="flex size-14 border-4 bg-surface items-center justify-center justify-self-center rounded-full"
            aria-label="사진 촬영"
          >
          </button>
        )}

        <button
          type="button"
          className="size-10 justify-self-end rounded-full bg-surface text-lg"
          aria-label="카메라 방향 전환"
        >
          ↻
        </button>
      </section>

      {errorMessage && <p>{errorMessage}</p>} 

      <footer className="absolute inset-x-0 bottom-0 z-20 grid h-20 grid-cols-3 items-center px-5 pb-3">
        <div className="justify-self-start size-12 overflow-hidden rounded-xl bg-surface">
          {latestPhoto && ( //latestPhoto가 없으면 렌더링 하지 않고
            <img //있으면 <img> 렌더링
              src={latestPhoto.previewUrl} 
              alt="최근 촬영한 사진"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <p className="text-center text-sm font-medium">
          {photos.length}장 촬영했어요.
        </p>

        <button
          type="button"
          onClick={completeCapture}
          className="flex size-12 items-center justify-center justify-self-end rounded-full bg-surface text-xl"
          aria-label="촬영 완료"
        >
          →
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
*/