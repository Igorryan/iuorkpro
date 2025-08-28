import { TextInputProps } from 'react-native';

import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';

import { GOOGLE_MAPS_API_KEY } from '@env';

import * as S from './styles';
import { useTheme } from 'styled-components/native';
import { useRef } from 'react';
import type { IAddress } from '../../types/address';

type formatAddressProps = {
  administrative_area_level_1: string;
  administrative_area_level_2: string;
  country: string;
  postal_code: string;
  route: string;
  street_number: string;
  sublocality_level_1: string;
};

interface Props extends TextInputProps {
  changeAddress(address: IAddress): void;
  clearTextOnFocus?: boolean;
}

export const InputFindAddress: React.FC<Props> = ({ changeAddress, clearTextOnFocus }) => {
  const { COLORS } = useTheme();
  const inputRef = useRef<GooglePlacesAutocompleteRef>(null);

  function handleSelectAddress(data: GooglePlaceData, details: GooglePlaceDetail | null) {
    if (!details) return;

    const formattedAddress = details.address_components.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.types[0]]: curr.long_name,
      }),
      {},
    ) as formatAddressProps;

    const address = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      street: formattedAddress.route,
      number: Number(formattedAddress.street_number),
      district: formattedAddress.sublocality_level_1,
      city: formattedAddress.administrative_area_level_2,
      state: formattedAddress.administrative_area_level_1,
      postalcode: formattedAddress.postal_code,
      distanceInMeters: null,
    } as IAddress;

    changeAddress(address);
  }

  return (
    <S.Container>
      <S.Icon name="search-outline" />
      <GooglePlacesAutocomplete
        fetchDetails
        ref={inputRef}
        styles={{
          poweredContainer: { display: 'none' },
        }}
        textInputProps={{
          autoFocus: true,
          placeholderTextColor: `${COLORS.GREY_60}`,
          style: {
            marginLeft: 32,
            flex: 1,
            height: 58,
            marginTop: -2,
          },
        }}
        debounce={500}
        minLength={5}
        placeholder={'Buscar endereço'}
        onPress={handleSelectAddress}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'pt-BR',
        }}
      />
    </S.Container>
  );
};


