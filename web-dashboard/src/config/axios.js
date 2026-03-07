import axios from 'axios'

// Configure axios to use the backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

axios.defaults.baseURL = API_BASE_URL

export default axios
