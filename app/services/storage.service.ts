import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const ROLE_KEY = "auth_role";

export const saveAuth = async (token: string, user: object, role: "company" | "employee") => {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
    [ROLE_KEY, role],
  ]);
};

export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const getRole = () => AsyncStorage.getItem(ROLE_KEY);
export const getUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearAuth = () =>
  AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, ROLE_KEY]);
