
// Data generated at https://www.mkompf.com/tech/eddystoneurl.html
var ed_data = [
  0x03,  // Length of Service List
  0x03,  // Param: Service List
  0xAA, 0xFE,  // Eddystone ID
  0x14,  // Length of Service Data
  0x16,  // Service Data
  0xAA, 0xFE, // Eddystone ID
  0x10,  // Frame type: URL
  0xF8, // Power
  0x03, // https://
  'b', 'i', 't', '.', 'l', 'y', '/', '2', 'A', 'Q', 'v', 'R', 'L', 'S'
];

NRF.setAdvertising(ed_data, {interval:100});
