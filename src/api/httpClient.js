import axios from 'axios';

import {LANGUAGE_KEY} from '@/utils/consts.js';

const httpClient = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 5000, // indicates, 1000ms ie. 1 second
  headers: {
    "Content-Type": "application/json",
    "Content-Language": window.localStorage.getItem(LANGUAGE_KEY),
    "Accept-Language": window.localStorage.getItem(LANGUAGE_KEY)
  }
});

httpClient.getBaseURL = () => {
  return process.env.VUE_APP_BASE_URL;
}

// interceptor to catch errors
const errorInterceptor = error => {
  // all the error responses
  switch (error.response.status) {
    case 400:
      console.error(error.response.status, error.message);
      break;

    default:
      console.error(error.response.status, error.message);
  }
  return Promise.reject(error);
}

// Interceptor for responses
const responseInterceptor = response => {
  switch (response.status) {
    case 200:
      // yay!
      break;
    // any other cases
    default:
    // default case
  }

  return response;
}

const requestInterceptor = config => {
  config.headers["Accept-Language"] = window.localStorage.getItem(LANGUAGE_KEY);
  config.headers["Content-Language"] = window.localStorage.getItem(LANGUAGE_KEY);

  return config;
}

httpClient.interceptors.response.use(responseInterceptor, errorInterceptor);
httpClient.interceptors.request.use(requestInterceptor);

export default httpClient;