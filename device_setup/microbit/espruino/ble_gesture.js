/* Edit using https://espruino.github.io/EspruinoWebIDE/ */
g = Graphics.createArrayBuffer(5, 5, 1);
str = " ";
function showChar (ch) {
  g.clear();
  g.drawString(ch);
  show(g.buffer);
}

function acceleration_direction() {
  let acc = acceleration();
  let x = acc.x;
  let y = acc.y;
  let z = acc.z;
  let xa = Math.abs(x);
  let ya = Math.abs(y);
  let za = Math.abs(z);
  let result = [];
  // N.B. Need a transfer 'zone' percentage
  if ((xa >= ya) && (xa >= za)) { // X is biggest
    if (x <= 0) {
      result = [">", "right"];
    } else {
      result = ["<", "left"];
    }
  } else if ((ya >= za)) { // Y is biggest
    if (y <= 0) {
      result = ["F", "forward"];
    } else {
      result = ["B", "backward"];
    }
  } else { // Z is biggest
    if (z >= 0) {
      result = ["v", "down"];
    } else {
      result = ["^", "up"];
    }
  }
  return result;
}
// var btn1 = false, btn2 = false, str = " ";
// function update() {
//   if (btn1 && btn2) {
//     str = "+";
//   } else if (btn1) {
//     str = "A";
//   } else if (btn2) {
//     str = "B";
//   }
// }

function onInit() {
  // setWatch(function (e) {
  //   btn1 = e.state;
  //   update();
  // }, BTN1, { repeat: true, debounce: 20, edge: "both" });

  // setWatch(function (e) {
  //   btn2 = e.state;
  //   update();
  // }, BTN2, { repeat: true, debounce: 20, edge: "both" });

  setInterval(function () {
    if (str == " ") {
      var accl = acceleration_direction();
      str = accl[0];
      console.log(accl[1]);
    }
    showChar(str);
    str = " ";
  }, 250);
}

onInit();
// save();reset();