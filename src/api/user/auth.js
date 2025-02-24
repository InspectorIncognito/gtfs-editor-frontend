import httpClient from "../httpClient";

const BASE_END_POINT = '/user';
const END_POINT_LOGIN = `${BASE_END_POINT}/login/`;
const END_POINT_LOGOUT = `${BASE_END_POINT}/logout/`;


function login(username, password) {
    return httpClient.post(END_POINT_LOGIN, {username, password});
}

function logout() {
    return httpClient.post(`${END_POINT_LOGOUT}`);
}

export default {
    login,
    logout
};