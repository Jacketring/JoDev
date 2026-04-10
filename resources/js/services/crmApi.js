import http from '../bootstrap';

function pruneParams(params) {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
    );
}

export async function fetchCollection(endpoint, params) {
    const response = await http.get(endpoint, {
        params: pruneParams(params),
    });

    return response.data;
}

export async function fetchRecord(endpoint, id) {
    const response = await http.get(`${endpoint}/${id}`);
    return response.data.data;
}

export async function createRecord(endpoint, payload) {
    const response = await http.post(endpoint, payload);
    return response.data.data;
}

export async function updateRecord(endpoint, id, payload) {
    const response = await http.put(`${endpoint}/${id}`, payload);
    return response.data.data;
}

export async function archiveRecord(endpoint, id) {
    await http.delete(`${endpoint}/${id}`);
}

export async function fetchCurrentUser() {
    try {
        const response = await http.get('/api/auth/user');
        return response.data.data;
    } catch (error) {
        if (error.response?.status === 401) {
            return null;
        }

        throw error;
    }
}

export async function login(payload) {
    const response = await http.post('/api/auth/login', payload);
    return response.data.data;
}

export async function logout() {
    await http.post('/api/auth/logout');
}

export async function fetchDashboard() {
    const response = await http.get('/api/dashboard');
    return response.data;
}

export async function fetchOptions() {
    const response = await http.get('/api/opciones');
    return response.data;
}

export async function fetchVisualSettings() {
    const response = await http.get('/api/ajustes-visuales');
    return response.data.data;
}

export async function updateVisualSettings(payload) {
    const response = await http.put('/api/ajustes-visuales', payload);
    return response.data.data;
}
