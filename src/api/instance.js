import axios from 'axios';

const instance = axios.create({
  baseURL: '/api', //백엔드 서버 기본 주소
  withCredentials: true, //로그인 후 받은 세션 쿠키를 다른 API 요청에도 같이 보내기 위한 설정(JSESSIONID)
  timeout: 60000, //ms
});

export default instance;

//Axios의 공통 설정