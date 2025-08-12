
let last_words = "";
let last_words_opacity = 0;
let prevDrum = 0;
let rippleActive = false;
let rippleX = 0, rippleY = 0, rippleR = 0, rippleAlpha = 0;


function norm01(v) {
  return map(v, 0, 50, 0, 1, true);
}


function isOnset(curr, prev) {
  return (norm01(curr) - norm01(prev)) > 0.06;
}

function drawSky(other) {
  
  let k = norm01(other); 
  
  let r = map(k, 0, 1, 90, 160);
  let g = map(k, 0, 1, 150, 210);
  let b = map(k, 0, 1, 200, 255);
  background(r, g, b);
}


function drawSun(vocal) {
  let k = norm01(vocal);
  let sunSize = map(k, 0, 1, 80, 100); // 直径
  fill(255, 230, 140);
  noStroke();
  ellipse(width * 0.82, height * 0.18, sunSize, sunSize);
}


function drawMountains(bass) {
  let k = norm01(bass);

  let h1 = map(k, 0, 1, 80, 220);
  let h2 = map(k, 0, 1, 60, 180);
  let baseY1 = height * 0.70;
  let baseY2 = height * 0.78;

  noStroke();


  fill(90, 130, 150);
  triangle(
    width * 0.15, baseY1,
    width * 0.50, baseY1 - h1,
    width * 0.85, baseY1
  );


  fill(70, 120, 110);
  triangle(
    width * 0.00, baseY2,
    width * 0.35, baseY2 - h2,
    width * 0.70, baseY2
  );
}


function drawWater(bass, vocal, other) {
  let kb = norm01(bass);
  let kv = norm01(vocal);
  let ko = norm01(other);


  let centerY = height * 0.84;
  let halfW = map(kb, 0, 1, 34, 78); 
  let wave = sin(frameCount * (0.02 + ko * 0.02)) * 3;


  noStroke();
  fill(60, 140, 210);
  rect(0, centerY - halfW + wave, width, halfW * 2);


  stroke(230, 245, 255, map(kv, 0, 1, 40, 140));
  strokeWeight(2);
  for (let x = 0; x <= width; x += 28) {
    let y = centerY + wave + sin((x + frameCount * 2) * 0.03) * 2;
    line(x - 10, y, x + 10, y);
  }
}

function updateRipple(drum) {
  
  if (isOnset(drum, prevDrum)) {
    rippleActive = true;
    rippleR = 8;
    rippleAlpha = 120;

    rippleX = random(30, width - 30);
    rippleY = height * 0.84 + random(-6, 6);
  }

 
  if (rippleActive) {
    noFill();
    stroke(230, 245, 255, rippleAlpha);
    ellipse(rippleX, rippleY, rippleR * 2, rippleR * 1.2); 
    rippleR += 2.0;
    rippleAlpha *= 0.95;
    if (rippleAlpha < 2) rippleActive = false;
  }
}

function draw_one_frame(words, vocal, drum, bass, other, counter) {
  drawSky(other);
  drawSun(vocal);
  drawMountains(bass);
  drawWater(bass, vocal, other);  
  updateRipple(drum);


  noStroke();
  fill(30, 70, 60);
  rect(0, height * 0.92, width, height * 0.08);

  
  if (words === "") {
    last_words_opacity *= 0.95;
    words = last_words;
  } else {
    last_words_opacity = (1 + last_words_opacity) * 1.06;
    if (last_words_opacity > 255) last_words_opacity = 255;
  }
  last_words = words;

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(40);
  noStroke();
  fill(0, 0, 0, int(last_words_opacity));
  text(words, width / 2, height * 0.16);

  
  prevDrum = drum;
}
