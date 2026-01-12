
import { FullDatabaseExport } from '../types';

const CLIENT_ID = '2dt5yex2gl41kp5';
const STORAGE_KEY_TOKEN = 'it_dropbox_token';

export const dropboxService = {
  getAuthUrl: () => {
    // Cruciale: Il redirect_uri deve corrispondere esattamente a quello nella console Dropbox.
    // Usiamo l'origine pulita (es. https://tuo-sito.com/)
    const redirectUri = window.location.origin + window.location.pathname;
    // Rimuoviamo eventuali slash finali o hash per consistenza
    const cleanRedirectUri = redirectUri.replace(/\/$/, "").split('#')[0];
    
    return `https://www.dropbox.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(cleanRedirectUri)}`;
  },

  saveToken: (token: string) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  },

  getToken: () => {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  },

  disconnect: () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  },

  uploadBackup: async (data: FullDatabaseExport): Promise<boolean> => {
    const token = dropboxService.getToken();
    if (!token) return false;

    try {
      const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Dropbox-API-Arg': JSON.stringify({
            path: `/backup_immuno_track_live.json`,
            mode: 'overwrite',
            autorename: false,
            mute: true,
            strict_conflict: false
          }),
          'Content-Type': 'application/octet-stream'
        },
        body: JSON.stringify(data)
      });

      return response.ok;
    } catch (error) {
      console.error('Dropbox Sync Error:', error);
      return false;
    }
  },

  downloadBackup: async (): Promise<FullDatabaseExport | null> => {
    const token = dropboxService.getToken();
    if (!token) return null;

    try {
      const response = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Dropbox-API-Arg': JSON.stringify({
            path: `/backup_immuno_track_live.json`
          })
        }
      });

      if (!response.ok) return null;
      const text = await response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error('Dropbox Download Error:', error);
      return null;
    }
  }
};
