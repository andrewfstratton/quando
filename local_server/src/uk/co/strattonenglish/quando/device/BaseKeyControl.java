package uk.co.strattonenglish.quando.device;

public abstract class BaseKeyControl extends LocalControl {
	public abstract void typeKeyCode(int keyCode, int delay) throws InterruptedException;
	public abstract void typeChar(char ch, int delay) throws InterruptedException;
	public abstract void pressKeyCode(int keyCode) throws InterruptedException;
	public abstract void releaseKeyCode(int keyCode) throws InterruptedException;
}
