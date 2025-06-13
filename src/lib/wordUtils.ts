import type { Puzzle } from '../types/index';

// List of offensive words to filter out (case-insensitive)
const OFFENSIVE_WORDS = new Set([
  'chink', 'chinks', 'chinky',
  'spic', 'spick', 'spik', 'spig',
  'kike', 'kikes',
  'wop', 'wops',
  'dago', 'dagos',
  'kraut', 'krauts',
  'jap', 'japs',
  'gook', 'gooks',
  'gyp', 'gyps', 'gypped',
  'wetback', 'wetbacks',
  'towelhead', 'towelheads',
  'sandnigger', 'sandniggers',
  'spook', 'spooks',
  'coon', 'coons',
  'jigaboo', 'jigaboos',
  'porchmonkey', 'porchmonkeys',
  'paki', 'pakis',
  'raghead', 'ragheads',
  'tarbaby', 'tarbabies',
  'zipperhead', 'zipperheads',
  'golliwog', 'golliwogs',
  'sambo', 'sambos',
  'mick', 'micks',
  'dink', 'dinks',
  'gook', 'gooks',
  'guido', 'guidos',
  'hymie', 'hymies',
  'kyke', 'kykes',
  'mickey', 'mickeys',
  'nazi', 'nazis',
  'polack', 'polacks',
  'redskin', 'redskins',
  'squaw', 'squaws',
  'tard', 'tards',
  'tranny', 'trannies'
].map(word => word.toUpperCase()));

// Add type declaration for seedrandom
declare global {
  interface Math {
    seedrandom?: (seed: string) => void;
  }
}

// Static word lists for fallback and initial puzzles
const STATIC_WORD_LISTS = {
  3: [
    ['CAT', 'COT', 'DOT', 'DOG'],
    ['HOT', 'HOP', 'MOP', 'MAP'],
    ['BIG', 'BAG', 'BAT', 'CAT'],
    ['DOG', 'DOE', 'TOE', 'TOO', 'TOO'],
    ['PIG', 'BIG', 'BAG', 'BAT', 'CAT'],
    ['SUN', 'GUN', 'GUT', 'GOT', 'DOT', 'DOG']
  ],
  4: [
    ['COLD', 'CORD', 'CARD', 'WARD', 'WARM'],
    ['FISH', 'DISH', 'DASH', 'DARN', 'YARN'],
    ['WIND', 'WILD', 'WILE', 'WILL', 'WALL'],
    ['LOVE', 'LIVE', 'LIME', 'LAME', 'LAMB', 'LAMP'],
    ['FOUR', 'FOUL', 'FOOL', 'FOOT', 'FOOD', 'GOOD', 'WOOD'],
    ['HEAD', 'HEAL', 'HEAT', 'MEAT', 'MEET', 'MELT', 'MELD', 'MOLD', 'MOOD']
  ],
  5: [
    ['CRANE', 'CRANK', 'CRACK', 'TRACK', 'TRACE'],
    ['PLATE', 'PLACE', 'PLANE', 'PLANK', 'BLANK'],
    ['STONE', 'ATONE', 'ATONY', 'PEONY', 'PENNY'],
    ['HEART', 'HEARD', 'HEARD', 'HEARD', 'HEARD'],
    ['CLOUD', 'CLOUT', 'FLOUT', 'FLOOR', 'FLOOD'],
    ['BLACK', 'CLACK', 'CLICK', 'CHICK', 'CHINK', 'CHINA', 'CHINE', 'CHILE', 'CHILD'],
    ['WHITE', 'WHILE', 'WHALE', 'SHALE', 'SHALT', 'SHANT', 'CHANT', 'CHART', 'CHARM', 'CHIRP']
  ],
  6: [
    ['BOTANY', 'COTTON', 'COLTON', 'COLTON', 'COLTON', 'COLTON'],
    ['LETTER', 'BETTER', 'BETTOR', 'BETTAS', 'BETTAS', 'BETTAS'],
    ['SIMPLE', 'SAMPLE', 'SAMPLE', 'SAMPLE', 'SAMPLE', 'SAMPLE']
  ]
};

// In-memory word lists by length (3-8 letters)
const DYNAMIC_WORD_LISTS: Record<number, Set<string>> = {
  3: new Set(),
  4: new Set(),
  5: new Set(),
  6: new Set(),
  7: new Set(),
  8: new Set()
};

// Dictionary of all words (static and dynamic)
const DICTIONARY = new Set<string>();

// Function to initialize the dictionary
const initializeDictionary = () => {
  // Clear existing entries
  DICTIONARY.clear();
  
  // Add all words from DYNAMIC_WORD_LISTS
  for (const wordSet of Object.values(DYNAMIC_WORD_LISTS)) {
    for (const word of wordSet) {
      if (word) {  // Ensure word is not empty
        DICTIONARY.add(word.toUpperCase());
      }
    }
  }
  
  console.log(`Dictionary initialized with ${DICTIONARY.size} words`);
  
  // Log some sample words for debugging
  const sampleWords = Array.from(DICTIONARY).slice(0, 10);
  console.log('Sample words in dictionary:', sampleWords);
};

// Common English words for our word lists (expanded and filtered)
// Excluding obscure words and focusing on more common vocabulary
const COMMON_WORDS = [
  // 3-letter words (expanded)
  'AAH', 'AAS', 'ABA', 'ABB', 'ABO', 'ABS', 'ABY', 'ACE', 'ACH', 'ACT', 
  'ADD', 'ADO', 'ADS', 'ADZ', 'AFF', 'AFT', 'AGA', 'AGE', 'AGO', 'AGS', 
  'AHA', 'AHI', 'AHS', 'AIA', 'AID', 'AIL', 'AIM', 'AIN', 'AIR', 'AIS', 
  'AIT', 'AKA', 'ALA', 'ALB', 'ALE', 'ALL', 'ALP', 'ALS', 'ALT', 'AMA', 
  'AMI', 'AMP', 'AMU', 'ANA', 'AND', 'ANE', 'ANI', 'ANN', 'ANT', 'ANY', 
  'APE', 'APO', 'APP', 'APT', 'ARB', 'ARC', 'ARD', 'ARE', 'ARF', 'ARK', 
  'ARM', 'ARS', 'ART', 'ASH', 'ASK', 'ASP', 'ASS', 'ATE', 'ATS', 'ATT', 
  'AUE', 'AUX', 'AVA', 'AVE', 'AVO', 'AWA', 'AWE', 'AWK', 'AWL', 'AWN', 
  'AXE', 'AYE', 'AYS', 'AYU', 'AZO', 'BAA', 'BAC', 'BAD', 'BAG', 'BAH', 
  'BAL', 'BAM', 'BAN', 'BAP', 'BAR', 'BAS', 'BAT', 'BAY', 'BED', 'BEE', 
  'BEG', 'BEN', 'BES', 'BET', 'BEY', 'BIB', 'BID', 'BIG', 'BIN', 'BIO', 
  'BIS', 'BIT', 'BIZ', 'BOA', 'BOB', 'BOD', 'BOG', 'BOH', 'BOI', 'BOK', 
  'BON', 'BOO', 'BOP', 'BOR', 'BOS', 'BOT', 'BOW', 'BOX', 'BOY', 'BRA', 
  'BRO', 'BRR', 'BRU', 'BUB', 'BUD', 'BUG', 'BUM', 'BUN', 'BUR', 'BUS', 
  'BUT', 'BUY', 'BYE', 'BYS', 'CAB', 'CAD', 'CAM', 'CAN', 'CAP', 'CAR', 
  'CAT', 'CAW', 'CAY', 'CEE', 'CEL', 'CEP', 'CHA', 'CHE', 'CHI', 'CIG', 
  'CIS', 'CIT', 'CLY', 'COB', 'COD', 'COG', 'COL', 'CON', 'COO', 'COP', 
  'COR', 'COS', 'COT', 'COW', 'COX', 'COY', 'COZ', 'CRU', 'CRY', 'CUB', 
  'CUD', 'CUE', 'CUM', 'CUP', 'CUR', 'CUT', 'CWM', 'DAB', 'DAD', 'DAE', 
  'DAG', 'DAH', 'DAK', 'DAL', 'DAM', 'DAN', 'DAP', 'DAW', 'DAY', 'DEB', 
  'DEE', 'DEF', 'DEG', 'DEI', 'DEL', 'DEN', 'DEV', 'DEW', 'DEX', 'DEY', 
  'DIB', 'DID', 'DIE', 'DIF', 'DIG', 'DIM', 'DIN', 'DIP', 'DIS', 'DIT', 
  'DOC', 'DOE', 'DOG', 'DOH', 'DOL', 'DOM', 'DON', 'DOO', 'DOP', 'DOR', 
  'DOS', 'DOT', 'DOW', 'DRY', 'DSO', 'DUB', 'DUD', 'DUE', 'DUG', 'DUH', 
  'DUI', 'DUM', 'DUN', 'DUO', 'DUP', 'DYE', 'DZO', 'EAN', 'EAR', 'EAS', 
  'EAT', 'EAU', 'EBB', 'ECH', 'ECO', 'ECU', 'EDH', 'EDS', 'EEK', 'EEL', 
  'EEN', 'EFF', 'EFS', 'EFT', 'EGG', 'EGO', 'EHS', 'EIK', 'EKE', 'ELD', 
  'ELF', 'ELK', 'ELL', 'ELM', 'ELS', 'EME', 'EMO', 'EMS', 'EMU', 'END', 
  'ENG', 'ENS', 'EON', 'ERA', 'ERE', 'ERF', 'ERG', 'ERK', 'ERN', 'ERR', 
  'ERS', 'ESS', 'EST', 'ETA', 'ETH', 'EUK', 'EVE', 'EWE', 'EWK', 'EWT', 
  'EXO', 'EYE', 'EYG', 'EYR', 'FAA', 'FAB', 'FAD', 'FAE', 'FAG', 'FAH', 
  'FAN', 'FAP', 'FAR', 'FAS', 'FAT', 'FAW', 'FAX', 'FAY', 'FED', 'FEE', 
  'FEG', 'FEH', 'FEM', 'FEN', 'FER', 'FES', 'FET', 'FEU', 'FEW', 'FEY', 
  'FEZ', 'FIB', 'FID', 'FIE', 'FIG', 'FIL', 'FIN', 'FIR', 'FIT', 'FIX', 
  'FIZ', 'FLU', 'FLY', 'FOB', 'FOE', 'FOG', 'FOH', 'FON', 'FOP', 'FOR', 
  'FOU', 'FOX', 'FOY', 'FRA', 'FRY', 'FUB', 'FUD', 'FUG', 'FUN', 'FUR', 
  'GAB', 'GAD', 'GAE', 'GAG', 'GAL', 'GAM', 'GAN', 'GAP', 'GAR', 'GAS', 
  'GAT', 'GAU', 'GAY', 'GED', 'GEE', 'GEL', 'GEM', 'GEN', 'GET', 'GEY', 
  'GHI', 'GIB', 'GID', 'GIE', 'GIF', 'GIG', 'GIN', 'GIO', 'GIP', 'GIS', 
  'GIT', 'GJU', 'GNU', 'GOA', 'GOB', 'GOD', 'GOE', 'GON', 'GOO', 'GOR', 
  'GOS', 'GOT', 'GOV', 'GOX', 'GOY', 'GRR', 'GUB', 'GUE', 'GUL', 'GUM', 
  'GUN', 'GUP', 'GUR', 'GUS', 'GUT', 'GUV', 'GUY', 'GYM', 'GYP', 'HAD', 
  'HAE', 'HAG', 'HAH', 'HAJ', 'HAM', 'HAN', 'HAO', 'HAP', 'HAS', 'HAT', 
  'HAW', 'HAY', 'HEH', 'HEM', 'HEN', 'HEP', 'HER', 'HES', 'HET', 'HEW', 
  'HEX', 'HEY', 'HIC', 'HID', 'HIE', 'HIM', 'HIN', 'HIP', 'HIS', 'HIT', 
  'HMM', 'HOA', 'HOB', 'HOC', 'HOD', 'HOE', 'HOG', 'HOH', 'HOI', 'HOM', 
  'HON', 'HOO', 'HOP', 'HOS', 'HOT', 'HOV', 'HOW', 'HOX', 'HOY', 'HUB', 
  'HUE', 'HUG', 'HUH', 'HUI', 'HUM', 'HUN', 'HUP', 'HUT', 'HYE', 'HYP', 
  'ICE', 'ICH', 'ICK', 'ICY', 'IDE', 'IDS', 'IFF', 'IGG', 'ILK', 'ILL', 
  'IMP', 'ING', 'INK', 'INN', 'INS', 'ION', 'IOS', 'IRE', 'IRK', 'ISH', 
  'ISM', 'ISO', 'ITA', 'ITS', 'IVY', 'IWI', 'JAB', 'JAG', 'JAM', 'JAP', 
  'JAR', 'JAW', 'JAY', 'JEE', 'JET', 'JEU', 'JEW', 'JIG', 'JIN', 'JIZ', 
  'JOB', 'JOE', 'JOG', 'JOL', 'JOR', 'JOT', 'JOW', 'JOY', 'JUD', 'JUG', 
  'JUN', 'JUS', 'JUT', 'KAB', 'KAE', 'KAF', 'KAI', 'KAM', 'KAS', 'KAT', 
  'KAW', 'KAY', 'KEA', 'KEB', 'KED', 'KEF', 'KEG', 'KEN', 'KEP', 'KET', 
  'KEX', 'KEY', 'KHI', 'KID', 'KIF', 'KIN', 'KIP', 'KIR', 'KIS', 'KIT', 
  'KOA', 'KOB', 'KOI', 'KOP', 'KOR', 'KOS', 'KOW', 'KUE', 'KYE', 'LAB', 
  'LAC', 'LAD', 'LAG', 'LAH', 'LAM', 'LAP', 'LAR', 'LAS', 'LAT', 'LAV', 
  'LAW', 'LAX', 'LAY', 'LEA', 'LED', 'LEE', 'LEG', 'LEI', 'LEK', 'LEP', 
  'LET', 'LEU', 'LEV', 'LEX', 'LEY', 'LEZ', 'LIB', 'LID', 'LIE', 'LIN', 
  'LIP', 'LIS', 'LIT', 'LOB', 'LOG', 'LOO', 'LOP', 'LOR', 'LOS', 'LOT', 
  'LOU', 'LOW', 'LOX', 'LUD', 'LUG', 'LUM', 'LUR', 'LUV', 'LUX', 'LUZ', 
  'LYE', 'LYM', 'MAA', 'MAC', 'MAD', 'MAE', 'MAG', 'MAK', 'MAL', 'MAM', 
  'MAN', 'MAP', 'MAR', 'MAS', 'MAT', 'MAW', 'MAX', 'MAY', 'MED', 'MEE', 
  'MEG', 'MEH', 'MEL', 'MEM', 'MEN', 'MES', 'MET', 'MEU', 'MEW', 'MHO', 
  'MIB', 'MIC', 'MID', 'MIG', 'MIL', 'MIM', 'MIR', 'MIS', 'MIX', 'MIZ', 
  'MMM', 'MOA', 'MOB', 'MOC', 'MOD', 'MOG', 'MOI', 'MOL', 'MOM', 'MON', 
  'MOO', 'MOP', 'MOR', 'MOS', 'MOT', 'MOU', 'MOW', 'MOY', 'MUD', 'MUG', 
  'MUM', 'MUN', 'MUS', 'MUT', 'MUX', 'MYC', 'NAB', 'NAE', 'NAG', 'NAK', 
  'NAM', 'NAN', 'NAP', 'NAV', 'NAY', 'NEB', 'NED', 'NEE', 'NEF', 'NEG', 
  'NEK', 'NEP', 'NET', 'NEW', 'NIB', 'NID', 'NIE', 'NIL', 'NIM', 'NIP', 
  'NIS', 'NIT', 'NIX', 'NOB', 'NOD', 'NOG', 'NOH', 'NOM', 'NON', 'NOO', 
  'NOR', 'NOS', 'NOT', 'NOW', 'NOX', 'NTH', 'NUB', 'NUG', 'NUN', 'NUR', 
  'NUS', 'NUT', 'NYE', 'NYM', 'OAF', 'OAK', 'OAR', 'OAT', 'OBA', 'OBE', 
  'OBI', 'OBO', 'OCA', 'ODA', 'ODD', 'ODE', 'ODS', 'OES', 'OFF', 'OFT', 
  'OHM', 'OHO', 'OHS', 'OIK', 'OIL', 'OIS', 'OKA', 'OKE', 'OLD', 'OLE', 
  'OLM', 'OMS', 'ONE', 'ONO', 'ONS', 'OOF', 'OOH', 'OOM', 'OON', 'OOP', 
  'OOR', 'OOS', 'OOT', 'OPE', 'OPS', 'OPT', 'ORA', 'ORB', 'ORC', 'ORD', 
  'ORE', 'ORF', 'ORS', 'ORT', 'OSE', 'OUD', 'OUR', 'OUT', 'OVA', 'OWE', 
  'OWL', 'OWN', 'OWT', 'OXO', 'OXY', 'OYE', 'OYS', 'PAC', 'PAD', 'PAH', 
  'PAK', 'PAL', 'PAM', 'PAN', 'PAP', 'PAR', 'PAS', 'PAT', 'PAV', 'PAW', 
  'PAX', 'PAY', 'PEA', 'PEC', 'PED', 'PEE', 'PEG', 'PEH', 'PEN', 'PEP', 
  'PER', 'PES', 'PET', 'PEW', 'PHI', 'PHO', 'PHT', 'PIA', 'PIC', 'PIE', 
  'PIG', 'PIN', 'PIP', 'PIR', 'PIS', 'PIT', 'PIU', 'PIX', 'PLU', 'PLY', 
  'POD', 'POH', 'POI', 'POL', 'POM', 'POO', 'POP', 'POS', 'POT', 'POW', 
  'POX', 'PRO', 'PRY', 'PSI', 'PST', 'PUB', 'PUD', 'PUG', 'PUH', 'PUL', 
  'PUN', 'PUP', 'PUR', 'PUS', 'PUT', 'PUY', 'PYA', 'PYE', 'PYX', 'QAT', 
  'QIS', 'QUA', 'RAD', 'RAG', 'RAH', 'RAI', 'RAJ', 'RAM', 'RAN', 'RAP', 
  'RAS', 'RAT', 'RAV', 'RAW', 'RAX', 'RAY', 'REB', 'REC', 'RED', 'REE', 
  'REF', 'REG', 'REH', 'REI', 'REM', 'REN', 'REO', 'REP', 'RES', 'RET', 
  'REV', 'REW', 'REX', 'RHO', 'RHY', 'RIA', 'RIB', 'RID', 'RIF', 'RIG', 
  'RIM', 'RIN', 'RIP', 'RIT', 'RIZ', 'ROB', 'ROC', 'ROD', 'ROE', 'ROK', 
  'ROM', 'ROO', 'ROT', 'ROW', 'RUB', 'RUC', 'RUD', 'RUE', 'RUG', 'RUM', 
  'RUN', 'RUT', 'RYA', 'RYE', 'RYU', 'SAB', 'SAC', 'SAD', 'SAE', 'SAG', 
  'SAI', 'SAL', 'SAM', 'SAN', 'SAP', 'SAR', 'SAT', 'SAU', 'SAV', 'SAW', 
  'SAX', 'SAY', 'SAZ', 'SEA', 'SEC', 'SED', 'SEE', 'SEG', 'SEI', 'SEL', 
  'SEN', 'SER', 'SET', 'SEW', 'SEX', 'SEY', 'SEZ', 'SHA', 'SHE', 'SHH', 
  'SHY', 'SIB', 'SIC', 'SIF', 'SIK', 'SIM', 'SIN', 'SIP', 'SIR', 'SIS', 
  'SIT', 'SIX', 'SKA', 'SKI', 'SKY', 'SLY', 'SMA', 'SNY', 'SOB', 'SOC', 
  'SOD', 'SOH', 'SOL', 'SOM', 'SON', 'SOP', 'SOS', 'SOT', 'SOU', 'SOV', 
  'SOW', 'SOY', 'SPA', 'SPY', 'STY', 'SUB', 'SUD', 'SUE', 'SUI', 'SUK', 
  'SUM', 'SUN', 'SUP', 'SUQ', 'SUS', 'SWY', 'SYE', 'SYN', 'TAB', 'TAD', 
  'TAE', 'TAG', 'TAI', 'TAJ', 'TAM', 'TAN', 'TAO', 'TAP', 'TAR', 'TAS', 
  'TAT', 'TAU', 'TAV', 'TAW', 'TAX', 'TAY', 'TEA', 'TEC', 'TED', 'TEE', 
  'TEF', 'TEG', 'TEL', 'TEN', 'TES', 'TET', 'TEW', 'THE', 'THO', 'THY', 
  'TIC', 'TID', 'TIE', 'TIG', 'TIK', 'TIL', 'TIN', 'TIP', 'TIS', 'TIT', 
  'TIZ', 'TOC', 'TOD', 'TOE', 'TOG', 'TOM', 'TON', 'TOO', 'TOP', 'TOR', 
  'TOT', 'TOW', 'TOY', 'TRY', 'TSK', 'TUB', 'TUG', 'TUI', 'TUM', 'TUN', 
  'TUP', 'TUT', 'TUX', 'TWA', 'TWO', 'TYE', 'TYG', 'UDO', 'UDU', 'UEY', 
  'UFO', 'UGH', 'UGS', 'UKE', 'ULU', 'UMM', 'UMP', 'UNI', 'UNS', 'UPO', 
  'UPS', 'URB', 'URD', 'URE', 'URN', 'URP', 'USE', 'UTA', 'UTE', 'UTS', 
  'UVA', 'VAC', 'VAG', 'VAN', 'VAR', 'VAS', 'VAT', 'VAU', 'VAV', 'VAW', 
  'VEE', 'VEG', 'VET', 'VEX', 'VIA', 'VID', 'VIE', 'VIG', 'VIM', 'VIN', 
  'VIS', 'VLY', 'VOE', 'VOG', 'VOL', 'VOR', 'VOW', 'VOX', 'VOY', 'VUG', 
  'VUM', 'WAB', 'WAD', 'WAE', 'WAG', 'WAH', 'WAI', 'WAN', 'WAP', 'WAR', 
  'WAS', 'WAT', 'WAW', 'WAX', 'WAY', 'WEB', 'WED', 'WEE', 'WEM', 'WEN', 
  'WET', 'WEX', 'WEY', 'WHA', 'WHO', 'WHY', 'WIG', 'WIN', 'WIS', 'WIT', 
  'WIZ', 'WOE', 'WOF', 'WOG', 'WOK', 'WON', 'WOO', 'WOP', 'WOS', 'WOT', 
  'WOW', 'WOX', 'WRY', 'WUD', 'WUS', 'WYE', 'WYN', 'XIS', 'YAG', 'YAH', 
  'YAK', 'YAM', 'YAP', 'YAR', 'YAW', 'YAY', 'YEA', 'YEH', 'YEN', 'YEP', 
  'YES', 'YET', 'YEW', 'YGO', 'YID', 'YIN', 'YIP', 'YOB', 'YOD', 'YOK', 
  'YOM', 'YOU', 'YOW', 'YUG', 'YUK', 'YUM', 'YUP', 'YUS', 'ZAG', 'ZAP', 
  'ZAS', 'ZEA', 'ZED', 'ZEE', 'ZEK', 'ZEL', 'ZEX', 'ZHO', 'ZIG', 'ZIN', 
  'ZIP', 'ZIT', 'ZIZ', 'ZOA', 'ZOL', 'ZOO', 'ZOS', 'ZUG', 'ZZZ'
];

// Initialize dynamic word lists
function initializeWordLists() {
  try {
    // Initialize word lists by length (3-8 letters)
    for (let len = 3; len <= 8; len++) {
      if (!DYNAMIC_WORD_LISTS[len]) {
        DYNAMIC_WORD_LISTS[len] = new Set();
      }
    }
    
    // Add words from STATIC_WORD_LISTS to DYNAMIC_WORD_LISTS
    for (const [len, ladders] of Object.entries(STATIC_WORD_LISTS)) {
      const length = parseInt(len);
      if (isNaN(length) || length < 3 || length > 8) continue;
      
      if (!DYNAMIC_WORD_LISTS[length]) {
        DYNAMIC_WORD_LISTS[length] = new Set();
      }
      
      for (const ladder of ladders) {
        for (const word of ladder) {
          if (word && word.length === length) {
            DYNAMIC_WORD_LISTS[length].add(word.toUpperCase());
          }
        }
      }
    }

    // Note: Static words are now added to DYNAMIC_WORD_LISTS in the first loop above

    // Add common words with duplicates and empty checks
    const uniqueWords = new Set(
      COMMON_WORDS
        .filter(word => word && word.length >= 3 && word.length <= 8)
        .map(word => word.toUpperCase())
    );

    for (const word of uniqueWords) {
      if (!DYNAMIC_WORD_LISTS[word.length]) {
        DYNAMIC_WORD_LISTS[word.length] = new Set();
      }
      DYNAMIC_WORD_LISTS[word.length].add(word);
    }

    // Add common word endings/prefixes (only the most common ones)
    const COMMON_AFFIXES = [
      'ING', 'TION', 'MENT', 'NESS', 'ABLE', 'ANCE', 'ENCE', 'SHIP',
      'HOOD', 'LESS', 'FUL', 'OUS', 'ISH', 'IVE', 'ANT', 'ENT', 'ARY',
      'ER', 'EST', 'LY', 'ED', 'S'
    ];

    for (const ending of COMMON_AFFIXES) {
      if (ending.length >= 2 && ending.length <= 8) {
        const len = ending.length;
        if (!DYNAMIC_WORD_LISTS[len]) {
          DYNAMIC_WORD_LISTS[len] = new Set();
        }
        DYNAMIC_WORD_LISTS[len].add(ending);
      }
    }

    // Add all words to the main dictionary
    DICTIONARY.clear(); // Clear existing entries
    for (const wordSet of Object.values(DYNAMIC_WORD_LISTS)) {
      for (const word of wordSet) {
        if (word) {  // Ensure word is not empty
          DICTIONARY.add(word);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing word lists:', error);
  }
}

// Initialize word lists and dictionary
initializeWordLists();
initializeDictionary();

// Test function to verify word validation
export function testWordValidation() {
  const testWords = [
    'cat', 'dog', 'hat', 'pen', 'run', 'sun', 'fun', 'big', 'zoo', 'quiz',
    'jazz', 'hymn', 'lynx', 'gym', 'pyx', 'cwm', 'qat', 'hajj'
  ];

  console.log('Word Validation Test Results:');
  console.log('----------------------------');

  testWords.forEach(word => {
    console.log(`${word}: ${isValidWord(word) ? '✅' : '❌'}`);
  });
}

// Uncomment to run tests when this file is executed directly
// if (require.main === module) {
//   testWordValidation();
// }



// Word frequency data (for future use in difficulty calculation)
const WORD_FREQUENCY: Record<string, number> = {
  // Common words have higher frequency
  'THE': 100, 'AND': 95, 'HAVE': 90, 'THAT': 85, 'FOR': 80,
  // Add more words as needed
};

// Helper function to get a random element from an array
function getRandomElement<T>(array: T[], seed?: number): T {
  if (!array.length) throw new Error('Cannot get random element from empty array');
  
  // Use provided seed, or lastSeed + 1, or generate a new one
  const actualSeed = seed !== undefined ? seed : (lastSeed !== null ? lastSeed + 1 : Date.now());
  const randomIndex = Math.floor(seededRandom(actualSeed) * array.length);
  
  // Update lastSeed for next call
  lastSeed = actualSeed + 1;
  
  return array[randomIndex];
}

// Cache for previously validated words to improve performance
const wordValidationCache = new Map<string, boolean>();

// Cache for found paths to improve performance
const pathCache = new Map<string, string[]>();

// Track the last seed to ensure we don't repeat sequences
let lastSeed: number | null = null;

// Simple seeded random number generator
const seededRandom = (seed: number | null) => {
  if (seed === null) {
    seed = Date.now();
  }
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Find all words that are one letter different
function getNeighbors(word: string, wordList: Set<string>): string[] {
  const neighbors: string[] = [];
  const wordUpper = word.toUpperCase();
  
  for (const candidate of wordList) {
    if (candidate.length !== wordUpper.length) continue;
    
    let diff = 0;
    for (let i = 0; i < wordUpper.length; i++) {
      if (wordUpper[i] !== candidate[i]) diff++;
      if (diff > 1) break;
    }
    
    if (diff === 1) {
      neighbors.push(candidate);
    }
  }
  
  return neighbors;
}

// Find a path between two words using BFS
export function findWordLadder(start: string, end: string, wordList: Set<string>): string[] | null {
  console.log(`  Searching for path from ${start} to ${end}...`);
  const startTime = Date.now();
  let iterations = 0;
  const cacheKey = `${start}_${end}`;
  
  // Check cache first
  if (pathCache.has(cacheKey)) {
    const cachedPath = pathCache.get(cacheKey);
    if (cachedPath) {
      console.log(`  Using cached path: ${cachedPath.join(' → ')}`);
      return [...cachedPath];
    }
  }
  
  // Check if words are in the word list
  if (!wordList.has(start) || !wordList.has(end)) {
    console.log(`  ❌ Either ${start} or ${end} not in word list`);
    return null;
  }
  
  // BFS setup
  const queue: { word: string; path: string[] }[] = [{ word: start, path: [start] }];
  const visited = new Set<string>([start]);
  
  while (queue.length > 0) {
    iterations++;
    
    const { word, path } = queue.shift()!;
    
    // Check if we've reached the end
    if (word === end) {
      const timeTaken = Date.now() - startTime;
      console.log(`  ✅ Found path in ${iterations} iterations (${timeTaken}ms): ${path.join(' → ')}`);
      // Cache the path for future use
      pathCache.set(cacheKey, [...path]);
      return path;
    }
    
    // Get all possible next words
    const neighbors = getNeighbors(word, wordList);
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({
          word: neighbor,
          path: [...path, neighbor]
        });
      }
    }
  }
  
  const timeTaken = Date.now() - startTime;
  console.log(`  ❌ No path found after ${iterations} iterations (${timeTaken}ms)`);
  return null;
}

// Create a fallback puzzle for when generation fails
function createFallbackPuzzle(difficulty: 'easy' | 'medium' | 'hard'): Puzzle {
  const now = new Date().toISOString();
  const timestamp = Date.now();
  
  // Define fallback words based on difficulty
  const fallbackWords = {
    easy: ['CAT', 'COT', 'DOT', 'DOG'],
    medium: ['COLD', 'CORD', 'CARD', 'WARD', 'WARM'],
    hard: ['CRANE', 'CRANK', 'CRACK', 'TRACK', 'TRACE']
  }[difficulty];
  
  const startWord = fallbackWords[0];
  const endWord = fallbackWords[fallbackWords.length - 1];
  
  return {
    id: `puzzle-${timestamp}-fallback`,
    startWord,
    endWord,
    difficulty,
    maxMoves: fallbackWords.length * 2,
    parSteps: Math.ceil(fallbackWords.length * 1.5),
    score: 0,
    currentWord: startWord,
    moves: [],
    startTime: now,
    endTime: '',
    isComplete: false,
    isSuccess: false,
    usedWords: new Set([startWord]),
    wordLength: startWord.length,
    path: [...fallbackWords]
  };
}



// Helper function to check if a word is considered common
const isCommonWord = (word: string): boolean => {
  // Simple check for common word patterns
  const commonPatterns = [
    /ING$/, /TION$/, /MENT$/, /NESS$/, /ABLE$/, /SHIP$/, /HOOD$/, /LESS$/
  ];
  return commonPatterns.some(pattern => pattern.test(word));
};

/**
 * Validates if a word exists in the dictionary
 * @param word The word to validate
 * @returns boolean indicating if the word is valid
 */
export function isValidWord(word: string | undefined | null): boolean {
  if (!word) return false;
  
  // Clean and normalize the word
  const cleanWord = word.trim().toUpperCase();
  
  // Check cache first for better performance
  if (wordValidationCache.has(cleanWord)) {
    return wordValidationCache.get(cleanWord) as boolean;
  }
  
  // Check if word is offensive
  if (isOffensiveWord(cleanWord)) {
    console.log(`Offensive word filtered out: ${cleanWord}`);
    wordValidationCache.set(cleanWord, false);
    return false;
  }
  
  // Check if word is in the dictionary
  const isValid = DICTIONARY.has(cleanWord);
  
  // Cache the result for future lookups
  wordValidationCache.set(cleanWord, isValid);
  
  // Log for debugging
  if (isValid) {
    console.log(`Word validated: ${cleanWord}`);
  } else {
    console.log(`Word not found: ${cleanWord}`);
  }
  
  return isValid;
};

export const isOffensiveWord = (word: string | undefined | null): boolean => {
  if (!word) return false;
  return OFFENSIVE_WORDS.has(word.trim().toUpperCase());
};

export const isOneLetterDifferent = (word1: string, word2: string): boolean => {
  if (!word1 || !word2 || word1.length !== word2.length) return false;
  
  let differences = 0;
  const upperWord1 = word1.toUpperCase();
  const upperWord2 = word2.toUpperCase();
  
  for (let i = 0; i < upperWord1.length; i++) {
    if (upperWord1[i] !== upperWord2[i]) {
      differences++;
      if (differences > 1) return false;
    }
  }
  
  return differences === 1;
};

// Helper function to calculate word difficulty
const calculateWordDifficulty = (word: string): number => {
  // Simple difficulty calculation based on word length and frequency
  const lengthFactor = Math.min(word.length / 3, 1.5); // 1-1.5x based on length (3-5 letters)
  const frequency = 1; // Default frequency if not in frequency list
  const frequencyFactor = 1 + (100 - Math.min(frequency, 100)) / 100; // 1-2x based on frequency
  
  return lengthFactor * frequencyFactor;
};
const createPuzzle = (
  startWord: string,
  endWord: string,
  difficulty: 'easy' | 'medium' | 'hard',
  path: string[]
): Puzzle => {
  // Calculate par steps based on optimal path length and difficulty
  const optimalSteps = path.length - 1;
  let parSteps = optimalSteps;
  
  // Adjust par based on difficulty
  switch (difficulty) {
    case 'easy':
      parSteps = Math.ceil(optimalSteps * 1.5); // More lenient
      break;
    case 'hard':
      parSteps = Math.max(optimalSteps - 1, 1); // More challenging
      break;
    // medium stays at optimal
  }

  const now = new Date().toISOString();
  
  return {
    id: `puzzle-${Date.now()}`,
    startWord,
    endWord,
    currentWord: startWord,
    moves: [],
    usedWords: new Set([startWord]),
    wordLength: startWord.length,
    path: [...path],
    isComplete: false,
    isSuccess: false,
    startTime: now,
    endTime: '',
    score: 0,
    difficulty,
    parSteps,
    maxMoves: Math.ceil(optimalSteps * 1.5),
    // Legacy fields
    length: startWord.length,
    date: now.split('T')[0],
    constraint: null,
    featured: false,
    wildcardEnabled: false
  };
}


// Generate a new puzzle with the specified difficulty
export function generatePuzzle(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Puzzle {
  console.log(`\n🎮 Generating new ${difficulty} puzzle...`);
  const startTime = Date.now();
  
  // Define difficulty parameters
  const difficultyParams = {
    easy: { minLength: 3, maxLength: 4, minSteps: 3, maxAttempts: 10 },
    medium: { minLength: 4, maxLength: 6, minSteps: 4, maxAttempts: 15 },
    hard: { minLength: 5, maxLength: 8, minSteps: 5, maxAttempts: 20 }
  }[difficulty];
  
  const { minLength, maxLength, minSteps, maxAttempts } = difficultyParams;
  console.log(`Difficulty: ${difficulty}, Word length: ${minLength}-${maxLength}, Min steps: ${minSteps}`);
  
  // Try multiple times to find a good puzzle
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n🔍 Attempt ${attempt}/${maxAttempts}`);
    
    // Select word length based on difficulty
    const wordLength = Math.floor(seededRandom(Date.now() + attempt) * (maxLength - minLength + 1)) + minLength;
    const wordsOfLength = DYNAMIC_WORD_LISTS[wordLength] || new Set<string>();
    
    if (wordsOfLength.size === 0) {
      console.warn(`No words of length ${wordLength} found`);
      continue;
    }
    
    // Convert to array for easier manipulation
    const wordsArray = Array.from(wordsOfLength);
    
    // Try multiple start words in this attempt
    const startWordsToTry = Math.min(5, wordsArray.length);
    const shuffledWords = [...wordsArray].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < startWordsToTry; i++) {
      const startWord = shuffledWords[i];
      if (!startWord) continue;
      
      console.log(`\n🔤 Start word: ${startWord}`);
      
      // Find a target word that's at least minSteps away
      const targetWord = findDistantTarget(startWord, wordsOfLength, minSteps);
      if (!targetWord) {
        console.log(`No valid target found for '${startWord}'`);
        continue;
      }
      
      console.log(`🎯 Target word: ${targetWord}`);
      
      // Find the actual ladder
      const ladder = findWordLadder(startWord, targetWord, wordsOfLength);
      if (!ladder || ladder.length < minSteps + 1) {
        console.log(`No valid ladder found from '${startWord}' to '${targetWord}'`);
        continue;
      }
      
      console.log(`✅ Found valid ladder with ${ladder.length - 1} steps`);
      
      // Calculate score based on difficulty and word length
      const baseScore = 100 * ladder.length;
      const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2
      }[difficulty];
      
      // Bonus for longer words
      const lengthBonus = 1 + (wordLength - minLength) * 0.2;
      const score = Math.ceil(baseScore * difficultyMultiplier * lengthBonus);
      
      console.log(`\n✅ Success! Generated puzzle in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
      console.log(`Start: ${startWord}`);
      console.log(`Target: ${targetWord}`);
      console.log(`Path (${ladder.length} steps): ${ladder.join(' → ')}`);
      console.log(`Difficulty: ${difficulty}`);
      
      // Create and return the puzzle
      return createPuzzle(
        startWord,
        targetWord,
        difficulty,
        ladder
      );
    }
  }
  
  // If we get here, all attempts failed - use a fallback
  console.warn(`\n⚠️ All ${maxAttempts} generation attempts failed, using fallback puzzle`);
  return createFallbackPuzzle(difficulty);
}

// Helper function to find a target word that's at least minSteps away from startWord
const findDistantTarget = (
  startWord: string,
  allWords: string[] | Set<string>,
  minSteps: number,
  maxAttempts: number = 50
): string | null => {
  console.log(`\n🔍 Finding target word at least ${minSteps} steps from '${startWord}'`);
  
  // Convert to uppercase for consistency and ensure we have an array
  startWord = startWord.toUpperCase();
  const wordsArray = Array.isArray(allWords) 
    ? allWords.map(w => w.toUpperCase())
    : Array.from(allWords).map(w => w.toUpperCase());
  
  // First, try to find a target using BFS to ensure minimum steps
  const visited = new Set<string>([startWord]);
  const queue: [string, number, string[]][] = [[startWord, 0, [startWord]]];
  const validTargets: {word: string, path: string[]}[] = [];
  
  // Track the best candidate found so far (farthest from start)
  let bestCandidate = '';
  let maxDistance = 0;
  let bestPath: string[] = [];
  
  while (queue.length > 0 && validTargets.length < 15) {
    const [current, steps, path] = queue.shift()!;
    
    // Update best candidate
    if (steps > maxDistance) {
      maxDistance = steps;
      bestCandidate = current;
      bestPath = [...path];
    }
    
    // If we've reached the minimum steps, add to valid targets
    if (steps >= minSteps) {
      // Prefer words that are common and not too similar to start word
      if (isCommonWord(current) || Math.random() > 0.7) {
        validTargets.push({ word: current, path: [...path] });
      }
    }
    
    // Get neighbors that haven't been visited yet
    const neighbors = getNeighbors(current, new Set(wordsArray));
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, steps + 1, [...path, neighbor]]);
      }
    }
  }
  
  // If we found valid targets, return a random one
  if (validTargets.length > 0) {
    const target = validTargets[Math.floor(Math.random() * validTargets.length)];
    console.log(`Found ${validTargets.length} valid targets, selected: ${target.word}`);
    // Cache the path for future use
    if (target.path.length > 1) {
      const cacheKey = `${startWord}_${target.word}`;
      pathCache.set(cacheKey, target.path);
    }
    return target.word;
  }
  
  console.log(`No target found with BFS (max distance: ${maxDistance}), trying fallback method`);
  
  // Fallback: Find words that are different enough
  const candidates: {word: string, diff: number}[] = [];
  
  // Try to find words with at least minSteps different letters
  for (const word of wordsArray) {
    if (word === startWord) continue;
    
    let diffCount = 0;
    for (let i = 0; i < word.length; i++) {
      if (word[i] !== startWord[i]) diffCount++;
    }
    
    if (diffCount >= minSteps) {
      candidates.push({ word, diff: diffCount });
      if (candidates.length >= 30) break; // Limit number of candidates
    }
  }
  
  // Sort by difference (more different is better)
  candidates.sort((a, b) => b.diff - a.diff);
  
  if (candidates.length > 0) {
    // Pick from top 5 most different words
    const topCandidates = candidates.slice(0, 5);
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    console.log(`Found ${candidates.length} candidates with at least ${minSteps} letter differences, selected: ${selected.word}`);
    return selected.word;
  }
  
  // Last resort: return any word that's different from start
  const otherWords = wordsArray.filter(w => w !== startWord);
  if (otherWords.length > 0) {
    console.log('No good candidates found, returning random word');
    return otherWords[Math.floor(Math.random() * otherWords.length)];
  }
  
  console.warn('No valid target word found');
  return null;
};

export const validateWord = (word: string, previousWord: string, isFirstWord: boolean, puzzle: Puzzle): { isValid: boolean; error?: string } => {
  if (!word) {
    return { isValid: false, error: 'Please enter a word' };
  }

  // Convert to uppercase for case-insensitive comparison
  const upperWord = word.toUpperCase();
  
  // Check if word is in dictionary
  if (!isValidWord(upperWord)) {
    return { isValid: false, error: 'Not a valid word' };
  }
  
  // For first word, just check if it's the start word
  if (isFirstWord) {
    if (upperWord !== puzzle.startWord) {
      return { isValid: false, error: `First word must be ${puzzle.startWord}` };
    }
    return { isValid: true };
  }
  
  // For subsequent words, check they're one letter different from previous word
  if (!isOneLetterDifferent(upperWord, previousWord)) {
    return { isValid: false, error: 'Must change exactly one letter' };
  }
  
  // Check if word was already used
  if (puzzle.usedWords.has(upperWord)) {
    return { isValid: false, error: 'Word already used' };
  }
  
  return { isValid: true };
};

// Calculate estimated par score based on word characteristics
export const estimateParScore = (startWord: string, endWord: string): number => {
  const length = startWord.length;
  
  // Base par based on word length (minimum moves needed)
  let basePar = length + 1;
  
  // Calculate number of different letters between words
  let diffCount = 0;
  for (let i = 0; i < length; i++) {
    if (startWord[i] !== endWord[i]) diffCount++;
  }
  
  // Adjust par based on number of differing letters
  // More differing letters typically means more moves needed
  const diffAdjustment = Math.ceil(diffCount * 0.7);
  
  // Adjust for word difficulty (using a simple vowel/consonant ratio)
  const vowels = new Set(['A', 'E', 'I', 'O', 'U']);
  const startVowelRatio = startWord.split('').filter(c => vowels.has(c)).length / length;
  const endVowelRatio = endWord.split('').filter(c => vowels.has(c)).length / length;
  const vowelRatioDiff = Math.abs(startVowelRatio - endVowelRatio);
  const vowelAdjustment = Math.ceil(vowelRatioDiff * 3);
  
  // Calculate final par
  let estimatedPar = basePar + diffAdjustment + vowelAdjustment;
  
  // Ensure par is at least the number of differing letters
  estimatedPar = Math.max(estimatedPar, diffCount);
  
  // Add some randomness to simulate different puzzle difficulties
  const randomAdjustment = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
  estimatedPar += randomAdjustment;
  
  // Ensure minimum par of 3 for very easy puzzles
  return Math.max(3, Math.min(estimatedPar, 12)); // Cap at 12 for very difficult puzzles
};

// All exports are done inline with the function declarations
