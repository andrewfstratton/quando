package uk.co.strattonenglish.quando.device;

import java.awt.event.KeyEvent;
import java.util.HashMap;

public class KeyControl extends BaseKeyControl {
	// For controlling the keyboard on the local machine
	
	// Default time between press and release (to type) is 50ms, i.e. ~20 char/second, ~240 wpm
	public static final int DEFAULT_TYPING_DELAY = 50; 

	private static HashMap<Character, Integer> LOWER_CHAR_TO_KEYCODE = new HashMap<>();
	static {
		LOWER_CHAR_TO_KEYCODE.put('`', KeyEvent.VK_BACK_QUOTE);
		LOWER_CHAR_TO_KEYCODE.put('-', KeyEvent.VK_MINUS);
		LOWER_CHAR_TO_KEYCODE.put('=', KeyEvent.VK_EQUALS);
		LOWER_CHAR_TO_KEYCODE.put('#', KeyEvent.VK_NUMBER_SIGN);
		LOWER_CHAR_TO_KEYCODE.put('\t', KeyEvent.VK_TAB);
		LOWER_CHAR_TO_KEYCODE.put('\n', KeyEvent.VK_ENTER);
		LOWER_CHAR_TO_KEYCODE.put('\b', KeyEvent.VK_BACK_SPACE);
		LOWER_CHAR_TO_KEYCODE.put('\\', KeyEvent.VK_BACK_SLASH);
		LOWER_CHAR_TO_KEYCODE.put('[', KeyEvent.VK_OPEN_BRACKET);
		LOWER_CHAR_TO_KEYCODE.put(']', KeyEvent.VK_CLOSE_BRACKET);
		LOWER_CHAR_TO_KEYCODE.put(';', KeyEvent.VK_SEMICOLON);
		LOWER_CHAR_TO_KEYCODE.put('\'', KeyEvent.VK_QUOTE);
		LOWER_CHAR_TO_KEYCODE.put(',', KeyEvent.VK_COMMA);
		LOWER_CHAR_TO_KEYCODE.put('.', KeyEvent.VK_PERIOD);
		LOWER_CHAR_TO_KEYCODE.put('/', KeyEvent.VK_SLASH);
		LOWER_CHAR_TO_KEYCODE.put(' ', KeyEvent.VK_SPACE);
	}
	    
	private static HashMap<Character, Integer> UPPER_CHAR_TO_KEYCODE = new HashMap<>();
	static {
		UPPER_CHAR_TO_KEYCODE.put('!', KeyEvent.VK_1);
		UPPER_CHAR_TO_KEYCODE.put('\"', KeyEvent.VK_2);
		UPPER_CHAR_TO_KEYCODE.put('£', KeyEvent.VK_3);
		UPPER_CHAR_TO_KEYCODE.put('$', KeyEvent.VK_4);
		UPPER_CHAR_TO_KEYCODE.put('%', KeyEvent.VK_5);
		UPPER_CHAR_TO_KEYCODE.put('^', KeyEvent.VK_6);
		UPPER_CHAR_TO_KEYCODE.put('&', KeyEvent.VK_7);
		UPPER_CHAR_TO_KEYCODE.put('*', KeyEvent.VK_8);
		LOWER_CHAR_TO_KEYCODE.put('(', KeyEvent.VK_9);
		LOWER_CHAR_TO_KEYCODE.put(')', KeyEvent.VK_0);
		UPPER_CHAR_TO_KEYCODE.put('@', KeyEvent.VK_QUOTE);
		UPPER_CHAR_TO_KEYCODE.put('_', KeyEvent.VK_MINUS);
		UPPER_CHAR_TO_KEYCODE.put('+', KeyEvent.VK_EQUALS);
		UPPER_CHAR_TO_KEYCODE.put('{', KeyEvent.VK_OPEN_BRACKET);
		UPPER_CHAR_TO_KEYCODE.put('}', KeyEvent.VK_CLOSE_BRACKET);
		UPPER_CHAR_TO_KEYCODE.put('~', KeyEvent.VK_NUMBER_SIGN);
		UPPER_CHAR_TO_KEYCODE.put('|', KeyEvent.VK_BACK_SLASH);
		UPPER_CHAR_TO_KEYCODE.put(':', KeyEvent.VK_SEMICOLON);
		UPPER_CHAR_TO_KEYCODE.put('<', KeyEvent.VK_COMMA);
		UPPER_CHAR_TO_KEYCODE.put('>', KeyEvent.VK_PERIOD);
		UPPER_CHAR_TO_KEYCODE.put('?', KeyEvent.VK_SLASH);
		UPPER_CHAR_TO_KEYCODE.put('¬', KeyEvent.VK_BACK_QUOTE);
	}

	public void typeKeyCode(int keyCode, int delay) throws InterruptedException {
		robot.keyPress(keyCode);
		Thread.sleep(50);
		robot.keyRelease(keyCode);
	}

	@Override
	public void pressKeyCode(int keyCode) throws InterruptedException {
		robot.keyPress(keyCode);
	}

	@Override
	public void releaseKeyCode(int keyCode) throws InterruptedException {
		robot.keyRelease(keyCode);
	}

	@Override
	public void typeChar(char ch, int delay) throws InterruptedException {
		int keyCode = KeyEvent.VK_UNDEFINED; // default to unknown character

		boolean isUpper = false;
		boolean isLetter = (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
		boolean isDigit = Character.isDigit(ch);

		if (isLetter || isDigit) {
			keyCode = KeyEvent.getExtendedKeyCodeForChar(ch);
			isUpper = Character.isUpperCase(ch);
		} else {
			Integer lowKeycode = LOWER_CHAR_TO_KEYCODE.get(ch);
			if (lowKeycode != null) {
				keyCode = lowKeycode.intValue();
			} else {
				Integer highKeycode = UPPER_CHAR_TO_KEYCODE.get(ch);
				if (highKeycode != null) {
					keyCode = highKeycode.intValue();
					isUpper = true;
				}
			}
		}

		if (keyCode != KeyEvent.VK_UNDEFINED) {
			if (isUpper) {
				pressKeyCode(KeyEvent.VK_SHIFT);
			}
			try {
				typeKeyCode(keyCode, delay);
			} catch (IllegalArgumentException e) {
				// ignore silently
			}
			if (isUpper) {
				releaseKeyCode(KeyEvent.VK_SHIFT);
			}
		}
	}
}