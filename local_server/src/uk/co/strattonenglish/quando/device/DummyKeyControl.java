package uk.co.strattonenglish.quando.device;

public class DummyKeyControl extends BaseKeyControl {
	// Allows keycontrol to be ignored - e.g. when on a server.
	@Override
	public void typeKeyCode(int keyCode, boolean shift, int delay) throws InterruptedException {}

	@Override
	public void typeKey(String char_or_id, int delay) throws InterruptedException {}

	@Override
	public void pressKeyCode(int keyCode) throws InterruptedException {}

	@Override
	public void releaseKeyCode(int keyCode) throws InterruptedException {}

}
