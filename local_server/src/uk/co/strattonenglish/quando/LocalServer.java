package uk.co.strattonenglish.quando;

import org.eclipse.jetty.server.Server;

public class LocalServer {

	public static void main(final String[] args) throws Exception {
		final int port = 80;
		final Server server = new Server(port);
        server.setHandler(new LocalhostHandler());
		server.start();
		server.join();
	}
}