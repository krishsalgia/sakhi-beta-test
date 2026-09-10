// Plain, portable article data. Existing Markdown posts are converted on read;
// no existing post is deleted or overwritten just by opening the editor.
export const BLOCK_TYPES = ['paragraph','heading','image','bulletList','numberedList','quote'];
export function safeLink(value) {
  const text=String(value||'').trim();
  if(!text || /[\\\u0000-\u001f]/.test(text))return null;
  if(/^\/(?!\/)/.test(text)||text.startsWith('#'))return text;
  try {const url=new URL(text);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}
}
export function inlineRuns(value) {
  if(Array.isArray(value))return value.filter(run=>run&&typeof run.text==='string').map(run=>({text:run.text,...(run.bold?{bold:true}:{}),...(run.italic?{italic:true}:{}),...(safeLink(run.href)?{href:safeLink(run.href)}:{})}));
  return [{text:String(value||'')}];
}
export const runText=value=>inlineRuns(value).map(run=>run.text).join('');
function legacyInline(text) {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean).map(part=>{
    if(part.startsWith('**')&&part.endsWith('**'))return{text:part.slice(2,-2),bold:true};
    const link=part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);return link?{text:link[1],...(safeLink(link[2])?{href:safeLink(link[2])}:{})}:{text:part};
  });
}
export function legacyBlocks(content) {
  const lines=String(content||'').replace(/\r/g,'').split('\n'),blocks=[];let index=0;
  const heading=line=>/^(#{1,3})\s+/.test(line),list=line=>/^\s*[-*]\s+/.test(line)?'bulletList':/^\s*\d+\.\s+/.test(line)?'numberedList':null;
  const add=block=>blocks.push({id:`legacy-${blocks.length}`,...block});
  while(index<lines.length){
    if(!lines[index].trim()){index++;continue;}
    if(heading(lines[index])){const match=lines[index++].match(/^(#{1,3})\s+(.+)$/);if(match)add({type:'heading',level:match[1].length===3?3:2,content:legacyInline(match[2])});continue;}
    const kind=list(lines[index]);if(kind){const items=[];while(index<lines.length&&list(lines[index])===kind)items.push(legacyInline(lines[index++].replace(/^\s*(?:[-*]|\d+\.)\s+/,'')));add({type:kind,items});continue;}
    const paragraph=[];while(index<lines.length&&lines[index].trim()&&!heading(lines[index])&&!list(lines[index]))paragraph.push(lines[index++]);
    add({type:'paragraph',content:legacyInline(paragraph.join('\n'))});
  }
  return blocks;
}
export function normalizeBlocks(value,legacy='') {
  if(!Array.isArray(value))return legacyBlocks(legacy);
  const ids=new Set();
  return value.filter(block=>block&&BLOCK_TYPES.includes(block.type)).map((block,index)=>{
    let id=typeof block.id==='string'&&block.id?block.id:`block-${index}`;
    while(ids.has(id))id+='-copy';ids.add(id);
    if(block.type==='image')return{id,type:'image',imageId:String(block.imageId||''),alt:String(block.alt||''),caption:String(block.caption||''),width:Number(block.width)||0,height:Number(block.height)||0};
    if(block.type==='bulletList'||block.type==='numberedList')return{id,type:block.type,items:Array.isArray(block.items)?block.items.map(inlineRuns):[]};
    return{id,type:block.type,content:inlineRuns(block.content),...(block.type==='heading'?{level:block.level===3?3:2}:{})};
  });
}
export const blocksText=blocks=>normalizeBlocks(blocks).map(block=>block.type==='image'?'':block.items?block.items.map(runText).join('\n'):runText(block.content)).join('\n\n');
export const wordCount=blocks=>blocksText(blocks).trim().split(/\s+/).filter(Boolean).length;
export const createBlock=type=>normalizeBlocks([{id:crypto.randomUUID(),type,level:2,content:'',items:['']}])[0];
export const assetIDs=posts=>new Set(posts.flatMap(post=>[post.featuredImageId,...normalizeBlocks(post.blocks,post.content).filter(block=>block.type==='image').map(block=>block.imageId)]).filter(Boolean));
