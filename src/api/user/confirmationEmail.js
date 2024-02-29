import httpClient from "../httpClient";

const BASE_END_POINT = '/user';
const END_POINT = `${BASE_END_POINT}/email-verification/`;

const confirmationEmail = (verificationToken) => httpClient.get(`${END_POINT}`,
    {params: {'verificationToken': verificationToken}})

export default {
    confirmationEmail
}