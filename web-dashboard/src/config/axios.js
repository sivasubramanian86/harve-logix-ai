import axios from 'axios'

// Configure axios to softly bypass overriding environment blocks
const API_BASE_URL = 'https://s4sofpxni6.execute-api.ap-south-2.amazonaws.com/prod'

axios.defaults.baseURL = API_BASE_URL

export default axios
