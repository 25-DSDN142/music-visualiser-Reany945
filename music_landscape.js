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

// === Steve（代码绘制版） ===
let steve = { x:0, y:0, w:0, h:0, dir:1, speed:1.4, bob:0 };

function snap(v){ return Math.round(v/PIX)*PIX; }
function block(x,y,w=PIX,h=PIX){ rect(snap(x),snap(y),snap(w),snap(h)); }

// 山体（固定轮廓）
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

  for(let i=0;i<6;i++){ clouds.push({x:random(width),y:random(height*0.10,height*0.26),s:random(50,90),vx:random(0.4,0.9)}); }
  for(let i=0;i<140;i++){ flowersSmall.push({x:random(width),y:random(BASE_Y,height*0.985)}); }
  for(let i=0;i<40;i++){ flowersBig.push({x:random(width),y:random(BASE_Y,height*0.975)}); }

  let cols=floor(width/PIX)+1;
  TOPS_BACK  = fixedRidgeHeights(cols, snap(height*0.58), height*0.30, 0);
  TOPS_MID   = fixedRidgeHeights(cols, snap(height*0.68), height*0.24, 1);
  TOPS_FRONT = fixedRidgeHeights(cols, BASE_Y,            height*0.20, 2);
  for(let i=0;i<cols;i++){ TOPS_MID[i]=max(TOPS_MID[i],TOPS_BACK[i]+PIX); TOPS_FRONT[i]=max(TOPS_FRONT[i],TOPS_MID[i]+PIX); }

  // 史蒂夫尺寸/初始位置（像素网格上）
  const GW=12, GH=18;                // 角色网格尺寸
  steve.w = GW*PIX; steve.h = GH*PIX;
  steve.x = width*0.15;
  steve.y = BASE_Y - steve.h;

  inited=true;
}

// —— 天空 / 太阳 / 云 —— //
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
  const speed=0.4+map(other,0,50,0,1,true);
  for(let c of clouds){ c.x+=c.vx*speed; if(c.x>width+100) c.x=-100; drawCloud(c.x,c.y,c.s); }
}
function drawSun(vocal){
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

// —— 山、草地、花 —— //
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
  drawLayer(TOPS_BACK,  BASE_Y, [92,150,112]); drawSnow(TOPS_BACK,  snap(height*0.58), 120);
  drawLayer(TOPS_MID,   BASE_Y, [80,160,100]); drawSnow(TOPS_MID,   snap(height*0.68), 100);
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

// ===== 史蒂夫（代码像素版） =====
function drawSteveBody(x0, y0, dir){
  // 基本色
  const skin=[223,171,135], skinBack=[200,152,120];
  const hair=[60,40,25];
  const shirt=[46,175,170], shirtShadow=[36,150,140];
  const pants=[55,85,170], pantsBack=[42,70,150];
  const shoe=[130,130,130], white=[255,255,255], eye=[70,50,35];

  const s = PIX;
  const GW = 12, GH = 18; // 角色网格宽高
  function put(col, px,py,w=1,h=1){
    fill(col[0],col[1],col[2]);
    for(let yy=0; yy<h; yy++) for(let xx=0; xx<w; xx++){
      let gx = px+xx, gy = py+yy;
      if(dir<0) gx = (GW-1) - gx; // 镜像
      block(x0 + gx*s, y0 + gy*s, s, s);
    }
  }

  // 鞋
  put(shoe, 2,17, 3,1); put(shoe, 7,17, 3,1);
  // 裤（前/后腿）
  put(pantsBack, 2,12, 3,5); put(pants, 7,12, 3,5);
  // 身体
  put(shirtShadow, 3,8, 2,4); put(shirt, 5,8, 4,4);
  // 手臂（后/前）
  put(shirtShadow, 2,8, 1,2); put(skinBack, 2,10, 1,3);
  put(shirt, 9,8, 1,2);       put(skin,     9,10, 1,3);
  // 头发 + 脸（侧面）
  put(hair, 3,2, 6,2);           // 顶部
  put(hair, 3,4, 2,3);           // 后脑
  put(skin, 5,4, 4,3);           // 脸
  put(white, 7,5, 1,1); put(eye, 7,5, 1,1); // 眼睛（简化）
  // 下巴（一点胡渣色）
  put([190,140,110], 5,7, 3,1);
}

function updateAndDrawSteve(drum){
  // 速度受鼓的能量微调（也可设为常量）
  let sp = steve.speed + map(drum,0,50,0,1.0,true);
  steve.x += steve.dir * sp;

  let left = PIX*2, right = width - steve.w - PIX*2;
  if(steve.x > right){ steve.x = right; steve.dir = -1; }
  if(steve.x < left ){ steve.x = left;  steve.dir =  1; }

  steve.bob = sin(frameCount*0.15)*PIX*0.4;
  steve.y   = BASE_Y - steve.h + steve.bob;

  noStroke();
  drawSteveBody(steve.x, steve.y, steve.dir);
}

// —— 歌词 —— //
function drawLyrics(words){
  const ts=min(64,width*0.06);
  textSize(ts); textAlign(CENTER,CENTER); textStyle(BOLD);
  if(words && words.trim().length>0){
    const tw=textWidth(words);
    noStroke(); fill(255,255,255,90);
    rectMode(CENTER); rect(width/2,height*0.14,tw+24,ts+24,6); rectMode(CORNER);
  }
  noStroke(); fill(0,0,0,int(last_words_opacity));
  text(words,width/2,height*0.14);
}

// —— 主帧 —— //
function draw_one_frame(words, vocal, drum, bass, other, counter){
  if(!inited) initScene();

  drawSky(other);
  drawSun(vocal);
  drawMountains();
  drawMeadow();

  // 史蒂夫（在草地上行走）
  updateAndDrawSteve(drum);

  drawFlowers(vocal);

  if(!words || words===""){ last_words_opacity*=0.95; words=last_words; }
  else{ last_words_opacity=min(255,(1+last_words_opacity)*1.06); }
  last_words=words;
  drawLyrics(words);
}
