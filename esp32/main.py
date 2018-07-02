import time
time.sleep(1)
import machine, ssd1306
pin16 = machine.Pin(16, machine.Pin.OUT)
pin16.value(1)
i2c = machine.I2C(scl=machine.Pin(15), sda=machine.Pin(4))
oled = ssd1306.SSD1306_I2C(128, 64, i2c)
oled.fill(0)
oled.text('Hello World!', 0, 0)
oled.show()

# ampy --port COM4 -d 2 put main.py
#
# esptool.py --port COM4 erase_flash
# esptool.py --chip esp32 --port COM4 write_flash -z 0x1000 .\esp32-20180627-v1.9.4-204-gb9ec6037.bin