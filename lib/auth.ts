import { createClient } from '@samkiel/authsdk';

export const authClient = createClient(
  process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.samkiel.tech'
);
