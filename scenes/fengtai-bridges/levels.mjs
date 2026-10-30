const profiles={
 west:[[39.8421,0],[39.84325,-1.2],[39.84455,-5.48],[39.8459,-5.48],[39.84655,-3.6],[39.84845,0]],
 east:[[39.8421,0],[39.8432,-2.8],[39.84455,-5.48],[39.8459,-5.48],[39.8471,-3.8],[39.8488,0]]
};
export const evidence={status:"approximate independent side profiles; exact historical dimensions unknown"};
function interpolate(points,lat){if(lat<=points[0][0])return points[0][1];for(let i=1;i<points.length;i++)if(lat<points[i][0]){const[a,y]=points[i-1],[b,z]=points[i],t=(lat-a)/(b-a),s=t*t*(3-2*t);return y+(z-y)*s;}return points.at(-1)[1];}
export const sideSurface=(p,side=1)=>interpolate(profiles[side<0?'west':'east'],p.lat)+.1;
export const sideTerrace=(p,side)=>sideSurface(p,side)+(side<0?.65:.28);
export const outerGround=(p,side)=>side<0?.26:.12;
export const profilesForAudit=profiles;
