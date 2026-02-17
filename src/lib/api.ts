

const API_URL = 'http://localhost:5000/api'

interface FetchOptions extends RequestInit {
    token?: string
}

export const api = async (endpoint: string, options: FetchOptions = {}) => {
    const token = localStorage.getItem('token')

    const headers = new Headers(options.headers)

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    const config = {
        ...options,
        headers,
    }

    const response = await fetch(`${API_URL}${endpoint}`, config)

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token')
            // Optional: Redirect to login or dispatch an event
            // window.location.href = '/login' // This might be too aggressive for a SPA
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Something went wrong')
    }

    return response.json()
}
