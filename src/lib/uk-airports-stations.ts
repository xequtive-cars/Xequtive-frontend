/**
 * UK Airports and Stations Database
 * Comprehensive hardcoded data for reliable location search
 */

export interface UKLocation {
  id: string;
  name: string;
  fullName: string;
  type: 'airport' | 'station';
  latitude: number;
  longitude: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  city: string;
  region: string;
  postcode?: string;
  terminals?: UKTerminal[];
  metadata: {
    primaryType: 'airport' | 'station';
    category: 'airport' | 'train_station';
    region: 'UK';
  };
}

export interface UKTerminal {
  id: string;
  name: string;
  fullName: string;
  type: 'terminal' | 'platform';
  latitude: number;
  longitude: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
  parentLocationId: string;
}

// UK Airports Database
export const UK_AIRPORTS: UKLocation[] = [
  {
    id: 'heathrow-airport',
    name: 'Heathrow Airport',
    fullName: 'London Heathrow Airport',
    type: 'airport',
    latitude: 51.4700,
    longitude: -0.4543,
    coordinates: { lat: 51.4700, lng: -0.4543 },
    address: 'Heathrow Airport, Hounslow TW6, UK',
    city: 'London',
    region: 'Greater London',
    postcode: 'TW6',
    terminals: [
      {
        id: 'heathrow-terminal-2',
        name: 'Terminal 2',
        fullName: 'Heathrow Terminal 2',
        type: 'terminal',
        latitude: 51.470022,
        longitude: -0.454295,
        coordinates: { lat: 51.470022, lng: -0.454295 },
        description: 'Main terminal for Star Alliance airlines',
        parentLocationId: 'heathrow-airport'
      },
      {
        id: 'heathrow-terminal-3',
        name: 'Terminal 3',
        fullName: 'Heathrow Terminal 3',
        type: 'terminal',
        latitude: 51.471944,
        longitude: -0.461389,
        coordinates: { lat: 51.471944, lng: -0.461389 },
        description: 'OneWorld alliance terminal',
        parentLocationId: 'heathrow-airport'
      },
      {
        id: 'heathrow-terminal-4',
        name: 'Terminal 4',
        fullName: 'Heathrow Terminal 4',
        type: 'terminal',
        latitude: 51.459722,
        longitude: -0.447500,
        coordinates: { lat: 51.459722, lng: -0.447500 },
        description: 'SkyTeam alliance terminal',
        parentLocationId: 'heathrow-airport'
      },
      {
        id: 'heathrow-terminal-5',
        name: 'Terminal 5',
        fullName: 'Heathrow Terminal 5',
        type: 'terminal',
        latitude: 51.471389,
        longitude: -0.487500,
        coordinates: { lat: 51.471389, lng: -0.487500 },
        description: 'British Airways main terminal',
        parentLocationId: 'heathrow-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'gatwick-airport',
    name: 'Gatwick Airport',
    fullName: 'London Gatwick Airport',
    type: 'airport',
    latitude: 51.1537,
    longitude: -0.1821,
    coordinates: { lat: 51.1537, lng: -0.1821 },
    address: 'Gatwick Airport, Crawley RH6, UK',
    city: 'London',
    region: 'West Sussex',
    postcode: 'RH6',
    terminals: [
      {
        id: 'gatwick-north-terminal',
        name: 'North Terminal',
        fullName: 'Gatwick North Terminal',
        type: 'terminal',
        latitude: 51.158056,
        longitude: -0.161111,
        coordinates: { lat: 51.158056, lng: -0.161111 },
        description: 'Main terminal for international flights',
        parentLocationId: 'gatwick-airport'
      },
      {
        id: 'gatwick-south-terminal',
        name: 'South Terminal',
        fullName: 'Gatwick South Terminal',
        type: 'terminal',
        latitude: 51.153611,
        longitude: -0.161389,
        coordinates: { lat: 51.153611, lng: -0.161389 },
        description: 'Terminal for domestic and European flights',
        parentLocationId: 'gatwick-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'stansted-airport',
    name: 'Stansted Airport',
    fullName: 'London Stansted Airport',
    type: 'airport',
    latitude: 51.8860,
    longitude: 0.2389,
    coordinates: { lat: 51.8860, lng: 0.2389 },
    address: 'Stansted Airport, Stansted CM24, UK',
    city: 'London',
    region: 'Essex',
    postcode: 'CM24',
    terminals: [
      {
        id: 'stansted-main-terminal',
        name: 'Main Terminal',
        fullName: 'Stansted Main Terminal',
        type: 'terminal',
        latitude: 51.886944,
        longitude: 0.235278,
        coordinates: { lat: 51.886944, lng: 0.235278 },
        description: 'Single terminal for all flights',
        parentLocationId: 'stansted-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'luton-airport',
    name: 'Luton Airport',
    fullName: 'London Luton Airport',
    type: 'airport',
    latitude: 51.8747,
    longitude: -0.3683,
    coordinates: { lat: 51.8747, lng: -0.3683 },
    address: 'Luton Airport, Luton LU2, UK',
    city: 'London',
    region: 'Bedfordshire',
    postcode: 'LU2',
    terminals: [
      {
        id: 'luton-main-terminal',
        name: 'Main Terminal',
        fullName: 'Luton Main Terminal',
        type: 'terminal',
        latitude: 51.874722,
        longitude: -0.368333,
        coordinates: { lat: 51.874722, lng: -0.368333 },
        description: 'Single terminal for all flights',
        parentLocationId: 'luton-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'manchester-airport',
    name: 'Manchester Airport',
    fullName: 'Manchester Airport',
    type: 'airport',
    latitude: 53.3537,
    longitude: -2.2750,
    coordinates: { lat: 53.3537, lng: -2.2750 },
    address: 'Manchester Airport, Manchester M90, UK',
    city: 'Manchester',
    region: 'Greater Manchester',
    postcode: 'M90',
    terminals: [
      {
        id: 'manchester-terminal-1',
        name: 'Terminal 1',
        fullName: 'Manchester Terminal 1',
        type: 'terminal',
        latitude: 53.353611,
        longitude: -2.275000,
        coordinates: { lat: 53.353611, lng: -2.275000 },
        description: 'Main terminal for international flights',
        parentLocationId: 'manchester-airport'
      },
      {
        id: 'manchester-terminal-2',
        name: 'Terminal 2',
        fullName: 'Manchester Terminal 2',
        type: 'terminal',
        latitude: 53.358056,
        longitude: -2.274722,
        coordinates: { lat: 53.358056, lng: -2.274722 },
        description: 'Terminal for domestic and European flights',
        parentLocationId: 'manchester-airport'
      },
      {
        id: 'manchester-terminal-3',
        name: 'Terminal 3',
        fullName: 'Manchester Terminal 3',
        type: 'terminal',
        latitude: 53.356389,
        longitude: -2.281944,
        coordinates: { lat: 53.356389, lng: -2.281944 },
        description: 'Terminal for budget airlines',
        parentLocationId: 'manchester-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'birmingham-airport',
    name: 'Birmingham Airport',
    fullName: 'Birmingham Airport',
    type: 'airport',
    latitude: 52.4539,
    longitude: -1.7480,
    coordinates: { lat: 52.4539, lng: -1.7480 },
    address: 'Birmingham Airport, Birmingham B26, UK',
    city: 'Birmingham',
    region: 'West Midlands',
    postcode: 'B26',
    terminals: [
      {
        id: 'birmingham-main-terminal',
        name: 'Main Terminal',
        fullName: 'Birmingham Main Terminal',
        type: 'terminal',
        latitude: 52.4539,
        longitude: -1.7480,
        coordinates: { lat: 52.4539, lng: -1.7480 },
        description: 'Single terminal for all flights',
        parentLocationId: 'birmingham-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'edinburgh-airport',
    name: 'Edinburgh Airport',
    fullName: 'Edinburgh Airport',
    type: 'airport',
    latitude: 55.9500,
    longitude: -3.3725,
    coordinates: { lat: 55.9500, lng: -3.3725 },
    address: 'Edinburgh Airport, Edinburgh EH12, UK',
    city: 'Edinburgh',
    region: 'Scotland',
    postcode: 'EH12',
    terminals: [
      {
        id: 'edinburgh-main-terminal',
        name: 'Main Terminal',
        fullName: 'Edinburgh Main Terminal',
        type: 'terminal',
        latitude: 55.9500,
        longitude: -3.3725,
        coordinates: { lat: 55.9500, lng: -3.3725 },
        description: 'Single terminal for all flights',
        parentLocationId: 'edinburgh-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'glasgow-airport',
    name: 'Glasgow Airport',
    fullName: 'Glasgow Airport',
    type: 'airport',
    latitude: 55.8650,
    longitude: -4.4330,
    coordinates: { lat: 55.8650, lng: -4.4330 },
    address: 'Glasgow Airport, Glasgow PA3, UK',
    city: 'Glasgow',
    region: 'Scotland',
    postcode: 'PA3',
    terminals: [
      {
        id: 'glasgow-main-terminal',
        name: 'Main Terminal',
        fullName: 'Glasgow Main Terminal',
        type: 'terminal',
        latitude: 55.8650,
        longitude: -4.4330,
        coordinates: { lat: 55.8650, lng: -4.4330 },
        description: 'Single terminal for all flights',
        parentLocationId: 'glasgow-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'bristol-airport',
    name: 'Bristol Airport',
    fullName: 'Bristol Airport',
    type: 'airport',
    latitude: 51.3825,
    longitude: -2.7189,
    coordinates: { lat: 51.3825, lng: -2.7189 },
    address: 'Bristol Airport, Bristol BS48, UK',
    city: 'Bristol',
    region: 'Somerset',
    postcode: 'BS48',
    terminals: [
      {
        id: 'bristol-main-terminal',
        name: 'Main Terminal',
        fullName: 'Bristol Main Terminal',
        type: 'terminal',
        latitude: 51.3825,
        longitude: -2.7189,
        coordinates: { lat: 51.3825, lng: -2.7189 },
        description: 'Single terminal for all flights',
        parentLocationId: 'bristol-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'newcastle-airport',
    name: 'Newcastle Airport',
    fullName: 'Newcastle Airport',
    type: 'airport',
    latitude: 55.0375,
    longitude: -1.6917,
    coordinates: { lat: 55.0375, lng: -1.6917 },
    address: 'Newcastle Airport, Newcastle NE13, UK',
    city: 'Newcastle',
    region: 'Tyne and Wear',
    postcode: 'NE13',
    terminals: [
      {
        id: 'newcastle-main-terminal',
        name: 'Main Terminal',
        fullName: 'Newcastle Main Terminal',
        type: 'terminal',
        latitude: 55.0375,
        longitude: -1.6917,
        coordinates: { lat: 55.0375, lng: -1.6917 },
        description: 'Single terminal for all flights',
        parentLocationId: 'newcastle-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'london-city-airport',
    name: 'London City Airport',
    fullName: 'London City Airport',
    type: 'airport',
    latitude: 51.505278,
    longitude: 0.055278,
    coordinates: { lat: 51.505278, lng: 0.055278 },
    address: 'London City Airport, London E16, UK',
    city: 'London',
    region: 'Greater London',
    postcode: 'E16',
    terminals: [
      {
        id: 'london-city-main-terminal',
        name: 'Main Terminal',
        fullName: 'London City Main Terminal',
        type: 'terminal',
        latitude: 51.505278,
        longitude: 0.055278,
        coordinates: { lat: 51.505278, lng: 0.055278 },
        description: 'Single terminal for all flights',
        parentLocationId: 'london-city-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'southend-airport',
    name: 'Southend Airport',
    fullName: 'London Southend Airport',
    type: 'airport',
    latitude: 51.571389,
    longitude: 0.695556,
    coordinates: { lat: 51.571389, lng: 0.695556 },
    address: 'Southend Airport, Southend-on-Sea SS2, UK',
    city: 'Southend-on-Sea',
    region: 'Essex',
    postcode: 'SS2',
    terminals: [
      {
        id: 'southend-main-terminal',
        name: 'Main Terminal',
        fullName: 'Southend Main Terminal',
        type: 'terminal',
        latitude: 51.571389,
        longitude: 0.695556,
        coordinates: { lat: 51.571389, lng: 0.695556 },
        description: 'Single terminal for all flights',
        parentLocationId: 'southend-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'liverpool-airport',
    name: 'Liverpool Airport',
    fullName: 'Liverpool John Lennon Airport',
    type: 'airport',
    latitude: 53.333611,
    longitude: -2.849722,
    coordinates: { lat: 53.333611, lng: -2.849722 },
    address: 'Liverpool Airport, Liverpool L24, UK',
    city: 'Liverpool',
    region: 'Merseyside',
    postcode: 'L24',
    terminals: [
      {
        id: 'liverpool-main-terminal',
        name: 'Main Terminal',
        fullName: 'Liverpool Main Terminal',
        type: 'terminal',
        latitude: 53.333611,
        longitude: -2.849722,
        coordinates: { lat: 53.333611, lng: -2.849722 },
        description: 'Single terminal for all flights',
        parentLocationId: 'liverpool-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'leeds-bradford-airport',
    name: 'Leeds Bradford Airport',
    fullName: 'Leeds Bradford Airport',
    type: 'airport',
    latitude: 53.865833,
    longitude: -1.660556,
    coordinates: { lat: 53.865833, lng: -1.660556 },
    address: 'Leeds Bradford Airport, Leeds LS19, UK',
    city: 'Leeds',
    region: 'West Yorkshire',
    postcode: 'LS19',
    terminals: [
      {
        id: 'leeds-bradford-main-terminal',
        name: 'Main Terminal',
        fullName: 'Leeds Bradford Main Terminal',
        type: 'terminal',
        latitude: 53.865833,
        longitude: -1.660556,
        coordinates: { lat: 53.865833, lng: -1.660556 },
        description: 'Single terminal for all flights',
        parentLocationId: 'leeds-bradford-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'east-midlands-airport',
    name: 'East Midlands Airport',
    fullName: 'East Midlands Airport',
    type: 'airport',
    latitude: 52.831111,
    longitude: -1.328056,
    coordinates: { lat: 52.831111, lng: -1.328056 },
    address: 'East Midlands Airport, Castle Donington DE74, UK',
    city: 'Castle Donington',
    region: 'Leicestershire',
    postcode: 'DE74',
    terminals: [
      {
        id: 'east-midlands-main-terminal',
        name: 'Main Terminal',
        fullName: 'East Midlands Main Terminal',
        type: 'terminal',
        latitude: 52.831111,
        longitude: -1.328056,
        coordinates: { lat: 52.831111, lng: -1.328056 },
        description: 'Single terminal for all flights',
        parentLocationId: 'east-midlands-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'cardiff-airport',
    name: 'Cardiff Airport',
    fullName: 'Cardiff Airport',
    type: 'airport',
    latitude: 51.396667,
    longitude: -3.343333,
    coordinates: { lat: 51.396667, lng: -3.343333 },
    address: 'Cardiff Airport, Cardiff CF62, UK',
    city: 'Cardiff',
    region: 'Vale of Glamorgan',
    postcode: 'CF62',
    terminals: [
      {
        id: 'cardiff-main-terminal',
        name: 'Main Terminal',
        fullName: 'Cardiff Main Terminal',
        type: 'terminal',
        latitude: 51.396667,
        longitude: -3.343333,
        coordinates: { lat: 51.396667, lng: -3.343333 },
        description: 'Single terminal for all flights',
        parentLocationId: 'cardiff-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'belfast-international-airport',
    name: 'Belfast International Airport',
    fullName: 'Belfast International Airport',
    type: 'airport',
    latitude: 54.657500,
    longitude: -6.215833,
    coordinates: { lat: 54.657500, lng: -6.215833 },
    address: 'Belfast International Airport, Belfast BT29, UK',
    city: 'Belfast',
    region: 'County Antrim',
    postcode: 'BT29',
    terminals: [
      {
        id: 'belfast-international-main-terminal',
        name: 'Main Terminal',
        fullName: 'Belfast International Main Terminal',
        type: 'terminal',
        latitude: 54.657500,
        longitude: -6.215833,
        coordinates: { lat: 54.657500, lng: -6.215833 },
        description: 'Single terminal for all flights',
        parentLocationId: 'belfast-international-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'aberdeen-airport',
    name: 'Aberdeen Airport',
    fullName: 'Aberdeen Airport',
    type: 'airport',
    latitude: 57.201944,
    longitude: -2.197778,
    coordinates: { lat: 57.201944, lng: -2.197778 },
    address: 'Aberdeen Airport, Aberdeen AB21, UK',
    city: 'Aberdeen',
    region: 'Aberdeenshire',
    postcode: 'AB21',
    terminals: [
      {
        id: 'aberdeen-main-terminal',
        name: 'Main Terminal',
        fullName: 'Aberdeen Main Terminal',
        type: 'terminal',
        latitude: 57.201944,
        longitude: -2.197778,
        coordinates: { lat: 57.201944, lng: -2.197778 },
        description: 'Single terminal for all flights',
        parentLocationId: 'aberdeen-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'southampton-airport',
    name: 'Southampton Airport',
    fullName: 'Southampton Airport',
    type: 'airport',
    latitude: 50.950278,
    longitude: -1.356667,
    coordinates: { lat: 50.950278, lng: -1.356667 },
    address: 'Southampton Airport, Southampton SO18, UK',
    city: 'Southampton',
    region: 'Hampshire',
    postcode: 'SO18',
    terminals: [
      {
        id: 'southampton-main-terminal',
        name: 'Main Terminal',
        fullName: 'Southampton Main Terminal',
        type: 'terminal',
        latitude: 50.950278,
        longitude: -1.356667,
        coordinates: { lat: 50.950278, lng: -1.356667 },
        description: 'Single terminal for all flights',
        parentLocationId: 'southampton-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'jersey-airport',
    name: 'Jersey Airport',
    fullName: 'Jersey Airport',
    type: 'airport',
    latitude: 49.207778,
    longitude: -2.195556,
    coordinates: { lat: 49.207778, lng: -2.195556 },
    address: 'Jersey Airport, St Peter JE3, UK',
    city: 'St Peter',
    region: 'Jersey',
    postcode: 'JE3',
    terminals: [
      {
        id: 'jersey-main-terminal',
        name: 'Main Terminal',
        fullName: 'Jersey Main Terminal',
        type: 'terminal',
        latitude: 49.207778,
        longitude: -2.195556,
        coordinates: { lat: 49.207778, lng: -2.195556 },
        description: 'Single terminal for all flights',
        parentLocationId: 'jersey-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'guernsey-airport',
    name: 'Guernsey Airport',
    fullName: 'Guernsey Airport',
    type: 'airport',
    latitude: 49.434722,
    longitude: -2.601944,
    coordinates: { lat: 49.434722, lng: -2.601944 },
    address: 'Guernsey Airport, Forest GY8, UK',
    city: 'Forest',
    region: 'Guernsey',
    postcode: 'GY8',
    terminals: [
      {
        id: 'guernsey-main-terminal',
        name: 'Main Terminal',
        fullName: 'Guernsey Main Terminal',
        type: 'terminal',
        latitude: 49.434722,
        longitude: -2.601944,
        coordinates: { lat: 49.434722, lng: -2.601944 },
        description: 'Single terminal for all flights',
        parentLocationId: 'guernsey-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'isle-of-man-airport',
    name: 'Isle of Man Airport',
    fullName: 'Isle of Man Airport',
    type: 'airport',
    latitude: 54.083333,
    longitude: -4.623889,
    coordinates: { lat: 54.083333, lng: -4.623889 },
    address: 'Isle of Man Airport, Ballasalla IM9, UK',
    city: 'Ballasalla',
    region: 'Isle of Man',
    postcode: 'IM9',
    terminals: [
      {
        id: 'isle-of-man-main-terminal',
        name: 'Main Terminal',
        fullName: 'Isle of Man Main Terminal',
        type: 'terminal',
        latitude: 54.083333,
        longitude: -4.623889,
        coordinates: { lat: 54.083333, lng: -4.623889 },
        description: 'Single terminal for all flights',
        parentLocationId: 'isle-of-man-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'inverness-airport',
    name: 'Inverness Airport',
    fullName: 'Inverness Airport',
    type: 'airport',
    latitude: 57.542500,
    longitude: -4.047500,
    coordinates: { lat: 57.542500, lng: -4.047500 },
    address: 'Inverness Airport, Inverness IV2, UK',
    city: 'Inverness',
    region: 'Highland',
    postcode: 'IV2',
    terminals: [
      {
        id: 'inverness-main-terminal',
        name: 'Main Terminal',
        fullName: 'Inverness Main Terminal',
        type: 'terminal',
        latitude: 57.542500,
        longitude: -4.047500,
        coordinates: { lat: 57.542500, lng: -4.047500 },
        description: 'Single terminal for all flights',
        parentLocationId: 'inverness-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  },
  {
    id: 'prestwick-airport',
    name: 'Prestwick Airport',
    fullName: 'Glasgow Prestwick Airport',
    type: 'airport',
    latitude: 55.509444,
    longitude: -4.586667,
    coordinates: { lat: 55.509444, lng: -4.586667 },
    address: 'Prestwick Airport, Prestwick KA9, UK',
    city: 'Prestwick',
    region: 'South Ayrshire',
    postcode: 'KA9',
    terminals: [
      {
        id: 'prestwick-main-terminal',
        name: 'Main Terminal',
        fullName: 'Prestwick Main Terminal',
        type: 'terminal',
        latitude: 55.509444,
        longitude: -4.586667,
        coordinates: { lat: 55.509444, lng: -4.586667 },
        description: 'Single terminal for all flights',
        parentLocationId: 'prestwick-airport'
      }
    ],
    metadata: {
      primaryType: 'airport',
      category: 'airport',
      region: 'UK'
    }
  }
];

// UK Train Stations Database
export const UK_STATIONS: UKLocation[] = [
  {
    id: 'kings-cross-station',
    name: 'King\'s Cross Station',
    fullName: 'London King\'s Cross Station',
    type: 'station',
    latitude: 51.53077,
    longitude: -0.12331,
    coordinates: { lat: 51.53077, lng: -0.12331 },
    address: 'King\'s Cross Station, London N1, UK',
    city: 'London',
    region: 'Greater London',
    postcode: 'N1',
    terminals: [
      {
        id: 'kings-cross-platform-1',
        name: 'Platform 1',
        fullName: 'King\'s Cross Platform 1',
        type: 'platform',
        latitude: 51.53215,
        longitude: -0.12331,
        coordinates: { lat: 51.53215, lng: -0.12331 },
        description: 'Main platform for East Coast services',
        parentLocationId: 'kings-cross-station'
      },
      {
        id: 'kings-cross-platform-2',
        name: 'Platform 2',
        fullName: 'King\'s Cross Platform 2',
        type: 'platform',
        latitude: 51.53218,
        longitude: -0.12325,
        coordinates: { lat: 51.53218, lng: -0.12325 },
        description: 'Platform for domestic services',
        parentLocationId: 'kings-cross-station'
      },
      {
        id: 'kings-cross-platform-3',
        name: 'Platform 3',
        fullName: 'King\'s Cross Platform 3',
        type: 'platform',
        latitude: 51.53221,
        longitude: -0.12319,
        coordinates: { lat: 51.53221, lng: -0.12319 },
        description: 'Platform for international services',
        parentLocationId: 'kings-cross-station'
      },
      {
        id: 'kings-cross-platform-4',
        name: 'Platform 4',
        fullName: 'King\'s Cross Platform 4',
        type: 'platform',
        latitude: 51.53224,
        longitude: -0.12313,
        coordinates: { lat: 51.53224, lng: -0.12313 },
        description: 'Platform for domestic services',
        parentLocationId: 'kings-cross-station'
      },
      {
        id: 'kings-cross-platform-5',
        name: 'Platform 5',
        fullName: 'King\'s Cross Platform 5',
        type: 'platform',
        latitude: 51.53227,
        longitude: -0.12307,
        coordinates: { lat: 51.53227, lng: -0.12307 },
        description: 'Platform for domestic services',
        parentLocationId: 'kings-cross-station'
      },
      {
        id: 'kings-cross-platform-6',
        name: 'Platform 6',
        fullName: 'King\'s Cross Platform 6',
        type: 'platform',
        latitude: 51.53230,
        longitude: -0.12301,
        coordinates: { lat: 51.53230, lng: -0.12301 },
        description: 'Platform for domestic services',
        parentLocationId: 'kings-cross-station'
      },
      {
        id: 'kings-cross-platform-7',
        name: 'Platform 7',
        fullName: 'King\'s Cross Platform 7',
        type: 'platform',
        latitude: 51.53233,
        longitude: -0.12295,
        coordinates: { lat: 51.53233, lng: -0.12295 },
        description: 'Platform for domestic services',
        parentLocationId: 'kings-cross-station'
      },
      {
        id: 'kings-cross-platform-8',
        name: 'Platform 8',
        fullName: 'King\'s Cross Platform 8',
        type: 'platform',
        latitude: 51.53236,
        longitude: -0.12289,
        coordinates: { lat: 51.53236, lng: -0.12289 },
        description: 'Platform for domestic services',
        parentLocationId: 'kings-cross-station'
      },
      {
        id: 'kings-cross-platform-9',
        name: 'Platform 9',
        fullName: 'King\'s Cross Platform 9',
        type: 'platform',
        latitude: 51.53239,
        longitude: -0.12283,
        coordinates: { lat: 51.53239, lng: -0.12283 },
        description: 'Platform for domestic services',
        parentLocationId: 'kings-cross-station'
      },
      {
        id: 'kings-cross-platform-10',
        name: 'Platform 10',
        fullName: 'King\'s Cross Platform 10',
        type: 'platform',
        latitude: 51.53242,
        longitude: -0.12277,
        coordinates: { lat: 51.53242, lng: -0.12277 },
        description: 'Platform for domestic services',
        parentLocationId: 'kings-cross-station'
      },
      {
        id: 'kings-cross-platform-11',
        name: 'Platform 11',
        fullName: 'King\'s Cross Platform 11',
        type: 'platform',
        latitude: 51.53245,
        longitude: -0.12271,
        coordinates: { lat: 51.53245, lng: -0.12271 },
        description: 'Platform for domestic services',
        parentLocationId: 'kings-cross-station'
      },
      {
        id: 'kings-cross-platform-12',
        name: 'Platform 12',
        fullName: 'King\'s Cross Platform 12',
        type: 'platform',
        latitude: 51.53248,
        longitude: -0.12265,
        coordinates: { lat: 51.53248, lng: -0.12265 },
        description: 'Platform for domestic services',
        parentLocationId: 'kings-cross-station'
      }
    ],
    metadata: {
      primaryType: 'station',
      category: 'train_station',
      region: 'UK'
    }
  },
  {
    id: 'paddington-station',
    name: 'Paddington Station',
    fullName: 'London Paddington Station',
    type: 'station',
    latitude: 51.51517,
    longitude: -0.17619,
    coordinates: { lat: 51.51517, lng: -0.17619 },
    address: 'Paddington Station, London W2, UK',
    city: 'London',
    region: 'Greater London',
    postcode: 'W2',
    terminals: [
      {
        id: 'paddington-platform-1',
        name: 'Platform 1',
        fullName: 'Paddington Platform 1',
        type: 'platform',
        latitude: 51.51618,
        longitude: -0.17642,
        coordinates: { lat: 51.51618, lng: -0.17642 },
        description: 'Main platform for Great Western services',
        parentLocationId: 'paddington-station'
      },
      {
        id: 'paddington-platform-2',
        name: 'Platform 2',
        fullName: 'Paddington Platform 2',
        type: 'platform',
        latitude: 51.51621,
        longitude: -0.17636,
        coordinates: { lat: 51.51621, lng: -0.17636 },
        description: 'Platform for Heathrow Express',
        parentLocationId: 'paddington-station'
      },
      {
        id: 'paddington-platform-3',
        name: 'Platform 3',
        fullName: 'Paddington Platform 3',
        type: 'platform',
        latitude: 51.51624,
        longitude: -0.17630,
        coordinates: { lat: 51.51624, lng: -0.17630 },
        description: 'Platform for domestic services',
        parentLocationId: 'paddington-station'
      },
      {
        id: 'paddington-platform-4',
        name: 'Platform 4',
        fullName: 'Paddington Platform 4',
        type: 'platform',
        latitude: 51.51627,
        longitude: -0.17624,
        coordinates: { lat: 51.51627, lng: -0.17624 },
        description: 'Platform for domestic services',
        parentLocationId: 'paddington-station'
      },
      {
        id: 'paddington-platform-5',
        name: 'Platform 5',
        fullName: 'Paddington Platform 5',
        type: 'platform',
        latitude: 51.51630,
        longitude: -0.17618,
        coordinates: { lat: 51.51630, lng: -0.17618 },
        description: 'Platform for domestic services',
        parentLocationId: 'paddington-station'
      },
      {
        id: 'paddington-platform-6',
        name: 'Platform 6',
        fullName: 'Paddington Platform 6',
        type: 'platform',
        latitude: 51.51633,
        longitude: -0.17612,
        coordinates: { lat: 51.51633, lng: -0.17612 },
        description: 'Platform for domestic services',
        parentLocationId: 'paddington-station'
      },
      {
        id: 'paddington-platform-7',
        name: 'Platform 7',
        fullName: 'Paddington Platform 7',
        type: 'platform',
        latitude: 51.51636,
        longitude: -0.17606,
        coordinates: { lat: 51.51636, lng: -0.17606 },
        description: 'Platform for domestic services',
        parentLocationId: 'paddington-station'
      },
      {
        id: 'paddington-platform-8',
        name: 'Platform 8',
        fullName: 'Paddington Platform 8',
        type: 'platform',
        latitude: 51.51639,
        longitude: -0.17600,
        coordinates: { lat: 51.51639, lng: -0.17600 },
        description: 'Platform for domestic services',
        parentLocationId: 'paddington-station'
      },
      {
        id: 'paddington-platform-9',
        name: 'Platform 9',
        fullName: 'Paddington Platform 9',
        type: 'platform',
        latitude: 51.51642,
        longitude: -0.17594,
        coordinates: { lat: 51.51642, lng: -0.17594 },
        description: 'Platform for domestic services',
        parentLocationId: 'paddington-station'
      },
      {
        id: 'paddington-platform-10',
        name: 'Platform 10',
        fullName: 'Paddington Platform 10',
        type: 'platform',
        latitude: 51.51645,
        longitude: -0.17588,
        coordinates: { lat: 51.51645, lng: -0.17588 },
        description: 'Platform for domestic services',
        parentLocationId: 'paddington-station'
      },
      {
        id: 'paddington-platform-11',
        name: 'Platform 11',
        fullName: 'Paddington Platform 11',
        type: 'platform',
        latitude: 51.51648,
        longitude: -0.17582,
        coordinates: { lat: 51.51648, lng: -0.17582 },
        description: 'Platform for domestic services',
        parentLocationId: 'paddington-station'
      },
      {
        id: 'paddington-platform-12',
        name: 'Platform 12',
        fullName: 'Paddington Platform 12',
        type: 'platform',
        latitude: 51.51651,
        longitude: -0.17576,
        coordinates: { lat: 51.51651, lng: -0.17576 },
        description: 'Platform for domestic services',
        parentLocationId: 'paddington-station'
      }
    ],
    metadata: {
      primaryType: 'station',
      category: 'train_station',
      region: 'UK'
    }
  },
  {
    id: 'victoria-station',
    name: 'Victoria Station',
    fullName: 'London Victoria Station',
    type: 'station',
    latitude: 51.49521,
    longitude: -0.14390,
    coordinates: { lat: 51.49521, lng: -0.14390 },
    address: 'Victoria Station, London SW1, UK',
    city: 'London',
    region: 'Greater London',
    postcode: 'SW1',
    terminals: [
      {
        id: 'victoria-platform-1',
        name: 'Platform 1',
        fullName: 'Victoria Platform 1',
        type: 'platform',
        latitude: 51.49525,
        longitude: -0.14447,
        coordinates: { lat: 51.49525, lng: -0.14447 },
        description: 'Main platform for Southern services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-2',
        name: 'Platform 2',
        fullName: 'Victoria Platform 2',
        type: 'platform',
        latitude: 51.49528,
        longitude: -0.14441,
        coordinates: { lat: 51.49528, lng: -0.14441 },
        description: 'Platform for Gatwick Express',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-3',
        name: 'Platform 3',
        fullName: 'Victoria Platform 3',
        type: 'platform',
        latitude: 51.49531,
        longitude: -0.14435,
        coordinates: { lat: 51.49531, lng: -0.14435 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-4',
        name: 'Platform 4',
        fullName: 'Victoria Platform 4',
        type: 'platform',
        latitude: 51.49534,
        longitude: -0.14429,
        coordinates: { lat: 51.49534, lng: -0.14429 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-5',
        name: 'Platform 5',
        fullName: 'Victoria Platform 5',
        type: 'platform',
        latitude: 51.49537,
        longitude: -0.14423,
        coordinates: { lat: 51.49537, lng: -0.14423 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-6',
        name: 'Platform 6',
        fullName: 'Victoria Platform 6',
        type: 'platform',
        latitude: 51.49540,
        longitude: -0.14417,
        coordinates: { lat: 51.49540, lng: -0.14417 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-7',
        name: 'Platform 7',
        fullName: 'Victoria Platform 7',
        type: 'platform',
        latitude: 51.49543,
        longitude: -0.14411,
        coordinates: { lat: 51.49543, lng: -0.14411 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-8',
        name: 'Platform 8',
        fullName: 'Victoria Platform 8',
        type: 'platform',
        latitude: 51.49546,
        longitude: -0.14405,
        coordinates: { lat: 51.49546, lng: -0.14405 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-9',
        name: 'Platform 9',
        fullName: 'Victoria Platform 9',
        type: 'platform',
        latitude: 51.49549,
        longitude: -0.14399,
        coordinates: { lat: 51.49549, lng: -0.14399 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-10',
        name: 'Platform 10',
        fullName: 'Victoria Platform 10',
        type: 'platform',
        latitude: 51.49552,
        longitude: -0.14393,
        coordinates: { lat: 51.49552, lng: -0.14393 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-11',
        name: 'Platform 11',
        fullName: 'Victoria Platform 11',
        type: 'platform',
        latitude: 51.49555,
        longitude: -0.14387,
        coordinates: { lat: 51.49555, lng: -0.14387 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-12',
        name: 'Platform 12',
        fullName: 'Victoria Platform 12',
        type: 'platform',
        latitude: 51.49558,
        longitude: -0.14381,
        coordinates: { lat: 51.49558, lng: -0.14381 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-13',
        name: 'Platform 13',
        fullName: 'Victoria Platform 13',
        type: 'platform',
        latitude: 51.49561,
        longitude: -0.14375,
        coordinates: { lat: 51.49561, lng: -0.14375 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-14',
        name: 'Platform 14',
        fullName: 'Victoria Platform 14',
        type: 'platform',
        latitude: 51.49564,
        longitude: -0.14369,
        coordinates: { lat: 51.49564, lng: -0.14369 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-15',
        name: 'Platform 15',
        fullName: 'Victoria Platform 15',
        type: 'platform',
        latitude: 51.49567,
        longitude: -0.14363,
        coordinates: { lat: 51.49567, lng: -0.14363 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-16',
        name: 'Platform 16',
        fullName: 'Victoria Platform 16',
        type: 'platform',
        latitude: 51.49570,
        longitude: -0.14357,
        coordinates: { lat: 51.49570, lng: -0.14357 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-17',
        name: 'Platform 17',
        fullName: 'Victoria Platform 17',
        type: 'platform',
        latitude: 51.49573,
        longitude: -0.14351,
        coordinates: { lat: 51.49573, lng: -0.14351 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-18',
        name: 'Platform 18',
        fullName: 'Victoria Platform 18',
        type: 'platform',
        latitude: 51.49576,
        longitude: -0.14345,
        coordinates: { lat: 51.49576, lng: -0.14345 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-19',
        name: 'Platform 19',
        fullName: 'Victoria Platform 19',
        type: 'platform',
        latitude: 51.49579,
        longitude: -0.14339,
        coordinates: { lat: 51.49579, lng: -0.14339 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      },
      {
        id: 'victoria-platform-20',
        name: 'Platform 20',
        fullName: 'Victoria Platform 20',
        type: 'platform',
        latitude: 51.49582,
        longitude: -0.14333,
        coordinates: { lat: 51.49582, lng: -0.14333 },
        description: 'Platform for domestic services',
        parentLocationId: 'victoria-station'
      }
    ],
    metadata: {
      primaryType: 'station',
      category: 'train_station',
      region: 'UK'
    }
  },
  {
    id: 'waterloo-station',
    name: 'Waterloo Station',
    fullName: 'London Waterloo Station',
    type: 'station',
    latitude: 51.50313,
    longitude: -0.11321,
    coordinates: { lat: 51.50313, lng: -0.11321 },
    address: 'Waterloo Station, London SE1, UK',
    city: 'London',
    region: 'Greater London',
    postcode: 'SE1',
    terminals: [
      {
        id: 'waterloo-platform-1',
        name: 'Platform 1',
        fullName: 'Waterloo Platform 1',
        type: 'platform',
        latitude: 51.50295,
        longitude: -0.11305,
        coordinates: { lat: 51.50295, lng: -0.11305 },
        description: 'Main platform for South Western services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-2',
        name: 'Platform 2',
        fullName: 'Waterloo Platform 2',
        type: 'platform',
        latitude: 51.50298,
        longitude: -0.11299,
        coordinates: { lat: 51.50298, lng: -0.11299 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-3',
        name: 'Platform 3',
        fullName: 'Waterloo Platform 3',
        type: 'platform',
        latitude: 51.50301,
        longitude: -0.11293,
        coordinates: { lat: 51.50301, lng: -0.11293 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-4',
        name: 'Platform 4',
        fullName: 'Waterloo Platform 4',
        type: 'platform',
        latitude: 51.50304,
        longitude: -0.11287,
        coordinates: { lat: 51.50304, lng: -0.11287 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-5',
        name: 'Platform 5',
        fullName: 'Waterloo Platform 5',
        type: 'platform',
        latitude: 51.50307,
        longitude: -0.11281,
        coordinates: { lat: 51.50307, lng: -0.11281 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-6',
        name: 'Platform 6',
        fullName: 'Waterloo Platform 6',
        type: 'platform',
        latitude: 51.50310,
        longitude: -0.11275,
        coordinates: { lat: 51.50310, lng: -0.11275 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-7',
        name: 'Platform 7',
        fullName: 'Waterloo Platform 7',
        type: 'platform',
        latitude: 51.50313,
        longitude: -0.11269,
        coordinates: { lat: 51.50313, lng: -0.11269 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-8',
        name: 'Platform 8',
        fullName: 'Waterloo Platform 8',
        type: 'platform',
        latitude: 51.50316,
        longitude: -0.11263,
        coordinates: { lat: 51.50316, lng: -0.11263 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-9',
        name: 'Platform 9',
        fullName: 'Waterloo Platform 9',
        type: 'platform',
        latitude: 51.50319,
        longitude: -0.11257,
        coordinates: { lat: 51.50319, lng: -0.11257 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-10',
        name: 'Platform 10',
        fullName: 'Waterloo Platform 10',
        type: 'platform',
        latitude: 51.50322,
        longitude: -0.11251,
        coordinates: { lat: 51.50322, lng: -0.11251 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-11',
        name: 'Platform 11',
        fullName: 'Waterloo Platform 11',
        type: 'platform',
        latitude: 51.50325,
        longitude: -0.11245,
        coordinates: { lat: 51.50325, lng: -0.11245 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-12',
        name: 'Platform 12',
        fullName: 'Waterloo Platform 12',
        type: 'platform',
        latitude: 51.50328,
        longitude: -0.11239,
        coordinates: { lat: 51.50328, lng: -0.11239 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-13',
        name: 'Platform 13',
        fullName: 'Waterloo Platform 13',
        type: 'platform',
        latitude: 51.50331,
        longitude: -0.11233,
        coordinates: { lat: 51.50331, lng: -0.11233 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-14',
        name: 'Platform 14',
        fullName: 'Waterloo Platform 14',
        type: 'platform',
        latitude: 51.50334,
        longitude: -0.11227,
        coordinates: { lat: 51.50334, lng: -0.11227 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-15',
        name: 'Platform 15',
        fullName: 'Waterloo Platform 15',
        type: 'platform',
        latitude: 51.50337,
        longitude: -0.11221,
        coordinates: { lat: 51.50337, lng: -0.11221 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-16',
        name: 'Platform 16',
        fullName: 'Waterloo Platform 16',
        type: 'platform',
        latitude: 51.50340,
        longitude: -0.11215,
        coordinates: { lat: 51.50340, lng: -0.11215 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-17',
        name: 'Platform 17',
        fullName: 'Waterloo Platform 17',
        type: 'platform',
        latitude: 51.50343,
        longitude: -0.11209,
        coordinates: { lat: 51.50343, lng: -0.11209 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-18',
        name: 'Platform 18',
        fullName: 'Waterloo Platform 18',
        type: 'platform',
        latitude: 51.50346,
        longitude: -0.11203,
        coordinates: { lat: 51.50346, lng: -0.11203 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-19',
        name: 'Platform 19',
        fullName: 'Waterloo Platform 19',
        type: 'platform',
        latitude: 51.50349,
        longitude: -0.11197,
        coordinates: { lat: 51.50349, lng: -0.11197 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-20',
        name: 'Platform 20',
        fullName: 'Waterloo Platform 20',
        type: 'platform',
        latitude: 51.50352,
        longitude: -0.11191,
        coordinates: { lat: 51.50352, lng: -0.11191 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-21',
        name: 'Platform 21',
        fullName: 'Waterloo Platform 21',
        type: 'platform',
        latitude: 51.50355,
        longitude: -0.11185,
        coordinates: { lat: 51.50355, lng: -0.11185 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-22',
        name: 'Platform 22',
        fullName: 'Waterloo Platform 22',
        type: 'platform',
        latitude: 51.50358,
        longitude: -0.11179,
        coordinates: { lat: 51.50358, lng: -0.11179 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-23',
        name: 'Platform 23',
        fullName: 'Waterloo Platform 23',
        type: 'platform',
        latitude: 51.50361,
        longitude: -0.11173,
        coordinates: { lat: 51.50361, lng: -0.11173 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      },
      {
        id: 'waterloo-platform-24',
        name: 'Platform 24',
        fullName: 'Waterloo Platform 24',
        type: 'platform',
        latitude: 51.50364,
        longitude: -0.11167,
        coordinates: { lat: 51.50364, lng: -0.11167 },
        description: 'Platform for domestic services',
        parentLocationId: 'waterloo-station'
      }
    ],
    metadata: {
      primaryType: 'station',
      category: 'train_station',
      region: 'UK'
    }
  },
  {
    id: 'euston-station',
    name: 'Euston Station',
    fullName: 'London Euston Station',
    type: 'station',
    latitude: 51.5285,
    longitude: -0.1339,
    coordinates: { lat: 51.5285, lng: -0.1339 },
    address: 'Euston Station, London NW1, UK',
    city: 'London',
    region: 'Greater London',
    postcode: 'NW1',
    terminals: [
      {
        id: 'euston-platform-1',
        name: 'Platform 1',
        fullName: 'Euston Platform 1',
        type: 'platform',
        latitude: 51.5285,
        longitude: -0.1339,
        coordinates: { lat: 51.5285, lng: -0.1339 },
        description: 'Main platform for West Coast services',
        parentLocationId: 'euston-station'
      },
      {
        id: 'euston-platform-2',
        name: 'Platform 2',
        fullName: 'Euston Platform 2',
        type: 'platform',
        latitude: 51.5285,
        longitude: -0.1339,
        coordinates: { lat: 51.5285, lng: -0.1339 },
        description: 'Platform for domestic services',
        parentLocationId: 'euston-station'
      },
      {
        id: 'euston-platform-3',
        name: 'Platform 3',
        fullName: 'Euston Platform 3',
        type: 'platform',
        latitude: 51.5285,
        longitude: -0.1339,
        coordinates: { lat: 51.5285, lng: -0.1339 },
        description: 'Platform for international services',
        parentLocationId: 'euston-station'
      }
    ],
    metadata: {
      primaryType: 'station',
      category: 'train_station',
      region: 'UK'
    }
  },
  {
    id: 'liverpool-street-station',
    name: 'Liverpool Street Station',
    fullName: 'London Liverpool Street Station',
    type: 'station',
    latitude: 51.5185,
    longitude: -0.0810,
    coordinates: { lat: 51.5185, lng: -0.0810 },
    address: 'Liverpool Street Station, London EC2, UK',
    city: 'London',
    region: 'Greater London',
    postcode: 'EC2',
    terminals: [
      {
        id: 'liverpool-street-platform-1',
        name: 'Platform 1',
        fullName: 'Liverpool Street Platform 1',
        type: 'platform',
        latitude: 51.5185,
        longitude: -0.0810,
        coordinates: { lat: 51.5185, lng: -0.0810 },
        description: 'Main platform for Greater Anglia services',
        parentLocationId: 'liverpool-street-station'
      },
      {
        id: 'liverpool-street-platform-2',
        name: 'Platform 2',
        fullName: 'Liverpool Street Platform 2',
        type: 'platform',
        latitude: 51.5185,
        longitude: -0.0810,
        coordinates: { lat: 51.5185, lng: -0.0810 },
        description: 'Platform for domestic services',
        parentLocationId: 'liverpool-street-station'
      },
      {
        id: 'liverpool-street-platform-3',
        name: 'Platform 3',
        fullName: 'Liverpool Street Platform 3',
        type: 'platform',
        latitude: 51.5185,
        longitude: -0.0810,
        coordinates: { lat: 51.5185, lng: -0.0810 },
        description: 'Platform for international services',
        parentLocationId: 'liverpool-street-station'
      }
    ],
    metadata: {
      primaryType: 'station',
      category: 'train_station',
      region: 'UK'
    }
  },
  {
    id: 'st-pancras-station',
    name: 'St Pancras Station',
    fullName: 'London St Pancras International Station',
    type: 'station',
    latitude: 51.5320,
    longitude: -0.1273,
    coordinates: { lat: 51.5320, lng: -0.1273 },
    address: 'St Pancras Station, London NW1, UK',
    city: 'London',
    region: 'Greater London',
    postcode: 'NW1',
    terminals: [
      {
        id: 'st-pancras-platform-1',
        name: 'Platform 1',
        fullName: 'St Pancras Platform 1',
        type: 'platform',
        latitude: 51.5320,
        longitude: -0.1273,
        coordinates: { lat: 51.5320, lng: -0.1273 },
        description: 'Main platform for Eurostar services',
        parentLocationId: 'st-pancras-station'
      },
      {
        id: 'st-pancras-platform-2',
        name: 'Platform 2',
        fullName: 'St Pancras Platform 2',
        type: 'platform',
        latitude: 51.5320,
        longitude: -0.1273,
        coordinates: { lat: 51.5320, lng: -0.1273 },
        description: 'Platform for East Midlands services',
        parentLocationId: 'st-pancras-station'
      },
      {
        id: 'st-pancras-platform-3',
        name: 'Platform 3',
        fullName: 'St Pancras Platform 3',
        type: 'platform',
        latitude: 51.5320,
        longitude: -0.1273,
        coordinates: { lat: 51.5320, lng: -0.1273 },
        description: 'Platform for domestic services',
        parentLocationId: 'st-pancras-station'
      }
    ],
    metadata: {
      primaryType: 'station',
      category: 'train_station',
      region: 'UK'
    }
  },
  {
    id: 'charing-cross-station',
    name: 'Charing Cross Station',
    fullName: 'London Charing Cross Station',
    type: 'station',
    latitude: 51.5075,
    longitude: -0.1245,
    coordinates: { lat: 51.5075, lng: -0.1245 },
    address: 'Charing Cross Station, London WC2, UK',
    city: 'London',
    region: 'Greater London',
    postcode: 'WC2',
    terminals: [
      {
        id: 'charing-cross-platform-1',
        name: 'Platform 1',
        fullName: 'Charing Cross Platform 1',
        type: 'platform',
        latitude: 51.5075,
        longitude: -0.1245,
        coordinates: { lat: 51.5075, lng: -0.1245 },
        description: 'Main platform for Southeastern services',
        parentLocationId: 'charing-cross-station'
      },
      {
        id: 'charing-cross-platform-2',
        name: 'Platform 2',
        fullName: 'Charing Cross Platform 2',
        type: 'platform',
        latitude: 51.5075,
        longitude: -0.1245,
        coordinates: { lat: 51.5075, lng: -0.1245 },
        description: 'Platform for domestic services',
        parentLocationId: 'charing-cross-station'
      },
      {
        id: 'charing-cross-platform-3',
        name: 'Platform 3',
        fullName: 'Charing Cross Platform 3',
        type: 'platform',
        latitude: 51.5075,
        longitude: -0.1245,
        coordinates: { lat: 51.5075, lng: -0.1245 },
        description: 'Platform for international services',
        parentLocationId: 'charing-cross-station'
      }
    ],
    metadata: {
      primaryType: 'station',
      category: 'train_station',
      region: 'UK'
    }
  },
  {
    id: 'london-bridge-station',
    name: 'London Bridge Station',
    fullName: 'London Bridge Station',
    type: 'station',
    latitude: 51.5050,
    longitude: -0.0860,
    coordinates: { lat: 51.5050, lng: -0.0860 },
    address: 'London Bridge Station, London SE1, UK',
    city: 'London',
    region: 'Greater London',
    postcode: 'SE1',
    terminals: [
      {
        id: 'london-bridge-platform-1',
        name: 'Platform 1',
        fullName: 'London Bridge Platform 1',
        type: 'platform',
        latitude: 51.5050,
        longitude: -0.0860,
        coordinates: { lat: 51.5050, lng: -0.0860 },
        description: 'Main platform for Southern services',
        parentLocationId: 'london-bridge-station'
      },
      {
        id: 'london-bridge-platform-2',
        name: 'Platform 2',
        fullName: 'London Bridge Platform 2',
        type: 'platform',
        latitude: 51.5050,
        longitude: -0.0860,
        coordinates: { lat: 51.5050, lng: -0.0860 },
        description: 'Platform for domestic services',
        parentLocationId: 'london-bridge-station'
      },
      {
        id: 'london-bridge-platform-3',
        name: 'Platform 3',
        fullName: 'London Bridge Platform 3',
        type: 'platform',
        latitude: 51.5050,
        longitude: -0.0860,
        coordinates: { lat: 51.5050, lng: -0.0860 },
        description: 'Platform for international services',
        parentLocationId: 'london-bridge-station'
      }
    ],
    metadata: {
      primaryType: 'station',
      category: 'train_station',
      region: 'UK'
    }
  },
  {
    id: 'manchester-piccadilly-station',
    name: 'Manchester Piccadilly Station',
    fullName: 'Manchester Piccadilly Station',
    type: 'station',
    latitude: 53.4775,
    longitude: -2.2300,
    coordinates: { lat: 53.4775, lng: -2.2300 },
    address: 'Manchester Piccadilly Station, Manchester M1, UK',
    city: 'Manchester',
    region: 'Greater Manchester',
    postcode: 'M1',
    terminals: [
      {
        id: 'manchester-piccadilly-platform-1',
        name: 'Platform 1',
        fullName: 'Manchester Piccadilly Platform 1',
        type: 'platform',
        latitude: 53.4775,
        longitude: -2.2300,
        coordinates: { lat: 53.4775, lng: -2.2300 },
        description: 'Main platform for TransPennine services',
        parentLocationId: 'manchester-piccadilly-station'
      },
      {
        id: 'manchester-piccadilly-platform-2',
        name: 'Platform 2',
        fullName: 'Manchester Piccadilly Platform 2',
        type: 'platform',
        latitude: 53.4775,
        longitude: -2.2300,
        coordinates: { lat: 53.4775, lng: -2.2300 },
        description: 'Platform for domestic services',
        parentLocationId: 'manchester-piccadilly-station'
      },
      {
        id: 'manchester-piccadilly-platform-3',
        name: 'Platform 3',
        fullName: 'Manchester Piccadilly Platform 3',
        type: 'platform',
        latitude: 53.4775,
        longitude: -2.2300,
        coordinates: { lat: 53.4775, lng: -2.2300 },
        description: 'Platform for international services',
        parentLocationId: 'manchester-piccadilly-station'
      }
    ],
    metadata: {
      primaryType: 'station',
      category: 'train_station',
      region: 'UK'
    }
  }
];

// Combined database for easy access
export const UK_AIRPORTS_AND_STATIONS: UKLocation[] = [
  ...UK_AIRPORTS,
  ...UK_STATIONS
];

// Helper functions
export const findAirportByName = (name: string): UKLocation | undefined => {
  const searchName = name.toLowerCase();
  return UK_AIRPORTS.find(airport => 
    airport.name.toLowerCase().includes(searchName) ||
    airport.fullName.toLowerCase().includes(searchName) ||
    airport.address.toLowerCase().includes(searchName)
  );
};

export const findStationByName = (name: string): UKLocation | undefined => {
  const searchName = name.toLowerCase();
  return UK_STATIONS.find(station => 
    station.name.toLowerCase().includes(searchName) ||
    station.fullName.toLowerCase().includes(searchName) ||
    station.address.toLowerCase().includes(searchName)
  );
};

export const findLocationById = (id: string): UKLocation | undefined => {
  return UK_AIRPORTS_AND_STATIONS.find(location => location.id === id);
};

export const getTerminalsByLocationId = (locationId: string): UKTerminal[] => {
  const location = findLocationById(locationId);
  return location?.terminals || [];
};

export const searchLocations = (query: string): UKLocation[] => {
  const searchQuery = query.toLowerCase();
  return UK_AIRPORTS_AND_STATIONS.filter(location => 
    location.name.toLowerCase().includes(searchQuery) ||
    location.fullName.toLowerCase().includes(searchQuery) ||
    location.address.toLowerCase().includes(searchQuery) ||
    location.city.toLowerCase().includes(searchQuery)
  );
}; 