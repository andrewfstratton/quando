import struct
import time

def find_device(devices, *, usage_page, usage):
    """Search through the provided list of devices to find the one with the matching usage_page and
    usage."""
    if hasattr(devices, "send_report"):
        devices = [devices]
    for device in devices:
        if (
            device.usage_page == usage_page
            and device.usage == usage
            and hasattr(device, "send_report")
        ):
            return device
    raise ValueError("Could not find matching HID device.")

class Gamepad:
    def __init__(self, devices):
        self._gamepad_device = find_device(devices, usage_page=0x1, usage=0x05)
        self._report = bytearray(10)
        self._last_report = bytearray(10)

        # Send an initial report to test if HID device is ready.
        # If not, wait a second and try once more.
        try:
            self.reset_all()
        except OSError:
            time.sleep(1)
            self.reset_all()

    def press_buttons(self, *buttons):
        for button in buttons:
            self._buttons_state |= 1 << self._validate_button_number(button) - 1
        self._send()

    def release_buttons(self, *buttons):
        for button in buttons:
            self._buttons_state &= ~(1 << self._validate_button_number(button) - 1)
        self._send()

    def release_all_buttons(self):
        self._buttons_state = 0
        self._send()

    def move_joysticks(self, x=None, y=None, z=None, rz=None):
        if x is not None:
            self._joy_x = self._validate_joystick_value(x)
        if y is not None:
            self._joy_y = self._validate_joystick_value(y)
        if z is not None:
            self._joy_z = self._validate_joystick_value(z)
        if rz is not None:
            self._joy_rz = self._validate_joystick_value(rz)
        self._send()

    def reset_all(self):
        """Release all buttons and set joystick to zero."""
        self._buttons_state = 0
        self._joy_x = 0
        self._joy_y = 0
        self._joy_z = 0
        self._joy_rz = 0
        self._send(always=True)

    def _send(self, always=False):
        struct.pack_into('<Hhhhh', self._report, 0,
                         self._buttons_state,
                         self._joy_x, self._joy_y, self._joy_z, self._joy_rz)

        if always or self._last_report != self._report:
            self._gamepad_device.send_report(self._report)

            # Remember what we sent, without allocating new storage.
            self._last_report[:] = self._report

    @staticmethod
    def _validate_button_number(button):
        if not 1 <= button <= 16:
            raise ValueError("Button number must in range 1 to 16")
        return button

    @staticmethod
    def _validate_joystick_value(value):
        if not -32767 <= value <= 32767:
            raise ValueError("Joystick value must be in range -32767 to 32767")
        return value
