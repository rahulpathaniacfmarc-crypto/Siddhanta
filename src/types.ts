export interface BirthInfo {
  name: string;
  dob: string;
  tob: string;
  pob: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface LagnaInfo {
  sign: string;
  signNumber: number;
  degree: number;
  nakshatra: string;
  nakshatraLord: string;
}

export interface PlanetInfo {
  sign: string;
  signNumber: number;
  degree: number;
  house: number;
  nakshatra: string;
  nakshatraLord: string;
  dignity: string;
  isRetrograde: boolean;
  isCombust: boolean;
}

export interface DivisionalChart {
  lagna: number;
  Sun: number;
  Moon: number;
  Mars: number;
  Mercury: number;
  Jupiter: number;
  Venus: number;
  Saturn: number;
  Rahu: number;
  Ketu: number;
}

export interface YogaInfo {
  name: string;
  type: string;
  description: string;
  astrologicalRule: string;
  impact: string;
}

export interface DoshaInfo {
  name: string;
  description: string;
  impact: string;
}

export interface SubDasha {
  planet: string;
  startDate: string;
  endDate: string;
}

export interface VimshottariDasha {
  planet: string;
  startDate: string;
  endDate: string;
  subDashas: SubDasha[];
}

export interface ShadbalaInfo {
  Sun: number;
  Moon: number;
  Mars: number;
  Mercury: number;
  Jupiter: number;
  Venus: number;
  Saturn: number;
}

export interface AshtakavargaInfo {
  Sun: number[];
  Moon: number[];
  Mars: number[];
  Mercury: number[];
  Jupiter: number[];
  Venus: number[];
  Saturn: number[];
  Sarvashtakavarga: number[];
}

export interface KundliData {
  birthInfo: BirthInfo;
  lagna: LagnaInfo;
  planets: {
    Sun: PlanetInfo;
    Moon: PlanetInfo;
    Mars: PlanetInfo;
    Mercury: PlanetInfo;
    Jupiter: PlanetInfo;
    Venus: PlanetInfo;
    Saturn: PlanetInfo;
    Rahu: PlanetInfo;
    Ketu: PlanetInfo;
    [key: string]: any;
  };
  divisionalCharts: {
    D1: DivisionalChart;
    D9: DivisionalChart;
    D10: DivisionalChart;
  };
  yogas: YogaInfo[];
  doshas: DoshaInfo[];
  vimshottariDasha: VimshottariDasha[];
  shadbala: ShadbalaInfo;
  ashtakavarga: AshtakavargaInfo;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "astrologer";
  text: string;
  timestamp: string;
}

export interface Suggestion {
  id?: string;
  name: string;
  email: string;
  phone: string;
  suggestion: string;
  timestamp: string;
}

