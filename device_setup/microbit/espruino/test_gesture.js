function acceleration_direction() {
  var acc = acceleration();
  var x = acc.x;
  var y = acc.y;
  var z = acc.z;
  var xa = Math.abs(x);
  var ya = Math.abs(y);
  var za = Math.abs(z);
  var ch;
  if ((xa >= ya) && (xa >= za)) {
    if (x <= 0) {
      ch = '>';
    } else {
      ch = '<';
    }
  } else if ((ya >= za)) {
    if (y <= 0) {
      ch = 'F';
    } else {
      ch = 'B';
    }
  } else {
    if (z <= 0) {
      ch = '^';
    } else {
      ch = 'v';
    }
  }
  console.log(ch);
}

setInterval(acceleration_direction, 250);