import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { 
    getPhotosBySessionId,
    losersToTrash,
 } from '../libs/photoDB';

import useCategoryStore from '../store/useCategoryStore';
import useBestPickUpload from '../hooks/useBestPickUplaod';
import useTournament from '../hooks/useTournament';

import TournamentWinner from '../components/tournament/TournamentWinner';
import TournamentMatch from '../components/tournament/TournamentMatch';

const TournamentPage = () => {
  const { sessionId } = useParams(); //라우터에서 주소 뒷부분(변수)를 객체로 반환해서 sessionId에 저장
  
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedCategory = useCategoryStore(
    (state) => state.selectedCategory,
  );

  const {
    winner,
    firstPhoto,
    secondPhoto,
    startTournament, // 불러온 사진으로 토너먼트를 초기화하는 함수
    selectPhoto, //사용자 선택 사진을 처리하는  함수
  } = useTournament();

  const { 
    handleUploadBestPick, //커스텀 훅에서 전달받음
    isUploading,
    uploadError,
    uploadedBestPick,
  } = useBestPickUpload({ //커스텀 hook 호출
    winner,
    selectedCategory,
    candidateCount: photos.length, //커스텀 훅으로 전달함
  })

  useEffect(() => { //화면이 렌더링된 다음 IndexedDB 조회 작업을 실행
    const loadPhotos = async () => { //비동기 작업
        try {
            const sessionPhotos = 
                await getPhotosBySessionId(sessionId);
            const photosWithPreview = 
                sessionPhotos.map((photo) => ({
                    ...photo,
                    previewUrl: URL.createObjectURL(photo.blob), //각 사진에 previewUrl추가. <img>의 src에는 Blob객체를 그대로 넣을 수 없기 때문
            }));
            setPhotos(photosWithPreview);
            startTournament(photosWithPreview);
            
        } catch (error) {
            console.error('토너먼트 사진 불러오기 실패:', error);
        } finally { //성공하든 실패하든 무조건 실행. 로딩상태 끔
            setIsLoading(false);
        }
    };
    loadPhotos();
  }, [sessionId, startTournament]); //페이지 첨 렌더링 될 때, sessionId가 바뀔때 실행

  useEffect(() => { //winner가 정해졌을 때 탈락사진을 휴지통으로 옮김
    if (!winner) {
        return;
    }

    const trashLosers = async () => {
        try {
            const trashedCount = await losersToTrash(
                sessionId,
                winner.id,
        );

        console.log(`${trashedCount}장의 탈락 사진을 휴지통으로 이동했습니다.`);
        } catch (error) {
        console.error('탈락 사진 휴지통 이동 실패:', error);
        }
    };

    trashLosers();
  }, [winner, sessionId]);


  if (isLoading) {
    return (
        <main>
            <p className="p-4">사진 불러오는 중...</p>
        </main>
    );
  }
  if (photos.length === 0) {
    return (
        <main>
            <p className="p-4">토너먼트에 사용할 사진이 없어요.</p>
        </main>
    )
  }

  return (
    <main className="relative mx-auto w-full max-w-md bg-background">
        {winner ? (
            <TournamentWinner //우승 페이지
                winner={winner} //props이름={부모(토너먼트 페이지)가 가진 값}
                onUpload={handleUploadBestPick}
                isUploading={isUploading}
                uploadError={uploadError}
                uploadedBestPick={uploadedBestPick}
            />
        ) : (
            <TournamentMatch 
                firstPhoto={firstPhoto}
                secondPhoto={secondPhoto}
                onSelectPhoto={selectPhoto}
            />
        )}
    </main>
  );
};

export default TournamentPage;

/*
1. 주소에서 sessionId 받기
2. IndexedDB에서 그 세션의 사진 불러오기
3. 두 장씩 보여주고 한 장 선택받기
4. 선택된 사진들로 다음 라운드를 반복해서 우승자 만들기
*/