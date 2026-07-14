const url =
  'https://api.crftr.net/open/rawapi/v3/datamos/educationalactivitylicensesregister?limit=3';

const res = await fetch(url);
const data = await res.json();
console.log(JSON.stringify(data, null, 2).slice(0, 3000));
