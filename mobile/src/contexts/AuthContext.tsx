import { createContext, useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { api } from '../services/api';

WebBrowser.maybeCompleteAuthSession();

interface UserProps {
  name: string,
  avatarUrl?: string
}

export interface AuthContextDataProps {
  user: UserProps,
  signIn: () => Promise<void>,
  isUserLoading: boolean
}

export const AuthContext = createContext({} as AuthContextDataProps)

export function AuthContextProvider({ children }) {
  const [isUserLoading, setIsUserLoading] = useState<boolean>(false);
  const [user, setUser] = useState<UserProps | undefined>(undefined);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ['profile', 'email']
  })

  async function signIn() {
    try {
      setIsUserLoading(true);
      await promptAsync();
    } catch (_err) {
      console.error(_err)
      throw _err;
    } finally {
      setIsUserLoading(false)
    }
  }

  async function signInWithGoogle(access_token: string) {
    try {
      setIsUserLoading(true);

      const { data: { token } } = await api.post("/users", { access_token })
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const { data: { user: userLogged } } = await api.get("/me");
      setUser(userLogged)
    } catch (_err) {
      console.error(_err);
      throw _err
    } finally {
      setIsUserLoading(false);
    }
  }

  useEffect(() => {
    if (response?.type === 'success' && response.authentication.accessToken) {
      signInWithGoogle(response.authentication.accessToken)
    }
  }, [response])

  return <AuthContext.Provider value={{
    signIn,
    user,
    isUserLoading
  }}>
    {children}
  </AuthContext.Provider>
}