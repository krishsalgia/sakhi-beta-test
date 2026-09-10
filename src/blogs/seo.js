import {blocksText,wordCount} from './blocks';
export const seoTitle=post=>post.seoTitle?.trim()||`${post.title||'Sakhi Journal'} | Sakhi`;
export const seoDescription=post=>post.metaDescription?.trim()||post.excerpt||'';
const folded=value=>String(value||'').normalize('NFC').toLocaleLowerCase().replace(/[^\p{L}\p{N}\p{M}]+/gu,' ').trim();
export function seoChecks(post){
  const keyword=folded(post.focusKeyword),title=seoTitle(post),description=seoDescription(post);
  const check=(label,good,hint,missing=false)=>({label,status:good?'Good':missing?'Missing':'Needs Attention',hint:good?'':hint});
  const contains=value=>!!keyword&&folded(value).includes(keyword);
  return [
    check('Focus Keyword added',!!keyword,'Choose one phrase people might search for.',!keyword),
    check('Focus Keyword in Blog title',contains(post.title),'Include your Focus Keyword naturally in the Blog title.',!keyword),
    check('Focus Keyword in SEO title',contains(title),'Include your Focus Keyword naturally in the SEO title.',!keyword),
    check('Focus Keyword in Meta Description',contains(description),'Add your Focus Keyword to the Meta Description.',!keyword),
    check('Focus Keyword in URL slug',contains(post.slug),'Use your Focus Keyword in the URL slug where it fits.',!keyword),
    check('SEO title length',title.length>=50&&title.length<=60,'Aim for about 50–60 characters. This is a guide, not a publishing limit.'),
    check('Meta Description length',description.length>=140&&description.length<=160,'Aim for about 140–160 characters. A clear summary matters most.',!description),
    check('Featured Image added',!!(post.featuredImageId||post.image),'Upload a Featured Image for your article.',!post.featuredImageId&&!post.image),
    check('Featured Image Alt Text',!!post.featuredImageAlt?.trim(),'Briefly describe the Featured Image.',!post.featuredImageAlt?.trim()),
    check('Article headings',post.blocks?.some(block=>block.type==='heading'&&blocksText([block]).trim()),'Add a heading to help readers follow your article.'),
    check('Written content',wordCount(post.blocks)>=100,'Consider adding more useful detail. This check looks for at least 100 words.',!blocksText(post.blocks).trim()),
  ];
}
