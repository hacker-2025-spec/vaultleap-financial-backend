export enum TaxFormType {
  FORM_1099 = '1099',
  FORM_W9 = 'W9',
  FORM_W8_BEN = 'W8_BEN',
  FORM_W8_BEN_E = 'W8_BEN_E',
}

export enum FedTaxClassification {
  C_CORPORATION = 'C Corporation',
  S_CORPORATION = 'S Corporation',
  PARTNERSHIP = 'Partnership',
  TRUST_ESTATE = 'Trust / Estate',
  INDIVIDUAL = 'Individual / Sole Proprietor or single-member LLC',
  LLC = 'LLC',
  OTHER = 'other',
}

export enum IdentificationStatus {
  SIMPLE_TRUST = 'Simple Trust',
  PRIVATE_FOUNDATION = 'Private Foundation',
  COMPLEX_TRUST = 'Complex Trust',
  CENTRAL_BANK_OF_ISSUE = 'Central Bank of Issue',
  PARTNERSHIP = 'Partnership',
  ESTATE = 'Estate',
  GRANTOR_TRUST = 'Grantor Trust',
  DISREGARDED_ENTITY = 'Disregarded Entity',
  INTERNATIONAL_ORGANIZATION = 'International Organization',
  TAX_EXEMPT_ORGANIZATION = 'Tax-exempt Organization',
  CORPORATION = 'Corporation',
  FOREIGN_GOVERNMENT_CONTROLLED_ENTITY = 'Foreign Government - Controlled Entity',
  FOREIGN_GOVERNMENT_INTEGRAL_PART = 'Foreign Government - Integral Part',
}

export enum FATCAStatus {
  _1 = 'Participating FFI',
  _2 = 'Reporting Model 1 FFI',
  _3 = 'Reporting Model 2 FFI',
  _4 = 'Sponsored FFI (Complete Part IV)',
  _5 = 'Certified deemed-compliant nonregistering local bank (Complete Part V)',
  _6 = 'Certified deemed-compliant FFI with only low-value accounts (Complete Part VI)',
  _7 = 'Certified deemed-compliant sponsored, closely held investment vehicle (Complete Part VII)',
  _8 = 'Certified deemed-compliant limited life debt investment entity (Complete Part VIII)',
  _9 = 'Certain investment entities that don’t maintain financial accounts (Complete Part IX)',
  _10 = 'Owner-documented FFI (Complete Part X)',
  _11 = 'Restricted distributor (Complete Part XI)',
  _12 = 'Nonreporting IGA FFI (Complete Part XII)',
  _13 = 'Foreign government, government of a U.S. possession, or foreign central bank of issue (Complete Part XIII)',
  _14 = 'International organization (Complete Part XIV)',
  _15 = 'Exempt retirement plans (Complete Part XV)',
  _16 = 'Entity wholly owned by exempt beneficial owners (Complete Part XVI)',
  _17 = 'Territory financial institution (Complete Part XVII)',
  _18 = 'Excepted nonfinancial group entity (Complete Part XVIII)',
  _19 = 'Excepted nonfinancial start-up company (Complete Part XIX)',
  _20 = 'Excepted nonfinancial entity in liquidation or bankruptcy (Complete Part XX)',
  _21 = '501(c) organization (Complete Part XXI)',
  _22 = 'Nonprofit organization (Complete Part XXII)',
  _23 = 'Publicly traded NFFE or NFFE affiliate of a publicly traded corporation (Complete Part XXIII)',
  _24 = 'Excepted territory NFFE (Complete Part XXIV)',
  _25 = 'Active NFFE (Complete Part XXV)',
  _26 = 'Passive NFFE (Complete Part XXVI)',
  _27 = 'Excepted inter-affiliate FFI (Complete Part XXVII)',
  _28 = 'Direct reporting NFFE',
  _29 = 'Sponsored direct reporting NFFE (Complete Part XXVIII)',
  _30 = 'Account that is not a financial account',
  _31 = 'Nonparticipating FFI (including an FFI related to a Reporting IGA FFI other than a deemed-compliant FFI, participating FFI, or exempt beneficial owner)',
  _32 = 'Registered deemed-compliant FFI (other than a reporting Model 1 FFI, sponsored FFI, or nonreporting IGA FFI covered in Part XII)',
}

export enum EntityFATCAStatus {
  _1 = 'Branch treated as nonparticipating FFI',
  _2 = 'Reporting Model 1 FFI',
  _3 = 'U.S. Branch',
  _4 = 'Participating FFI',
  _5 = 'Reporting Model 2 FFI',
}

export enum TaxTreatyBenefits {
  _1 = 'Government',
  _2 = 'Tax-exempt pension trust or pension fund',
  _3 = 'Other tax-exempt organization',
  _4 = 'Publicly traded corporation',
  _5 = 'Subsidiary of a publicly traded corporation',
  _6 = 'Company that meets the ownership and base erosion test',
  _7 = 'Company that meets the derivative benefits test',
  _8 = 'Company with an item of income that meets active trade or business test',
  _9 = 'Favorable discretionary determination by the U.S. competent authority received',
  _10 = 'No LOB article in treaty',
  OTHER = 'Other (specify Article and paragraph):',
}

export enum SponsoredFIICertify {
  _1 = '1',
  _2 = '2',
}

export enum TrusteeCountry {
  US = 'U.S',
  FOREIGN = 'FOREIGN',
}
