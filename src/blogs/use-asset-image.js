import {useEffect,useState} from 'react';
import {AssetRepository} from './asset-repository';

export function useAssetImage(id){
  const [state,setState]=useState({id:'',src:'',loading:false,error:''});
  useEffect(()=>{
    let active=true,url='';
    if(!id){setState({id:'',src:'',loading:false,error:''});return;}
    setState({id,src:'',loading:true,error:''});
    AssetRepository.getImage(id).then(asset=>{
      if(!active)return;
      if(!asset?.blob){setState({id,src:'',loading:false,error:'This image is unavailable. Please upload it again.'});return;}
      url=URL.createObjectURL(asset.blob);setState({id,src:url,loading:false,error:''});
    }).catch(()=>{if(active)setState({id,src:'',loading:false,error:'This image is unavailable. Please upload it again.'});});
    return()=>{active=false;if(url)URL.revokeObjectURL(url);};
  },[id]);
  return state.id===id?state:{id,src:'',loading:!!id,error:''};
}
