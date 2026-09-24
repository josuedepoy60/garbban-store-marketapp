// Lieux d'Abidjan connus de l'app (coordonnées GPS réelles, arrondies).
// En attendant un service de géocodage, la recherche d'adresse se fait sur ce catalogue.

export type Side = 'nord' | 'sud';

export type Place = {
  id: string;
  name: string;
  /** Commune ou quartier, affiché sous le nom. */
  area: string;
  lat: number;
  lng: number;
  /** Rive de la lagune Ébrié : traverser de l'une à l'autre impose un pont. */
  side: Side;
};

export const PLACES: Place[] = [
  { id: 'riviera2', name: 'Riviera 2', area: 'Cocody', lat: 5.3633, lng: -3.9681, side: 'nord' },
  { id: 'bonoumin', name: 'Riviera Bonoumin', area: 'Cocody', lat: 5.3712, lng: -3.9606, side: 'nord' },
  { id: 'angre8', name: 'Angré 8e Tranche', area: 'Cocody', lat: 5.3985, lng: -3.9862, side: 'nord' },
  { id: 'deux-plateaux', name: 'Deux Plateaux', area: 'Cocody', lat: 5.3652, lng: -3.9998, side: 'nord' },
  { id: 'cocody-arts', name: 'Cité des Arts', area: 'Cocody', lat: 5.3455, lng: -3.9954, side: 'nord' },
  { id: 'ufhb', name: 'Université FHB', area: 'Cocody', lat: 5.3462, lng: -3.9851, side: 'nord' },
  { id: 'plateau-ccia', name: 'Plateau, Immeuble CCIA', area: 'Plateau', lat: 5.3246, lng: -4.0193, side: 'nord' },
  { id: 'plateau-postel', name: 'Postel 2001', area: 'Plateau', lat: 5.3198, lng: -4.0168, side: 'nord' },
  { id: 'adjame-gare', name: 'Gare d’Adjamé', area: 'Adjamé', lat: 5.3545, lng: -4.0228, side: 'nord' },
  { id: 'yop-siporex', name: 'Siporex', area: 'Yopougon', lat: 5.3378, lng: -4.0732, side: 'nord' },
  { id: 'abobo-gare', name: 'Gare d’Abobo', area: 'Abobo', lat: 5.4215, lng: -4.0176, side: 'nord' },
  { id: 'treichville', name: 'Palais des Sports', area: 'Treichville', lat: 5.2986, lng: -4.0088, side: 'sud' },
  { id: 'marcory-z4', name: 'Zone 4', area: 'Marcory', lat: 5.2941, lng: -3.9818, side: 'sud' },
  { id: 'cap-sud', name: 'Cap Sud', area: 'Marcory', lat: 5.2972, lng: -3.9912, side: 'sud' },
  { id: 'koumassi', name: 'Grand Carrefour', area: 'Koumassi', lat: 5.2963, lng: -3.9505, side: 'sud' },
  { id: 'aeroport', name: 'Aéroport FHB', area: 'Port-Bouët', lat: 5.2614, lng: -3.9263, side: 'sud' },
];

export const placeById = (id: string) => PLACES.find((p) => p.id === id);

export function getPlace(id: string): Place {
  const p = placeById(id);
  if (!p) throw new Error(`Lieu inconnu : ${id}`);
  return p;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ');

/** Recherche insensible aux accents sur le nom et la commune. */
export function searchPlaces(query: string, exclude: string[] = []): Place[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return PLACES.filter((p) => {
    if (exclude.includes(p.id)) return false;
    const hay = normalize(`${p.name} ${p.area}`);
    return words.every((w) => hay.includes(w));
  });
}

/** Libellé court : « Riviera 2 » ou « Zone 4, Marcory ». */
export const placeLabel = (p: Place) => (p.name.includes(p.area) || p.area === p.name ? p.name : `${p.name}, ${p.area}`);
