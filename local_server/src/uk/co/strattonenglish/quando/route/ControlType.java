package uk.co.strattonenglish.quando.route;

import java.io.IOException;
import java.awt.event.KeyEvent;

import uk.co.strattonenglish.quando.device.BaseKeyControl;
import uk.co.strattonenglish.quando.device.KeyControl;
import uk.co.strattonenglish.quando.device.LocalControl;

import javax.servlet.http.HttpServletRequest;

public class ControlType extends RESTRoute {
	// REST access to controlling the keyboard and mouse on the local machine
	// Note: the factory should return a dummy KeyControl for servers
	private static BaseKeyControl keyControl = LocalControl.getKeyControl();
	
	@Override
	public String handle_REST(HttpServletRequest request) throws IOException {
		setJSONObjectOnRequest(request);
		StringBuffer result = new StringBuffer();
		String val = getJSONString("val");

		if (val != null) {
			System.out.println(val);
			
			try {
				keyControl.pressKeyCode(KeyEvent.VK_CONTROL);
				keyControl.typeKeyCode(KeyEvent.VK_ESCAPE, 100);
		        keyControl.releaseKeyCode(KeyEvent.VK_CONTROL);
		        for (char ch: val.toCharArray()) {
		        	keyControl.typeChar(ch, KeyControl.DEFAULT_TYPING_DELAY);
		        }
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}

		System.out.println("handled by Control Route");

        result.append("{}");
        return result.toString();
	}

}
