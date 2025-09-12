let last_words = "";
let last_words_opacity = 0;
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
let steve = { x:0, y:0, w:0, h:0, dir:1, speed:1.4, bob:0 };
let oaks = [];
const VMAX = 50;
const HUD_LERP = 0.28;
let hud = { hp:8, hunger:8, oxy:8, armor:8 };
let autoMax = { vocal:5, bass:5, other:5, drum:5 };
let foothills = [];
const ICON8_HEART = [
  "01100110","11111111","11111111","11111111",
  "01111110","00111100","00011000","00000000"
];

const ICON8_MEAT = [
  "00011100","00111110","01111111","01111111",
  "01111111","00111111","00011110","00001100"
];
const ICON8_BUBBLE = [
  "00111100","01111110","11111111","11111111",
  "11111111","11111111","01111110","00111100"
];
const ICON8_ARMOR = [
  "01111110","11111111","11100111","11100111",
  "11011011","11011011","11111111","01111110"
];

const PAL_HEART = {edge:[0, 0, 0], fill:[230, 30, 30],shade:[155, 10, 10],hi:[255, 120, 120],empty: [0, 0, 0]};
const PAL_MEAT  = { edge:[0,0,0], fill:[200,135,70], shade:[150,95,55],  hi:[240,205,150], empty:[0,0,0], bone:[245,240,225] };
const PAL_BUBBLE= { edge:[0,0,0], fill:[120,175,255], shade:[88,130,210], hi:[245,255,255], empty:[0,0,0] };
const PAL_ARMOR = { edge:[0,0,0], fill:[205,205,205], shade:[150,150,160], hi:[235,235,240], empty:[0,0,0] };

function snap(v){ return Math.round(v/PIX)*PIX; }
function block(x,y,w=PIX,h=PIX){ rect(snap(x),snap(y),snap(w),snap(h)); }
function bump(t,c,w){ let x=(t-c)/(w/2); if(Math.abs(x)>1) return 0; let s=Math.cos(x*Math.PI*0.5); return s*s; }

function fixedRidgeHeights(cols, baseY, amp, profile){
  let tops=new Array(cols);
  for(let i=0;i<cols;i++){
    let t=(cols<=1)?0:i/(cols-1);
    let h=0;
    if(profile===0){ h=0.60*bump(t,0.50,0.98)+0.22*bump(t,0.23,0.40)+0.18*bump(t,0.80,0.42); }
    else if(profile===1){ h=0.58*bump(t,0.52,0.92)+0.20*bump(t,0.15,0.36)+0.22*bump(t,0.78,0.36); }
    else{ h=0.55*bump(t,0.48,0.88)+0.25*bump(t,0.28,0.38)+0.20*bump(t,0.70,0.34); }
    h=constrain(h,0,1);
    tops[i]=snap(baseY-amp*h);
  }
  return tops;
}

function initScene(){
  PIX=int(constrain(round(min(width,height)/110),6,14));
  BASE_Y=snap(height*MEADOW_TOP);
  noSmooth();

  for(let i=0;i<6;i++){ clouds.push({x:random(width),y:random(height*0.10,height*0.26),s:random(50,90),vx:random(0.4,0.9)}); }
  for(let i=0;i<140;i++){ flowersSmall.push({x:random(width),y:random(BASE_Y,height*0.985)}); }
  for(let i=0;i<40;i++){ flowersBig.push({x:random(width),y:random(BASE_Y,height*0.975)}); }

  let cols=floor(width/PIX)+1;
  TOPS_BACK  = fixedRidgeHeights(cols, snap(height*0.58), height*0.30, 0);
  TOPS_MID   = fixedRidgeHeights(cols, snap(height*0.68), height*0.24, 1);
  TOPS_FRONT = fixedRidgeHeights(cols, BASE_Y,            height*0.20, 2);
  for(let i=0;i<cols;i++){ TOPS_MID[i]=max(TOPS_MID[i],TOPS_BACK[i]+PIX); TOPS_FRONT[i]=max(TOPS_FRONT[i],TOPS_MID[i]+PIX); }

  const GW=12, GH=18;
  steve.w = GW*PIX; steve.h = GH*PIX;
  steve.x = width*0.15; steve.y = BASE_Y - steve.h;

  let n = int(random(5,8));
  for(let i=0;i<n;i++){ oaks.push({ x: snap(random(width*0.08,width*0.92)), s: random()<0.5 ? 1 : 2 }); }
  

  inited=true;
}
function mix(a, b, t){ return a + (b - a) * t; }

function ridgeMin(tops){
  let m = 1e9;
  for (let i = 0; i < tops.length; i++) if (tops[i] < m) m = tops[i];
  return m;
}

function makeFoothillRow(y, count, halfW, height, colTop, colBase){
  let step = width / (count - 1);
  for(let i=0;i<count;i++){
    let jitter = (i % 2 ? PIX*3 : 0);                 // 轻微错位让形状更自然
    foothills.push({
      x: snap(i*step + jitter),
      y: snap(y),
      halfW: halfW,
      h: height,
      colTop: colTop,     // 顶部颜色（偏亮/偏蓝）
      colBase: colBase    // 底部颜色（偏绿/偏暗）
    });
  }
}

function drawOneHill(h){
 
  for(let yy = h.y - h.h; yy <= h.y; yy += PIX){
    let t = map(yy, h.y - h.h, h.y, 0, 1, true);
    let half = floor(h.halfW * (1 - t));              // 越往上越窄
    let r = mix(h.colTop[0],  h.colBase[0], t);
    let g = mix(h.colTop[1],  h.colBase[1], t);
    let b = mix(h.colTop[2],  h.colBase[2], t);
    fill(r, g, b);
    for(let xx = h.x - half; xx <= h.x + half; xx += PIX) block(xx, yy);
  }
  // 顶缘轻描边，强调体块
  stroke(30, 60); strokeWeight(2);
  line(h.x - h.halfW, h.y - h.h, h.x + h.halfW, h.y - h.h);
  noStroke();
}

function drawFoothills(){
  // 先按 y 从小到大排序：越靠上 = 越远，先画远处再画近处
  foothills.sort((a,b)=>a.y - b.y);
  for(const h of foothills) drawOneHill(h);
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
}

function drawSky(other){
  const rows=ceil(height/PIX);
  for(let i=0;i<rows;i++){
    const k=i/rows;
    noStroke(); fill(lerp(60,120,k), lerp(150,210,k), 255);
    rect(0,i*PIX,width,PIX);
  }
  const speed=0.4+map(other,0,VMAX,0,1,true);
  for(let c of clouds){ c.x+=c.vx*speed; if(c.x>width+100) c.x=-100; drawCloud(c.x,c.y,c.s); }
}

function drawSun(vocal){
  let cells = int(map(vocal, 0, VMAX, 6, 12, true)); 
  let size  = cells * PIX;
  let cx = snap(width * 0.82);
  let cy = snap(height * 0.16);
  let left = cx - floor(size / 2);
  let top  = cy - floor(size / 2);
  noStroke();
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      let dx = abs(j - (cells - 1) / 2) / ((cells - 1) / 2);
      let dy = abs(i - (cells - 1) / 2) / ((cells - 1) / 2);
      let k  = max(dx, dy);  
      if (k < 0.33)      fill(255, 240, 140); 
      else if (k < 0.66) fill(255, 220,  90); 
      else               fill(245, 190,  60); 

      block(left + j * PIX, top + i * PIX);
    }
  }


  stroke(240, 170, 50);
  noFill();
  rect(left, top, size, size);
  noStroke();
}

function drawLayer(tops, baseY, colTop, colBase, withSnow){
  noStroke();
  for (let i = 0; i < tops.length; i++){
    let x = i * PIX;
    let topY = tops[i];

    // 纵向渐变（顶端偏蓝/亮、向下偏绿/暗）
    for (let y = topY; y <= snap(baseY); y += PIX){
      let t = map(y, topY, baseY, 0, 1, true);
      let r = mix(colTop[0],  colBase[0],  t);
      let g = mix(colTop[1],  colBase[1],  t);
      let b = mix(colTop[2],  colBase[2],  t);
      fill(r, g, b);
      block(x, y);
    }
  }
}



function drawMountains(){
  drawSnowMountain();           // 放在最前，作为最远背景
  drawLayer(TOPS_BACK,  BASE_Y, [102,200,112], [100,150,120], true);
  drawLayer(TOPS_MID,   BASE_Y, [80,160,100], [85,160,105],  true);
  drawLayer(TOPS_FRONT, BASE_Y, [60,140,90],  [75,175,95],   false);
}

function drawMeadow(){
  for(let y=BASE_Y; y<height; y+=PIX){
    const k=map(y,BASE_Y,height,0,1);
    noStroke(); fill(lerp(120,60,k), lerp(200,140,k), lerp(90,60,k));
    rect(0,y,width,PIX);
  }
}
function drawSnowMountain(){

  let cx    = snap(width * 0.62);
  let topY  = snap(height * 0.3);  
  let baseY = snap(height * 0.6);  
  let halfW0 = snap(width * 2);  
  let stepH  = PIX * 1;             

  for (let y = baseY; y >= topY; y -= stepH) {
    let t = map(y, baseY, topY, 0, 1, true);
    // 更尖的山顶
    let half = floor(halfW0 * (1 - t * 0.95));
    let left = snap(cx - half);
    let right= snap(cx + half);

    for (let yy = y - stepH + PIX; yy <= y; yy += PIX) {
      for (let x = left; x <= right; x += PIX) {
        let tt = map(yy, topY, baseY, 0, 1, true);

        // 雪面 + 斑驳
        let snow = (tt < 0.38) || (tt < 0.55 && ((x/PIX + yy/PIX) % 5 < 2));
        if (snow) {
          let s = (x > cx) ? -10 : 10;
          fill(245 + s, 245 + s, 255);
        } else {
          let k = map(tt, 0.38, 1, 0, 1, true);
          let r = lerp(200,140,k), g = lerp(205,160,k), b = lerp(215,175,k);
          if (((x/PIX + yy/PIX) % 9) === 0) { r -= 25; g -= 25; b -= 25; }
          if (x > cx) { r -= 10; g -= 10; b -= 10; }
          fill(r, g, b);
        }
        block(x, yy);
      }
    }
  }
}
function drawOakTree(xCenter, s){
  const trunkC = [124,92,62];
  const leafC  = [76,140,72];
  const leafD  = [56,110,54];
  const tw = 2*s, th = 5*s;
  const yTop = BASE_Y - th*PIX;
  fill(trunkC[0],trunkC[1],trunkC[2]);
  for(let yy=0; yy<th; yy++) for(let xx=0; xx<tw; xx++) block(xCenter + (xx - tw/2)*PIX, yTop + yy*PIX);
  const rows = [4*s, 6*s, 8*s, 6*s];
  let yLeafTop = yTop - rows.length*PIX;
  for(let r=0; r<rows.length; r++){
    let w = rows[r], x0 = xCenter - (w/2)*PIX;
    fill(leafC[0],leafC[1],leafC[2]);
    for(let i=0;i<w;i++) block(x0 + i*PIX, yLeafTop + r*PIX);
  }
  let wB = rows[rows.length-1], xB = xCenter - (wB/2)*PIX;
  fill(leafD[0],leafD[1],leafD[2]);
  for(let i=0;i<wB;i+=2) block(xB + i*PIX, yLeafTop + (rows.length-1)*PIX);
}

function drawOaks(){ for(let o of oaks){ drawOakTree(o.x, o.s); } }

function drawFlowers(vocal){
  const bob=sin(frameCount*0.05)*map(vocal,0,VMAX,0,2,true);
  for(let f of flowersSmall){
    const y=max(f.y+bob*0.5, BASE_Y), x=f.x;
    fill(45,120,70); rect(snap(x-PIX/4), snap(y-6), PIX/2, 6);
    fill(255); block(x-PIX, y-PIX-6); block(x, y-PIX-6); block(x-PIX/2, y-6-PIX/2);
    fill(255,210,80); block(x-PIX/2, y-PIX-6);
  }
  for(let f of flowersBig){
    const y=max(f.y+bob, BASE_Y+10), x=f.x;
    fill(45,120,70); rect(snap(x-PIX/3), snap(y-12), (PIX*2)/3, 12);
    fill(255); block(x-PIX*1.2, y-PIX-12); block(x, y-PIX-12); block(x-PIX*0.6, y-PIX*1.6-12); block(x-PIX*0.6, y-12);
    fill(255,220,90); block(x-PIX*0.6, y-PIX-12);
  }
}

function drawSteveBody(x0, y0, dir){
  const skin=[223,171,135], skinBack=[200,152,120];
  const hair=[60,40,25];
  const shirt=[46,175,170], shirtShadow=[36,150,140];
  const pants=[55,85,170], pantsBack=[42,70,150];
  const shoe=[130,130,130], white=[255,255,255], eye=[70,50,35];
  const s=PIX, GW=12, GH=18;
  function put(c,px,py,w=1,h=1){
    fill(c[0],c[1],c[2]);
    for(let yy=0;yy<h;yy++) for(let xx=0;xx<w;xx++){
      let gx=px+xx, gy=py+yy; if(dir<0) gx=(GW-1)-gx; block(x0+gx*s,y0+gy*s,s,s);
    }
  }
  put(shoe,2,17,3,1); put(shoe,7,17,3,1);
  put(pantsBack,2,12,3,5); put(pants,7,12,3,5);
  put(shirtShadow,3,8,2,4); put(shirt,5,8,4,4);
  put(shirtShadow,2,8,1,2); put(skinBack,2,10,1,3);
  put(shirt,9,8,1,2);       put(skin,9,10,1,3);
  put(hair,3,2,6,2); put(hair,3,4,2,3);
  put(skin,5,4,4,3);
  put(white,7,5,1,1); put(eye,7,5,1,1);
  put([190,140,110],5,7,3,1);
}

function updateAndDrawSteve(drum){
 let sp = (steve.speed + map(drum, 0, VMAX, 0, 1.0, true)) * 5; 
  steve.x += steve.dir*sp;
  let L=PIX*2, R=width-steve.w-PIX*2;
  if(steve.x>R){steve.x=R;steve.dir=-1;}
  if(steve.x<L){steve.x=L;steve.dir=1;}
  steve.bob=sin(frameCount*0.15)*PIX*0.4;
  steve.y=BASE_Y-steve.h+steve.bob;
  noStroke();
  drawSteveBody(steve.x,steve.y,steve.dir);
}

function iconIsEdge(mask,r,c){
  const H=mask.length, W=mask[0].length;
  if(mask[r][c]!=='1') return false;
  const N=[[1,0],[-1,0],[0,1],[0,-1]];
  for(let k=0;k<4;k++){
    const rr=r+N[k][0], cc=c+N[k][1];
    if(rr<0||rr>=H||cc<0||cc>=W||mask[rr][cc]!=='1') return true;
  }
  return false;
}

function drawIconSlotVanilla(x,y,mask,pal,state,kind,rtl){
  rtl = !!rtl;
  const H=mask.length, W=mask[0].length;

  for(let r=0;r<H;r++){
    for(let c=0;c<W;c++){
      if(mask[r][c]==='1' && iconIsEdge(mask,r,c)){
        fill(pal.edge[0],pal.edge[1],pal.edge[2]);
        block(x+c*PIX, y+r*PIX);
      }
    }
  }
  for(let r=0;r<H;r++){
    for(let c=0;c<W;c++){
      if(mask[r][c]!=='1' || iconIsEdge(mask,r,c)) continue;
      fill(pal.empty[0],pal.empty[1],pal.empty[2]);
      block(x+c*PIX, y+r*PIX);
    }
  }
  if(state<=0) return;

  let limit = state>=1 ? W : Math.floor(W/2);
  for(let r=0;r<H;r++){
    for(let c=0;c<W;c++){
      if(mask[r][c]!=='1' || iconIsEdge(mask,r,c)) continue;
      const shouldFill = rtl ? (c >= W - limit) : (c < limit);
      if(!shouldFill) continue;

      const sampleC = rtl ? (W-1 - c) : c;
      let kx = sampleC/(W-1), ky = r/(H-1);
      let col=pal.fill;
      if(kind==='heart'){
        if(kx<0.45 && ky<0.45) col=pal.hi; else if(ky>0.65||kx>0.75) col=pal.shade;
      }else if(kind==='meat'){
        if(kx<0.35 && ky<0.35) col=pal.hi; else if(kx>0.70||ky>0.70) col=pal.shade;
      }else if(kind==='bubble'){
        if(kx<0.45 && ky<0.42) col=pal.hi; else if(ky>0.62) col=pal.shade;
      }else if(kind==='armor'){
        if(ky<0.35) col=pal.hi; else if(ky>0.65) col=pal.shade;
      }
      fill(col[0],col[1],col[2]);
      block(x+c*PIX, y+r*PIX);
    }
  }
  if(kind==='meat' && state>0){
    const bone = pal.bone;
    const bx = x + (W-2)*PIX, by = y + 3*PIX;
    fill(bone[0],bone[1],bone[2]); block(bx, by);
    block(bx, by-PIX); block(bx+PIX, by);
  }
}

function drawHUD(vocal, drum, bass, other){
  const S = 0.62;
  push();
  translate(PIX*0.6, PIX*0.6);
  scale(S);

  autoMax.vocal = max(autoMax.vocal*0.995, abs(vocal));
  autoMax.bass  = max(autoMax.bass *0.985, abs(bass));
  autoMax.other = max(autoMax.other*0.985, abs(other));
  autoMax.drum  = max(autoMax.drum *0.995, abs(drum));

  const eps=1e-6;
  let vNorm = constrain(abs(vocal)/max(autoMax.vocal,eps),0,1);
  let dNorm = constrain(abs(drum )/max(autoMax.drum ,eps),0,1);
  let bNorm = constrain(abs(bass )/max(autoMax.bass ,eps),0,1);
  let oNorm = constrain(abs(other)/max(autoMax.other,eps),0,1);

  let hpFrac = constrain(vNorm/0.85, 0, 1);
  let arFrac = constrain(dNorm/0.85, 0, 1);
  let hgFrac = min(constrain(pow(bNorm*0.85,1.2),0,1),0.95);
  let oxFrac = min(constrain(pow(oNorm*0.75,1.2),0,1),0.95);

  hud.hp     = lerp(hud.hp,     hpFrac*10, HUD_LERP);
  hud.hunger = lerp(hud.hunger, hgFrac*10, HUD_LERP);
  hud.oxy    = lerp(hud.oxy,    oxFrac*10, HUD_LERP);
  hud.armor  = lerp(hud.armor,  arFrac*10, HUD_LERP);

  noStroke(); fill(0,0,0,90);
  const W = 8*PIX, H = 8*PIX;
  const stepX = W + PIX;
  const rowH  = H + PIX;
  const padX  = PIX*2;
  rect(PIX, PIX, stepX*10 + padX, rowH*4 + PIX, 6);

  let x0 = PIX*2, y = PIX*3;

  for(let i=0;i<10;i++){
    let v = hud.armor - i;
    let s = (v>=1)?1:(v>=0.5?0.5:0);
    push();
    translate(x0 + i*stepX, y + H);
    scale(1, -1);
    drawIconSlotVanilla(0, 0, ICON8_ARMOR, PAL_ARMOR, s, 'armor');
    pop();
  }
  y += rowH;

  for(let i=0;i<10;i++){
    let v = hud.hp - i;
    let s = (v>=1)?1:(v>=0.5?0.5:0);
    drawIconSlotVanilla(x0 + i*stepX, y, ICON8_HEART, PAL_HEART, s, 'heart');
  }
  y += rowH;

  for(let i=0;i<10;i++){
    let v = hud.hunger - i;
    let s = (v>=1)?1:(v>=0.5?0.5:0);
    drawIconSlotVanilla(x0 + i*stepX, y, ICON8_MEAT, PAL_MEAT, s, 'meat');
  }
  y += rowH;

  for(let i=0;i<10;i++){
    let v = hud.oxy - i;
    let s = (v>=1)?1:(v>=0.5?0.5:0);
    drawIconSlotVanilla(x0 + i*stepX, y, ICON8_BUBBLE, PAL_BUBBLE, s, 'bubble');
  }

  pop();
}

function drawLyrics(words){}
function draw_one_frame(words, vocal, drum, bass, other, counter){
  if(!inited) initScene();
  drawSky(other);
  drawSun(vocal);
  drawMountains();
  drawMeadow();
  drawOaks();
  updateAndDrawSteve(drum);
  drawFlowers(vocal);
  drawHUD(vocal, drum, bass, other);
}
