// Two river lanes joined by semicircles, with continuous position and heading.
const RADIUS=1.4,END=3.6,STRAIGHT=END*2,TURN=Math.PI*RADIUS;
const TOTAL_LENGTH=2*(STRAIGHT+TURN);
function boatRoute(distance){
  let s=((distance%TOTAL_LENGTH)+TOTAL_LENGTH)%TOTAL_LENGTH;
  if(s<STRAIGHT)return {x:-RADIUS,z:END-s,heading:Math.PI};
  s-=STRAIGHT;
  if(s<TURN){const a=Math.PI+s/RADIUS;return {x:RADIUS*Math.cos(a),z:-END+RADIUS*Math.sin(a),heading:-a};}
  s-=TURN;
  if(s<STRAIGHT)return {x:RADIUS,z:-END+s,heading:0};
  const a=(s-STRAIGHT)/RADIUS;
  return {x:RADIUS*Math.cos(a),z:END+RADIUS*Math.sin(a),heading:-a};
}
boatRoute.TOTAL_LENGTH=TOTAL_LENGTH;
module.exports=boatRoute;
