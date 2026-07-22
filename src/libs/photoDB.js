import { openDB } from 'idb';

const DB_NAME = 'piccup-db'; // IndexedDB 데이터베이스 이름
const DB_VERSION = 1; 
const PHOTO_STORE = 'photos'; // 사진 데이터를 저장할 object store 이름

const dbPromise = openDB(DB_NAME, DB_VERSION, { //openDB()는 Promise를 반환
  upgrade(db) { //데이터베이스가 새로 생성되거나 버전이 변경될 때 호출되는 콜백 함수
    if (!db.objectStoreNames.contains(PHOTO_STORE)) {
      const photoStore = db.createObjectStore(PHOTO_STORE, {
        keyPath: 'id', // 각 photo 객체의 고유 식별자로 사용될 속성
      });

      photoStore.createIndex('sessionId', 'sessionId');
      photoStore.createIndex('status', 'status'); // 사진 상태
      photoStore.createIndex('createdAt', 'createdAt'); // 촬영 시간
      /*createIndex는 검색할 속성을 정하는 것*/ 
    }
  },
});

export const savePhoto = async (photo) => {
  const db = await dbPromise;
  await db.put(PHOTO_STORE, photo);

  return photo.id;
};

export const getPhotosBySessionId = async (sessionId) => {
  const db = await openDB(DB_NAME, DB_VERSION);
  return db.getAllFromIndex(
    PHOTO_STORE,
    'sessionId', 
    sessionId, //매개변수로 받은 sessionId와 같은 사진을 PHOTO_STORE 저장소에서 찾음
  ); //sessionId만 반환하는게 아니라 사진 객체 자체를 반환
}

const TRASH_RETENTION_DAYS = 7;


export const losersToTrash = async ( //탈락 사진 trash로 상태 변경 함수
  sessionId,
  winnerId, //winnerId와 다른 걸 보고 loser판단
) => {
  const db = await dbPromise; //IndexedDB 받아옴

  const transaction = db.transaction(
    PHOTO_STORE,
    'readwrite', //읽기와 수정 가능
  );

  const sessionPhotos =
    await transaction.store //photos 저장소
      .index('sessionId') //sessionId 인덱스 사용하겠다.
      .getAll(sessionId); //해당 sessionId와 같은 사진 객체를 모두 가져오기

  const trashedAt = new Date(); //휴지통 이동 시각

  const expiresAt = new Date(
    trashedAt.getTime() + //trashedAt 시간을 밀리초 숫자로 바꾼 후
      TRASH_RETENTION_DAYS * //7일 x 24시간, 60분, 60초, 1초 =>밀리초로 바꾸는 계산
        24 *
        60 *
        60 *
        1000,
  );
  /*const expiresAt = new Date(
  trashedAt.getTime() + 60 * 1000,  
  ); 테스트 용 1분*/ 

  const loserPhotos = sessionPhotos.filter(
    (photo) =>
      photo.id !== winnerId &&
      photo.status !== 'trash', //이미 휴지통 처리된 사진 중복 방지
  );

  const updateTrashRequests = loserPhotos.map(
    (photo) =>
      transaction.store.put({ //put은 기존 데이터 수정
        ...photo,
        status: 'trash',
        trashedAt: trashedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      }),
  );

  await Promise.all(updateTrashRequests); //상태 수정 요청을 전부 기다린다.
  await transaction.done; //transaction 완료될때까지 기다림

  return loserPhotos.length;
};

export const deleteExpiredTrashPhotos = async () => {
  const db = await dbPromise;

  const transaction = db.transaction(
    PHOTO_STORE,
    'readwrite',
  );

  const trashPhotos = await transaction.store
    .index('status')
    .getAll('trash');

  const now = Date.now(); //현재 시각(밀리초 숫자로 반환) 만들기

  const expiredPhotos = trashPhotos.filter(
    (photo) =>
      photo.expiresAt && //expiresAt이 존재하고
      new Date(photo.expiresAt).getTime() <= now, //expiresAt 시간이 현재보다 이전이거나 같으면
  );

  const expiredDeleteRequests = expiredPhotos.map(
    (photo) =>
      transaction.store.delete(photo.id),
  );

  await Promise.all(expiredDeleteRequests); //만료 사진 삭제 요청이 모두 끝날때까지 기다리기
  await transaction.done; 

  return expiredPhotos.length;
};