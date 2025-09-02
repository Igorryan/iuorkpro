export default {
  COLORS: {
    PRIMARY: '#1F2225',

    SECONDARY: '#0670FF',

    GREY: '#2D2B29',
    GREY_80: '#424242',
    GREY_60: '#626263',
    GREY_40: '#ABAAA9',
    GREY_20: '#D5D5D4',
    GREY_10: '#F7F7F6',

    BLACK: '#000000',
    WHITE: '#FEFEFE',

    WARNING: '#FF7D7D',
    ATTENTION: '#FFAA1B',
    SUCCESS: '#70CF4F',

    SHADOW: 'rgba(0, 0, 0, 0.67)',
    BACKGROUND: '#F4F4F4',
  },
  FONT_FAMILY: {
    REGULAR: 'Roboto_400Regular',
    BOLD: 'Roboto_700Bold',
    MEDIUM: 'Roboto_500Medium',
  },
  FONT_SIZE: {
    SSSM: 10,
    SSM: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 24,
    XXL: 32,
  },
  SHADOW: {
    FOCUSONBACKGROUND: '0px 4px 19px rgba(0, 0, 0, 0.07)',
  },
  MAPSTYLE: [
    {
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#444444',
        },
      ],
    },
    {
      featureType: 'landscape',
      elementType: 'all',
      stylers: [
        {
          color: '#f2f2f2',
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'all',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'all',
      stylers: [
        {
          saturation: -100,
        },
        {
          lightness: 45,
        },
      ],
    },
    {
      featureType: 'road.highway',
      elementType: 'all',
      stylers: [
        {
          visibility: 'simplified',
        },
      ],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.icon',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'transit',
      elementType: 'all',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'all',
      stylers: [
        {
          color: '#46bcec',
        },
        {
          visibility: 'on',
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [
        {
          color: '#00b7bd',
        },
      ],
    },
  ],
};

// [
//   {
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#f5f5f5',
//       },
//     ],
//   },
//   {
//     elementType: 'labels.icon',
//     stylers: [
//       {
//         visibility: 'off',
//       },
//     ],
//   },
//   {
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#616161',
//       },
//     ],
//   },
//   {
//     elementType: 'labels.text.stroke',
//     stylers: [
//       {
//         color: '#f5f5f5',
//       },
//     ],
//   },
//   {
//     featureType: 'administrative.land_parcel',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#bdbdbd',
//       },
//     ],
//   },
//   {
//     featureType: 'poi',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#eeeeee',
//       },
//     ],
//   },
//   {
//     featureType: 'poi',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#757575',
//       },
//     ],
//   },
//   {
//     featureType: 'poi.park',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#e5e5e5',
//       },
//     ],
//   },
//   {
//     featureType: 'poi.park',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#9e9e9e',
//       },
//     ],
//   },
//   {
//     featureType: 'road',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#ffffff',
//       },
//     ],
//   },
//   {
//     featureType: 'road.arterial',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#757575',
//       },
//     ],
//   },
//   {
//     featureType: 'road.highway',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#dadada',
//       },
//     ],
//   },
//   {
//     featureType: 'road.highway',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#616161',
//       },
//     ],
//   },
//   {
//     featureType: 'road.local',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#9e9e9e',
//       },
//     ],
//   },
//   {
//     featureType: 'transit.line',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#e5e5e5',
//       },
//     ],
//   },
//   {
//     featureType: 'transit.station',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#eeeeee',
//       },
//     ],
//   },
//   {
//     featureType: 'water',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#c9c9c9',
//       },
//     ],
//   },
//   {
//     featureType: 'water',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#9e9e9e',
//       },
//     ],
//   },
// ],
