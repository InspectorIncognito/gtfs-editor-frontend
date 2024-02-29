import httpClient from "../httpClient";

const BASE_END_POINT = '/user';
const END_POINT = `${BASE_END_POINT}/register/`;

const register = (registerData) => httpClient.post(`${END_POINT}`, registerData);

export default {
  register
};