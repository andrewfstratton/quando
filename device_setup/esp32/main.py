import time, machine, ssd1306, usocket as socket, network, uctypes, ujson

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
  show(' Connected as:')
  show(str(station.ifconfig()[0], "utf-8"))

def main():
  host_ip = '192.168.137.1'
  show('starting...')
  setup_wifi()
  sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  show('connect to:')
  show(' '+host_ip)
  addr = socket.getaddrinfo(host_ip, 591)
  con = addr[0][-1]
  show(str(con))
  sock.connect(con)
  show(' connected...')
  # sock.send("hello")
  # show('sent')
  while True:
    req = sock.recv(256)
    req = str(req, "utf-8")
    print(req)
    try:
      obj = ujson.loads(req)
      print('len obj='+str(len(obj)))
      print(obj['id'])
      show(obj['id'])
    except ValueError:
      print('Exception')
      time.sleep(10)
    #obj['i.1d'])
  #     except OSError:
  #       print('EX:')
  #       conn.close()
  #       conn = False

main()
time.sleep(10)

# ampy --port COM4 -d 2 put main.py
#
# esptool.py --port COM4 erase_flash
# esptool.py --chip esp32 --port COM4 write_flash -z 0x1000 .\esp32-20180627-v1.9.4-204-gb9ec6037.bin