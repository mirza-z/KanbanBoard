export interface GoogleLoginResponse {
  token: string;
  ownerId: string;
  email: string;
  name: string;
}

export interface AuthUser {
  ownerId: string;
  email: string;
  name: string;
}