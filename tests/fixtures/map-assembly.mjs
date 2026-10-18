/** Synthetic illustration units only. No Fengtai coordinates, dimensions or private content. */
export function exampleFeature(id = 'new-corner', ground = [470, 340, 64, 36]) {
  const [x,y,w,h] = ground;
  return {
    id, placeId: `fixture-place-${id}`, registrationRef: `fixture-registration:${id}`,
    ground, emphasis: 'memory', priority: 60, label: 'Remembered corner',
    states: [{ id: `${id}-2005`, approval: 'accepted', periodIds: ['sample-2005'], representations: {
      1: { assetRef: 'fixture-corner-neighborhood@1', styleRevision: 'journal-sample-1', bounds: [x,y-40,w,h+40], groundAnchor: [x+w/2,y+h], labelBounds: [x-10,y+h+3,w+20,12] },
      2: { assetRef: 'fixture-corner-street-map@1', styleRevision: 'journal-sample-1', bounds: [x,y-40,w,h+40], groundAnchor: [x+w/2,y+h], labelBounds: [x-10,y+h+3,w+20,12] },
    }}],
  };
}
export function assemblyFixture() {
  const landmark = exampleFeature('hall', [540, 95, 90, 60]);
  landmark.emphasis = 'landmark'; landmark.priority = 100; landmark.label = 'Hall';
  landmark.states[0].periodIds = ['sample-1995', 'sample-2005'];
  landmark.states[0].representations[0] = structuredClone(landmark.states[0].representations[1]);
  const bands = [
    {id:'walk-west', role:'sidewalk', modes:['walk'], profiles:[{t:0,offset:-32,width:4,elevation:0},{t:.5,offset:-31,width:4,elevation:-2},{t:1,offset:-32,width:4,elevation:0}]},
    {id:'service-west', role:'service', modes:['cycle','vehicle'], profiles:[{t:0,offset:-24,width:9,elevation:0},{t:.5,offset:-23,width:9,elevation:-3},{t:1,offset:-24,width:9,elevation:0}]},
    {id:'main', role:'main', modes:['vehicle'], profiles:[{t:0,offset:0,width:30,elevation:0},{t:.5,offset:0,width:30,elevation:-6},{t:1,offset:0,width:30,elevation:0}]},
    {id:'service-east', role:'service', modes:['cycle','vehicle'], profiles:[{t:0,offset:24,width:9,elevation:0},{t:.5,offset:26,width:9,elevation:-1},{t:1,offset:24,width:9,elevation:0}]},
    {id:'walk-east', role:'sidewalk', modes:['walk'], profiles:[{t:0,offset:32,width:4,elevation:0},{t:.5,offset:34,width:4,elevation:-1},{t:1,offset:32,width:4,elevation:0}]},
  ];
  return {
    schemaVersion:1, id:'synthetic-composition', revision:1, layoutRevision:'synthetic-artboard-1',
    registrationBounds:[100,50,650,500], backdrop:{styleRevision:'paper-1',fill:'#f3ecd9'},
    context:[
      {id:'west-north',bounds:[0,0,450,300],interactive:false,recipe:{seed:'wn-1',styleRevision:'journal-sample-1',typology:'slab-rows',sourceStatus:'synthetic'}},
      {id:'east-north',bounds:[450,0,450,300],interactive:false,recipe:{seed:'en-1',styleRevision:'journal-sample-1',typology:'mixed-towers-slabs',sourceStatus:'synthetic'}},
      {id:'west-south',bounds:[0,300,450,300],interactive:false,recipe:{seed:'ws-1',styleRevision:'journal-sample-1',typology:'low-roof-grain',sourceStatus:'synthetic'}},
      {id:'east-south',bounds:[450,300,450,300],interactive:false,recipe:{seed:'es-1',styleRevision:'journal-sample-1',typology:'quiet-green-roof-wash',sourceStatus:'synthetic'}},
    ].map(patch => ({...patch, recipe:{seed:patch.recipe.seed+'-neutral',styleRevision:patch.recipe.styleRevision,typology:'land-wash'}, states:[{id:patch.id+'-supported',approval:'accepted',periodIds:['sample-1995','sample-2005'],recipe:patch.recipe}]})),
    roads:[{id:'sample-ring-section',registrationRef:'fixture-road:ring',states:[{
      id:'ring-state',approval:'accepted',periodIds:['sample-1995','sample-2005'],
      basePartId:'road-floor',reservations:[[350,0,90,600],[315,205,160,25],[315,270,160,35]],bands,
      parts:[
        {id:'road-floor',kind:'surface',minLevel:0,bounds:[300,0,180,600],paintAfter:[]},
        {id:'wall-rear',kind:'retaining-wall',minLevel:0,bounds:[350,160,10,220],paintAfter:['road-floor']},
        {id:'road-deck-north',kind:'deck',minLevel:0,bounds:[315,205,160,25],paintAfter:['wall-rear']},
        {id:'rail-deck-south',kind:'deck',minLevel:0,bounds:[315,270,160,35],paintAfter:['wall-rear']},
        {id:'wall-near',kind:'retaining-wall',minLevel:1,bounds:[430,160,10,220],paintAfter:['road-floor']},
        {id:'railings',kind:'railing',minLevel:2,bounds:[315,268,160,4],paintAfter:['rail-deck-south']},
      ],
    }]}],
    features:[landmark],
  };
}
