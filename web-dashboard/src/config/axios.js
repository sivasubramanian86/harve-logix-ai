import axios from 'axios'

// Configure axios to softly bypass overriding environment blocks
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

axios.defaults.baseURL = API_BASE_URL

export default axios
