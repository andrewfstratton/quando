package uk.co.strattonenglish.quando.device;

import java.awt.AWTException;
import java.awt.Robot;

public abstract class LocalControl {
	static protected Robot robot;
	static private BaseKeyControl keyControl;
	static private BaseMouseControl mouseControl;
	static {
		try {
			robot = new Robot();
			keyControl = new KeyControl();
			mouseControl = new MouseControl();
		} catch (AWTException e1) { // TODO should detect when in cloud
			System.out.println("Warning - Local Control threw exception - ignored from now");
			e1.printStackTrace();
			keyControl = new BaseKeyControl();
			mouseControl = new BaseMouseControl();
		}
	}

	// Factory
	public static BaseKeyControl getKeyControl() {
		return keyControl;
	}
	public static BaseMouseControl getMouseControl() {
		return mouseControl;
	}
}
