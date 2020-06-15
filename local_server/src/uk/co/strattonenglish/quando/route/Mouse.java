package uk.co.strattonenglish.quando.route;

import java.io.IOException;

import uk.co.strattonenglish.quando.device.MouseControl;
import uk.co.strattonenglish.quando.device.LocalControl;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONException;

public class Mouse extends RESTRoute {
	// REST access to controlling the mouse on the local machine
	// Note: the factory should return a dummy MouseControl for servers
	private static MouseControl mouseControl = LocalControl.getMouseControl();

	@Override
	public String handle_REST(HttpServletRequest request) throws IOException {
		StringBuffer result = new StringBuffer();
		if (mouseControl == null) {
			result.append("{'error':'cloud deploy'}");
		} else {
			try {
				setJSONObjectOnRequest(request);
				setJSONObjectOnKey("val");

				float x_val = getJSONFloat("x", -1);
				float y_val = getJSONFloat("y", -1);
				if (x_val >= 0 || y_val >= 0) { // i.e. one or both of x and y have been given
					mouseControl.moveXYVal(x_val, y_val);
				}
				int left = getJSONInteger("left", 0);
				int right = getJSONInteger("right", 0);
				int middle = getJSONInteger("middle", 0);

				if (left != 0) { // -1 is release, 1 is press
					if (left == 1) {
						mouseControl.pressButton(1);
					} else {
						mouseControl.releaseButton(1);
					}
				}
				if (middle != 0) {
					if (middle == 1) {
						mouseControl.pressButton(2);
					} else {
						mouseControl.releaseButton(2);
					}
				}
				if (right != 0) {
					if (right == 1) {
						mouseControl.pressButton(3);
					} else {
						mouseControl.releaseButton(3);
					}
				}

				System.out.println("handled by Control Mouse Route");

				result.append("{}");
			} catch (JSONException ex) {
				ex.printStackTrace();
				System.out.println("Malformed JSON received");
				result.append("{err: 'Malformed JSON received'}");
			}
		}
		return result.toString();
	}

}
