function onInit() {
  setWatch(function (e) {
    Bluetooth.write(e.state?'A':'-');
    show(1*e.state);
  }, BTN1, { repeat: true, debounce: 20, edge: "both" });
  setWatch(function (e) {
    Bluetooth.write(e.state?'B':'-');
    show(16*e.state);
  }, BTN2, { repeat: true, debounce: 20, edge: "both" });
}
save();