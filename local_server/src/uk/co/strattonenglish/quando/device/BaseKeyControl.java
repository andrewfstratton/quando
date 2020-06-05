package uk.co.strattonenglish.quando.device;

public abstract class BaseKeyControl extends LocalControl {
	public abstract void typeKeyCode(int keyCode, boolean shift, int delay) throws InterruptedException;
	public abstract void typeKey(String char_or_id, int delay) throws InterruptedException;
	public abstract void pressKeyCode(int keyCode) throws InterruptedException;
	public abstract void releaseKeyCode(int keyCode) throws InterruptedException;
}
