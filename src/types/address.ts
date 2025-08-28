export interface IAddress {
  latitude: number;
  longitude: number;
  street: string;
  number: number;
  district: string;
  city: string;
  state: string;
  postalcode: string;
  distanceInMeters: number | null;
}


