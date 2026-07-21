import instance from './instance';

export const get = (...args) => { 
  return instance.get(...args);
}; //...arg는 전달받은 인자들을 그대로 Axios 함수에 넘긴다는 뜻

export const post = (...args) => {
  return instance.post(...args);
};

export const put = (...args) => {
  return instance.put(...args);
}; //데이터 전체적으로 수정

export const patch = (...args) => {
  return instance.patch(...args);
}; //데이터 일부만 수정

export const del = (...args) => {
  return instance.delete(...args);
};

//GET, POST 같은 요청을 공통 함수로 제공