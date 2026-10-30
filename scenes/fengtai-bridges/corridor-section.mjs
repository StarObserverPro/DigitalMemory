const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function corridorSection(p){
 const low=39.8441,high=39.84625,feather=.00035;
 const enclosed=smooth((p.lat-(low-feather))/feather)*(1-smooth((p.lat-high)/feather));
 const serviceCenter=31-.3*enclosed,serviceWidth=10-.4*enclosed;
 const serviceInner=serviceCenter-serviceWidth/2,serviceOuter=serviceCenter+serviceWidth/2;
 const walkWidth=serviceWidth*.5,walkInner=serviceOuter+.35*(1-enclosed),walkOuter=walkInner+walkWidth;
 return{serviceCenter,serviceWidth,serviceInner,serviceOuter,walkInner,walkOuter,walkWidth,walkCenter:(walkInner+walkOuter)/2,outerWall:41.75-.75*enclosed,enclosed};
}
export function softBow(station){
 const spans=[42,68,55,83],strength=[.55,.95,.7,.85],period=spans.reduce((a,b)=>a+b,0);let s=((station%period)+period)%period;
 for(let i=0;i<spans.length;i++){if(s<=spans[i]){const t=s/spans[i];return 16*t*t*(1-t)*(1-t)*strength[i];}s-=spans[i];}
 return 0;
}
export const sectionEvidence={ratio:.5,typicalServiceM:10,typicalWalkM:5,underpassServiceM:9.6,underpassWalkM:4.8,status:"approximate selected widths"};
