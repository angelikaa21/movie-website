import mongo from './mongo';

export const loginUser = async (credentials) => {
    try {
        const response = await mongo.post('/user/auth', credentials);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Logowanie nie powiodło się.';
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await mongo.post('/user/create', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Rejestracja nie powiodła się.';
    }
};
