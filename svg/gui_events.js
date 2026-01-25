var keyPressed = null; // as I know only one key can be pressed there

var trkey = false;

var fkflag = false;

window.addEventListener('keydown', KBKeyPress, true);
window.addEventListener('keyup', KBKeyRelease, true);

function keyByCode(keyCode) {
	if (gameArrows) {
		for (let key in gamesMapping)
			if(gamesMapping[key] === keyCode) return key
	}
	for (let key in keyboardMapping)
		if(keyboardMapping[key] === keyCode) return key
	for (let key in numpadKeyboardMapping)
		if(numpadKeyboardMapping[key] === keyCode) return key
	return undefined;
}

function KBKeyPress(evt) {
	console.log("Real keyboard key code:", evt.keyCode.toString(16));

	var key = keyByCode(evt.keyCode);
	if(typeof key == 'undefined') return;

	if (evt.cancelable) evt.preventDefault();

	document.getElementById(key).children[0].setAttributeNS(null, "opacity", 1);

	if (fkflag) {
		fkflag = false;
		document.getElementById("ovl").setAttributeNS(null, "opacity", 0);
	}
	else if (key == "fk") {
		fkflag = true;
		document.getElementById("ovl").setAttributeNS(null, "opacity", 1);
	}

	if (key=="off") {
		devicePower(false);
		return;
	}
	else if (key=="on") {
		if (!POWER) {
			devicePower(true);
		}
		else {
			panelDevRestart();
		}
		return;
	}

	// find the key in mapping
	if(keyPressed != key) {
		keyPressed = key;
		KeyIrq();
		console.log("Pressed key:", key);
	}
}

function KBKeyRelease(evt) {

	var key = keyByCode(evt.keyCode);
	if(typeof key == 'undefined') return;

	if (evt.cancelable) evt.preventDefault();

	document.getElementById(key).children[0].setAttributeNS(null, "opacity", 0);

	keyPressed = null;
}

function GUIKeyPress(evt) {
	var key = evt.currentTarget.id;
	console.log("Virtual keyboard key code:", key);
	if (evt.cancelable) evt.preventDefault();
	if(supportsVibrate && useVibrate) window.navigator.vibrate(100);

	evt.currentTarget.children[0].setAttributeNS(null, "opacity", 1);

	if (fkflag) {
		fkflag = false;
		document.getElementById("ovl").setAttributeNS(null, "opacity", 0);
	}
	else if (key == "fk") {
		fkflag = true;
		document.getElementById("ovl").setAttributeNS(null, "opacity", 1);
	}

	if (key=="off") {
		devicePower(false);
		return;
	}
	else if (key=="on") {
		if (!POWER) {
			devicePower(true);
		}
		else {
			panelDevRestart();
		}
		return;
	}
	
	// find the key in mapping
	if(keyPressed != key) {
		keyPressed = key;
		KeyIrq();
		console.log("Pressed key:", key);
	}
}

function GUIKeyRelease(evt) {
	if (evt.cancelable) evt.preventDefault();

	evt.currentTarget.children[0].setAttributeNS(null, "opacity", 0);

	keyPressed = null;
}
