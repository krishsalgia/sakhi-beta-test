import { branches } from './branch-data';
import shapes from './branch-state-shapes.json';

// WGS84 [latitude, longitude], derived from approved address localities.
// These are locality/landmark matches, not surveyed branch entrances.
// Cached source evidence: qa/branch-drilldown/geocoding.
export const branchLocations = {
  andheri: { point: [19.102889,72.886222], locality:'Sakinaka Junction, Andheri East', source:'https://www.sakhimultistate.com/branches', precision:'official map location' },
  jarimari: { point:[19.091318,72.881935], locality:'Jarimari, Kurla West', source:'https://www.openstreetmap.org/way/1364680842', precision:'locality' },
  jogeshwari: { point:[19.143244,72.835378], locality:'Behram Baug, Jogeshwari West', source:'https://www.openstreetmap.org/way/202660311', precision:'locality' },
  ghatkopar: { point:[19.089744,72.904804], locality:'Ghatkopar West', source:'https://www.openstreetmap.org/node/1640260030', precision:'locality' },
  chembur: { point:[19.069238,72.897846], locality:'Tilak Nagar, Chembur West', source:'https://www.openstreetmap.org/node/1640461335', precision:'locality' },
  thane: { point:[19.200698,72.961186], locality:'Ramchandra Nagar No. 3, Thane West', source:'https://www.openstreetmap.org/node/4585359396', precision:'locality' },
  borivali: { point:[19.226723,72.861933], locality:'Borivali East', source:'https://www.openstreetmap.org/node/1640203457', precision:'locality' },
  pusesavali: { point:[17.462294,74.316018], locality:'Pusesavali, Satara district', source:'https://www.openstreetmap.org/node/7226575956', precision:'local landmark' },
  tembhurni: { point:[18.027711,75.194872], locality:'Tembhurni, Solapur district', source:'https://www.openstreetmap.org/node/245642891', precision:'locality' },
  chinchwad: { point:[18.648220,73.764899], locality:'Akurdi station / Walhekarwadi, Pimpri-Chinchwad', source:'https://www.openstreetmap.org/node/13644823988', precision:'nearby landmark' },
  panvel: { point:[18.989525,73.122194], locality:'Panvel, Raigad district', source:'https://www.openstreetmap.org/relation/13182526', precision:'locality' },
  satara: { point:[17.683782,73.995410], locality:'Bhavani Peth, Satara', source:'https://www.openstreetmap.org/way/434844446', precision:'street' },
};
export const branchAreas = [
  {id:'mumbai',name:'Mumbai',subtitle:'Mumbai city & suburbs',branches:['andheri','jarimari','jogeshwari','ghatkopar','chembur','borivali'],anchor:'andheri',label:[20,270]},
  {id:'thane',name:'Thane',subtitle:'Thane West',branches:['thane'],anchor:'thane',label:[20,202]},
  {id:'panvel',name:'Panvel',subtitle:'Navi Mumbai / Raigad',branches:['panvel'],anchor:'panvel',label:[20,338]},
  {id:'pune',name:'Pune',subtitle:'Pimpri-Chinchwad',branches:['chinchwad'],anchor:'chinchwad',label:[355,348]},
  {id:'satara',name:'Satara',subtitle:'Satara & Pusesavali',branches:['satara','pusesavali'],anchor:'satara',label:[180,525]},
  {id:'solapur',name:'Solapur',subtitle:'Tembhurni, Solapur district',branches:['tembhurni'],anchor:'tembhurni',label:[445,432]},
];
export const getAreaBranches = area => area.branches.map(id=>branches.find(branch=>branch.id===id));
export function projectStatePoint(state,[lat,lon]) {
  const {minX,minY,scale,offsetX,offsetY}=shapes[state].projection;
  return [(lon*Math.PI/180-minX)*scale+offsetX,(-Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))-minY)*scale+offsetY];
}
export const stateShapes=shapes;
