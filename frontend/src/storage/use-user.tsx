import { Socket } from 'socket.io-client';
import {create} from 'zustand';

interface UseUser {
  //ANY USER DATA U WANT IF U WANT TO DO AUTH THIS WAY OR ANOTHER..
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  type: 'owner' | 'customer' | 'employee' | null;
  socket: Socket | null;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setExpiresAtToken: (expiresAt: number) => void;
  setType: (type: 'owner' | 'customer' | 'employee') => void;
  setSocket: (socket: Socket | null) => void;
  signOut: () => void;
}

export const useUser = create<UseUser>(set => {
  return {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    type: null,
    socket: null,
    signOut() {
      set(() => {
        return {
          accessToken: null,
          expiresAt: null,
          type: null,
          refreshToken: null,
          socket: null,
        };
      });
    },
    setType(type) {
      set(() => {
        return {type};
      });
    },
    setAccessToken(token) {
      set(() => {
        return {accessToken: token};
      });
    },
    setExpiresAtToken(expiresAt) {
      set(() => {
        return {expiresAt};
      });
    },
    setRefreshToken(token) {
      set(() => {
        return {refreshToken: token};
      });
    },
    setSocket(socket) {
      set(()=>{
        return {socket}
      })
    },
  };
});
