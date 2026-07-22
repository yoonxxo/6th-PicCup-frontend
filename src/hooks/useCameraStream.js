import { useCallback, useEffect, useRef, useState } from "react";

const useCameraStream = () => {
    const videoRef = useRef(null); //실제 <video> DOM 요소를 참조
    const streamRef = useRef(null); // getUserMedia로 받은 MediaStream 객체를 보관

    const [isCameraOn, setIsCameraOn] = useState(false);
    const [cameraError, setCameraError] = useState('');

    const stopCamera = useCallback(() => {
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
    },[]);

    const startCamera = useCallback(async () => {
        try { //try 성공하면 그대로 진행, 실패하면 catch로 이동
          setCameraError('');
        
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
          return true; //카메라 시작 성공

        } catch (error) {
          console.error('카메라 실행 오류:', error);
          setCameraError(`카메라 실행 실패: ${error.message}`);
          return false; //카메라 시작 실패
        }
      }, []);

      useEffect(() => { //언마운트 될때 카메라 종료
        return () => {
            stopCamera();
        };
      }, [stopCamera]);

  return {
    videoRef,
    isCameraOn,
    cameraError,
    startCamera,
    stopCamera,
  }
}

export default useCameraStream;