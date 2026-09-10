import React,{useEffect,useId,useRef,useState} from 'react';
import {t} from '../i18n';
import {AssetRepository} from './asset-repository';
import {useAssetImage} from './use-asset-image';
import {safeImage} from './repository';
import {BlogImage} from './blog-ui';

export function ImageUpload({imageId,legacy='',featured=false,alt='',onChange,onAsset,onBusy}){
  const input=useRef(null),mounted=useRef(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[failed,setFailed]=useState(false);
  const asset=useAssetImage(imageId),src=imageId?asset.src:safeImage(legacy),exists=!!(imageId||legacy),help=useId();
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  useEffect(()=>setFailed(false),[src]);
  async function upload(event){
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    setError('');setBusy(true);onBusy(1);
    try{const id=await AssetRepository.saveImage(file);onAsset(id);const record=await AssetRepository.getImage(id);if(mounted.current)onChange(id,{width:record.width,height:record.height});}
    catch(error){if(mounted.current)setError(error.message);}
    finally{onBusy(-1);if(mounted.current)setBusy(false);}
  }
  const warning=error||asset.error||(failed?'This image is unavailable. Please upload it again.':'');
  return <div className={`editor-upload ${featured?'editor-upload--featured':''}`}>
    {featured?<BlogImage post={{id:'editor-upload',featuredImageId:imageId,featuredImageAlt:alt,image:legacy}}/>:src&&!failed?<img className="editor-upload-preview" src={src} alt={alt} onError={()=>setFailed(true)}/>:<div className="editor-upload-empty"><span aria-hidden="true">↥</span><p>{t('Add a photo to this part of your article.')}</p></div>}
    <input ref={input} className="editor-file-input" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={upload} tabIndex={-1} aria-label={t(featured?'Upload Featured Image':'Upload Image')} disabled={busy}/>
    <div className="editor-upload-actions"><button type="button" className="blog-admin-secondary" disabled={busy} aria-describedby={help} onClick={()=>input.current.click()}>{t(busy?'Uploading image…':exists?'Replace Image':featured?'Upload Featured Image':'Upload Image')}</button>{exists&&<button type="button" className="blog-admin-delete" disabled={busy} onClick={()=>{onChange('');setError('');}}>{t('Remove Image')}</button>}</div>
    <small id={help}>{t('JPG, PNG or WebP. Up to 10 MB per image.')}</small>
    {warning?<p className="blog-form-error" role="alert">{t(warning)}</p>:!featured&&!exists?<p className="editor-image-note">{t('Upload an image here. Empty image blocks will not appear in the public article.')}</p>:null}
  </div>;
}
