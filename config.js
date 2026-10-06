import { Platform } from 'react-native';

// สำหรับ Emulator
// Android Emulator = 10.0.2.2
// iOS Simulator = localhost
// มือถือจริง = IP คอม

//const LOCAL_IP = '192.168.11.149'; // <-- แก้ IP ตรงนี้ที่เดียว
/* export const LOCAL_IP = 'https://reminder-app-backend-3wbx.onrender.com/api';

export const API_URL = Platform.select({
  android: `http://${LOCAL_IP}:5000/api`, // มือถือจริง / Emulator แก้เป็น 10.0.2.2 ถ้าใช้ Emulator
  ios: `http://${LOCAL_IP}:5000/api`,
  default: `http://${LOCAL_IP}:5000/api`,
});
 */
export const API_URL = 'https://reminder-app-backend-3wbx.onrender.com/api';
console.log('API_URL:', API_URL);