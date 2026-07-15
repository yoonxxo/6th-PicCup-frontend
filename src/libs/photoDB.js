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
    }
  },
});

export const savePhoto = async (photo) => {
  const db = await dbPromise;
  await db.put(PHOTO_STORE, photo);

  return photo.id;
};
