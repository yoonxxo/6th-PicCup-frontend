/*
1. 주소에서 sessionId 받기
2. IndexedDB에서 그 세션의 사진 불러오기
3. 두 장씩 보여주고 한 장 선택받기
4. 선택된 사진들로 다음 라운드를 반복해서 우승자 만들기

nextRoundPhotos
→ 현재 라운드 전체 동안 승자들을 계속 기억하는 상태

updatedNextRoundPhotos
→ 한 번의 사진 선택을 처리할 때 최신 배열을 계산하기 위한 임시 변수
*/

import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getPhotosBySessionId } from '../libs/photoDB'; //IndexedDB의 저장소에서 같은 sessionId를 가진 사진을 가져오는 함수

const TournamentPage = () => {
  const { sessionId } = useParams(); //라우터에서 주소 뒷부분(변수)를 객체로 반환해서 sessionId에 저장
  
  const [photos, setPhotos] = useState([]); //원본 보관용
  const [currentRoundPhotos, setCurrentRoundPhotos] = useState([]);
  const [nextRoundPhotos, setNextRoundPhotos] = useState([]); //현재 라운드에서 승리한 사진들 임시 저장. 이후 currentRoundPhotos로 넘겨줌
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0); //현재 몇 번째 사진부터 대결하는지 나타냄
  const [winner, setWinner] = useState(null); //최종 우승 사진
  const [isLoading, setIsLoading] = useState(true); //IndexDB에서 사진을 불러오는 중인지

  useEffect(() => { //화면이 렌더링된 다음 IndexedDB 조회 작업을 실행
    const loadPhotos = async () => { //비동기 작업
        try {
            const oneSessionPhotos = 
                await getPhotosBySessionId(sessionId);
            const photosWithPreview = oneSessionPhotos.map((photo) => ({
                ...photo,
                previewUrl: URL.createObjectURL(photo.blob), //각 사진에 previewUrl추가. <img>의 src에는 Blob객체를 그대로 넣을 수 없기 때문
            }));
            setPhotos(photosWithPreview);

            if (photosWithPreview.length === 1) { //촬영한 사진이 한장일 경우
                setWinner(photosWithPreview[0]);
            } else {
                setCurrentRoundPhotos(photosWithPreview);
            }
        } catch (error) {
            console.error('토너먼트 사진 불러오기 실패:', error);
        } finally { //성공하든 실패하든 무조건 실행. 로딩상태 끔
            setIsLoading(false);
        }
    };
    loadPhotos();
  }, [sessionId]); //페이지 첨 렌더링 될 때, sessionId가 바뀔때 실행

  const firstPhoto = currentRoundPhotos[currentMatchIndex];
  const secondPhoto = currentRoundPhotos[currentMatchIndex + 1];

  const selectPhoto = (selectedPhoto) => {
    let updatedNextRoundPhotos = [ //React의 상태변경이 즉시 반영되지 않을 수 있으므로 별도의 변수 생성
        ...nextRoundPhotos,
        selectedPhoto,
    ];

    const nextMatchIndex = currentMatchIndex + 2;
    const remainPhoto = currentRoundPhotos[nextMatchIndex];
    const remainOpponent = currentRoundPhotos[nextMatchIndex + 1];

    if (remainPhoto && !remainOpponent) {
        updatedNextRoundPhotos = [
            ...updatedNextRoundPhotos,
            remainPhoto,
        ];

        finishRound(updatedNextRoundPhotos);
        return;
    }

    if (remainPhoto && remainOpponent) {
        setNextRoundPhotos(updatedNextRoundPhotos);
        setCurrentMatchIndex(nextMatchIndex);
        return;
    }

    finishRound(updatedNextRoundPhotos);
  };

  const finishRound = (roundWinners) => {
    if (roundWinners.length === 1) {
        setWinner(roundWinners[0]);
        return;
    }

    setCurrentRoundPhotos(roundWinners); // 승리한 사진이 두 장 이상이면 
    setNextRoundPhotos([]); //다음 라운드 시작 
    setCurrentMatchIndex(0); 
  }

  if (isLoading) {
    return (
        <main className="mx-auto min-h-dvh w-full max-w-md bg-background">
            <p className="p-4">사진 불러오는 중...</p>
        </main>
    );
  }
  if (photos.length === 0) {
    return (
        <main className="mx-auto min-h-dvh w-full max-w-md bg-background">
            <p className="p-4">토너먼트에 사용할 사진이 없어요.</p>
        </main>
    )
  }
  return (
    <main className="relative mx-auto w-full max-w-md bg-background">
        {winner ? (
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-xl font-bold">우승 사진</h2>

                <img
                    src={winner.previewUrl}
                    alt="최종 우승 사진"
                    className="w-full max-w-72 rounded-xl object-cover"
                />
            </div>
            ) : (
            <div className="flex flex-col items-center gap-3">
                {firstPhoto && secondPhoto && (
                <>
                    <button 
                        type="button"
                        onClick={()=> selectPhoto(firstPhoto)} 
                        className="w-full"
                    >
                        <img
                            src={firstPhoto.previewUrl}
                            alt="위 후보 사진"
                            className="mx-auto w-full rounded-xl object-cover"
                        />
                    </button>
                    
                    <span className="text-sm font-medium">vs</span>

                    <button 
                        type="button" 
                        onClick={()=> selectPhoto(secondPhoto)}
                        className="w-full"
                    >
                        <img
                            src={secondPhoto.previewUrl}
                            alt="아래 후보 사진"
                            className="mx-auto w-full rounded-xl object-cover"
                        />
                    </button>
                </>
                )}
            </div>
            )}
    </main>
  );
};

export default TournamentPage;

