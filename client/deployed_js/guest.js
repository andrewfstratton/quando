quando.robot.connect("192.168.43.71");
quando.robot.setVocabulary("Hi,Hello,Hey");
quando.robot.listenForWords(function() {
  quando.robot.say("Hello");
}, function() {
  quando.robot.say("Goodbye");
}, 60);
