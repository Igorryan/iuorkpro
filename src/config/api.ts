import axios from 'axios';
import { Platform } from 'react-native';

const envUrl = process.env.EXPO_PUBLIC_API_URL;

const defaultLocalUrl = Platform.select({
  ios: 'http://127.0.0.1:3333',
  android: 'http://10.0.2.2:3333',
  default: 'http://127.0.0.1:3333',
});

export const api = axios.create({ baseURL: envUrl || defaultLocalUrl });


