/** Trial illustration placement. Source control points stay in the spatial registry. */
export function compileCompoundTrials(registration,transform,assets) {
  return (registration.trialCompounds||[]).map(c=>{
    const asset=assets[c.assetRef];if(!asset)throw new Error('Missing compound asset: '+c.id);
    const p=c.controlPoints;if(p.length!==3||p[0].pixel[0]!==0||p[0].pixel[1]!==0||p[1].pixel[0]!==asset.width||p[2].pixel[1]!==asset.height)throw new Error('Invalid compound control frame');
    const [o,x,y]=p.map(p=>transform.toImage(p.geo));
    const matrix=[(x[0]-o[0])/asset.width,(x[1]-o[1])/asset.width,(y[0]-o[0])/asset.height,(y[1]-o[1])/asset.height,...o];
    if(!matrix.every(Number.isFinite)||matrix[0]*matrix[3]-matrix[1]*matrix[2]<=0)throw new Error('Invalid compound projection');
    return {...c,matrix,anchor:transform.toImage(c.geo),mask:c.contextMaskGeo.map(transform.toImage)};
  });
}
export const visibleCompoundTrials=(assembly,state,available)=>assembly.compounds.filter(c=>c.periodIds.includes(state.periodId)&&available.includes(c.assetRef));
export function compoundTrialMarkup(compounds,assets,level) {
  return `<g data-layer="compound-illustrations" mask="url(#compound-road-clear)">${[...compounds].sort((a,b)=>a.anchor[1]-b.anchor[1]).map(c=>{
    const a=assets[c.assetRef];return `<image data-compound="${c.id}" transform="matrix(${c.matrix.join(' ')})" x="0" y="0" width="${a.width}" height="${a.height}" preserveAspectRatio="none" href="${a.url}" opacity="${level===0?.75:.94}"/>`;
  }).join('')}</g>`;
}
