/**
 * FIDE federation code (IOC-style, 3 letters) → ISO 3166-1 alpha-2 code used by `flag-icons`.
 * Codes with no national flag (FIDE refugee team, IBCA, IPCA, ICSC) are absent and fall back to a badge.
 */
export const FED_TO_ISO: Record<string, string> = {
  AFG: 'af', ALB: 'al', ALG: 'dz', AND: 'ad', ANG: 'ao', ANT: 'ag', ARG: 'ar', ARM: 'am', ARU: 'aw', AUS: 'au',
  AUT: 'at', AZE: 'az', BAH: 'bs', BAN: 'bd', BAR: 'bb', BDI: 'bi', BEL: 'be', BEN: 'bj', BER: 'bm', BHU: 'bt',
  BIH: 'ba', BIZ: 'bz', BLR: 'by', BOL: 'bo', BOT: 'bw', BRA: 'br', BRN: 'bh', BRU: 'bn', BUL: 'bg', BUR: 'bf',
  CAF: 'cf', CAM: 'kh', CAN: 'ca', CAY: 'ky', CGO: 'cg', CHA: 'td', CHI: 'cl', CHN: 'cn', CIV: 'ci', CMR: 'cm',
  COD: 'cd', COK: 'ck', COL: 'co', COM: 'km', CPV: 'cv', CRC: 'cr', CRO: 'hr', CUB: 'cu', CUR: 'cw', CYP: 'cy',
  CZE: 'cz', DEN: 'dk', DJI: 'dj', DMA: 'dm', DOM: 'do', ECU: 'ec', EGY: 'eg', ENG: 'gb-eng', ERI: 'er', ESA: 'sv',
  ESP: 'es', EST: 'ee', ETH: 'et', FAI: 'fo', FIJ: 'fj', FIN: 'fi', FRA: 'fr', GAB: 'ga', GAM: 'gm', GBS: 'gw',
  GCI: 'gg', GEO: 'ge', GEQ: 'gq', GER: 'de', GHA: 'gh', GRE: 'gr', GRL: 'gl', GRN: 'gd', GUA: 'gt', GUI: 'gn',
  GUM: 'gu', GUY: 'gy', HAI: 'ht', HKG: 'hk', HON: 'hn', HUN: 'hu', INA: 'id', IND: 'in', IOM: 'im', IRI: 'ir',
  IRL: 'ie', IRQ: 'iq', ISL: 'is', ISR: 'il', ISV: 'vi', ITA: 'it', IVB: 'vg', JAM: 'jm', JCI: 'je', JOR: 'jo',
  JPN: 'jp', KAZ: 'kz', KEN: 'ke', KGZ: 'kg', KIR: 'ki', KOR: 'kr', KOS: 'xk', KSA: 'sa', KUW: 'kw', LAO: 'la',
  LAT: 'lv', LBA: 'ly', LBN: 'lb', LBR: 'lr', LCA: 'lc', LES: 'ls', LIE: 'li', LTU: 'lt', LUX: 'lu', MAC: 'mo',
  MAD: 'mg', MAR: 'ma', MAS: 'my', MAW: 'mw', MDA: 'md', MDV: 'mv', MEX: 'mx', MGL: 'mn', MHL: 'mh', MKD: 'mk',
  MLI: 'ml', MLT: 'mt', MNC: 'mc', MNE: 'me', MOZ: 'mz', MRI: 'mu', MTN: 'mr', MYA: 'mm', NAM: 'na', NCA: 'ni',
  NCL: 'nc', NED: 'nl', NEP: 'np', NGR: 'ng', NIG: 'ne', NOR: 'no', NRU: 'nr', NZL: 'nz', OMA: 'om', PAK: 'pk',
  PAN: 'pa', PAR: 'py', PER: 'pe', PHI: 'ph', PLE: 'ps', PLW: 'pw', PNG: 'pg', POL: 'pl', POR: 'pt', PRK: 'kp',
  PUR: 'pr', QAT: 'qa', ROU: 'ro', RSA: 'za', RUS: 'ru', RWA: 'rw', SAM: 'ws', SCO: 'gb-sct', SEN: 'sn', SEY: 'sc',
  SGP: 'sg', SKN: 'kn', SLE: 'sl', SLO: 'si', SMR: 'sm', SOL: 'sb', SOM: 'so', SRB: 'rs', SRI: 'lk', SSD: 'ss',
  STP: 'st', SUD: 'sd', SUI: 'ch', SUR: 'sr', SVK: 'sk', SWE: 'se', SWZ: 'sz', SYR: 'sy', TAN: 'tz', TGA: 'to',
  THA: 'th', TJK: 'tj', TKM: 'tm', TLS: 'tl', TOG: 'tg', TPE: 'tw', TTO: 'tt', TUN: 'tn', TUR: 'tr', TUV: 'tv',
  UAE: 'ae', UGA: 'ug', UKR: 'ua', URU: 'uy', USA: 'us', UZB: 'uz', VAN: 'vu', VEN: 've', VIE: 'vn', VIN: 'vc',
  WLS: 'gb-wls', YEM: 'ye', ZAM: 'zm', ZIM: 'zw',
};

export function fedToIso(fedCode: string | null | undefined): string | null {
  if (!fedCode) return null;
  return FED_TO_ISO[fedCode.toUpperCase()] ?? null;
}
