quando.forever(
 function(inc, dec) {
  quando.wait(
   function (inc, dec) {
    quando.video('/client/video/furnace.mp4', inc, dec);
    quando.text("1936 Car Production");
  },
  function() {
  quando.wait(
   function (inc, dec) {
    quando.video('/client/video/cleaning_engine_block.mp4', inc, dec);
    quando.text("Dirty work");
  },
  function() {
  quando.wait(
   function (inc, dec) {
    quando.video('/client/video/lifting_engine.mp4', inc, dec);
    quando.text("...and dangerous...");
  },
  function() {
  quando.wait(
   function (inc, dec) {
    quando.video('/client/video/driving_away.mp4', inc, dec);
    quando.text("Another happy customer...");
  },
  function() {
dec();
});
});
});
});
});