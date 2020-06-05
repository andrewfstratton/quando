package uk.co.strattonenglish.quando.route;

import java.io.IOException;
import java.awt.event.KeyEvent;

import uk.co.strattonenglish.quando.device.BaseKeyControl;
import uk.co.strattonenglish.quando.device.KeyControl;
import uk.co.strattonenglish.quando.device.LocalControl;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONException;

public class ControlKey extends RESTRoute {
	// REST access to controlling the keyboard and mouse on the local machine
	// Note: the factory should return a dummy KeyControl for servers
	private static BaseKeyControl keyControl = LocalControl.getKeyControl();

	@Override
	public String handle_REST(HttpServletRequest request) throws IOException {
		StringBuffer result = new StringBuffer();
		try {
			setJSONObjectOnRequest(request);
			setJSONObjectOnKey("val");

			String key = getJSONString("key");
			boolean shift = getJSONBoolean("shift");
			boolean ctrl = getJSONBoolean("ctrl");
			boolean alt = getJSONBoolean("alt");
			boolean command = getJSONBoolean("command");

				try {
					if (shift) { keyControl.pressKeyCode(KeyEvent.VK_SHIFT); }
					if (ctrl) { keyControl.pressKeyCode(KeyEvent.VK_CONTROL); }
					if (alt) { keyControl.pressKeyCode(KeyEvent.VK_ALT); }
					if (command) { keyControl.pressKeyCode(KeyEvent.VK_META); }
					keyControl.typeKey(key, KeyControl.DEFAULT_TYPING_DELAY);
					if (command) { keyControl.releaseKeyCode(KeyEvent.VK_META); }
					if (alt) { keyControl.releaseKeyCode(KeyEvent.VK_ALT); }
					if (ctrl) { keyControl.releaseKeyCode(KeyEvent.VK_CONTROL); }
					if (shift) { keyControl.releaseKeyCode(KeyEvent.VK_SHIFT); }
				} catch (InterruptedException e) {
					e.printStackTrace();
				}

			System.out.println("handled by Control Key Route");

			result.append("{}");
		} catch (JSONException ex) {
			System.out.println("Malformed JSON received");
			result.append("{err: 'Malformed JSON received'}");
		}
		return result.toString();
	}

}
