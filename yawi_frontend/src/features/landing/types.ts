export interface Product {
  id: string;
  name: string;
  country: string;
  artisan: string;
  price: number;
  currency: string;
  imageSrc: string;
}

export interface LatamCountry {
  id: string;
  nameKey: string;
  src: string;
  active: boolean;
}
