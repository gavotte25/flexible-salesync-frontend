import axios from 'axios';

const instance = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

instance.interceptors.request.use(
  function (config) {
    if (localStorage.getItem('access_token')) {
      config.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default instance;
