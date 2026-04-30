import { SamkielAuthClient } from '@samkiel/authsdk';

export const authClient = new SamkielAuthClient({
  baseUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.samkiel.tech',
});
