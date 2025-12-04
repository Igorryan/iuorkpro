import axios from 'axios';
import { GooglePlaceDetail } from 'react-native-google-places-autocomplete';

import { GOOGLE_MAPS_API_KEY } from '@env';

type ILatLngProps = {
  lat: number;
  lng: number;
};

export async function findPlaceFromText(text: string) {
  try {
    const response = await axios.get<GooglePlaceDetail[]>(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${text}&inputtype=textquery&fields=geometry%2Cplace_id&key=${GOOGLE_MAPS_API_KEY}`,
    );

    const result = response.data[0];

    return result;
  } catch (error) {
    // Erro silencioso
  }
}

export async function findPlaceFromPlaceId(placeId: string) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return response.data.result as GooglePlaceDetail;
  } catch (error) {
    // Erro silencioso
  }
}

export async function findPlaceFromLatLng({ lat, lng }: ILatLngProps) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return response.data.results[0] as GooglePlaceDetail;
  } catch (error) {
    // Erro silencioso
  }
}


