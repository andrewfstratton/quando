import time, machine, ssd1306, usocket as socket, network, uctypes

oled = False
line = 0

RESPONSE = b"""\
HTTP/1.0 200 OK
Hello from ESP32...
"""

def show(str):
  global oled, line

  def setup_display():
    time.sleep(1)
    pin16 = machine.Pin(16, machine.Pin.OUT)
    pin16.value(1)
    i2c = machine.I2C(scl=machine.Pin(15), sda=machine.Pin(4))
    oled = ssd1306.SSD1306_I2C(128, 64, i2c)
    oled.fill(0)
    oled.text('init...', 0, 0)
    oled.show()
    return oled

  if (oled == False):
    oled = setup_display()
    line = 8
  if (line > 63):
    oled.fill(0)
    line = 0
  oled.text(str, 0, line)
  oled.show()
  line = line + 8

def clear():
  global line
  line = 0
  oled.fill(0)
  oled.show()

def setup_wifi():
  show('setup:wifi')
  station = network.WLAN(network.STA_IF)
  if not station.isconnected():
    show('connecting...')
    station.active(True)
    station.connect("Quando", "1234567890")
    while not station.isconnected():
      time.sleep(1)
      show('...')
  clear()
  show(' Connected to:')
  show(str(station.ifconfig()[0]))

def main():
  setup_wifi()
  show('starting...')
  _socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  show('...have socket')
  _socket.bind(('',80))
  _socket.listen(5)
  show('..listening')
  while True:
    conn, addr = _socket.accept()
    # show('Con<<'+str(addr))
    print('Connected ' + str(addr))
    print(str(conn))
    while conn != False:
      print('..')
      try:
        req = conn.recv(256)
        if not req:
          conn.close()
          conn = False
        else:
          req = req.decode('utf-8').rstrip()
          if len(req) > 0:
            show(req)
            print('>'+req)
        # conn.send('ok')
      except OSError:
        print('EX:')
        conn.close()
        conn = False

main()
time.sleep(10)

# ampy --port COM4 -d 2 put main.py
#
# esptool.py --port COM4 erase_flash
# esptool.py --chip esp32 --port COM4 write_flash -z 0x1000 .\esp32-20180627-v1.9.4-204-gb9ec6037.bin