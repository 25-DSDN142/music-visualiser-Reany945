

let last_words = "";
let last_words_opacity = 0;

let prevDrum = 0;
let rippleActive = false, rippleX=0, rippleY=0, rippleR=0, rippleAlpha=0;

let inited = false;
let clouds = [];

function norm01(v){ return map(v, 0, 50, 0, 1, true); }
function isOnset(curr, prev){ return (norm01(curr) - norm01(prev)) > 0.06; }

function ensureInit(){
  if (inited) return;
  for (let i=0;i<5;i++){
    clouds.push({ x: random(0,width), y: random(height*0.10,height*0.35), s: random(30,60), vx: random(0.5,1.2) });
  }
  inited = true;
}


function drawSky(other){
  let k = norm01(other);
  for (let y=0; y<height; y+=2){
    let t=y/height;
    let r = lerp(90,155,t)*(0.95+0.2*k);
    let g = lerp(150,210,t)*(0.95+0.2*k);
    let b = lerp(200,255,t)*(0.95+0.2*k);
    stroke(r,g,b); line(0,y,width,y);
  }
  noStroke();
}


function drawClouds(other){
  let speed = 0.3 + norm01(other)*1.2;
  noStroke(); fill(255,255,255,220);
  for (let c of clouds){
    c.x += c.vx * speed;
    if (c.x > width+60) c.x = -60;
    ellipse(c.x, c.y, c.s, c.s*0.6);
    ellipse(c.x - c.s*0.5, c.y+4, c.s*0.8, c.s*0.5);
    ellipse(c.x + c.s*0.5, c.y+6, c.s*0.9, c.s*0.55);
  }
}


function drawSun(vocal){
  let k = norm01(vocal), d = map(k,0,1,30,90);
  noStroke(); fill(255,230,150);
  ellipse(width*0.80, height*0.18, d, d);
}

// 两层山 + 雪顶（高度随 bass），并画简单倒影
function drawMountains(bass){
  let k = norm01(bass);
  let h1 = map(k,0,1,80,220); let y1 = height*0.70;
  let h2 = map(k,0,1,60,180); let y2 = height*0.78;

  noStroke();
  // 远山
  fill(90,130,150);
  let fx1=width*0.15, fx2=width*0.50, fx3=width*0.85;
  triangle(fx1,y1, fx2,y1-h1, fx3,y1);
  fill(240,245,255); // 雪顶
  triangle(fx2-18,y1-h1+30, fx2,y1-h1, fx2+18,y1-h1+30);

  // 近山
  fill(70,120,110);
  let nx1=width*0.00, nx2=width*0.35, nx3=width*0.70;
  triangle(nx1,y2, nx2,y2-h2, nx3,y2);
  fill(235,240,250); // 雪顶
  triangle(nx2-16,y2-h2+26, nx2,y2-h2, nx2+16,y2-h2+26);

  // 水面倒影（镜像，透明度低一点）
  let wy = height*0.84, a=60;
  fill(90,130,150,a);
  triangle(fx1, wy+(wy-y1), fx2, wy+(wy-(y1-h1)), fx3, wy+(wy-y1));
  fill(70,120,110,a);
  triangle(nx1, wy+(wy-y2), nx2, wy+(wy-(y2-h2)), nx3, wy+(wy-y2));
}

// 水（宽度随 bass；高光随 vocal；波随 other；太阳倒影）
function drawWater(bass, vocal, other){
  let kb=norm01(bass), kv=norm01(vocal), ko=norm01(other);
  let cy=height*0.84, halfW=map(kb,0,1,34,78);
  let wave = sin(frameCount*(0.02+ko*0.02))*3;

  noStroke(); fill(60,140,210);
  rect(0, cy-halfW+wave, width, halfW*2);

  stroke(230,245,255, map(kv,0,1,40,140));
  strokeWeight(2);
  for (let x=0; x<=width; x+=26){
    let y = cy + wave + sin((x+frameCount*2)*0.03)*2;
    line(x-10, y, x+10, y);
  }

  // 太阳倒影（竖椭圆）
  noStroke(); fill(255,230,160, 50+kv*80);
  ellipse(width*0.80, cy + halfW*0.2, 14+kv*14, halfW);
}

// 鼓点涟漪
function updateRipple(drum){
  if (isOnset(drum, prevDrum)){
    rippleActive = true; rippleR=8; rippleAlpha=120;
    rippleX = random(30, width-30);
    rippleY = height*0.84 + random(-8,8);
  }
  if (rippleActive){
    noFill(); stroke(230,245,255, rippleAlpha);
    ellipse(rippleX, rippleY, rippleR*2, rippleR*1.2);
    rippleR += 2.0; rippleAlpha *= 0.95;
    if (rippleAlpha < 2) rippleActive = false;
  }
}

function draw_one_frame(words, vocal, drum, bass, other, counter){
  ensureInit();

  drawSky(other);
  drawClouds(other);
  drawSun(vocal);
  drawMountains(bass);
  drawWater(bass, vocal, other);
  updateRipple(drum);

  // 底部收边
  noStroke(); fill(30,70,60);
  rect(0, height*0.92, width, height*0.08);

  // 歌词淡入
  if (words===""){ last_words_opacity *= 0.95; words = last_words; }
  else { last_words_opacity = min(255, (1+last_words_opacity)*1.06); }
  last_words = words;

  textAlign(CENTER,CENTER); textStyle(BOLD); textSize(40);
  noStroke(); fill(0,0,0, int(last_words_opacity));
  text(words, width/2, height*0.16);

  prevDrum = drum;
}
