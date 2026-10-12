// Merge only siblings with the same material. Moving groups remain independent.
module.exports=function mergeMeshes(parent,THREE){
  parent.children.slice().forEach(child=>{if(child.isGroup)mergeMeshes(child,THREE);});
  const buckets=new Map();
  parent.children.forEach(child=>{
    if(!child.isMesh||Array.isArray(child.material)||!child.visible)return;
    const key=child.material.uuid+'/'+child.castShadow+'/'+child.receiveShadow;
    if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(child);
  });
  for(const meshes of buckets.values()){
    if(meshes.length<2)continue;
    const chunks=meshes.map(mesh=>{
      mesh.updateMatrix();
      const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
      g.applyMatrix4(mesh.matrix);return g;
    });
    const geometry=new THREE.BufferGeometry();
    for(const name of ['position','normal','uv']){
      if(!chunks.every(g=>g.getAttribute(name)))continue;
      const size=chunks[0].getAttribute(name).itemSize;
      const count=chunks.reduce((n,g)=>n+g.getAttribute(name).array.length,0);
      const data=new Float32Array(count);let offset=0;
      chunks.forEach(g=>{const a=g.getAttribute(name).array;data.set(a,offset);offset+=a.length;});
      geometry.setAttribute(name,new THREE.BufferAttribute(data,size));
    }
    geometry.computeBoundingSphere();
    const merged=new THREE.Mesh(geometry,meshes[0].material);
    merged.castShadow=meshes[0].castShadow;merged.receiveShadow=meshes[0].receiveShadow;parent.add(merged);
    meshes.forEach(m=>{parent.remove(m);m.geometry.dispose();});chunks.forEach(g=>g.dispose());
  }
};
