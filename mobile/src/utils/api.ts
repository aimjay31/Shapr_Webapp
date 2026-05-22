import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8000/api'
  : 'http://192.168.18.9:8000/api';

export const getToken = async () => {
  return await AsyncStorage.getItem("auth_token");
};

export const setToken = async (token: string) => {
  await AsyncStorage.setItem("auth_token", token);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem("auth_token");
};

export const apiFetch = async (url: string, options: any = {}) => {
  const token = await getToken();

  return fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...options.headers,
    },
  });
};