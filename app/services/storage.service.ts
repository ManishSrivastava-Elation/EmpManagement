import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'userSession';

export interface UserSession {
  token: string;
  role: 'company' | 'employee';
  profile: {
    name: string;
    email: string;
  };
}

export const saveSession = async (session: UserSession): Promise<void> => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSession = async (): Promise<UserSession | null> => {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as UserSession) : null;
};

export const clearSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

// ── Legacy aliases kept for any existing callers ─────────────────────────────
export const saveAuth = async (
  token: string,
  user: Record<string, any>,
  role: 'company' | 'employee',
): Promise<void> => {
  const name: string =
    user?.company_name ?? user?.FullName ?? user?.full_name ?? user?.name ?? '';
  const email: string = user?.email ?? user?.Email ?? '';
  await saveSession({ token, role, profile: { name, email } });
};

export const getToken = async (): Promise<string | null> => {
  const session = await getSession();
  return session?.token ?? null;
};

export const getRole = async (): Promise<string | null> => {
  const session = await getSession();
  return session?.role ?? null;
};

export const getUser = async (): Promise<UserSession['profile'] | null> => {
  const session = await getSession();
  return session?.profile ?? null;
};

export const clearAuth = clearSession;
