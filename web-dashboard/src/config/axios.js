import axios from 'axios'

// Configure axios to use the backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://s4sofpxni6.execute-api.ap-south-2.amazonaws.com/prod'

axios.defaults.baseURL = API_BASE_URL

export default axios
