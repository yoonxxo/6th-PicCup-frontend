import { useState } from 'react';

import { uploadBestPick } from '../api/bestPickApi';
import { getLocalDateString } from '../libs/date';

const useBestPickUpload = ({
  winner,
  selectedCategory,
  candidateCount,
}) => {
  const [isUploading, setIsUploading] =useState(false);
  const [uploadError, setUploadError] =useState('');
  const [uploadedBestPick, setUploadedBestPick] = useState(null); //서버 저장 성공응답 받은 베스트픽

  const handleUploadBestPick = async () => {
    if (!winner) {
      return;
    }

    if (!selectedCategory) {
      setUploadError(
        '선택된 카테고리가 없습니다.',
      );
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');

      const result = await uploadBestPick({
        file: winner.blob,

        categoryId:
          selectedCategory.id,

        capturedDate:
          getLocalDateString(
            new Date(winner.createdAt),
          ),

        candidateCount,
      });

      setUploadedBestPick(result);

      console.log(
        '베스트픽 업로드 성공:',
        result,
      );
    } catch (error) {
      console.error(
        '베스트픽 업로드 실패:',
        error,
      );

      const message =
        error.response?.data?.message ??
        '베스트픽 저장에 실패했습니다.';

      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleUploadBestPick,
    isUploading,
    uploadError,
    uploadedBestPick,
  };
};

export default useBestPickUpload;