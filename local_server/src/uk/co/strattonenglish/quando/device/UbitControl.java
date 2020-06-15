package uk.co.strattonenglish.quando.device;

public class UbitControl  extends LocalControl {
	// For controlling a micro:bit through the serial port on the local machine

	public void display(String str) {
		System.out.println("** Ubit **: '" + str + "'");
		// TODO implement display on ubit
	}
}