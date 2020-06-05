package uk.co.strattonenglish.quando.device;

import java.awt.event.KeyEvent;
import java.util.HashMap;

public class KeyControl extends BaseKeyControl {
	// For controlling the keyboard on the local machine
	
	// Default time between press and release (to type) is 50ms, i.e. ~20 char/second, ~240 wpm
	public static final int DEFAULT_TYPING_DELAY = 50; 

	private static final HashMap<Character, Integer> LOWER_CHAR_TO_KEYCODE = new HashMap<>();
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
	    
	protected boolean typed_lower(char ch, int delay_ms) {
		boolean typed = false;
		Integer keyCode = LOWER_CHAR_TO_KEYCODE.get(ch);
		if (keyCode != null) {
			typeKeyCode(keyCode.intValue(), false, delay_ms);
			typed = true;
		}
		return typed;
	}

	private static final HashMap<Character, Integer> UPPER_CHAR_TO_KEYCODE = new HashMap<>();
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

	protected boolean typed_upper(char ch, int delay_ms) {
		boolean typed = false;
		Integer keyCode = UPPER_CHAR_TO_KEYCODE.get(ch);
		if (keyCode != null) {
			typeKeyCode(keyCode.intValue(), true, delay_ms);
			typed = true;
		}
		return typed;
	}

	public void typeKeyCode(int keyCode, boolean shift, int delay) {
		try {
			if (shift) { pressKeyCode(KeyEvent.VK_SHIFT); }
			pressKeyCode(keyCode);
			Thread.sleep(delay);
			releaseKeyCode(keyCode);
			if (shift) { releaseKeyCode(KeyEvent.VK_SHIFT); }
		} catch (IllegalArgumentException e) {
			// ignore silently
		} catch (InterruptedException e) {
			// ignore silently
		}
	}

	protected boolean typed_letter_digit(char ch, int delay_ms) {
		boolean typed = false;
		boolean isUpper = false;
		// TODO need to keep count of current presses to allow correct release
		boolean isLetter = (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
		boolean isDigit = Character.isDigit(ch);

		if (isLetter || isDigit) {
			isUpper = Character.isUpperCase(ch);
			int keyCode = KeyEvent.getExtendedKeyCodeForChar(ch);
			if (keyCode != KeyEvent.VK_UNDEFINED) {
				typeKeyCode(keyCode, isUpper, delay_ms);
				typed = true;
			}
		}
		return typed;
	}

	private static final HashMap<String, Integer> ID_TO_KEY = new HashMap<>();
	static {
		ID_TO_KEY.put("left", KeyEvent.VK_LEFT);
		ID_TO_KEY.put("right", KeyEvent.VK_RIGHT);
		ID_TO_KEY.put("up", KeyEvent.VK_UP);
		ID_TO_KEY.put("down", KeyEvent.VK_DOWN);
		ID_TO_KEY.put("escape", KeyEvent.VK_ESCAPE);
	}

	protected boolean typed_on_Id(String id, int delay_ms) {
		boolean typed = false;
		Integer idKeyCode = ID_TO_KEY.get(id);
		if (idKeyCode != null) {
			typeKeyCode(idKeyCode.intValue(), false, delay_ms);
			typed = true;
		}
		return typed;
	}

	@Override
	public void pressKeyCode(int keyCode) {
		try { robot.keyPress(keyCode); } catch (IllegalArgumentException e) { /* ignore silently */ }
	}

	@Override
	public void releaseKeyCode(int keyCode) {
		try { robot.keyRelease(keyCode); } catch (IllegalArgumentException e) { /* ignore silently */ }
	}

	@Override
	public void typeKey(String char_or_id, int delay) {
		if (!typed_on_Id(char_or_id, delay)) {
			if (char_or_id.length() == 1) {
				char ch = char_or_id.charAt(0);
				if (!typed_lower(ch, delay)) {
					if (!typed_upper(ch, delay)) {
						if (!typed_letter_digit(ch, delay)) {
							// not recognised
						}
					}
				}
			}
		}
	}
}