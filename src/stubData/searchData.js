export const searchData = [
  { name: 'avtex' },
  { name: 'changhong' },
  { name: 'cvte' },
  { name: 'expressluck' },
  { name: 'freesat' },
  { name: 'freeviewplay' },
  { name: 'goodmans' },
  { name: 'hisense' },
  { name: 'hkc' },
  { name: 'humax' },
  { name: 'jvc' },
  { name: 'lg' },
  { name: 'loewe' },
  { name: 'manhattan' },
  { name: 'mediatek' },
  { name: 'mstar' },
  { name: 'mtc' },
  { name: 'netgem' },
  { name: 'novatek' },
  { name: 'panasonic' },
  { name: 'samsung' },
  { name: 'seraphic' },
  { name: 'sharp' },
  { name: 'skyworth' },
  { name: 'sony' },
  { name: 'tcl' },
  { name: 'toshiba' },
  { name: 'tpv' },
  { name: 'umcsharp' },
  { name: 'vestel' },
  { name: 'vewd' },
  { name: 'youview' },
].map((stub) => ({
  id: stub.name.toLowerCase().replace(" ", ""),
  title: stub.name,
  url: `https://www.google.com/search?q=${stub}`
}));
