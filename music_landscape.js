const NORM_MAX = 50;              // CSV 上限（若 0..100 改为 100）
const ONSET_DIFF_THRESHOLD = 10;  // 鼓点阈值（0..50 适用）
const ONSET_COOLDOWN = 8;         // 鼓点冷却，避免连发

// 复古日漫调色板
const P = {
  sky1: [45, 140, 255],
  sky2: [70, 170, 255],
  sky3: [95, 195, 255],
  sky4: [130, 215, 255],
  mFar: [40, 90, 160],    // 远山
  mNear:[30,120, 90],     // 近山
  grass:[60, 180, 80],
  riverD:[25, 90, 170],
  riverL:[60, 130, 210],
  white:[255,255,255],
  yellow:[255,210,80],
  outline:[20,20,20],
  fog:[245, 250, 255]
};

const RIVER = { cyRatio: 0.84, halfW: 62 }; // 静止河流
const LYR   = { sizeRatio: 0.06, bgA: 90, pad: 12 };

let last_words = "";
let last_words_opacity = 0;

let prevDrum = 0, cooldown = 0, drumFlash = 0;


let clouds = [];     // {x,y,s,vx}
let daisies = [];    // {x,y,s,twinkle}
let glints = [];     // 河面静态亮斑

const n01 = v => constrain(map(v, 0, NORM_MAX, 0, 1), 0, 1);
function onset(curr, prev){
  if (cooldown > 0){ cooldown--; return false; }
  if ((curr - prev) > ONSET_DIFF_THRESHOLD){ cooldown = ONSET_COOLDOWN; return true; }
  return false;
}
function O(r=3){ stroke(P.outline); strokeWeight(r); } // 粗描边
function F(c){ fill(c[0], c[1], c[2]); }               // 填色


function initOnce(){
  if (clouds.length === 0){
    for (let i=0;i<5;i++){
      clouds.push({ x: random(width), y: random(height*0.10, height*0.35), s: random(30,60), vx: random(0.6,1.2) });
    }
  }
  if (daisies.length === 0){
    for (let i=0;i<70;i++){
      daisies.push({
        x: random(width),
        y: random(height*0.72, height*0.96),
        s: random(0.7, 1.4),
        tw: random(40,120)  // 是否闪一下
      });
    }
  }
  if (glints.length === 0){
    const cy = height*RIVER.cyRatio;
    for (let i=0;i<36;i++){
      glints.push({ x: random(10,width-10), y: cy + random(-RIVER.halfW*0.4, RIVER.halfW*0.4), w: random(8,16), a: random(50,110) });
    }
  }
}


function drawSky(other){
  // 4 条色带，模拟 cel-shading 天空
  noStroke();
  F(P.sky1); rect(0, 0, width, height*0.25);
  F(P.sky2); rect(0, height*0.25, width, height*0.25);
  F(P.sky3); rect(0, height*0.50, width, height*0.15);
  F(P.sky4); rect(0, height*0.65, width, height*0.07);

  // 云：轮廓+填色（入门图形：三个椭圆拼）
  let speed = 0.4 + 1.2*n01(other);
  for (let c of clouds){
    c.x += c.vx * speed;
    if (c.x > width+60) c.x = -60;
    O(3); F(P.white);
    ellipse(c.x, c.y, c.s, c.s*0.6);
    ellipse(c.x-c.s*0.5, c.y+4, c.s*0.8, c.s*0.5);
    ellipse(c.x+c.s*0.5, c.y+6, c.s*0.9, c.s*0.55);
  }

  // 薄雾（底部一层）
  noStroke(); fill(P.fog[0],P.fog[1],P.fog[2], map(n01(other),0,1, 8, 80));
  rect(0, height*0.60, width, height*0.40);
}


function drawSun(vocal){
  let k = n01(vocal);
  let d = map(k, 0,1, 36, 96);
  O(4); F([255,230,150]);
  ellipse(width*0.80, height*0.18, d, d);
}


function drawMountains(bass){
  let k = n01(bass);
  let yFar = height*0.70, yNear = height*0.78;
  let hFar = map(k,0,1, 90, 230);
  let hNear= map(k,0,1, 70, 190);

  noStroke();
  // 远山
  O(4); F(P.mFar);
  let fx1=width*0.10, fx2=width*0.48, fx3=width*0.86;
  triangle(fx1,yFar, fx2,yFar-hFar, fx3,yFar);
  // 远山亮面
  O(3); F([P.mFar[0]+30, P.mFar[1]+30, P.mFar[2]+30]);
  triangle(fx2-22,yFar-hFar+40, fx2,yFar-hFar, fx2+22,yFar-hFar+40);

  // 近山
  O(4); F(P.mNear);
  let nx1=width*0.00, nx2=width*0.34, nx3=width*0.70;
  triangle(nx1,yNear, nx2,yNear-hNear, nx3,yNear);
  // 近山亮面
  O(3); F([P.mNear[0]+30, P.mNear[1]+30, P.mNear[2]+30]);
  triangle(nx2-20,yNear-hNear+34, nx2,yNear-hNear, nx2+20,yNear-hNear+34);

  // 鼓点边缘闪
  if (drumFlash > 1){
    stroke(255,255,210, drumFlash);
    strokeWeight(3);
    line(fx1,yFar, fx2,yFar-hFar); line(fx2,yFar-hFar, fx3,yFar);
    line(nx1,yNear, nx2,yNear-hNear); line(nx2,yNear-hNear, nx3,yNear);
  }
}

function drawStaticRiver(){
  const cy = height*RIVER.cyRatio, hw = RIVER.halfW;

  // 渐变底色（竖向细线）
  for (let y=-hw; y<=hw; y++){
    let t = map(y, -hw, hw, 0, 1);
    let r = lerp(P.riverD[0], P.riverL[0], t);
    let g = lerp(P.riverD[1], P.riverL[1], t);
    let b = lerp(P.riverD[2], P.riverL[2], t);
    stroke(r,g,b); line(0, cy+y, width, cy+y);
  }

  // 岸线（粗描边）
  O(5); line(0, cy-hw, width, cy-hw); line(0, cy+hw, width, cy+hw);

  // 静态“水纹”与 glints
  O(2); stroke(255,255,255,80);
  for (let x=0; x<width; x+=80){
    line(x+0,cy-4, x+20,cy-8);
    line(x+20,cy-8, x+40,cy-4);
    line(x+40,cy-4, x+60,cy);
    line(x+60,cy,   x+80,cy+4);
  }
  strokeWeight(2);
  for (let g of glints){
    stroke(255,255,255, g.a);
    line(g.x-g.w*0.5, g.y, g.x+g.w*0.5, g.y);
  }

  // 中央高光条（固定）
  stroke(255,255,255,90); strokeWeight(2);
  for (let x=0; x<=width; x+=24){ line(x, cy, x+14, cy); }
}


function drawGrass(vocal){
  const cy = height*RIVER.cyRatio, hw = RIVER.halfW;
  const sway = sin(frameCount*0.05) * map(n01(vocal),0,1, 0, 3);
  O(2); F(P.white); // 只用描边画线
  stroke(P.outline);
  for (let x=8; x<width; x+=16){
    line(x, cy-hw, x+sway, cy-hw-12);
  }
  for (let x=4; x<width; x+=16){
    line(x, cy+hw, x+sway, cy+hw+12);
  }
}


function drawDaisies(vocal, drum){
  const bob = sin(frameCount*0.05) * map(n01(vocal),0,1, 0, 3);
  for (let d of daisies){
    let x = d.x, y = d.y + bob;
    // 茎
    stroke(40,120,70); strokeWeight(2); line(x, y, x, y-12*d.s);
    // 花瓣
    O(2); F(P.white);
    for (let i=0;i<6;i++){
      let a = i*TWO_PI/6;
      ellipse(x+cos(a)*6*d.s, y-12*d.s+sin(a)*6*d.s, 8*d.s, 5*d.s);
    }
    // 花心（鼓点时更亮）
    let aBoost = onset(drum, prevDrum) ? 80 : 0;
    noStroke();
    fill(255,210,80, 200 + aBoost);
    ellipse(x, y-12*d.s, 6*d.s, 6*d.s);
  }
}


function drawLyrics(words){
  const ts = Math.min(64, width*LYR.sizeRatio);
  textSize(ts); textAlign(CENTER,CENTER); textStyle(BOLD);

  if (words && words.trim().length > 0){
    let tw = textWidth(words);
    noStroke(); fill(255,255,255, LYR.bgA);
    rectMode(CENTER);
    rect(width/2, height*0.16, tw + LYR.pad*2, ts + LYR.pad*2, 6);
    rectMode(CORNER);
  }
  noStroke(); fill(0,0,0, int(last_words_opacity));
  text(words, width/2, height*0.16);
}

// ---------- 主绘制（签名勿改） ----------
function draw_one_frame(words, vocal, drum, bass, other, counter){
  initOnce();

  // 天空/云/雾
  drawSky(other);

  // 太阳
  drawSun(vocal);

  // 群山
  drawMountains(bass);

  // 静止河流（完全不随时间/声道变化）
  drawStaticRiver();

  // 草线 & 雏菊
  drawGrass(vocal);
  drawDaisies(vocal, drum);

  // 地面收边
  noStroke(); fill(30,70,60); rect(0, height*0.92, width, height*0.08);

  // 鼓点闪烁衰减
  drumFlash *= 0.90;

  // 歌词淡入
  if (!words || words===""){ last_words_opacity *= 0.95; words = last_words; }
  else { last_words_opacity = min(255, (1+last_words_opacity)*1.06); }
  last_words = words;
  drawLyrics(words);

  
  if (onset(drum, prevDrum)) drumFlash = 180;
  prevDrum = drum;
}