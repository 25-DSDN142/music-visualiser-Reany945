let last_words = "";
let last_words_opacity = 0;

const NORM_MAX = 50;
const ONSET_DIFF = 10;
const ONSET_COOLDOWN = 8;

const RIVER_CENTER = 0.78;
const RIVER_HALF = 60;
const RIVER_SAFE = 18;
const MEADOW_TOP = 0.88;

let inited = false;
let cooldown = 0;
let prevDrum = 0;

let clouds = [];
let smallFlowers = [];
let bigFlowers = [];
let riverTop = null;
let riverBot = null;
let glints = [];

let ridgeSteps = 200;
let ridgeBack = [], ridgeMid = [], ridgeFront = [];
let pinesFar = [], pinesMid = [], pinesNear = [];
let snowFar = [], snowMid = [];

function norm01(v){ return constrain(map(v,0,NORM_MAX,0,1),0,1); }
function isOnset(curr, prev){ if(cooldown>0){cooldown--;return false;} if((curr-prev)>ONSET_DIFF){cooldown=ONSET_COOLDOWN;return true;} return false; }

function smoothArray(a,w){ let o=new Array(a.length).fill(0); for(let i=0;i<a.length;i++){ let s=0,c=0; for(let k=-w;k<=w;k++){ let j=constrain(i+k,0,a.length-1); s+=a[j]; c++; } o[i]=s/c; } return o; }
function buildRidge(steps,jitter){ let a=[]; for(let i=0;i<=steps;i++){ let t=i/steps; let s=sin(t*PI); let j=random(-jitter,jitter); let v=constrain(0.75*s+0.25*(0.5+j),0,1); a.push(v); } let mn=Math.min(...a), mx=Math.max(...a); a=a.map(v=>(v-mn)/(mx-mn+1e-6)); let d=0.026; for(let i=1;i<a.length;i++){ a[i]=constrain(a[i],a[i-1]-d,a[i-1]+d); } a=smoothArray(a,2); a=smoothArray(a,2); mn=Math.min(...a); mx=Math.max(...a); return a.map(v=>(v-mn)/(mx-mn+1e-6)); }
function ridgeY(arr,baseY,h,x){ let idx=floor(map(x,0,width,0,arr.length-1)); idx=constrain(idx,0,arr.length-1); return baseY-h*arr[idx]; }

function makeSnowBlobs(arr, baseY, h, level, count, rmin, rmax){
  let blobs=[];
  for(let i=0;i<count;i++){
    let x=random(0,width);
    let idx=floor(map(x,0,width,0,arr.length-1));
    if(arr[idx] > level+random(-0.08,0.08)){
      let y=ridgeY(arr,baseY,h,x)+random(-8,8);
      blobs.push({x,y,r:random(rmin,rmax)});
      if(random()<0.6) blobs.push({x:x+random(-18,18), y:y+random(-10,10), r:random(rmin*0.7,rmax*0.9)});
    }
  }
  return blobs;
}

function initScene(){
  for(let i=0;i<6;i++){ clouds.push({x:random(width),y:random(height*0.08,height*0.26),s:random(40,70),vx:random(0.5,1.0)}); }
  const cy=height*RIVER_CENTER, botY=cy+RIVER_HALF, meadowY=height*MEADOW_TOP;
  for(let i=0;i<90;i++){ smallFlowers.push({x:random(width),y:random(max(botY+RIVER_SAFE,meadowY),height*0.98),s:random(0.6,1.0)}); }
  for(let i=0;i<28;i++){ bigFlowers.push({x:random(width*0.04,width*0.96),y:random(max(botY+RIVER_SAFE,meadowY),height*0.96),s:random(1.1,1.8)}); }
  const t=RIVER_HALF;
  riverTop=[{x:-40,y:cy-t},{x:width*0.22,y:cy-t-24},{x:width*0.55,y:cy-t+28},{x:width+40,y:cy-t-8}];
  riverBot=[{x:-40,y:cy+t},{x:width*0.24,y:cy+t+20},{x:width*0.57,y:cy+t-26},{x:width+40,y:cy+t+10}];
  for(let i=0;i<40;i++){ glints.push({x:random(10,width-10),y:cy+random(-t*0.45,t*0.45),w:random(8,16)}); }
  ridgeBack  = buildRidge(ridgeSteps,0.16);
  ridgeMid   = buildRidge(ridgeSteps,0.20);
  ridgeFront = buildRidge(ridgeSteps,0.22);
  snowFar = makeSnowBlobs(ridgeBack,  height*0.62, 240, 0.65, 90, 10, 26);
  snowMid = makeSnowBlobs(ridgeMid,   height*0.72, 210, 0.60, 70,  8, 22);
  for(let i=0;i<26;i++){ pinesFar.push({x:random(width*0.08,width*0.92)}); }
  for(let i=0;i<22;i++){ pinesMid.push({x:random(width*0.06,width*0.94)}); }
  for(let i=0;i<18;i++){ pinesNear.push({x:random(width*0.04,width*0.96)}); }
  inited=true;
}

function drawCloudShape(cx,cy,s){
  stroke(25); strokeWeight(3); fill(255);
  beginShape();
  vertex(cx-1.3*s,cy);
  bezierVertex(cx-1.3*s,cy-0.6*s,cx-0.7*s,cy-1.0*s,cx,cy-0.85*s);
  bezierVertex(cx+0.8*s,cy-1.05*s,cx+1.3*s,cy-0.5*s,cx+1.3*s,cy);
  bezierVertex(cx+1.3*s,cy+0.6*s,cx+0.7*s,cy+1.0*s,cx,cy+0.85*s);
  bezierVertex(cx-0.8*s,cy+1.05*s,cx-1.3*s,cy+0.5*s,cx-1.3*s,cy);
  endShape(CLOSE);
}

function drawSky(other){
  for(let y=0;y<height;y+=2){ let k=y/height; stroke(lerp(52,120,k), lerp(150,210,k), 255); line(0,y,width,y); }
  noStroke();
  const speed=0.4+1.1*norm01(other);
  for(let c of clouds){ c.x+=c.vx*speed; if(c.x>width+90) c.x=-90; drawCloudShape(c.x,c.y,c.s); }
}

function drawSun(vocal){
  const d=map(norm01(vocal),0,1,36,92);
  fill(255,232,160); stroke(25); strokeWeight(4);
  ellipse(width*0.82,height*0.16,d,d);
}

function drawSnowBlobs(blobs){
  stroke(215,235,255); strokeWeight(2); fill(255);
  for(let b of blobs){ ellipse(b.x,b.y,b.r*2,b.r*1.3); }
  noStroke(); fill(230,245,255,120);
  for(let b of blobs){ ellipse(b.x+2,b.y-2,b.r*1.5,b.r); }
}

function drawPine(x, y, s){
  noStroke(); fill(26,88,52);
  triangle(x, y-28*s, x-10*s, y-12*s, x+10*s, y-12*s);
  triangle(x, y-18*s, x-12*s, y-2*s,  x+12*s, y-2*s);
  triangle(x, y-8*s,  x-14*s, y+8*s,  x+14*s, y+8*s);
  fill(40,70,45); rect(x-3*s, y+8*s, 6*s, 10*s);
}

function sampleRidge(arr, baseY, h, step){
  let ys=[];
  for(let x=0;x<=width;x+=step){ ys.push(ridgeY(arr,baseY,h,x)); }
  return ys;
}

function drawRidgeFromSample(ys, baseY, r,g,b, step){
  stroke(25); strokeWeight(4); strokeJoin(ROUND); strokeCap(ROUND);
  fill(r,g,b);
  beginShape();
  let y0=ys[0];
  curveVertex(0,y0); curveVertex(0,y0);
  for(let i=0;i<ys.length;i++){ curveVertex(i*step, ys[i]); }
  let y1=ys[ys.length-1];
  curveVertex(width,y1); curveVertex(width,y1);
  vertex(width,baseY); vertex(0,baseY);
  endShape(CLOSE);
}

function drawMountainsStatic(){
  const STEP=8;

  let backYs  = sampleRidge(ridgeBack,  height*0.62, 240, STEP);
  drawRidgeFromSample(backYs, height*0.62, 90,150,110, STEP);
  drawSnowBlobs(snowFar);

  let midYs   = sampleRidge(ridgeMid,   height*0.72, 210, STEP);
  for(let i=0;i<midYs.length;i++){ midYs[i] = max(midYs[i], backYs[i] + 8); }
  drawRidgeFromSample(midYs,  height*0.72, 80,160,100, STEP);
  drawSnowBlobs(snowMid);

  let frontYs = sampleRidge(ridgeFront, height*0.79, 190, STEP);
  for(let i=0;i<frontYs.length;i++){ frontYs[i] = max(frontYs[i], midYs[i] + 8); }
  drawRidgeFromSample(frontYs, height*0.79, 70,175,95, STEP);

  for(let t of pinesFar){ let i=floor(constrain(t.x/STEP,0,backYs.length-1)); let y=backYs[i]+18; drawPine(t.x,y,0.7); }
  for(let t of pinesMid){ let i=floor(constrain(t.x/STEP,0,midYs.length-1));  let y=midYs[i]+16;  drawPine(t.x,y,0.9); }
  for(let t of pinesNear){ let i=floor(constrain(t.x/STEP,0,frontYs.length-1));let y=frontYs[i]+14; drawPine(t.x,y,1.1); }
}

function drawMeadowGround(){
  let startY = min(height*MEADOW_TOP, height*RIVER_CENTER + RIVER_HALF - 2);
  for(let y=startY; y<height; y+=2){
    let k = map(y,startY,height,0,1);
    stroke(lerp(130,60,k), lerp(205,140,k), lerp(90,60,k));
    line(0,y,width,y);
  }
  noStroke(); fill(35,110,65,180);
  rect(0,height*0.965,width,height*0.035);
}

function drawRiverBank(){
  const b=riverBot;
  noStroke(); fill(80,160,95);
  beginShape();
  vertex(b[0].x,b[0].y);
  bezierVertex(b[1].x,b[1].y, b[2].x,b[2].y, b[3].x,b[3].y);
  vertex(b[3].x, b[3].y+10);
  vertex(b[0].x, b[0].y+10);
  endShape(CLOSE);
}

function drawStaticRiver(){
  const top=riverTop, bot=riverBot, cy=height*RIVER_CENTER;
  noStroke(); fill(28,95,175);
  beginShape();
  vertex(top[0].x,top[0].y);
  bezierVertex(top[1].x,top[1].y, top[2].x,top[2].y, top[3].x,top[3].y);
  vertex(bot[3].x,bot[3].y);
  bezierVertex(bot[2].x,bot[2].y, bot[1].x,bot[1].y, bot[0].x,bot[0].y);
  endShape(CLOSE);
  stroke(25); strokeWeight(5); noFill();
  beginShape(); vertex(top[0].x,top[0].y);
  bezierVertex(top[1].x,top[1].y, top[2].x,top[2].y, top[3].x,top[3].y); endShape();
  beginShape(); vertex(bot[0].x,bot[0].y);
  bezierVertex(bot[1].x,bot[1].y, bot[2].x,bot[2].y, bot[3].x,bot[3].y); endShape();
  stroke(255,255,255,100); strokeWeight(2);
  for(let x=0;x<=width;x+=26){ line(x,cy,x+14,cy); }
  for(let g of glints){ line(g.x-g.w*0.5,g.y,g.x+g.w*0.5,g.y); }
}

function drawDaisies(vocal,drum){
  const bob=sin(frameCount*0.05)*map(norm01(vocal),0,1,0,3);
  const flash=isOnset(drum,prevDrum)?80:0;
  const cy=height*RIVER_CENTER, botY=cy+RIVER_HALF, meadowY=height*MEADOW_TOP;
  for(let d of smallFlowers){
    let y=max(d.y + bob*0.5, max(botY+RIVER_SAFE, meadowY));
    let x=d.x;
    stroke(45,120,70); strokeWeight(1.7); line(x,y,x,y-9*d.s);
    noStroke(); fill(255); for(let i=0;i<8;i++){ let a=i*TWO_PI/8; ellipse(x+cos(a)*5*d.s, y-9*d.s+sin(a)*4*d.s, 6*d.s,4*d.s); }
    fill(255,210,80,220+flash*0.5); ellipse(x,y-9*d.s,5.2*d.s,5.2*d.s);
    fill(120,180,80); ellipse(x-3*d.s,y-3*d.s,2.5*d.s,1.2*d.s);
  }
  for(let d of bigFlowers){
    let y=max(d.y + bob, max(botY+RIVER_SAFE + 16*d.s, meadowY));
    let x=d.x;
    stroke(45,120,70); strokeWeight(2.2); line(x,y,x,y-15*d.s);
    noStroke(); fill(255); let petals=10;
    for(let i=0;i<petals;i++){ let a=i*TWO_PI/petals; ellipse(x+cos(a)*8*d.s, y-15*d.s+sin(a)*8*d.s, 10*d.s,6*d.s); }
    fill(255,220,90,230+flash); ellipse(x,y-15*d.s,8*d.s,8*d.s);
    fill(255,255,255,80); ellipse(x,y-15*d.s,3.5*d.s,3.5*d.s);
  }
}

function drawLyrics(words){
  const ts=Math.min(64,width*0.06);
  textSize(ts); textAlign(CENTER,CENTER); textStyle(BOLD);
  if(words && words.trim().length>0){
    const tw=textWidth(words);
    noStroke(); fill(255,255,255,90);
    rectMode(CENTER); rect(width/2,height*0.14,tw+24,ts+24,6); rectMode(CORNER);
  }
  noStroke(); fill(0,0,0,int(last_words_opacity));
  text(words,width/2,height*0.14);
}

function draw_one_frame(words, vocal, drum, bass, other, counter){
  if(!inited) initScene();
  drawSky(other);
  drawSun(vocal);
  drawMountainsStatic();
  drawMeadowGround();
  drawRiverBank();
  drawStaticRiver();
  drawDaisies(vocal,drum);
  if(!words || words===""){ last_words_opacity*=0.95; words=last_words; }
  else{ last_words_opacity=min(255,(1+last_words_opacity)*1.06); }
  last_words=words;
  drawLyrics(words);
  prevDrum=drum;
}