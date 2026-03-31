import axios from 'axios';
import { getDeviceId } from '../utils/deviceId';

const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' : '/api';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  config.headers['x-device-id'] = getDeviceId();
  return config;
});

export default api;