import httpClient from "../httpClient";

const BASE_END_POINT = '/user';
const END_POINT = `${BASE_END_POINT}/recover-password`;

//preguntar si está bien conectado con el backend porque para cada persona es diferente el url :C
const recoverPasswordRequest = (username)  => httpClient.post(`${END_POINT}-request/`, username);
const recoverPassword = (registerData) => httpClient.post(`${END_POINT}/`, registerData);

export default {
    recoverPasswordRequest,
    recoverPassword
};