// Données de démonstration reprises des maquettes, en attendant le branchement d'un backend.

export const user = {
  name: 'Jean-Philippe Kouassi',
  phone: '+225 07 48 92 89 24',
  emailFull: 'j.kouassi@email.ci',
  email: 'j.k****@email.ci',
  maskedPhone: '+225 07 •• •• 89 24',
  loyaltyPoints: 1420,
  balance: 15750,
  location: 'Cocody, Riviera 2',
};

export const favoriteDriver = {
  name: 'Koffi T.',
  fullName: 'Koffi Traoré',
  shortCar: 'Toyota Yaris Blanche',
  rating: '4,9',
  trips: '850+',
  car: 'Toyota Yaris Sedan · Blanche',
  plate: '8841 JJ 01',
  ridesTogether: 12,
  fromPrice: '1 400 F',
};

export const quickPlaces = [
  { icon: 'home', label: 'Maison', address: 'Riviera Bonoumin', tone: 'primary' },
  { icon: 'work', label: 'Bureau', address: 'Plateau, Immeuble CCIA', tone: 'secondary' },
  { icon: 'local-mall', label: 'Cap Sud', address: 'Marcory', tone: 'tertiary' },
] as const;

export type VehicleKind = 'sedan' | 'suv' | 'van' | 'moto';

export const vehicles: {
  id: string;
  name: string;
  kind: VehicleKind;
  seats: number;
  description: string;
  eta: string;
  fast: boolean;
  price: number;
  airCon?: boolean;
  recommended?: boolean;
}[] = [
  { id: 'eco', name: 'Eco', kind: 'sedan', seats: 4, description: 'Toyota Corolla ou équivalent', eta: 'Dans 2 min', fast: true, price: 4800, recommended: true },
  { id: 'confort', name: 'Confort', kind: 'suv', seats: 4, description: 'Climatisation garantie · SUV', eta: 'Dans 4 min', fast: false, price: 6200, airCon: true },
  { id: 'van', name: 'Van Familial', kind: 'van', seats: 7, description: 'Grand coffre · Minibus', eta: 'Dans 7 min', fast: false, price: 8500 },
  { id: 'moto', name: 'Moto Express', kind: 'moto', seats: 1, description: 'Casque fourni · Anti-embouteillage', eta: 'Dans 1 min', fast: true, price: 2100 },
];

export const carModels = ['Peu importe', 'Hyundai Tucson', 'Toyota RAV4', 'Kia Sportage', 'Mercedes Classe C'];

export const departures = [
  {
    id: 'l82',
    line: 'Ligne 82',
    style: 'vip',
    badge: 'Climatisé',
    price: 500,
    route: 'Adjamé Gare → Yopougon Siporex',
    arrival: '4 min',
    time: '14:38',
    seats: '14 places assises libres',
    full: false,
  },
  {
    id: 'g14',
    line: 'Gbaka G-14',
    style: 'gbaka',
    badge: 'Voie Express',
    price: 350,
    route: 'Riviera 2 → Plateau Postel 2001',
    arrival: '8 min',
    seats: '3 places restantes',
    full: false,
  },
  {
    id: 'b205',
    line: 'Bus 205',
    style: 'bus',
    badge: 'SOTRA Express',
    price: 200,
    route: 'Cocody Cité des Arts → Treichville',
    arrival: '12 min',
    seats: 'Complet (0 place)',
    full: true,
  },
] as const;

// 15750 → « 15 750 » (sans dépendre d'Intl, absent de certains moteurs JS).
export const formatAmount = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
