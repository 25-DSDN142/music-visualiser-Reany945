let last_words = "";
let last_words_opacity = 0;

<<<<<<< Updated upstream
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
=======
let inited = false;
let PIX = 8;

let clouds = [];
let flowersSmall = [];
let flowersBig = [];

const MEADOW_TOP = 0.78;
let BASE_Y;

let TOPS_BACK = [];
let TOPS_MID = [];
let TOPS_FRONT = [];

function snap(v){ return Math.round(v/PIX)*PIX; }
function block(x,y,w=PIX,h=PIX){ rect(snap(x),snap(y),snap(w),snap(h)); }

function bump(t,c,w){
  let x=(t-c)/(w/2);
  if(Math.abs(x)>1) return 0;
  let s=Math.cos(x*Math.PI*0.5);
  return s*s;
}
function fixedRidgeHeights(cols, baseY, amp, profile){
  let tops=new Array(cols);
  for(let i=0;i<cols;i++){
    let t=(cols<=1)?0:i/(cols-1);
    let h=0;
    if(profile===0){
      h=0.60*bump(t,0.50,0.98)+0.22*bump(t,0.23,0.40)+0.18*bump(t,0.80,0.42);
    }else if(profile===1){
      h=0.58*bump(t,0.52,0.92)+0.20*bump(t,0.15,0.36)+0.22*bump(t,0.78,0.36);
    }else{
      h=0.55*bump(t,0.48,0.88)+0.25*bump(t,0.28,0.38)+0.20*bump(t,0.70,0.34);
>>>>>>> Stashed changes
    }
    h=constrain(h,0,1);
    tops[i]=snap(baseY-amp*h);
  }
<<<<<<< Updated upstream
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
=======
  return tops;
}

function initScene(){
  PIX=int(constrain(round(min(width,height)/110),6,14));
  BASE_Y=snap(height*MEADOW_TOP);

  for(let i=0;i<6;i++){
    clouds.push({x:random(width),y:random(height*0.10,height*0.26),s:random(50,90),vx:random(0.4,0.9)});
  }
  for(let i=0;i<140;i++){ flowersSmall.push({x:random(width),y:random(BASE_Y,height*0.985)}); }
  for(let i=0;i<40;i++){ flowersBig.push({x:random(width),y:random(BASE_Y,height*0.975)}); }

  let cols=floor(width/PIX)+1;
  TOPS_BACK  = fixedRidgeHeights(cols, snap(height*0.58), height*0.30, 0);
  TOPS_MID   = fixedRidgeHeights(cols, snap(height*0.68), height*0.24, 1);
  TOPS_FRONT = fixedRidgeHeights(cols, BASE_Y,            height*0.20, 2);

  for(let i=0;i<cols;i++){
    TOPS_MID[i]   = max(TOPS_MID[i],   TOPS_BACK[i]+PIX);
    TOPS_FRONT[i] = max(TOPS_FRONT[i], TOPS_MID[i]+PIX);
  }

  inited=true;
}

function drawSky(other){
  const rows=ceil(height/PIX);
  for(let i=0;i<rows;i++){
    const k=i/rows;
    noStroke(); fill(lerp(60,120,k), lerp(150,210,k), 255);
    rect(0,i*PIX,width,PIX);
  }
  const speed=0.4+map(other,0,50,0,1,true);
  for(let c of clouds){
    c.x+=c.vx*speed;
    if(c.x>width+100) c.x=-100;
    drawCloud(c.x,c.y,c.s);
  }
}
function drawCloud(cx,cy,s){
  noStroke(); fill(255);
  const r=s*0.5;
  for(let y=snap(cy-r); y<=snap(cy+r*0.8); y+=PIX){
    for(let x=snap(cx-r); x<=snap(cx+r); x+=PIX){
      const dx=(x-cx)/r, dy=(y-cy)/r;
      if(dx*dx+dy*dy<1.0) block(x,y);
    }
  }
>>>>>>> Stashed changes
}

function drawSun(vocal){
<<<<<<< Updated upstream
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
=======
  const d=map(vocal,0,50,40,90,true);
  noStroke(); fill(255,230,160);
  const r=d*0.5, cx=width*0.82, cy=height*0.16;
  for(let y=snap(cy-r); y<=snap(cy+r); y+=PIX){
    for(let x=snap(cx-r); x<=snap(cx+r); x+=PIX){
      const dx=(x-cx), dy=(y-cy);
      if(dx*dx+dy*dy<=r*r) block(x,y);
    }
  }
}

function drawLayer(tops, baseY, col){
  noStroke(); fill(col[0],col[1],col[2]);
  for(let i=0;i<tops.length;i++){
    let x=i*PIX;
    for(let y=tops[i]; y<=snap(baseY); y+=PIX) block(x,y);
  }
}
function drawSnow(tops, baseY, level){
  noStroke(); fill(255);
  for(let i=0;i<tops.length;i++){
    let top=tops[i];
    if(top < baseY-level){ block(i*PIX, top); block(i*PIX, top+PIX); }
  }
}

function drawMountains(){
  // 后山：填充到底（BASE_Y），但积雪阈值按原来的 0.58 高度
  drawLayer(TOPS_BACK,  BASE_Y, [92,150,112]);
  drawSnow (TOPS_BACK,  snap(height*0.58), 120);

  // 中山：同样贴合草坪
  drawLayer(TOPS_MID,   BASE_Y, [80,160,100]);
  drawSnow (TOPS_MID,   snap(height*0.68), 100);

  // 前山：本来就与草坪相连
  drawLayer(TOPS_FRONT, BASE_Y, [70,175,95]);
}
function drawMeadow(){
  for(let y=BASE_Y; y<height; y+=PIX){
    const k=map(y,BASE_Y,height,0,1);
    noStroke(); fill(lerp(120,60,k), lerp(200,140,k), lerp(90,60,k));
    rect(0,y,width,PIX);
  }
}

function drawFlowers(vocal){
  const bob=sin(frameCount*0.05)*map(vocal,0,50,0,2,true);

  for(let f of flowersSmall){
    const y=max(f.y+bob*0.5, BASE_Y), x=f.x;
    fill(45,120,70); rect(snap(x-PIX/4), snap(y-6), PIX/2, 6);
    fill(255);
    block(x-PIX, y-PIX-6);
    block(x,     y-PIX-6);
    block(x-PIX/2, y-6-PIX/2);
    fill(255,210,80);
    block(x-PIX/2, y-PIX-6);
  }
  for(let f of flowersBig){
    const y=max(f.y+bob, BASE_Y+10), x=f.x;
    fill(45,120,70); rect(snap(x-PIX/3), snap(y-12), (PIX*2)/3, 12);
    fill(255);
    block(x-PIX*1.2, y-PIX-12);
    block(x,         y-PIX-12);
    block(x-PIX*0.6, y-PIX*1.6-12);
    block(x-PIX*0.6, y-12);
    fill(255,220,90);
    block(x-PIX*0.6, y-PIX-12);
>>>>>>> Stashed changes
  }
}

function drawLyrics(words){
<<<<<<< Updated upstream
  const ts=Math.min(64,width*0.06);
=======
  const ts=min(64,width*0.06);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  drawMountainsStatic();
  drawMeadowGround();
  drawRiverBank();
  drawStaticRiver();
  drawDaisies(vocal,drum);
=======
  drawMountains();
  drawMeadow();
  drawFlowers(vocal);
>>>>>>> Stashed changes
  if(!words || words===""){ last_words_opacity*=0.95; words=last_words; }
  else{ last_words_opacity=min(255,(1+last_words_opacity)*1.06); }
  last_words=words;
  drawLyrics(words);
<<<<<<< Updated upstream
  prevDrum=drum;
}
=======
}
>>>>>>> Stashed changes
