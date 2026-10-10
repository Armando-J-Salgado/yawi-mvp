export interface JwtPayload {
  sub: string;
  userType: 'customer';
  email: string;
}

export interface AuthenticatedUser {
  id: string;
  userType: 'customer';
  email: string;
  name: string;
  lastname: string;
}
