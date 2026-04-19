export interface ScamType {
  id: string;
  nameKey: string;
  descKey: string;
  keywords: string[];
}

export const SCAM_TYPES: ScamType[] = [
  {
    id: "macauScam",
    nameKey: "scamTypes.macauScam.name",
    descKey: "scamTypes.macauScam.desc",
    keywords: ["polis", "mahkamah", "lhdn", "waran tangkap", "akaun frozen", "pindahkan wang", "pegawai", "siasatan"],
  },
  {
    id: "loveScam",
    nameKey: "scamTypes.loveScam.name",
    descKey: "scamTypes.loveScam.desc",
    keywords: ["sayang", "love", "bitcoin", "pelaburan bersama", "overseas", "hantar wang", "hospital", "stranded"],
  },
  {
    id: "jobScam",
    nameKey: "scamTypes.jobScam.name",
    descKey: "scamTypes.jobScam.desc",
    keywords: ["kerja", "income", "part time", "commission", "deposit", "bayaran pendahuluan", "gaji tinggi", "task"],
  },
  {
    id: "investmentScam",
    nameKey: "scamTypes.investmentScam.name",
    descKey: "scamTypes.investmentScam.desc",
    keywords: ["pelaburan", "roi", "dividen", "guaranteed return", "forex", "crypto", "pulangan", "untung"],
  },
  {
    id: "parcelScam",
    nameKey: "scamTypes.parcelScam.name",
    descKey: "scamTypes.parcelScam.desc",
    keywords: ["parcel", "bungkusan", "kastam", "cukai", "delivery", "pos laju", "ditahan", "bayar untuk lepas"],
  },
  {
    id: "phishing",
    nameKey: "scamTypes.phishing.name",
    descKey: "scamTypes.phishing.desc",
    keywords: ["klik sini", "verify", "update account", "suspended", "login", "password", "maybank2u", "cimb clicks"],
  },
  {
    id: "loanScam",
    nameKey: "scamTypes.loanScam.name",
    descKey: "scamTypes.loanScam.desc",
    keywords: ["pinjaman", "loan", "yuran pemprosesan", "processing fee", "lulus segera", "blacklist ok", "stamp duty"],
  },
  {
    id: "ecommerce",
    nameKey: "scamTypes.ecommerce.name",
    descKey: "scamTypes.ecommerce.desc",
    keywords: ["murah", "sale", "limited", "pre-order", "transfer dulu", "cod", "ig seller", "shopee scam"],
  },
];
