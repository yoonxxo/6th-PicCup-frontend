import { useCallback, useState } from 'react';

const useTournament = () => {
  const [roundPhotos, setRoundPhotos] =useState([]);
  const [roundWinners, setRoundWinners] =useState([]); //현재 라운드에서 승리한 사진들 임시 저장. 이후 roundPhotos로 넘겨줌
  const [matchIndex, setMatchIndex] =useState(0); //현재 몇 번째 사진부터 대결하는지 나타냄
  const [winner, setWinner] =useState(null); //최종 우승 사진

  const startTournament = useCallback((photos) => { //useCallback으로 매 렌더링마다 바뀌지 않게 설정
    setRoundWinners([]);
    setMatchIndex(0);
    setWinner(null);

    if (photos.length === 1) {
      setRoundPhotos([]);
      setWinner(photos[0]);
      return;
    }

    setRoundPhotos(photos);
  },[]);

  const finishRound = (winners) => {
    if (winners.length === 1) {
      setWinner(winners[0]);
      return;
    }

    setRoundPhotos(winners); // 승리한 사진이 두 장 이상이면
    setRoundWinners([]); //다음 라운드 시작 
    setMatchIndex(0);
  };

  const selectPhoto = (selectedPhoto) => {
    let updatedWinners = [ //React의 상태변경이 즉시 반영되지 않을 수 있으므로 별도의 변수 생성
      ...roundWinners,
      selectedPhoto,
    ];

    const nextMatchIndex = matchIndex + 2;

    const remainingPhoto = roundPhotos[nextMatchIndex];
    const remainingOpponent = roundPhotos[nextMatchIndex + 1];


    if (remainingPhoto && !remainingOpponent) { //자동 승급
      updatedWinners = [
        ...updatedWinners,
        remainingPhoto,
      ];

      finishRound(updatedWinners);
      return;
    }

    if (remainingPhoto && remainingOpponent) {
      setRoundWinners(updatedWinners); // 지금까지 선택된 승자들
      setMatchIndex(nextMatchIndex); //다음 사진 비교
      return;
    }

    finishRound(updatedWinners); 
  };

  const firstPhoto = roundPhotos[matchIndex];
  const secondPhoto = roundPhotos[matchIndex + 1];

  return {
    winner,
    firstPhoto,
    secondPhoto,
    startTournament,
    selectPhoto,
  };
};

export default useTournament;

/*roundWinners
→ 현재 라운드 전체 동안 승자들을 계속 기억하는 상태

updatedRoundWinners
→ 한 번의 사진 선택을 처리할 때 최신 배열을 계산하기 위한 임시 변수
*/