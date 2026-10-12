const THREE = require('./three');
const RoundedBoxGeometry = require('./rounded-box')(THREE);
const boatRoute = require('./boat-route');
module.exports = function createScene(canvas, width, height, pixelRatio, onError, onTheme = () => {}) {
  const listeners = {};
  const facade = {
    style: {},
    get width() { return canvas.width; }, set width(v) { canvas.width=v; },
    get height() { return canvas.height; }, set height(v) { canvas.height=v; },
    getContext: (...args) => canvas.getContext(...args),
    addEventListener(n,f) { (listeners[n] || (listeners[n]=[])).push(f); },
    removeEventListener(n,f) { listeners[n]=(listeners[n]||[]).filter(fn=>fn!==f); },
    dispatchEvent(e) { (listeners[e.type]||[]).slice().forEach(fn=>fn(e)); }
  };
  const context=canvas.getContext('webgl',{antialias:true,alpha:true});
  if(!context)throw new Error('设备暂不支持 WebGL，请更新微信后重试。');
  const renderer=new THREE.WebGLRenderer({canvas:facade,context,antialias:true,alpha:true});
  renderer.setClearColor(0x000000,0);
  // Match the phone's physical pixels, bounded only by the GPU's canvas limits.
  const requestedRatio=Number.isFinite(pixelRatio)&&pixelRatio>0?pixelRatio:1;
  const maxBuffer=context.getParameter(context.MAX_RENDERBUFFER_SIZE);
  const maxViewport=context.getParameter(context.MAX_VIEWPORT_DIMS);
  function resolution(w,h){return Math.min(requestedRatio,maxBuffer/w,maxBuffer/h,maxViewport[0]/w,maxViewport[1]/h);}
  renderer.setPixelRatio(resolution(width,height));
  renderer.setSize(width,height,false);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  // Lighting intensity changes do not change the shadow geometry.
  // Refresh moving shadows at 15 Hz rather than doing a second scene pass every frame.
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,width/height,.1,220);
  const touchDevice=true;
const world = new THREE.Group(); scene.add(world);
const materials = new Map();
function mat(color, roughness=.72){const key=`${color}/${roughness}`;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness}));return materials.get(key);}
const cream=mat('#fff6e4'), white=mat('#ffffff'), steel=mat('#b3cec6'), coral=mat('#ed967d'), teal=mat('#438e82'), gold=mat('#eaba67'), asphalt=mat('#718788'), foliage=mat('#8bc29a');
const windows = new THREE.MeshStandardMaterial({color:'#416f78',roughness:.24,metalness:.18,emissive:'#ffe0a0',emissiveIntensity:0});
const bulbMat = new THREE.MeshStandardMaterial({color:'#ffdfa0',emissive:'#ffc978',emissiveIntensity:.05});
function mesh(geo, material, pos, parent=world){const o=new THREE.Mesh(geo,material);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(w,h,d,color,pos,parent=world,r=.08){return mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),typeof color==='string'?mat(color):color,pos,parent);}
function sphere(r,color,pos,parent=world,scale=[1,1,1]){const o=mesh(new THREE.SphereGeometry(r,16,12),typeof color==='string'?mat(color):color,pos,parent);o.scale.set(...scale);return o;}
function bar(a,b,r,color,parent=world){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b);const o=mesh(new THREE.CylinderGeometry(r,r,av.distanceTo(bv),8),color,av.clone().add(bv).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());return o;}
const ambient=new THREE.HemisphereLight('#f5fbff','#abb9a3',2.6);scene.add(ambient);
const sun=new THREE.DirectionalLight('#fff3dc',4);sun.position.set(-9,18,10);sun.castShadow=true;sun.shadow.mapSize.set(touchDevice?1024:2048,touchDevice?1024:2048);sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=18;sun.shadow.camera.bottom=-12;sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;scene.add(sun);
const fill=new THREE.DirectionalLight('#b9e2fa',1.6);fill.position.set(10,8,-10);scene.add(fill);

// A rounded miniature island: the Hai River flows under Yongle Bridge.
box(18,.7,12,'#c5dbce',[0,-.75,0],world,.45);
box(17.8,.25,11.8,'#e6e6ce',[0,-.31,0],world,.3);
const waterMat=new THREE.MeshStandardMaterial({color:'#70c5c2',roughness:.3,metalness:.12});
box(9.6,.24,11.65,waterMat,[0,-.16,0],world,.15);
for(const side of [-1,1]){
  box(3.9,.17,11.6,'#c8dcb1',[side*6.78,-.12,0],world,.16);
  box(.28,.35,11.6,cream,[side*4.95,-.05,0]);
  box(.76,.1,11.6,'#eadfca',[side*5.5,0,0]);
  for(let i=0;i<12;i++)box(.53,.014,.035,'#d2c8b2',[side*5.5,.06,-5.15+i*.91]);
}
const ripples=[];
for(let i=0;i<39;i++){const x=Math.sin(i*127.1)*4.4,z=Math.cos(i*67.3)*5.25;const o=box(.23+(i%4)*.24,.012,.033,'#b2e7de',[x,-.028,z],world,.01);o.castShadow=false;ripples.push(o);}
// Bridge deck, piers, safety rails and quiet miniature traffic.
box(18.4,.4,2.15,cream,[0,.67,0],world,.2);
box(18.1,.11,1.72,asphalt,[0,.91,0],world,.08);
for(let i=0;i<23;i++)box(.38,.014,.055,'#f1ead2',[-8.5+i*.77,.975,0],world,.01);
for(const x of [-4.15,4.15]){box(.8,1.12,2.3,steel,[x,.06,0],world,.18);box(1.2,.25,2.7,cream,[x,-.35,0]);}
for(const z of [-1.12,1.12]){
  bar([-9,1.35,z],[9,1.35,z],.045,cream);
  for(let x=-8.8;x<9;x+=.63)bar([x,.85,z],[x,1.36,z],.032,cream);
  box(18.3,.14,.2,'#d8cdb0',[0,.99,z]);
}
function car(color,x,z){const g=new THREE.Group();world.add(g);g.position.set(x,1.06,z);box(.73,.27,.37,color,[0,.16,0],g,.11);box(.37,.22,.32,cream,[-.04,.35,0],g,.09);box(.25,.13,.332,windows,[-.04,.38,0],g,.045);for(const a of [-.23,.23])for(const b of [-.19,.19]){const w=mesh(new THREE.CylinderGeometry(.095,.095,.06,12),mat('#3d5050'),[a,.035,b],g);w.rotation.x=Math.PI/2;}return g;}
const cars=[car(coral,-6,.48),car(gold,6,-.45),car(teal,-1,-.45)];

// The two A-shaped supports sit on the bridge, framing the wheel axle.
const cy=6.2,R=4.72;
for(const z of [-.82,.82]){
  bar([-2.68,1.13,z],[0,cy,z*.55],.16,cream);
  bar([2.68,1.13,z],[0,cy,z*.55],.16,cream);
  for(const x of [-2.68,2.68])box(.65,.27,.73,steel,[x,1.12,z],world,.1);
}
bar([0,cy,-1.08],[0,cy,1.08],.23,cream);
const rotor=new THREE.Group();rotor.position.y=cy;world.add(rotor);
for(const z of [-.3,.3]){
  const ring=mesh(new THREE.TorusGeometry(R,.105,10,128),cream,[0,0,z],rotor);
  mesh(new THREE.TorusGeometry(R-.27,.045,8,128),steel,[0,0,z],rotor);
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;bar([0,0,z],[Math.cos(a)*(R-.22),Math.sin(a)*(R-.22),z],.027,cream,rotor);}
}
const hub=mesh(new THREE.CylinderGeometry(.43,.43,.93,32),cream,[0,cy,0]);hub.rotation.x=Math.PI/2;
sphere(.26,gold,[0,cy,.56],world,[1,1,.37]);
const cabins=[];
const cabinColors=['#edac88','#91bec0','#eac676','#b3b1ce','#90bc9d','#e9b5ae'];
for(let i=0;i<24;i++){
  const a=i/24*Math.PI*2;
  bar([Math.cos(a)*R,Math.sin(a)*R,-.36],[Math.cos(a)*R,Math.sin(a)*R,.36],.042,steel,rotor);
  const pivot=new THREE.Group();rotor.add(pivot);pivot.position.set(Math.cos(a)*R,Math.sin(a)*R,0);
  const cab=new THREE.Group();pivot.add(cab);
  const color=mat(cabinColors[i%6]);
  box(.55,.16,.59,color,[0,-.36,0],cab,.07);
  box(.49,.38,.51,windows,[0,-.09,0],cab,.12);
  box(.57,.15,.58,color,[0,.16,0],cab,.07);
  for(const x of [-.2,.2])for(const z of [-.215,.215])bar([x,-.24,z],[x,.14,z],.022,cream,cab);
  box(.45,.042,.53,cream,[0,-.095,0],cab,.015);
  bar([0,.19,0],[0,.34,0],.037,steel,cab);
  cabins.push(pivot);
  sphere(.054,bulbMat,[Math.cos(a)*R,Math.sin(a)*R,.39],rotor);
}
// Rounded trees, small riverside houses and warm street lamps.
function tree(x,z,size=1){const g=new THREE.Group();g.position.set(x,.01,z);g.scale.setScalar(size);world.add(g);bar([0,0,0],[0,.83,0],.085,mat('#b29b79'),g);sphere(.48,foliage,[0,1.14,0],g,[.88,1.15,.88]);sphere(.37,mat('#a9cb94'),[-.23,.97,.04],g);sphere(.3,mat('#74af91'),[.23,1.14,.02],g);}
for(const side of [-1,1])for(let i=0;i<6;i++)tree(side*(6.3+(i%2)*.55),-4.75+i*1.88,.68+(i%3)*.16);
function house(x,z,w,h,c){const g=new THREE.Group();g.position.set(x,.02,z);world.add(g);box(w,h,.88,c,[0,h/2,0],g,.08);box(w+.15,.17,1.04,cream,[0,h+.03,0],g,.06);for(let a=-1;a<=1;a+=2)for(let y=.31;y<h-.06;y+=.39)box(.18,.23,.015,windows,[a*w*.25,y,.452],g,.03);box(.2,.34,.025,teal,[0,.19,.458],g,.03);}
house(-7.72,-3.5,.83,1.3,'#edb196');house(-7.62,-2.23,.94,1.7,'#f1d29d');house(-7.75,3.1,.9,1.25,'#aac4ca');house(7.65,-3.65,.9,1.7,'#d2bcb0');house(7.7,2.7,.88,1.28,'#edcba0');house(7.72,4.2,.9,1.65,'#b0c7ca');
for(const side of [-1,1])for(const z of [-3.8,3.8]){bar([side*5.25,.03,z],[side*5.25,1.05,z],.035,teal);sphere(.105,bulbMat,[side*5.25,1.08,z]);}
for(const side of [-1,1])for(const z of [-2.8,2.8]){box(.22,.11,.68,'#c39673',[side*5.7,.3,z]);box(.09,.35,.7,teal,[side*5.85,.38,z]);for(const d of [-.22,.22])bar([side*5.7,.05,z+d],[side*5.7,.3,z+d],.032,teal);}
// A tiny sightseeing boat below the bridge.
const boat=new THREE.Group();world.add(boat);boat.position.set(-1.4,.05,3.6);boat.rotation.y=Math.PI;
boat.scale.y=.48; // Keep the roof below the bridge deck, including the bobbing motion.
box(1.05,.25,1.88,cream,[0,.16,0],boat,.18);box(.83,.33,1.1,coral,[0,.39,-.1],boat,.12);box(.67,.24,.89,windows,[0,.49,-.1],boat,.08);box(.96,.13,1.3,cream,[0,.68,-.1],boat,.09);box(.65,.09,.51,gold,[0,.33,.58],boat);
// Soft clouds complete the toy-like silhouette without obscuring the wheel.
const clouds=[];
const cloudMat=white.clone();cloudMat.transparent=true;cloudMat.depthWrite=false;
function cloud(x,y,z,s){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);world.add(g);sphere(.5,cloudMat,[0,0,0],g,[1.6,.65,.75]);sphere(.43,cloudMat,[-.32,.2,0],g);sphere(.54,cloudMat,[.2,.3,0],g);sphere(.33,cloudMat,[.69,.04,0],g);g.children.forEach(m=>{m.castShadow=false;m.receiveShadow=false;});clouds.push(g);}
cloud(-6,8.6,-2.5,1.12);cloud(5.65,10,-2.3,.85);cloud(6,6,-4.2,.62);
const ground=mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.1}),[0,-1.12,0],scene);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
// Keep both decorations in the render graph from the first animation frame.
// Zero-opacity stars prepare their buffers without a blocking startup render.
const starMat=new THREE.MeshBasicMaterial({color:'#ffe4af',transparent:true,opacity:0,depthWrite:false,toneMapped:false});
const stars=new THREE.Group();world.add(stars);
for(let i=0;i<38;i++){const x=Math.sin(i*91.73)*11,y=4+((i*17)%90)/10,z=-5-Math.abs(Math.cos(i*34))*4;sphere(.025+(i%3)*.012,starMat,[x,y,z],stars);}
// Decorative stars neither cast shadows nor need to sample the shadow map.
stars.children.forEach(star=>{star.castShadow=false;star.receiveShadow=false;});

  require('./merge-meshes')(world,THREE);
  let night=false,playing=true,speed=1,angle=0,time=0,boatDistance=0;
  let frame=0,last=0,active=false,disposed=false,lost=false;
  let shadowElapsed=0,modeTransition=false,nightBlend=0,blendVelocity=0;
  const target=new THREE.Vector3(0,4.1,0),orbit=new THREE.Spherical(),offset=new THREE.Vector3();
  const dayWater=new THREE.Color('#70c5c2'),nightWater=new THREE.Color('#29697b');
  const daySky=new THREE.Color('#e6f0e7'),nightSky=new THREE.Color('#142637');
  const dayLight=[2.6,4,1.6,0,.05],nightLight=[.65,.65,1.3,1.5,3];
  const skyColor=daySky.clone();
  // The page supplies the sky behind the transparent canvas. This guarantees
  // identical background colors across the canvas boundary on every UI frame.
  scene.background=null;
  let publishedBlend=-1;
  function setNight(v){
    const next=!!v;if(next===night||disposed)return;
    night=next;modeTransition=true;
    // Preserve both position and velocity when the user reverses direction.
  }
  function updateMode(dt){
    if(!modeTransition)return;
    // Analytic critically damped motion: consistent at 30/60 Hz, no overshoot.
    const goal=night?1:0,omega=10,delta=nightBlend-goal,decay=Math.exp(-omega*dt);
    const change=(blendVelocity+omega*delta)*dt;
    nightBlend=goal+(delta+change)*decay;
    blendVelocity=(blendVelocity-omega*change)*decay;
    if(Math.abs(nightBlend-goal)<.001&&Math.abs(blendVelocity)<.01){nightBlend=goal;blendVelocity=0;modeTransition=false;}
    const t=THREE.MathUtils.clamp(nightBlend,0,1);
    ambient.intensity=THREE.MathUtils.lerp(dayLight[0],nightLight[0],t);
    sun.intensity=THREE.MathUtils.lerp(dayLight[1],nightLight[1],t);
    fill.intensity=THREE.MathUtils.lerp(dayLight[2],nightLight[2],t);
    windows.emissiveIntensity=THREE.MathUtils.lerp(dayLight[3],nightLight[3],t);
    bulbMat.emissiveIntensity=THREE.MathUtils.lerp(dayLight[4],nightLight[4],t);
    waterMat.color.lerpColors(dayWater,nightWater,t);skyColor.lerpColors(daySky,nightSky,t);
    cloudMat.opacity=1-t;starMat.opacity=t;
  }
  function position(){
    orbit.radius=THREE.MathUtils.clamp(orbit.radius,15,110);
    orbit.phi=THREE.MathUtils.clamp(orbit.phi,.13,Math.PI/2-.045);
    camera.position.copy(target).add(offset.setFromSpherical(orbit));camera.lookAt(target);
  }
  function reset(){
    const scale=width/height<1?Math.max(1.8,Math.min(3.5,1.42/(width/height))):1.4;
    orbit.setFromVector3(new THREE.Vector3(12,9,24).multiplyScalar(scale));position();
  }
  function setActive(v){
    active=!!v;
    if(!active){if(frame)canvas.cancelAnimationFrame(frame);frame=0;last=0;}
    else if(!frame&&!disposed&&!lost){last=0;frame=canvas.requestAnimationFrame(animate);}
  }
  function animate(stamp){
    frame=0;if(!active||disposed||lost)return;frame=canvas.requestAnimationFrame(animate);
    const interval=modeTransition?1000/60:1000/30;
    if(last&&stamp-last<interval-1)return;
    const elapsed=last?Math.min((stamp-last)/1000,.2):1/30;
    const dt=Math.min(elapsed,.05);last=stamp;time+=dt;
    if(playing){
      angle+=dt*.075*speed;rotor.rotation.z=angle;cabins.forEach(c=>c.rotation.z=-angle);
      cars.forEach((c,i)=>{c.position.x+=dt*(i===0?.35:-.28);if(c.position.x>8.7)c.position.x=-8.7;if(c.position.x< -8.7)c.position.x=8.7;});
      boatDistance=(boatDistance+dt*.65)%boatRoute.TOTAL_LENGTH;
      const pose=boatRoute(boatDistance);
      boat.position.set(pose.x,.05+Math.sin(time*1.4)*.018,pose.z);boat.rotation.y=pose.heading;
      shadowElapsed+=dt;
      if(shadowElapsed>=1/15){renderer.shadowMap.needsUpdate=true;shadowElapsed%=1/15;}
    }
    updateMode(elapsed);
    try{
      renderer.render(scene,camera);
      const progress=THREE.MathUtils.clamp(nightBlend,0,1);
      if(progress!==publishedBlend){publishedBlend=progress;onTheme(progress);}
    }catch(e){setActive(false);onError(e.message||'渲染失败');}
  }
  let gesture=null;
  const point=t=>({x:Number(t.x!=null?t.x:t.clientX),y:Number(t.y!=null?t.y:t.clientY)});
  const distance=ts=>{const a=point(ts[0]),b=point(ts[1]);return Math.hypot(a.x-b.x,a.y-b.y);};
  function touchStart(ts){gesture=ts.length>=2?{count:2,d:distance(ts)}:ts.length===1?{count:1,...point(ts[0])}:null;}
  function touchMove(ts){
    if(!gesture){touchStart(ts);return;}
    if(ts.length>=2){
      if(gesture.count!==2){touchStart(ts);return;}
      const d=distance(ts);if(d>1&&gesture.d>1)orbit.radius*=gesture.d/d;gesture.d=d;position();
    }else if(ts.length===1){
      if(gesture.count!==1){touchStart(ts);return;}
      const p=point(ts[0]);orbit.theta-=(p.x-gesture.x)/Math.max(width,1)*Math.PI;
      orbit.phi-=(p.y-gesture.y)/Math.max(height,1)*Math.PI;gesture={count:1,...p};position();
    }
  }
  reset();
  // Keep initialization free of synchronous shader compilation/rendering.
  // The native canvas renders on its own animation frame after page readiness.
  return {
    setNight,
    setPlaying(v){playing=!!v;},setSpeed(v){speed=THREE.MathUtils.clamp(Number(v)||1,.25,3);},
    setActive,reset,zoom(f){orbit.radius*=f;position();},touchStart,touchMove,touchEnd:touchStart,
    resize(w,h){if(w>0&&h>0&&(w!==width||h!==height)){width=w;height=h;renderer.setPixelRatio(resolution(w,h));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();reset();}},
    contextLost(){lost=true;setActive(false);onError('图形显示中断，请点击重新加载。');},
    dispose(){
      if(disposed)return;setActive(false);disposed=true;
      const geometries=new Set(),materials=new Set();
      scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));if(o.shadow)o.shadow.dispose();});
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();
    }
  };
};
