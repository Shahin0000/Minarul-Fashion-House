export interface DivisionData {
  id: string;
  nameEn: string;
  nameBn: string;
  districts: { id: string; nameEn: string; nameBn: string }[];
}

export const bangladeshDivisions: DivisionData[] = [
  {
    id: 'dhaka',
    nameEn: 'Dhaka',
    nameBn: 'ঢাকা',
    districts: [
      { id: 'dhaka-city', nameEn: 'Dhaka City (ঢাকা সিটি)', nameBn: 'ঢাকা সিটি' },
      { id: 'gazipur', nameEn: 'Gazipur (গাজীপুর)', nameBn: 'গাজীপুর' },
      { id: 'narayanganj', nameEn: 'Narayanganj (নারায়ণগঞ্জ)', nameBn: 'নারায়ণগঞ্জ' },
      { id: 'tangail', nameEn: 'Tangail (টাঙ্গাইল)', nameBn: 'টাঙ্গাইল' },
      { id: 'narsingdi', nameEn: 'Narsingdi (নরসিংদী)', nameBn: 'নরসিংদী' },
      { id: 'faridpur', nameEn: 'Faridpur (ফরিদপুর)', nameBn: 'ফরিদপুর' },
      { id: 'kishoreganj', nameEn: 'Kishoreganj (কিশোরগঞ্জ)', nameBn: 'কিশোরগঞ্জ' },
      { id: 'manikganj', nameEn: 'Manikganj (মানিকগঞ্জ)', nameBn: 'মানিকগঞ্জ' },
      { id: 'munshiganj', nameEn: 'Munshiganj (মুন্সীগঞ্জ)', nameBn: 'মুন্সীগঞ্জ' },
      { id: 'rajbari', nameEn: 'Rajbari (রাজবাড়ী)', nameBn: 'রাজবাড়ী' },
      { id: 'madaripur', nameEn: 'Madaripur (মাদারীপুর)', nameBn: 'মাদারীপুর' },
      { id: 'gopalganj', nameEn: 'Gopalganj (গোপালগঞ্জ)', nameBn: 'গোপালগঞ্জ' },
      { id: 'shariatpur', nameEn: 'Shariatpur (শরীয়তপুর)', nameBn: 'শরীয়তপুর' },
    ],
  },
  {
    id: 'chittagong',
    nameEn: 'Chittagong',
    nameBn: 'চট্টগ্রাম',
    districts: [
      { id: 'chittagong-city', nameEn: 'Chittagong City (চট্টগ্রাম সিটি)', nameBn: 'চট্টগ্রাম সিটি' },
      { id: 'coxsbazar', nameEn: "Cox's Bazar (কক্সবাজার)", nameBn: 'কক্সবাজার' },
      { id: 'comilla', nameEn: 'Cumilla (কুমিল্লা)', nameBn: 'কুমিল্লা' },
      { id: 'feni', nameEn: 'Feni (ফেনী)', nameBn: 'ফেনী' },
      { id: 'brahmanbaria', nameEn: 'Brahmanbaria (ব্রাহ্মণবাড়িয়া)', nameBn: 'ব্রাহ্মণবাড়িয়া' },
      { id: 'noakhali', nameEn: 'Noakhali (নোয়াখালী)', nameBn: 'নোয়াখালী' },
      { id: 'chandpur', nameEn: 'Chandpur (চাঁদপুর)', nameBn: 'চাঁদপুর' },
      { id: 'lakshmipur', nameEn: 'Lakshmipur (লক্ষ্মীপুর)', nameBn: 'লক্ষ্মীপুর' },
      { id: 'rangamati', nameEn: 'Rangamati (রাঙ্গামাটি)', nameBn: 'রাঙ্গামাটি' },
      { id: 'bandarban', nameEn: 'Bandarban (বান্দরবান)', nameBn: 'বান্দরবান' },
      { id: 'khagrachari', nameEn: 'Khagrachari (খাগড়াছড়ি)', nameBn: 'খাগড়াছড়ি' },
    ],
  },
  {
    id: 'rajshahi',
    nameEn: 'Rajshahi',
    nameBn: 'রাজশাহী',
    districts: [
      { id: 'rajshahi-city', nameEn: 'Rajshahi City (রাজশাহী সিটি)', nameBn: 'রাজশাহী সিটি' },
      { id: 'bogra', nameEn: 'Bogura (বগুড়া)', nameBn: 'বগুড়া' },
      { id: 'pabna', nameEn: 'Pabna (পাবনা)', nameBn: 'পাবনা' },
      { id: 'sirajganj', nameEn: 'Sirajganj (সিরাজগঞ্জ)', nameBn: 'সিরাজগঞ্জ' },
      { id: 'naogaon', nameEn: 'Naogaon (নওগাঁ)', nameBn: 'নওগাঁ' },
      { id: 'natore', nameEn: 'Natore (নাটোর)', nameBn: 'নাটোর' },
      { id: 'chapainawabganj', nameEn: 'Chapai Nawabganj (চাঁপাইনবাবগঞ্জ)', nameBn: 'চাঁপাইনবাবগঞ্জ' },
      { id: 'joypurhat', nameEn: 'Joypurhat (জয়পুরহাট)', nameBn: 'জয়পুরহাট' },
    ],
  },
  {
    id: 'khulna',
    nameEn: 'Khulna',
    nameBn: 'খুলনা',
    districts: [
      { id: 'khulna-city', nameEn: 'Khulna City (খুলনা সিটি)', nameBn: 'খুলনা সিটি' },
      { id: 'jessore', nameEn: 'Jashore (যশোর)', nameBn: 'যশোর' },
      { id: 'kushtia', nameEn: 'Kushtia (কুষ্টিয়া)', nameBn: 'কুষ্টিয়া' },
      { id: 'satkhira', nameEn: 'Satkhira (সাতক্ষীরা)', nameBn: 'সাতক্ষীরা' },
      { id: 'bagerhat', nameEn: 'Bagerhat (বাগেরহাট)', nameBn: 'বাগেরহাট' },
      { id: 'chuadanga', nameEn: 'Chuadanga (চুয়াডাঙ্গা)', nameBn: 'চুয়াডাঙ্গা' },
      { id: 'jhenaidah', nameEn: 'Jhenaidah (ঝিনাইদহ)', nameBn: 'ঝিনাইদহ' },
      { id: 'magura', nameEn: 'Magura (মাগুরা)', nameBn: 'মাগুরা' },
      { id: 'meherpur', nameEn: 'Meherpur (মেহেরপুর)', nameBn: 'মেহেরপুর' },
      { id: 'narail', nameEn: 'Narail (নড়াইল)', nameBn: 'নড়াইল' },
    ],
  },
  {
    id: 'sylhet',
    nameEn: 'Sylhet',
    nameBn: 'সিলেট',
    districts: [
      { id: 'sylhet-city', nameEn: 'Sylhet City (সিলেট সিটি)', nameBn: 'সিলেট সিটি' },
      { id: 'moulvibazar', nameEn: 'Moulvibazar (মৌলভীবাজার)', nameBn: 'মৌলভীবাজার' },
      { id: 'habiganj', nameEn: 'Habiganj (হবিগঞ্জ)', nameBn: 'হবিগঞ্জ' },
      { id: 'sunamganj', nameEn: 'Sunamganj (সুনামগঞ্জ)', nameBn: 'সুনামগঞ্জ' },
    ],
  },
  {
    id: 'barishal',
    nameEn: 'Barishal',
    nameBn: 'বরিশাল',
    districts: [
      { id: 'barishal-city', nameEn: 'Barishal City (বরিশাল সিটি)', nameBn: 'বরিশাল সিটি' },
      { id: 'patuakhali', nameEn: 'Patuakhali (পটুয়াখালী)', nameBn: 'পটুয়াখালী' },
      { id: 'bhola', nameEn: 'Bhola (ভোলা)', nameBn: 'ভোলা' },
      { id: 'pirojpur', nameEn: 'Pirojpur (পিরোজপুর)', nameBn: 'পিরোজপুর' },
      { id: 'barguna', nameEn: 'Barguna (বরগুনা)', nameBn: 'বরগুনা' },
      { id: 'jhalokati', nameEn: 'Jhalokati (ঝালকাঠি)', nameBn: 'ঝালকাঠি' },
    ],
  },
  {
    id: 'rangpur',
    nameEn: 'Rangpur',
    nameBn: 'রংপুর',
    districts: [
      { id: 'rangpur-city', nameEn: 'Rangpur City (রংপুর সিটি)', nameBn: 'রংপুর সিটি' },
      { id: 'dinajpur', nameEn: 'Dinajpur (দিনাজপুর)', nameBn: 'দিনাজপুর' },
      { id: 'gaibandha', nameEn: 'Gaibandha (গাইবান্ধা)', nameBn: 'গাইবান্ধা' },
      { id: 'kurigram', nameEn: 'Kurigram (কুড়িগ্রাম)', nameBn: 'কুড়িগ্রাম' },
      { id: 'lalmonirhat', nameEn: 'Lalmonirhat (লালমনিরহাট)', nameBn: 'লালমনিরহাট' },
      { id: 'nilphamari', nameEn: 'Nilphamari (নীলফামারী)', nameBn: 'নীলফামারী' },
      { id: 'panchagarh', nameEn: 'Panchagarh (পঞ্চগড়)', nameBn: 'পঞ্চগড়' },
      { id: 'thakurgaon', nameEn: 'Thakurgaon (ঠাকুরগাঁও)', nameBn: 'ঠাকুরগাঁও' },
    ],
  },
  {
    id: 'mymensingh',
    nameEn: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    districts: [
      { id: 'mymensingh-city', nameEn: 'Mymensingh City (ময়মনসিংহ সিটি)', nameBn: 'ময়মনসিংহ সিটি' },
      { id: 'jamalpur', nameEn: 'Jamalpur (জামালপুর)', nameBn: 'জামালপুর' },
      { id: 'netrokona', nameEn: 'Netrokona (নেত্রকোণা)', nameBn: 'নেত্রকোণা' },
      { id: 'sherpur', nameEn: 'Sherpur (শেরপুর)', nameBn: 'শেরপুর' },
    ],
  },
];

export function calculateDeliveryFee(districtId: string): number {
  if (!districtId) return 60;
  // Dhaka city and adjacent zones standard delivery is 60, elsewhere in BD is 120
  if (districtId === 'dhaka-city' || districtId === 'gazipur' || districtId === 'narayanganj') {
    return 60;
  }
  return 120;
}

export interface FlatDistrict {
  id: string;
  nameEn: string;
  nameBn: string;
  cleanNameEn: string;
  cleanNameBn: string;
  divisionId: string;
  divisionNameBn: string;
  divisionNameEn: string;
}

export const allBangladeshDistricts: FlatDistrict[] = bangladeshDivisions.flatMap((div) =>
  div.districts.map((d) => {
    // e.g. "Khulna City (খুলনা সিটি)" -> "Khulna City" & "Khulna"
    const englishMain = d.nameEn.split('(')[0].trim().replace(/\s+City$/i, '');
    const bengaliMain = d.nameBn.replace(/\s+সিটি$/, '').trim();
    return {
      id: d.id,
      nameEn: d.nameEn,
      nameBn: d.nameBn,
      cleanNameEn: englishMain || d.nameEn,
      cleanNameBn: bengaliMain || d.nameBn,
      divisionId: div.id,
      divisionNameBn: div.nameBn,
      divisionNameEn: div.nameEn,
    };
  })
);

/**
 * Normalizes any raw district input (English or Bengali, case-insensitive, with/without punctuation or City suffix)
 * to match exact district entry or canonical name.
 */
export function normalizeDistrictName(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  const cleanKey = lower.replace(/[-_.,() ]/g, '');

  // 1. Direct match with id, nameBn, or cleanNameBn
  for (const d of allBangladeshDistricts) {
    if (d.nameBn === trimmed || d.cleanNameBn === trimmed || d.id === lower) {
      return d.cleanNameBn;
    }
  }

  // 2. Exact match with cleanNameEn or cleanKey
  for (const d of allBangladeshDistricts) {
    if (d.cleanNameEn.toLowerCase() === lower || d.nameEn.toLowerCase() === lower) {
      return d.cleanNameBn;
    }
    const dIdClean = d.id.replace(/[-_.,() ]/g, '').toLowerCase();
    const dEnClean = d.cleanNameEn.replace(/[-_.,() ]/g, '').toLowerCase();
    if (cleanKey === dIdClean || cleanKey === dEnClean) {
      return d.cleanNameBn;
    }
  }

  // 3. Substring matching (e.g. "khulna" in "Khulna City" or "খুলনা" in "খুলনা সিটি")
  for (const d of allBangladeshDistricts) {
    const dEnClean = d.cleanNameEn.toLowerCase();
    if (dEnClean.includes(lower) || lower.includes(dEnClean)) {
      return d.cleanNameBn;
    }
    if (d.nameBn.includes(trimmed) || trimmed.includes(d.nameBn) || d.cleanNameBn.includes(trimmed)) {
      return d.cleanNameBn;
    }
  }

  return trimmed;
}

