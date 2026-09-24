// Données de démonstration reprises des maquettes, en attendant le branchement d'un backend.

const img = (id: string) => `https://lh3.googleusercontent.com/aida-public/${id}`;

export const photos = {
  profile: img(
    'AB6AXuDjo5gKRh6ZtWr1VG1_RP1yINl8rOBrKfJyH2w0VpsgXT6GOl7EjLVLJLSoUFUkOTmh0vXhHIneC_U44eYqmKAyTXMmARZM3x55VP9KwNZSQUPhn1Amj3zHCfZlnqicuKl5025JGVuH4Zm7LBanh31NVq2Dtsx33ydTiiwtgVlUIuJYVfWtjvmkLLH5dHpc5IAlubr3CLRQGR1BWNVau4aqVnVMP5L_46x-gHTmLZk9u4fanjufd73D',
  ),
  user: img(
    'AB6AXuAyS-D64MAnvm9qmo8OX8AgEndvZ0z1-26li-sWyVRymK6LI1Da_wu0pxoiEHsVhDKj2x9PZXgtlvbOo14RlwAa7tqwRKNPcN5jgwL53t4at-CxaNHrEXoqvOjCeMx1u7AQ70LPSZLxXt0vD54bUmjZFV3mOU7CU76-XhHjVN03Vv7J10lpzZTqOXgOZ2keylTLMb0jf5NjVrhnwr-HkA7lOjx509eWJ-UjhNILvTtKp9p3ebvsT2gl',
  ),
  koffi: img(
    'AB6AXuAzFoWNyTVcpnjvhbQpt0pD_mXFzbh-ZluysV7XqwGbmdSdKRCN9-WAI14KNod2D9rUZNHMsDHlNImhn-dcuPk-kwTRViimWahZNj6-Lm15q7M0oczsYgd0dyd7pwfiLBYNHaL8S2JXREC8E66Cofd3SmpEHe2LXESlsEy9z1EYw5VTzrA29jWBs2QNIQ6TDA_bORNm8mo1HKPpkG9e9O3pah87LNNyraaKioHFzMBT3gkzWVauwj_q',
  ),
  koffiDriving: img(
    'AB6AXuC8a-X9E_HN87cGPCGfaiMN22ckfnJZCvoAeAuL5YjVNLS0XCUbqyQyOmeeIakcOiz6-F6DnzoppS9U1R90V8s-W2AFY18-xaUrng6xbMBYMghEvnlf0zLUAqmJ8eMbdgjxfD8jADC0hFbUnIID3WghGOvwNbIiXBq9a7AtP6I2Uer_IQ4k8bZNM5ZEoXNxqNEIuAFx5gVo4qXdbkj9GLJBAVVUqTaisOyn_cFMcJZNLWz2Td3gnLTm',
  ),
  awa: img(
    'AB6AXuCsA8i-_X_KIa8QqZzyHFZB3Fc4Wurnq60H1uH3vVmh3RDqwTZRWYFjr9MpNAIzVvvDjIpI5Ph4XEED6VZaCBKeYwYlgUp9PiGuJEVDgd6eGFZ-UAJwABWON060HHTgBy2BG0HGOXqLA5bPa5lfY1EHuxriYxS4YFSk86V8v2BVQGs-Uu14Gewu42W60SP1UlQp4pBmehofntmD2uvG-ev_350aKX6pPfAs5QCORVugQmw13CQcBpfc',
  ),
  maman: img(
    'AB6AXuD7H6FRaOxm5A1SFhDZSGtBiXhCjH0FitPeB1fXtD-GKgaPb0qxgRIoZsp1F2VAHM2kIVMgurD4heSH8xIqMFO8XJ8V3DZ0dc3c8psxO05CyR75E2GKkqdiDAw_XMpfCfXIYTlDA-MOhFNsawnyBr4PjZ5olePqAVyjhQMcsHERezTcEpq8cG6FqUXlQ-my1i5i4XxN80EwLdUaUDIVusOUXO6FfSqTP8bvtcOZ6TBOmFiuegdWG_UZ',
  ),
};

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
