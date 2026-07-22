export const calculateCropArea = ({
  videoWidth,
  videoHeight,
  targetRatio,
}) => {
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

  return {
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight, //drawImage에 사용
  };
};