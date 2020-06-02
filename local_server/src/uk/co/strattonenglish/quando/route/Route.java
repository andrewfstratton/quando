package uk.co.strattonenglish.quando.route;

import java.io.IOException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public abstract class Route {
	public abstract void handle(HttpServletRequest request,
		       HttpServletResponse response) throws IOException;
}
