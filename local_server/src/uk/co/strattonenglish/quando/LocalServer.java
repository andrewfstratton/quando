package uk.co.strattonenglish.quando;

import org.eclipse.jetty.server.Server;

public class LocalServer {

	private static final int SERVER_PORT = 8080;

	public static void main(final String[] args) throws Exception {
		final Server server = new Server(SERVER_PORT);

		server.setHandler(new LocalhostHandler());
		server.start();
		server.join();
	}
}