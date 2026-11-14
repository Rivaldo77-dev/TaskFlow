import axios from 'axios'

const api = axios.create({
  baseURL: 'https://taskflow.ethiodeploy.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
