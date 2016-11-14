quando.forever(
 function(inc, dec) {
  quando.wait(
   function (inc, dec) {
    inc();
    quando.do_duration(5,
    function() {
      quando.image("/client/images/shef_barkers_pool_1968_2009.jpg");
      quando.text("Barkers Pool 1968 and 2009");
    },
    function() {
    inc();
    quando.do_duration(5,
    function() {
      quando.image("/client/images/shef_millhouses_1932_2010.jpg");
      quando.text("Millhouses 1932 and 2010");
    },
    function() {
    inc();
    quando.do_duration(5,
    function() {
      quando.image("/client/images/shef_peace_gardens_196x_2009.jpg");
      quando.text("Peace Gardens late 1960s and 2009");
    },
    function() {
  dec();
  });
  dec();
  });
  dec();
  });
  },
  function() {
dec();
});
});