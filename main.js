/* Top level script for MK-90 emulator.
 * Trying to keep things simple this time and not cram the entire thing into a single object.
 * Although that would be handy, who knows, maybe I want to run 3 calculators on a single page
 * concurrently =)
 * 
 * 
 */

window.onload = function() {
	document.getElementById("mk90").appendChild(GUI);
	document.getElementById("mk90_panel").appendChild(PAN);
	document.getElementById("mk90_dbg").appendChild(DBG);
	document.getElementById("mk90_acpu").appendChild(ACPU);
	PAN.panelInit();
};

var VERVAR = "0.0b14 - build 03.02.2026";

var supportsVibrate = "vibrate" in navigator;

var useSound = loadProperty('mk90_sound', true, true);
var gameArrows = loadProperty('mk90_gamearrows', false, true);

var useVibrate = window.localStorage.getItem('mk90_vibro');

if(supportsVibrate && (useVibrate == null)) {
	useVibrate = true;
	window.localStorage.setItem('mk90_vibro', useVibrate);
}
else if (supportsVibrate) {
	useVibrate = (useVibrate == "true");
}

//var BASEPATH = "/jsemu/mk90";
var BASEPATH = "."; // Base path for files!

var GUI = composeGUI();

var LCD = new MK85_SVG_LCD();
var LCD_ANIMSPEED = 10;

var DBG = new DBGTOOL();

var DEBUG_STEPS = false;
var BREAKPOINT = false;
var SKIPBSTEP = false;

var DEBUG = loadProperty('mk90_debugmsg', false, true);
var usebas = Number(loadProperty('mk90_bromv', 2, false));
var usebast = Number(loadProperty('mk90_bromtv', 2, false));
var b1fix = loadProperty('mk90_b1fix', true, true);
var b2fix = loadProperty('mk90_b2fix', true, true);
var SPEED = loadProperty('mk90_speed', 1200, false);
var usem92 = Number(loadProperty('mk90_mk92type', 0, false));
var koiprint = loadProperty('mk90_koiprinter', false, true);

var ACPU = new ACPUPRINT();
var PAN = new PANEL();

GUI.appendChild(LCD.svg);

var MK85CPU = new CPU();

var POWER = true;
var PAUSE_ON_HID = false;

// Define RAM and load ROM, ROMT contents
var RAM = null;
var ROM = null;
var ROMT = null;
var romn = null;
var romtn = null;

switch(usebas) {
	case 0:
		ROM = new Uint8Array(base64ToArrayBuffer(window.localStorage.getItem('mk90_rom')));
		romn = window.localStorage.getItem('mk90_romname');
		break;
	case 1:
		ROM = new Uint8Array(ROM_int10); // Internal ROM 1.0 image constant
		romn = "internal BASIC 1.0";
		if (b1fix) {
			ROM[0x6EF9] = 0x0A; //Fix bug in SMP test program;
		}
		break;
	case 2:
		ROM = new Uint8Array(ROM_int20); // Internal ROM 2.0 image constant
		romn = "internal BASIC 2.0";
		if (b2fix) {
			ROM[0x491F] = 0; //Change supported years range from 89-99 to 00-99;
		}
}

switch(usebast) {
	case 0:
		ROMT = new Uint8Array(base64ToArrayBuffer(window.localStorage.getItem('mk90_romt')));
		romtn = window.localStorage.getItem('mk90_romtname');
		break;
	case 2:
		ROMT = new Uint8Array(ROMT_int); // Internal ROMT 2.0 image constant
		romtn = "internal B2.0 tests";
}

startEmu();

document.addEventListener("visibilitychange", () => {
	if (document.hidden) {
		if (POWER) {
			PAUSE_ON_HID = stopped;
			panelSwState(true);
		}
		// Store RTC RAM in local storage
		window.localStorage.setItem('mk90_rtram', btoa(String.fromCharCode.apply(null, RTC_RAM)));
		// Store SMP* in local storage
		SmpSave();
	}
	else{
		if (POWER && !PAUSE_ON_HID) {
			panelSwState(false);
		}
	}
});