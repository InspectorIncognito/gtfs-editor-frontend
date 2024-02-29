import httpClient from "../httpClient";

const BASE_END_POINT = '/user';
const END_POINT_LOGIN = `${BASE_END_POINT}/login/`;
const END_POINT_LOGOUT = `${BASE_END_POINT}/logout/`;

const login = (username, password) => httpClient.post(`${END_POINT_LOGIN}`, { username, password });
const logout = () => httpClient.post(`${END_POINT_LOGOUT}`);

export default {
  login,
  logout
};