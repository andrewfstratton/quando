package uk.co.strattonenglish.quando.route;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class Unknown extends Route {
	public static Route singleton = new Unknown();
	
	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html; charset=utf-8");
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        response.getWriter().println("Route not Found: " + request.getPathInfo());
	}
	
	public Route getInstance() { return singleton; }
}
