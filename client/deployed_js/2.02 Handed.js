quando.image("/client/images/gandhi.jpg");

quando.handed(false,
false,
 function() {
  quando.text("Which hand did Mahatma Gandhi write with?");
});
quando.handed(true,
false,
 function() {
  quando.text("He wasn't left handed...");
});
quando.handed(false,
true,
 function() {
  quando.text("He wasn't right handed...");
});
quando.handed(true,
true,
 function() {
  quando.text("Yes - he used both, though mostly his right");
});