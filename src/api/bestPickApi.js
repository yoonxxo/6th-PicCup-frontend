import { post } from './request';

export const uploadBestPick = async ({
  file,
  categoryId,
  capturedDate,
  candidateCount, //토너먼트 참가 사진 수
}) => {
  const formData = new FormData();

  formData.append('file', file, 'best-pick.jpg'); //file = winner.blob
  formData.append('categoryId', categoryId); //백엔드쪽에서 Long으로 변환해서 받음
  formData.append('capturedDate', capturedDate);
  formData.append('candidateCount', candidateCount);//백엔드쪽에서 int로 변환해서 받음

  const response = await post('/best-picks', formData, {
    headers: {
      'X-User-Id': '1',
    },
  });

  return response.data; //실제 응답 데이터만 반환
};

//bestPick 기능에 필요한 실제 API 요청