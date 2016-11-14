quando.forever(
 function(inc, dec) {
  inc();
  quando.do_duration(4,
  function() {
    quando.image("/client/images/hyaena.jpg");
    quando.text("Hyenas were at Creswell Crags");
    quando.audio('/client/audio/hyenas.mp3', inc, dec);
  },
  function() {
  inc();
  quando.do_duration(4,
  function() {
    quando.image("/client/images/lion.jpg");
    quando.text("...and Lions...");
    quando.audio('/client/audio/lion_roar.mp3', inc, dec);
  },
  function() {
  inc();
  quando.do_duration(4,
  function() {
    quando.image("/client/images/wolves.jpg");
    quando.text("...wolves...");
    quando.audio('/client/audio/wolf.mp3', inc, dec);
  },
  function() {
  inc();
  quando.do_duration(5,
  function() {
    quando.image("/client/images/mammoth.jpg");
    quando.text("...and Mammoths, whatever they sounded like.");
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