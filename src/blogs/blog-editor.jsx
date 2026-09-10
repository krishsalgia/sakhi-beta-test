import React,{useEffect,useRef,useState} from 'react';
import {t} from '../i18n';
import {Icon} from '../ui';
import {BlogRepository,cleanupUnusedImages,slugify,validatePost} from './repository';
import {createBlock,wordCount} from './blocks';
import {ArticleLayout} from './blogs-page';
import {AdminDialog} from './admin-dialog';
import {BlockEditor} from './block-editor';
import {ImageUpload} from './image-upload';
import {SEOPanel,TagInput} from './seo-panel';
import './editor.css';

const blankPost=()=>({title:'',slug:'',excerpt:'',content:'',blocks:[createBlock('paragraph')],image:'',featuredImageId:'',featuredImageAlt:'',author:'Sakhi Editorial',category:'',tags:[],focusKeyword:'',seoTitle:'',metaDescription:'',relatedKeywords:[],publishDate:new Date().toLocaleDateString('en-CA'),status:'draft',featured:false});
export function BlogEditor({post,onDone,onCancel}){
  const [values,setValues]=useState(()=>post?{...post}:blankPost()),[errors,setErrors]=useState({}),[notice,setNotice]=useState(''),[manualSlug,setManualSlug]=useState(!!post),[preview,setPreview]=useState(false),[discard,setDiscard]=useState(false),[uploads,setUploads]=useState(0);
  const initial=useRef(JSON.stringify(values)),form=useRef(null),created=useRef(new Set()),alive=useRef(true);
  const dirty=JSON.stringify(values)!==initial.current;
  useEffect(()=>{alive.current=true;form.current.querySelector('#blog-title').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});return()=>{alive.current=false;cleanupUnusedImages(created.current);};},[]);
  useEffect(()=>{if(!dirty&&!uploads)return;const warn=event=>{event.preventDefault();event.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty,uploads]);
  function change(key,value){setValues(previous=>({...previous,[key]:value,...(key==='title'&&!manualSlug?{slug:slugify(value)}:{})}));setErrors(previous=>({...previous,[key]:''}));setNotice('');}
  const onAsset=id=>{created.current.add(id);if(!alive.current)cleanupUnusedImages([id]);};
  const onBusy=delta=>{if(alive.current)setUploads(value=>Math.max(0,value+delta));};
  function save(status){
    if(uploads)return;
    const next={...values,slug:slugify(values.slug),status:status||values.status};const found=validatePost(next,post?.id);setErrors(found);
    if(Object.keys(found).length){setNotice('Please check the highlighted fields.');requestAnimationFrame(()=>{const invalid=form.current.querySelector('[aria-invalid=true]');if(invalid)invalid.focus();else form.current.querySelector('[data-block-input]')?.focus();});return;}
    try{const result=post?BlogRepository.updatePost(post.id,next):BlogRepository.createPost(next);onDone(result);}catch(error){setNotice(error.message);if(error.fields)setErrors(error.fields);}
  }
  function field(key,label,{textarea=false,rows=3,type='text',maxLength=200,help='',required=true,counter=0}={}){
    const Component=textarea?'textarea':'input',error=errors[key];
    return <label className={`blog-field editor-field--${key}`} htmlFor={`blog-${key}`}><span>{t(label)}{required&&<i aria-hidden="true"> *</i>}</span><Component id={`blog-${key}`} name={key} aria-label={t(label)} type={textarea?undefined:type} rows={textarea?rows:undefined} value={values[key]} maxLength={maxLength} required={required} onChange={event=>{if(key==='slug')setManualSlug(true);change(key,event.target.value);}} onBlur={key==='slug'?()=>change('slug',slugify(values.slug)):undefined} aria-invalid={!!error} aria-describedby={error?`error-${key}`:help?`help-${key}`:undefined}/>{counter>0&&<small className="editor-character-count">{values[key].length} / {counter}</small>}{error?<small className="blog-form-error" id={`error-${key}`}>{t(error)}</small>:help&&<small id={`help-${key}`}>{t(help)}</small>}</label>;
  }
  return <>
    <form className="blog-editor blog-block-editor" ref={form} noValidate onSubmit={event=>{event.preventDefault();save();}}>
      <div className="blog-editor-toolbar"><div><button type="button" className="blog-admin-back" onClick={()=>dirty||uploads?setDiscard(true):onCancel()}>← {t('All blogs')}</button><h1>{t(post?'Edit blog':'Create blog')}</h1></div><div className="blog-editor-actions"><button className="blog-admin-secondary" type="button" disabled={!!uploads} onClick={()=>setPreview(true)}>{t('Preview')}</button><button className="blog-admin-secondary" type="button" disabled={!!uploads} onClick={()=>save('draft')}>{t('Save draft')}</button><button className="blog-admin-primary" type="submit" disabled={!!uploads}>{t('Save blog')}<Icon/></button></div></div>
      {notice&&<p className="blog-admin-notice is-error" role="alert">{t(notice)}</p>}{uploads>0&&<p className="editor-saving-note" role="status">{t('Finishing your image upload…')}</p>}
      <div className="editor-story-intro"><div className="editor-section-heading"><span className="blog-admin-kicker">{t('YOUR ARTICLE')}</span><p>{t('Write, add photos, and make it yours.')}</p></div>{field('title','Title',{maxLength:220})}{field('excerpt','Short excerpt',{textarea:true,rows:3,maxLength:600,help:'A short introduction shown in the Blog listing.'})}</div><div className="blog-editor-columns"><div className="editor-writing-column"><div className="blog-editor-writing"><BlockEditor blocks={values.blocks} onChange={value=>change('blocks',value)} error={errors.blocks} onAsset={onAsset} onBusy={onBusy}/><p className="editor-word-count">{wordCount(values.blocks)} {t('words')}</p></div><SEOPanel values={values} change={change} field={field}/></div>
      <aside className="blog-editor-settings"><h2>{t('Blog details')}</h2><label className="blog-field" htmlFor="blog-status"><span>{t('Status')}</span><select id="blog-status" value={values.status} onChange={event=>change('status',event.target.value)}><option value="draft">{t('Draft')}</option><option value="published">{t('Published')}</option></select></label>{field('slug','URL Slug',{maxLength:180,help:'Auto-generated from the title. You can edit it.'})}<div className="editor-url-preview"><small>{t('Public URL')}</small><span>sakhimultistate.com/blogs/{slugify(values.slug)||'…'}</span></div>{field('author','Author',{maxLength:120})}{field('category','Category',{maxLength:80})}<TagInput label="Tags" value={values.tags} onChange={value=>change('tags',value)}/>{field('publishDate','Publish date',{type:'date'})}<label className="blog-feature-toggle"><input type="checkbox" checked={values.featured} onChange={event=>change('featured',event.target.checked)}/><span>{t('Feature this article')}</span></label><div className="blog-editor-image"><h2>{t('Featured image')}</h2><ImageUpload featured imageId={values.featuredImageId} legacy={values.image} alt={values.featuredImageAlt} onChange={id=>setValues(previous=>({...previous,featuredImageId:id,image:''}))} onAsset={onAsset} onBusy={onBusy}/>{field('featuredImageAlt','Image Alt Text',{required:false,maxLength:300,help:'Describe the image briefly for accessibility and search engines.'})}</div></aside></div>
    </form>
    {preview&&<AdminDialog title="Article preview" onClose={()=>setPreview(false)} wide><article className="journal-page journal-story blog-preview"><ArticleLayout post={{...values,id:post?.id||'preview',title:values.title||t('Untitled article')}} preview/></article></AdminDialog>}
    {discard&&<AdminDialog title="Discard unsaved changes?" onClose={()=>setDiscard(false)}><p>{t('Your saved blog will remain unchanged.')}</p><div className="blog-modal-actions"><button className="blog-admin-secondary" onClick={()=>setDiscard(false)} autoFocus>{t('Keep editing')}</button><button className="blog-admin-danger" onClick={onCancel}>{t('Discard changes')}</button></div></AdminDialog>}
  </>;
}
