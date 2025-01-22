import httpClient from './httpClient';

const END_POINT = 'projects/'

const list_tables = (projectId) => {
    let url = `${END_POINT}${projectId}/tables/`;
    return httpClient.get(url);
};

export default {
    list_tables
};