import { useCallback, useState } from "react"

import { savePhoto } from "../libs/photoDB"
import { calculateCropArea } from "../libs/cropArea.js"

const usePhotoCapture = ({
    videoRef,
    isCameraOn,
    sessionIdRef,
    targetRatio,
}) => {
    const [photos, setPhotos] = useState([]);
    const [captureError, setCaptureError] = useState('');

    const resetPhotos = useCallback(() => { //useCallback은 함수자체를 기억하기 위한 훅
        setPhotos([]);
        setCaptureError('');
    }, []); //새 촬영 세션 시작 시 배열 초기화

    const capturePhoto = () => {
        if (!videoRef.current || !isCameraOn) {
            return; //아무 작업도 하지 않고 함수 종료
        }

        const video = videoRef.current;
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            setCaptureError("카메라가 준비되지 않았습니다.");
            return;
        }

    const {
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
    } = calculateCropArea({
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        targetRatio,
    })

    const canvas = document.createElement('canvas');
    //canvas는 그림을 그릴 수 있는 HTML 요소 (사진 생성을 위한 임시 도화지)
    canvas.width = Math.round(sourceWidth);
    canvas.height = Math.round(sourceHeight);

    const context = canvas.getContext('2d');
    //context는 canvas에 그림을 그릴 수 있는 2D 컨텍스트 객체

    if (!context) {
        setCaptureError("사진을 촬영할 수 없습니다.");
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
                setCaptureError("사진 생성에 실패했습니다.");
                return;
            }

            try {
              setCaptureError('');

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
                setCaptureError(`사진 저장 실패: ${error.message}`);
            }
        },
        'image/jpeg',
        0.95,
    );
  };

  const latestPhoto = photos[ photos.length -1 ];

  return {
    photos,
    latestPhoto,
    captureError,
    capturePhoto,
    resetPhotos,
  };
};

export default usePhotoCapture