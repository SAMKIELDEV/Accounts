import { createClient } from '@samkiel/authsdk';

/**
 * Base URL of the SAMKIEL ID API. Always use this (not the bare env var) for
 * raw fetches/redirects: `NEXT_PUBLIC_*` vars are inlined at build time, so an
 * unset value would produce `undefined/auth/...` URLs that silently fail.
 */
export const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.samkiel.tech';

export const authClient = createClient(AUTH_URL);
