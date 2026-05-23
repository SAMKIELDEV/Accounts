import '@samkiel/authsdk';

declare module '@samkiel/authsdk' {
  export interface SamkielUser {
    phone?: string;
    phoneVerified?: boolean;
    birthday?: string;
    locale?: string;
    passwordChangedAt?: string;
  }
}
