package uk.co.strattonenglish.quando.route;

import java.io.IOException;
import java.awt.event.KeyEvent;

import uk.co.strattonenglish.quando.device.BaseKeyControl;
import uk.co.strattonenglish.quando.device.KeyControl;
import uk.co.strattonenglish.quando.device.LocalControl;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONException;

public class ControlType extends RESTRoute {
	// REST access to controlling the keyboard and mouse on the local machine
	// Note: the factory should return a dummy KeyControl for servers
	private static BaseKeyControl keyControl = LocalControl.getKeyControl();

	@Override
	public String handle_REST(HttpServletRequest request) throws IOException {
		StringBuffer result = new StringBuffer();
		try {
			setJSONObjectOnRequest(request);
			String val = getJSONString("val");

			if (val != null) {
				try {
					for (char ch : val.toCharArray()) {
						keyControl.typeKey(Character.toString(ch), KeyControl.DEFAULT_TYPING_DELAY);
					}
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}

			// System.out.println("handled by Control Type Route");

			result.append("{}");
		} catch (JSONException ex) {
			System.out.println("Malformed JSON received");
			result.append("{err: 'Malformed JSON received'}");
		}
		return result.toString();
	}

}
