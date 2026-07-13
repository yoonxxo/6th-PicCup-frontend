
import { useEffect, useRef, useState } from 'react';

const CameraPrototypePage = () => {
  const videoRef = useRef(null); //나중에 <video>에 연결
  const streamRef = useRef(null); //스트림 저장. 카메라 끌 때 필요

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const startCamera = async () => {
    try { //try 성공하면 그대로 진행, 실패하면 catch로 이동
      setErrorMessage('');
    
      const stream = await navigator.mediaDevices.getUserMedia({ //여기서 stream은 promise 객체. await로 기다려서 stream을 얻음
        video: { //getUserMedia()가 성공하면(권한허용) 결과값을 돌려주고 실패하면 error를 던져줌
          facingMode: 'environment', //후면카메라 우선
        },
        audio: false,
      });

      streamRef.current = stream; //스트림 저장. 카메라 끌 때 필요

      if (videoRef.current) { //<video> 태그가 존재하면
        videoRef.current.srcObject = stream; 
      } //srcObject에 stream 연결. 실시간 데이터는 src가 아니라 srcObject

      setIsCameraOn(true); //카메라 켜짐 상태로
    } catch (error) {
      console.error(error);
      setErrorMessage('카메라를 실행할 수 없습니다.');
    }
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
          <button type="button" onClick={startCamera}>
            카메라 시작
          </button>
        ) : (
          <button type="button" onClick={stopCamera}>
            카메라 종료
          </button> 
        )}
      </div>

      {errorMessage && <p>{errorMessage}</p>} 
      
    </main>
  );
};

export default CameraPrototypePage;


/*
useState → 카메라가 켜졌는지, 오류 메시지가 있는지 저장
useRef → video 태그와 카메라 stream 기억
useEffect → 페이지를 벗어날 때 카메라 종료
*/