quando.forever(
 function(inc, dec) {
  inc();
  quando.do_duration(1,
  function() {
    quando.image("/client/images/red_light.png");
  },
  function() {
  inc();
  quando.do_duration(1,
  function() {
    quando.image("/client/images/red_amber_light.png");
  },
  function() {
  inc();
  quando.do_duration(1,
  function() {
    quando.image("/client/images/green_light.png");
  },
  function() {
  inc();
  quando.do_duration(1,
  function() {
    quando.image("/client/images/amber_light.png");
  },
  function() {
dec();
dec();
});
dec();
});
dec();
});
dec();
});
});