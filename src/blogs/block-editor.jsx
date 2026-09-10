import React,{useEffect,useId,useRef,useState} from 'react';
import {t} from '../i18n';
import {BLOCK_TYPES,createBlock,inlineRuns,runText,safeLink} from './blocks';
import {ImageUpload} from './image-upload';

export const BLOCK_LABELS={paragraph:'Paragraph',heading:'Heading',image:'Image',bulletList:'Bullet List',numberedList:'Numbered List',quote:'Quote'};
const BLOCK_ICONS={paragraph:'¶',heading:'H',image:'▧',bulletList:'•',numberedList:'1.',quote:'“'};
function readRuns(root){
  const runs=[];
  function walk(node,marks={}){
    if(node.nodeType===3){if(node.textContent)runs.push({text:node.textContent,...marks});return;}
    if(node.nodeType!==1)return;
    if(node.tagName==='BR'){runs.push({text:'\n',...marks});return;}
    const next={...marks};if(['B','STRONG'].includes(node.tagName)||Number(node.style.fontWeight)>=600)next.bold=true;
    if(['I','EM'].includes(node.tagName)||node.style.fontStyle==='italic')next.italic=true;
    if(node.tagName==='A'&&safeLink(node.getAttribute('href')))next.href=safeLink(node.getAttribute('href'));
    if(['DIV','P'].includes(node.tagName)&&runs.length&&!runs.at(-1).text.endsWith('\n'))runs.push({text:'\n'});
    node.childNodes.forEach(child=>walk(child,next));
  }
  root.childNodes.forEach(node=>walk(node));return runs.length?runs:[{text:''}];
}
function writeRuns(root,value){
  const nodes=inlineRuns(value).map(run=>{
    const fragment=document.createDocumentFragment();run.text.split('\n').forEach((line,index)=>{if(index)fragment.append(document.createElement('br'));fragment.append(document.createTextNode(line));});
    let node=fragment;for(const tag of [run.bold?'strong':null,run.italic?'em':null,run.href?'a':null].filter(Boolean)){const parent=document.createElement(tag);if(tag==='a')parent.setAttribute('href',run.href);parent.append(node);node=parent;}return node;
  });root.replaceChildren(...nodes);
}
function RichText({value,onChange,label,heading=false}){
  const editor=useRef(null),selection=useRef(null),linkInput=useRef(null),[linkOpen,setLinkOpen]=useState(false),[link,setLink]=useState(''),[error,setError]=useState('');
  useEffect(()=>{if(document.activeElement!==editor.current)writeRuns(editor.current,value);},[value]);
  const remember=()=>{const selected=window.getSelection();if(selected.rangeCount&&editor.current.contains(selected.anchorNode))selection.current=selected.getRangeAt(0).cloneRange();};
  const restore=()=>{editor.current.focus();if(selection.current){const selected=window.getSelection();selected.removeAllRanges();selected.addRange(selection.current);}};
  function command(name,value){restore();document.execCommand(name,false,value);onChange(readRuns(editor.current));remember();}
  function addLink(){remember();setLinkOpen(true);setError('');setTimeout(()=>linkInput.current?.focus(),0);}
  return <div className={`editor-rich-wrap ${heading?'is-heading':''}`}>
    <div className="editor-format-tools" role="group" aria-label={t('Text formatting')}>
      <button type="button" aria-label={t('Bold')} title={t('Bold')} onMouseDown={e=>e.preventDefault()} onClick={()=>command('bold')}><strong>B</strong></button>
      <button type="button" aria-label={t('Italic')} title={t('Italic')} onMouseDown={e=>e.preventDefault()} onClick={()=>command('italic')}><em>I</em></button>
      <button type="button" onMouseDown={e=>e.preventDefault()} onClick={addLink}>{t('Link')}</button>
      <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command('unlink')}>{t('Remove link')}</button>
    </div>
    {linkOpen&&<div className="editor-link-form"><label>{t('Link destination')}<input ref={linkInput} type="url" value={link} onChange={e=>{setLink(e.target.value);setError('');}} placeholder="https://" onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.currentTarget.closest('.editor-link-form').querySelector('button').click();}if(e.key==='Escape'){setLinkOpen(false);restore();}}}/></label><button className="blog-admin-secondary" type="button" onClick={()=>{const href=safeLink(link);if(!href){setError('Enter a valid website link beginning with https:// or http://.');return;}restore();if(window.getSelection().isCollapsed){const selected=window.getSelection(),range=selected.getRangeAt(0),anchor=document.createElement('a');anchor.href=href;anchor.textContent=link;range.insertNode(anchor);range.setStartAfter(anchor);range.collapse(true);selected.removeAllRanges();selected.addRange(range);}else document.execCommand('createLink',false,href);onChange(readRuns(editor.current));setLinkOpen(false);setLink('');}}>{t('Apply link')}</button><button type="button" onClick={()=>{setLinkOpen(false);restore();}}>{t('Cancel')}</button>{error&&<p className="blog-form-error" role="alert">{t(error)}</p>}</div>}
    <div ref={editor} className="editor-rich-text" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label={label} data-block-input data-empty={!runText(value)} data-placeholder={t(heading?'Write a heading…':'Start writing…')} onInput={()=>onChange(readRuns(editor.current))} onKeyUp={remember} onMouseUp={remember} onBlur={remember} onClick={event=>{if(event.target.closest('a'))event.preventDefault();}} onPaste={event=>{event.preventDefault();document.execCommand('insertText',false,event.clipboardData.getData('text/plain'));onChange(readRuns(editor.current));}}/>
  </div>;
}
function AddBlock({onAdd}){
  const [open,setOpen]=useState(false),root=useRef(null),id=useId();
  useEffect(()=>{if(open)root.current.querySelector('.editor-block-menu button')?.focus();},[open]);
  return <div className="editor-add-block" ref={root} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);root.current.querySelector('button').focus();}}}>
    <button type="button" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>+ {t('Add Block')}</button>
    {open&&<div className="editor-block-menu" id={id} role="group" aria-label={t('Choose a block type')}>{BLOCK_TYPES.map(type=><button type="button" key={type} onClick={()=>{onAdd(type);setOpen(false);}}><span aria-hidden="true">{BLOCK_ICONS[type]}</span>{t(BLOCK_LABELS[type])}</button>)}</div>}
  </div>;
}
export function BlockEditor({blocks,onChange,error,onAsset,onBusy}){
  const root=useRef(null),[active,setActive]=useState('');
  const focus=id=>requestAnimationFrame(()=>{root.current.querySelector(`[data-block-id="${CSS.escape(id)}"] [data-block-input]`)?.focus();});
  const update=(id,patch)=>onChange(blocks.map(block=>block.id===id?{...block,...patch}:block));
  function add(index,type){const block=createBlock(type);onChange([...blocks.slice(0,index),block,...blocks.slice(index)]);setActive(block.id);focus(block.id);}
  function move(index,delta){const next=[...blocks];[next[index],next[index+delta]]=[next[index+delta],next[index]];onChange(next);}
  return <section className="editor-blocks" ref={root} aria-labelledby="editor-content-title"><div className="editor-section-heading"><h2 id="editor-content-title">{t('Content')}</h2><p>{t('Build your article, one block at a time.')}</p></div>{error&&<p className="blog-form-error" role="alert">{t(error)}</p>}
    <AddBlock onAdd={type=>add(0,type)}/>
    {blocks.map((block,index)=><React.Fragment key={block.id}><div className={`editor-block editor-block--${block.type}`} data-block-id={block.id} data-active={active===block.id} onFocusCapture={()=>setActive(block.id)} onClick={()=>setActive(block.id)}>
      <div className="editor-block-toolbar"><span>{t(BLOCK_LABELS[block.type])}<small>{String(index+1).padStart(2,'0')}</small></span><div>{block.type==='heading'&&<select aria-label={t('Heading level')} value={block.level} onChange={e=>update(block.id,{level:Number(e.target.value)})}><option value={2}>H2</option><option value={3}>H3</option></select>}<button type="button" aria-label={t('Move Up')} title={t('Move Up')} disabled={index===0} onClick={()=>move(index,-1)}>↑</button><button type="button" aria-label={t('Move Down')} title={t('Move Down')} disabled={index===blocks.length-1} onClick={()=>move(index,1)}>↓</button><button type="button" className="editor-remove-block" onClick={()=>{onChange(blocks.filter(b=>b.id!==block.id));requestAnimationFrame(()=>root.current.querySelectorAll('.editor-add-block>button')[Math.min(index,blocks.length-1)]?.focus());}}>{t('Remove block')}</button></div></div>
      {block.type==='image'?<div className="editor-image-block"><ImageUpload imageId={block.imageId} alt={block.alt} onChange={(imageId,dimensions={width:0,height:0})=>update(block.id,{imageId,...dimensions})} onAsset={onAsset} onBusy={onBusy}/><label className="blog-field"><span>{t('Alt Text')}</span><input data-block-input aria-label={t('Alt Text')} aria-describedby={`alt-help-${block.id}`} value={block.alt} maxLength={300} onChange={e=>update(block.id,{alt:e.target.value})}/><small id={`alt-help-${block.id}`}>{t('Briefly describe what is shown in the image.')}</small></label><label className="blog-field"><span>{t('Caption')} <small>{t('(optional)')}</small></span><input value={block.caption} maxLength={500} onChange={e=>update(block.id,{caption:e.target.value})}/></label></div>:block.items?<label className="editor-list-input"><span className="editor-list-guide">{t('Write one item per line.')}</span><textarea data-block-input aria-label={`${t(BLOCK_LABELS[block.type])} ${index+1}`} rows={Math.max(3,block.items.length)} value={block.items.map(runText).join('\n')} onChange={e=>update(block.id,{items:e.target.value.split('\n').map(text=>[{text}])})}/></label>:<RichText value={block.content} label={`${t(BLOCK_LABELS[block.type])} ${index+1}`} heading={block.type==='heading'} onChange={content=>update(block.id,{content})}/>}
    </div><AddBlock onAdd={type=>add(index+1,type)}/></React.Fragment>)}
  </section>;
}
