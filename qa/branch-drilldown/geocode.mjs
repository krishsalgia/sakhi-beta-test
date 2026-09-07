// One-time, sequential lookup of approved public branch address localities.
// Cached results only; no runtime geocoding. See Nominatim's usage policy:
// https://operations.osmfoundation.org/policies/nominatim/
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const queries = {
  andheri: 'Sagar Tech Plaza, Mumbai',
  jarimari: 'Jarimari, Mumbai',
  jogeshwari: 'Behram Baug, Mumbai',
  ghatkopar: 'Ghatkopar West, Mumbai',
  chembur: 'Tilak Nagar, Chembur, Mumbai',
  thane: 'Ramchandra Nagar, Thane',
  borivali: 'Borivali East, Mumbai',
  pusesavali: 'Pusesavali, Maharashtra',
  tembhurni: 'Tembhurni, Madha, Maharashtra',
  chinchwad: 'Akurdi railway station, Pimpri Chinchwad',
  panvel: 'Panvel, Maharashtra',
  satara: 'Bhavani Peth, Satara',
};
await mkdir('qa/branch-drilldown/geocoding', {recursive:true});
for(const [id,query] of Object.entries(queries)) {
  const file=`qa/branch-drilldown/geocoding/${id}.json`;
  let cached;
  try {cached=JSON.parse(await readFile(file,'utf8'));} catch {}
  if(!cached) {
    const url=`https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=in&limit=3&q=${encodeURIComponent(query)}`;
    const res=await fetch(url,{headers:{'User-Agent':'SakhiFrontendPrototype/1.0 (one-time public branch-locality lookup)'},signal:AbortSignal.timeout(15000)});
    if(!res.ok) throw new Error(`${res.status} ${query}`);
    cached={query,url,results:await res.json()};
    await writeFile(file,JSON.stringify(cached,null,2));
    await new Promise(resolve=>setTimeout(resolve,1200));
  }
  console.log(id,JSON.stringify(cached.results.map(r=>({lat:r.lat,lon:r.lon,name:r.display_name,osm:r.osm_type+'/'+r.osm_id}))));
}
