/**
 * UK Cruise Terminals Data
 * Comprehensive list of major cruise terminals in the UK
 */

export interface CruiseTerminal {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  portCode?: string;
  terminalName?: string;
  facilities?: string[];
}

export const UK_CRUISE_TERMINALS: CruiseTerminal[] = [
  // Southampton
  {
    id: 'southampton-city-cruise-terminal',
    name: 'Southampton City Cruise Terminal',
    address: 'Herbert Walker Avenue, Southampton SO15 1HJ, UK',
    city: 'Southampton',
    region: 'Hampshire',
    latitude: 50.8969,
    longitude: -1.4042,
    portCode: 'SOU',
    terminalName: 'City Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi']
  },
  {
    id: 'southampton-ocean-cruise-terminal',
    name: 'Southampton Ocean Cruise Terminal',
    address: 'Cunard Road, Southampton SO14 3QN, UK',
    city: 'Southampton',
    region: 'Hampshire',
    latitude: 50.9014,
    longitude: -1.4042,
    portCode: 'SOU',
    terminalName: 'Ocean Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi', 'Luggage Storage']
  },
  {
    id: 'southampton-mayflower-cruise-terminal',
    name: 'Southampton Mayflower Cruise Terminal',
    address: 'Herbert Walker Avenue, Southampton SO15 1HJ, UK',
    city: 'Southampton',
    region: 'Hampshire',
    latitude: 50.8969,
    longitude: -1.4042,
    portCode: 'SOU',
    terminalName: 'Mayflower Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi']
  },
  {
    id: 'southampton-qe2-cruise-terminal',
    name: 'Southampton QE2 Cruise Terminal',
    address: 'Herbert Walker Avenue, Southampton SO15 1HJ, UK',
    city: 'Southampton',
    region: 'Hampshire',
    latitude: 50.8969,
    longitude: -1.4042,
    portCode: 'SOU',
    terminalName: 'QE2 Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi']
  },

  // London
  {
    id: 'london-tilbury-cruise-terminal',
    name: 'London Tilbury Cruise Terminal',
    address: 'Tilbury Docks, Tilbury RM18 7EH, UK',
    city: 'Tilbury',
    region: 'Essex',
    latitude: 51.4567,
    longitude: 0.3614,
    portCode: 'LON',
    terminalName: 'Tilbury Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi', 'Customs']
  },
  {
    id: 'london-greenwich-cruise-terminal',
    name: 'London Greenwich Cruise Terminal',
    address: 'Greenwich Pier, Greenwich SE10 9HT, UK',
    city: 'London',
    region: 'Greater London',
    latitude: 51.5074,
    longitude: -0.1278,
    portCode: 'LON',
    terminalName: 'Greenwich Terminal',
    facilities: ['Shops', 'Restaurants', 'WiFi', 'Tourist Information']
  },

  // Liverpool
  {
    id: 'liverpool-cruise-terminal',
    name: 'Liverpool Cruise Terminal',
    address: 'Princes Parade, Liverpool L3 1DL, UK',
    city: 'Liverpool',
    region: 'Merseyside',
    latitude: 53.4084,
    longitude: -2.9916,
    portCode: 'LIV',
    terminalName: 'Liverpool Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi', 'Tourist Information']
  },

  // Newcastle
  {
    id: 'newcastle-cruise-terminal',
    name: 'Newcastle Cruise Terminal',
    address: 'International Passenger Terminal, North Shields NE29 6EE, UK',
    city: 'North Shields',
    region: 'Tyne and Wear',
    latitude: 55.0089,
    longitude: -1.4432,
    portCode: 'NCL',
    terminalName: 'Newcastle Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi', 'Customs']
  },

  // Edinburgh
  {
    id: 'edinburgh-cruise-terminal',
    name: 'Edinburgh Cruise Terminal',
    address: 'Ocean Terminal, Leith, Edinburgh EH6 6JJ, UK',
    city: 'Edinburgh',
    region: 'Scotland',
    latitude: 55.9804,
    longitude: -3.1791,
    portCode: 'EDI',
    terminalName: 'Leith Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi', 'Tourist Information']
  },

  // Glasgow
  {
    id: 'glasgow-cruise-terminal',
    name: 'Glasgow Cruise Terminal',
    address: 'Greenock Ocean Terminal, Greenock PA15 1HH, UK',
    city: 'Greenock',
    region: 'Scotland',
    latitude: 55.9486,
    longitude: -4.7642,
    portCode: 'GLA',
    terminalName: 'Greenock Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi', 'Customs']
  },

  // Belfast
  {
    id: 'belfast-cruise-terminal',
    name: 'Belfast Cruise Terminal',
    address: 'Stormont Wharf, Belfast BT3 9DT, UK',
    city: 'Belfast',
    region: 'Northern Ireland',
    latitude: 54.5973,
    longitude: -5.9301,
    portCode: 'BFS',
    terminalName: 'Belfast Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi', 'Customs']
  },

  // Dover
  {
    id: 'dover-cruise-terminal',
    name: 'Dover Cruise Terminal',
    address: 'Western Docks, Dover CT17 9DN, UK',
    city: 'Dover',
    region: 'Kent',
    latitude: 51.1279,
    longitude: 1.3134,
    portCode: 'DOV',
    terminalName: 'Dover Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi', 'Customs', 'Ferry Connections']
  },

  // Portsmouth
  {
    id: 'portsmouth-cruise-terminal',
    name: 'Portsmouth Cruise Terminal',
    address: 'Portsmouth International Port, Portsmouth PO2 8RU, UK',
    city: 'Portsmouth',
    region: 'Hampshire',
    latitude: 50.8198,
    longitude: -1.0880,
    portCode: 'PME',
    terminalName: 'Portsmouth Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi', 'Ferry Connections']
  },

  // Bristol
  {
    id: 'bristol-cruise-terminal',
    name: 'Bristol Cruise Terminal',
    address: 'Avonmouth Docks, Bristol BS11 9DA, UK',
    city: 'Bristol',
    region: 'Somerset',
    latitude: 51.5002,
    longitude: -2.7000,
    portCode: 'BRS',
    terminalName: 'Avonmouth Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi']
  },

  // Hull
  {
    id: 'hull-cruise-terminal',
    name: 'Hull Cruise Terminal',
    address: 'King George Dock, Hull HU9 5PX, UK',
    city: 'Hull',
    region: 'East Yorkshire',
    latitude: 53.7676,
    longitude: -0.3274,
    portCode: 'HUL',
    terminalName: 'King George Terminal',
    facilities: ['Parking', 'Shops', 'Restaurants', 'WiFi']
  }
];

/**
 * Convert cruise terminal to location suggestion format
 */
export function convertCruiseTerminalToLocationSuggestion(terminal: CruiseTerminal) {
  return {
    id: terminal.id,
    address: terminal.address,
    mainText: terminal.name,
    secondaryText: `${terminal.city}, ${terminal.region}`,
    name: terminal.name,
    latitude: terminal.latitude,
    longitude: terminal.longitude,
    coordinates: {
      lat: terminal.latitude,
      lng: terminal.longitude
    },
    metadata: {
      primaryType: 'cruise_terminal',
      postcode: terminal.address.split(' ').pop() || '',
      city: terminal.city,
      region: terminal.region,
      type: 'cruise_terminal',
      category: 'cruise_terminal',
      placeId: terminal.id,
      terminalId: terminal.portCode,
      terminalName: terminal.terminalName
    }
  };
}

/**
 * Search cruise terminals by query
 */
export function searchCruiseTerminals(query: string): CruiseTerminal[] {
  if (!query.trim()) {
    return UK_CRUISE_TERMINALS;
  }

  const searchTerm = query.toLowerCase();
  return UK_CRUISE_TERMINALS.filter(terminal =>
    terminal.name.toLowerCase().includes(searchTerm) ||
    terminal.city.toLowerCase().includes(searchTerm) ||
    terminal.region.toLowerCase().includes(searchTerm) ||
    terminal.address.toLowerCase().includes(searchTerm) ||
    terminal.portCode?.toLowerCase().includes(searchTerm)
  );
}

/**
 * Find cruise terminal by ID
 */
export function findCruiseTerminalById(id: string): CruiseTerminal | undefined {
  return UK_CRUISE_TERMINALS.find(terminal => terminal.id === id);
}
