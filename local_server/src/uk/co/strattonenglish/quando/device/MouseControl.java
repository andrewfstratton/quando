package uk.co.strattonenglish.quando.device;
import java.awt.Dimension;
import java.awt.MouseInfo;
import java.awt.Point;
import java.awt.PointerInfo;
import java.awt.event.InputEvent;

public class MouseControl extends LocalControl {
	private int screenWidth;
	private int screenHeight;
	private int button_mask = 0;
	private int last_x; 
	private int last_y;

	public MouseControl() {
		Dimension screenSize = java.awt.Toolkit.getDefaultToolkit().getScreenSize();
		screenWidth = (int) screenSize.getWidth();
		screenHeight = (int) screenSize.getHeight();
		last_x = screenWidth / 2;
		last_y = screenHeight / 2;
	}


	public synchronized void moveXYVal(float x_val, float y_val) {
		int x = last_x;
		int y = last_y;
		PointerInfo pointerInfo = MouseInfo.getPointerInfo();
		if (pointerInfo != null) { // N.B. This null test is essential for OpenJDK (at the least)
			Point p = pointerInfo.getLocation();
			x = p.x;
			y = p.y;
		}
		if (x_val >= 0) {
			x = (int) ((float) screenWidth * x_val);
		}
		if (y_val >= 0) {
			y_val = 1 - y_val; // inverted
			y = (int) ((float) screenHeight * y_val);
		}
		robot.mouseMove(x, y);
	}

	public void pressButton(final int button) {
		int new_mask = button_mask | InputEvent.getMaskForButton(button);
		if (new_mask != button_mask) {
			button_mask = new_mask;
			robot.mousePress(button_mask);
		}
	}

	public void releaseButton(final int button) {
		int mask_for_button = InputEvent.getMaskForButton(button);
		int new_mask = button_mask & mask_for_button;
		if (new_mask != 0) { // i.e. was pressed
			robot.mouseRelease(button_mask);
			button_mask ^= mask_for_button; // xor the mask to remove
		}
	}
}