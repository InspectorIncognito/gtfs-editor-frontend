import axios from 'axios';

import store from "@/store";

const httpClient = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 5000, // indicates, 1000ms ie. 1 second
  headers: {
    "Content-Type": "application/json"
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

export const getActiveHeaders = () => {
  let headers = {}
  headers["Accept-Language"] = store.getters['lang/getCurrentLanguage'];
  headers["Content-Language"] = store.getters['lang/getCurrentLanguage'];
  if (store.getters['auth/isAuthenticated']) {
    headers["User-Id"] = store.getters['auth/getUserId']
    headers["User-Token"] = store.getters['auth/getToken']
  }
  return headers;
}

const requestInterceptor = config => {
  const headers = getActiveHeaders();
  Object.assign(config.headers, headers);

  return config;
}

httpClient.interceptors.response.use(responseInterceptor, errorInterceptor);
httpClient.interceptors.request.use(requestInterceptor);

export default httpClient;