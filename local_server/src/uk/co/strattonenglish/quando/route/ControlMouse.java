package uk.co.strattonenglish.quando.route;

import java.io.IOException;

import uk.co.strattonenglish.quando.device.BaseMouseControl;
import uk.co.strattonenglish.quando.device.LocalControl;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONException;

public class ControlMouse extends RESTRoute {
	// REST access to controlling the mouse on the local machine
	// Note: the factory should return a dummy MouseControl for servers
	private static BaseMouseControl mouseControl = LocalControl.getMouseControl();

	@Override
	public String handle_REST(HttpServletRequest request) throws IOException {
		StringBuffer result = new StringBuffer();
		try {
			setJSONObjectOnRequest(request);
			setJSONObjectOnKey("val");

			int x_val = getJSONInteger("x", -1);
			int y_val = getJSONInteger("y", -1);
			if (x_val >= 0 || y_val >= 0) { // i.e. one or both of x and y have been given
				try {
					mouseControl.moveXYVal(x_val, y_val);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}

			System.out.println("handled by Control Mouse Route");

			result.append("{}");
		} catch (JSONException ex) {
			System.out.println("Malformed JSON received");
			result.append("{err: 'Malformed JSON received'}");
		}
		return result.toString();
	}

}
