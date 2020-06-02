package uk.co.strattonenglish.quando.route;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class IP extends Route {

	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response) throws IOException {
// TODO Implement get IP address of remote browser - may not be needed is node.js remains in cloud
		System.out.println("handled by IP Route");
        response.setContentType("text/html; charset=utf-8");
        response.setStatus(HttpServletResponse.SC_OK);

        PrintWriter out = response.getWriter();

        out.println("{greeting:" + request.getParameter("greeting") + ",\n"
        		+ "ip:" + null + "}");
	}

}
