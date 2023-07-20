import Enviroment from '@/lib/config/Enviroment';
import axios from 'axios';
const AxiosInstance = axios.create({
  baseURL: 'https://www.jtballetstar.com/api/',
  timeout: 4000,
});

export default AxiosInstance;
