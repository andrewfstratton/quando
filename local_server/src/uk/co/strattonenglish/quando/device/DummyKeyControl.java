package uk.co.strattonenglish.quando.device;

public class DummyKeyControl extends BaseKeyControl {
	// Allows keycontrol to be ignored - e.g. when on a server.
	@Override
	public void typeKeyCode(int keyCode, int delay) throws InterruptedException {}

	@Override
	public void typeChar(char ch, int delay) throws InterruptedException {}

	@Override
	public void pressKeyCode(int keyCode) throws InterruptedException {}

	@Override
	public void releaseKeyCode(int keyCode) throws InterruptedException {}
}
