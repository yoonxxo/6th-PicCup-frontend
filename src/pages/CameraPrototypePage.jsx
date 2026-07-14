import { useEffect, useRef, useState } from 'react';

const CameraPrototypePage = () => {
  const videoRef = useRef(null); //실제 <video> DOM 요소를 참조
  const streamRef = useRef(null); // getUserMedia로 받은 MediaStream 객체를 보관

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [photos, setPhotos] = useState([]);

  const startCamera = async () => {
    try { //try 성공하면 그대로 진행, 실패하면 catch로 이동
      setErrorMessage('');
    
      const stream = await navigator.mediaDevices.getUserMedia({ //여기서 getUserMedia가 promise를 반환. await로 기다려서 stream에 MediaStream을 넣음
        video: { //getUserMedia()가 성공하면(권한허용) 결과값을 돌려주고 실패하면 error를 던져줌
          facingMode: 'environment', //후면카메라 우선
        },
        audio: false,
      });

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
    const canvas = document.createElement('canvas');
    //canvas는 그림을 그릴 수 있는 HTML 요소 (사진 생성을 위한 임시 도화지)

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    //context는 canvas에 그림을 그릴 수 있는 2D 컨텍스트 객체

    if (!context) {
        setErrorMessage("사진을 촬영할 수 없습니다.");
        return;
    }

    context.drawImage(
        video, //video의 현재 프래임을 가져와서 
        0, // canvas의 왼쪽 상단 좌표 (0, 0)에서 시작하여
        0, 
        canvas.width, //canvas의 너비와 높이로 그리기
        canvas.height); 
    

    canvas.toBlob( //canvas를 사진 Blob(저장할 수 있는 이미지 데이터)으로 변환
        (blob) => { //콜백 함수로 blob을 받아옴
            if (!blob) {
                setErrorMessage("사진 생성에 실패했습니다.");
                return;
            }

            const photo = {
                id: crypto.randomUUID(),
                blob,
                previewUrl: URL.createObjectURL(blob), //Blob을 브라우저에서 볼 수 있는 URL로 변환
                createdAt: new Date().toISOString(), //촬영한 시간을 문자열로 저장
            }
            setPhotos((prevPhotos) => [
                ...prevPhotos, 
                photo,
            ]); //기존 photos 배열에 새로 촬영한 photo 객체를 추가
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

  useEffect(() => {
    return () => { //컴포넌트가 언마운트될 때 카메라 종료
      if (streamRef.current) { //종료할 스트림이 존재하지 않으면 필요없음
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return (
    <main>
      <h1>카메라 촬영 프로토타입</h1>

      <video
        ref={videoRef} //videoRef 연결
        autoPlay
        playsInline //전체화면으로 열리는 것을 방지
        muted //음소거
        style={{
          width: '100%',
          maxWidth: '420px',
          aspectRatio: '3 / 4',
          objectFit: 'cover',
          backgroundColor: '#222',
        }}
      />

      <div>
        {!isCameraOn ? (
          <button 
            type="button" 
            onClick={startCamera}
            className="rounded-lg bg-black px-4 py-3 text-white"
          >
            카메라 시작
          </button>
        ) : (
            <>
              <button 
                type="button" 
                onClick={capturePhoto}
                className="rounded-lg bg-black px-4 py-3 text-white"
              >
                사진 촬영
              </button>

              <button 
                type="button" 
                onClick={stopCamera}
                className="rounded-lg bg-black px-4 py-3 text-white"
              >
                촬영 종료
              </button>
            </>
          )}
      </div>

      {errorMessage && <p>{errorMessage}</p>} 

      <section>
        <h2 className="mb-2 text-lg font-bold">
          촬영한 사진: {photos.length}장
        </h2>

        <div className="flex overflow-x-auto">
            {photos.map((photo) => (
                <img
                    key={photo.id}
                    src={photo.previewUrl}
                    alt={`촬영한 사진 ${photo.id}`}
                    style={{
                        width: '120px',
                        height: '160px',
                        objectFit: 'cover',
                        marginRight: '8px',
                    }}
                />
            ))}
        </div>
      </section>
      
    </main>
  );
};

export default CameraPrototypePage;


/*
useState → 카메라가 켜졌는지, 오류 메시지가 있는지 저장
useRef → video 태그와 카메라 stream 기억
useEffect → 페이지를 벗어날 때 카메라 종료

getUserMedia()로 MediaStream 객체를 받아온 것이 streamRef.current에 저장됨
*/