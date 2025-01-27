import httpClient from './httpClient';

const BaseAPI = class {
    constructor(table) {
        this.client = httpClient;
        this.endpoint = '/projects';
        this.table = table;
    }

    getFullBaseURL(projectId) {
        return `${this.endpoint}/${projectId}/${this.table}/`
    }

    getDetailURL(projectId, id) {
        return `${this.getFullBaseURL(projectId)}${id}/`
    }

    getFullDetailURL(projectId, id) {
        return this.getDetailURL(projectId, id);
    }

    getAll(projectId) {
        return this.client.get(this.getFullBaseURL(projectId), {
            params: {
                no_page: "True"
            },
            timeout: 0,
        });
    }

    detail(projectId, id) {
        return this.client.get(this.getDetailURL(projectId, id));
    }

    update(projectId, data) {
        return this.client.patch(this.getDetailURL(projectId, data.id), data);
    }

    put(projectId, data) {
        return this.client.put(this.getDetailURL(projectId, data.id), data);
    }

    create(projectId, data) {
        return this.client.post(this.getFullBaseURL(projectId), data);
    }

    remove(projectId, data) {
        return this.client.delete(this.getDetailURL(projectId, data.id));
    }

    downloadCSV(projectId) {
        const url = this.getFullDetailURL(projectId, 'download');
        return this.client.get(url);
    }

    uploadCSV(projectId, file) {
        return this.client.put(this.getDetailURL(projectId, 'upload'), file, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${this.table}.txt";`,
            }
        })
    }

    getIDs(projectId) {
        return this.client.get(this.getDetailURL(projectId, 'ids'))
    }
}

export default {
    BaseAPI,
}