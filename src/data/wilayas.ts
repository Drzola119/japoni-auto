// Clean WILAYAS list for dropdowns (without numbers)
export const WILAYAS = [
  'Adrar',
  'Chlef',
  'Laghouat',
  'Oum El Bouaghi',
  'Batna',
  'Béjaïa',
  'Biskra',
  'Béchar',
  'Blida',
  'Bouïra',
  'Tamanrasset',
  'Tébessa',
  'Tlemcen',
  'Tiaret',
  'Tizi Ouzou',
  'Alger',
  'Djelfa',
  'Jijel',
  'Sétif',
  'Saïda',
  'Skikda',
  'Sidi Bel Abbès',
  'Annaba',
  'Guelma',
  'Constantine',
  'Médéa',
  'Mostaganem',
  "M'Sila",
  'Mascara',
  'Ouargla',
  'Oran',
  'El Bayadh',
  'Illizi',
  'Bordj Bou Arréridj',
  'Boumerdès',
  'El Tarf',
  'Tindouf',
  'Tissemsilt',
  'El Oued',
  'Khenchela',
  'Souk Ahras',
  'Tipaza',
  'Mila',
  'Aïn Defla',
  'Naâma',
  'Aïn Témouchent',
  'Ghardaïa',
  'Relizane',
  'Timimoun',
  'Bordj Badji Mokhtar',
  'Ouled Djellal',
  'Béni Abbès',
  'In Salah',
  'In Guezzam',
  'Touggourt',
  'Djanet',
  'El M\'Ghair',
  'El Meniaa',
  'Aflou',
  'Barika',
  'Ksar Chellala',
  'Messaad',
  'Aïn Oussera',
  'Bou Saâda',
  'El Abiodh Sidi Cheikh',
  'El Kantara',
  'Bir El Ater',
  'Ksar El Boukhari',
  'El Aricha',
] as const;

export type WILAYA = (typeof WILAYAS)[number];

// WILAYAS with numbers (legacy format for backwards compatibility)
export const WILAYAS_WITH_NUMBERS = [
  '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna',
  '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouïra',
  '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou',
  '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
  '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine',
  '26 - Médéa', '27 - Mostaganem', "28 - M'Sila", '29 - Mascara', '30 - Ouargla',
  '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arréridj', '35 - Boumerdès',
  '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
  '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma',
  '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane',
  '49 - Timimoun', '50 - Bordj Badji Mokhtar', '51 - Ouled Djellal', '52 - Béni Abbès', '53 - In Salah',
  '54 - In Guezzam', '55 - Touggourt', '56 - Djanet', '57 - El M\'Ghair', '58 - El Meniaa',
  '59 - Aflou', '60 - Barika', '61 - Ksar Chellala', '62 - Messaad', '63 - Aïn Oussera',
  '64 - Bou Saâda', '65 - El Abiodh Sidi Cheikh', '66 - El Kantara', '67 - Bir El Ater',
  '68 - Ksar El Boukhari', '69 - El Aricha',
] as const;

// Helper to convert between formats
export function wilayaToNumber(wilaya: string): string {
  const index = WILAYAS.indexOf(wilaya as WILAYA);
  if (index === -1) return wilaya;
  return `0${index + 1}`.slice(-2) + ' - ' + wilaya;
}

export function wilayaFromNumber(wilayaWithNumber: string): string {
  const match = wilayaWithNumber.match(/^\d+ - (.+)$/);
  return match ? match[1] : wilayaWithNumber;
}

export default WILAYAS;