// Type augmentation: surface the avatar field that SAMKIELID returns on the
// SamkielUser shape across all imports of @samkiel/authsdk in this app.

import type {} from '@samkiel/authsdk';

declare module '@samkiel/authsdk' {
  interface SamkielUser {
    avatar?: string;
  }
}
