export const USER_SERVICE_URL = "http://localhost:8081";
export const FLASHCARD_SERVICE_URL = "http://localhost:8082";

export async function fetchWithAuth(url, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`; 
    }

    const response = await fetch(url, { ...options, headers });
    return response;
}
