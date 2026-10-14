export interface CustomerJwtPayload {
  sub: string;
  userType: 'customer';
  email: string;
}

export interface VendorJwtPayload {
  sub: string;
  userType: 'vendor';
  username: string;
}

export type JwtPayload = CustomerJwtPayload | VendorJwtPayload;

export interface AuthenticatedCustomer {
  id: string;
  userType: 'customer';
  email: string;
  name: string;
  lastname: string;
}

export interface AuthenticatedVendor {
  id: string;
  userType: 'vendor';
  username: string;
  name: string;
  surname: string;
  lastname?: string;
  second_lastname?: string;
}

export type AuthenticatedUser = AuthenticatedCustomer | AuthenticatedVendor;
