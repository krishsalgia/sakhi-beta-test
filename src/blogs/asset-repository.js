// LOCAL PROTOTYPE ONLY. Before production replace IndexedDB with secure server
// uploads and storage/CDN, Blog localStorage with a database/API, and prototype
// login with real server-side authentication and authorization.
const DB='sakhi-blog-assets',STORE='images';
export const IMAGE_LIMIT=10*1024*1024;
let opening;
function database(){
  return opening??=new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB,1);
    request.onupgradeneeded=()=>request.result.createObjectStore(STORE,{keyPath:'id'});
    request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();opening=undefined;};resolve(db);};
    request.onerror=()=>{opening=undefined;reject(new Error('Image storage is unavailable. Allow browser storage and try again.'));};
    request.onblocked=()=>{opening=undefined;reject(new Error('Image storage is busy. Close other editor tabs and try again.'));};
  });
}
async function transaction(mode,action){
  const db=await database();return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,mode),request=action(tx.objectStore(STORE));let result;
    request.onsuccess=()=>{result=request.result;};
    tx.oncomplete=()=>resolve(result);
    tx.onerror=tx.onabort=()=>reject(new Error('The image could not be stored. Check available browser storage and try again.'));
  });
}
async function validate(file){
  if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG or WebP image.');
  if(file.size>IMAGE_LIMIT)throw new Error('This image is too large. Please choose an image under 10 MB.');
  const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
  const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const png=[137,80,78,71,13,10,26,10].every((value,i)=>bytes[i]===value);
  const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
  if(!(file.type==='image/jpeg'&&jpeg||file.type==='image/png'&&png||file.type==='image/webp'&&webp))throw new Error('This image could not be opened. Please choose another JPG, PNG or WebP file.');
  try{const bitmap=await createImageBitmap(file);const dimensions={width:bitmap.width,height:bitmap.height};bitmap.close();return dimensions;}catch{throw new Error('This image could not be opened. Please choose another JPG, PNG or WebP file.');}
}
export const AssetRepository={
  async saveImage(file){const dimensions=await validate(file);const id=crypto.randomUUID();await transaction('readwrite',store=>store.put({id,blob:file,name:file.name,type:file.type,size:file.size,createdAt:Date.now(),...dimensions}));return id;},
  getImage:id=>id?transaction('readonly',store=>store.get(id)):Promise.resolve(null),
  deleteImage:id=>transaction('readwrite',store=>store.delete(id)),
  // Only explicit candidates are cleaned, never a sweep of another tab's uploads.
  async deleteUnused(ids,used){for(const id of new Set(ids)){if(id&&!used.has(id))await this.deleteImage(id);}},
};
