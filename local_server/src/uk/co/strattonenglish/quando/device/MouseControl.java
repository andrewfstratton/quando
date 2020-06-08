package uk.co.strattonenglish.quando.device;
import java.awt.Dimension;
import java.awt.MouseInfo;
import java.awt.Point;

public class MouseControl extends BaseMouseControl {
	private int screenWidth;
	private int screenHeight;
	public MouseControl() {
		Dimension screenSize = java.awt.Toolkit.getDefaultToolkit().getScreenSize();
		screenWidth = (int) screenSize.getWidth();
		screenHeight = (int) screenSize.getHeight();
	}


	@Override
	public void moveXYVal(float x_val, float y_val) {
			Point p = MouseInfo.getPointerInfo().getLocation();
			int x = p.x;
			int y = p.y;
			if (x_val >= 0) {
				x = (int) ((float) screenWidth * x_val);
			}
			if (y_val >= 0) {
				y = (int) ((float) screenHeight * y_val);
			}
		robot.mouseMove(x, y);
	}

	@Override
	public void pressButton(final int button) throws InterruptedException {
		// TODO implement
	}

	@Override
	public void releaseButton(final int button) throws InterruptedException {
		// TODO implement
	}
}