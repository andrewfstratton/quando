package uk.co.strattonenglish.quando.route;

import java.io.IOException;
import java.awt.event.KeyEvent;

import uk.co.strattonenglish.quando.device.KeyControl;
import uk.co.strattonenglish.quando.device.LocalControl;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONException;

public class KeyboardKey extends RESTRoute {
	// REST access to controlling the keyboard and mouse on the local machine
	// Note: the factory should return a dummy KeyControl for servers
	private static KeyControl keyControl = LocalControl.getKeyControl();

	@Override
	public String handle_REST(HttpServletRequest request) throws IOException {
		StringBuffer result = new StringBuffer();
		if (keyControl == null) {
			result.append("{'error':'cloud deploy'}");
		} else {
			try {
				setJSONObjectOnRequest(request);
				setJSONObjectOnKey("val");

				String key = getJSONString("key");
				boolean press = getJSONBoolean("press", false);
				boolean shift = getJSONBoolean("shift", false);
				boolean ctrl = getJSONBoolean("ctrl", false);
				boolean alt = getJSONBoolean("alt", false);
				boolean command = getJSONBoolean("command", false);

				if (shift) {
					keyControl.pressKeyCode(KeyEvent.VK_SHIFT);
				}
				if (ctrl) {
					keyControl.pressKeyCode(KeyEvent.VK_CONTROL);
				}
				if (alt) {
					keyControl.pressKeyCode(KeyEvent.VK_ALT);
				}
				if (command) {
					keyControl.pressKeyCode(KeyEvent.VK_META);
				}
				keyControl.press_release_Key(key, press);
				if (command) {
					keyControl.releaseKeyCode(KeyEvent.VK_META);
				}
				if (alt) {
					keyControl.releaseKeyCode(KeyEvent.VK_ALT);
				}
				if (ctrl) {
					keyControl.releaseKeyCode(KeyEvent.VK_CONTROL);
				}
				if (shift) {
					keyControl.releaseKeyCode(KeyEvent.VK_SHIFT);
				}

				System.out.println("handled by Control Key Route");
				result.append("{}");
			} catch (JSONException ex) {
				System.out.println("Malformed JSON received");
				result.append("{err: 'Malformed JSON received'}");
			}
		}
		return result.toString();
	}

}
