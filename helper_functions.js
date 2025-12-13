var loadCounter = 0;

function loadProperty(propname, defval, convtobool){
	var prop = window.localStorage.getItem(propname);

	if (prop == null) {
		prop = defval;
		window.localStorage.setItem(propname, prop);
		return prop;
	}

	if (convtobool){
		prop = (prop == "true");
	}

	return prop;
}

/* http://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer */

function base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (let i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
/* ---------- */

/* https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string */

function arrayBufferToBase64( buffer ) {  //Chrome shits when trying to use btoa(String.fromCharCode.apply(null, <buffer>)) if buffer is >64KB
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

/* ---------- */



function devicePower(powst) {
	if (POWER == powst) {
		return;
	}
	else if (!powst) {
		if ((IO_MUT > 0) || (IO_STP > 0)) {
            IO_OSC.disconnect(IO_GNO);
            IO_MUT = 0;
            IO_STP = 0;
        }

		LCD.stopAnimating();
		LCD.clearScreen();
		DBG.debugStop();
		document.getElementById("stst").innerText = "Pause";
		document.getElementById("dstst").innerText = "Pause";

		document.getElementById("dbst").disabled = POWER;
		document.getElementById("dbsts").disabled = POWER;
		document.getElementById("dbbr").disabled = POWER;
		document.getElementById("stps").disabled = POWER;
		document.getElementById("brkp").disabled = POWER;
		document.getElementById("regist").disabled = POWER;
        document.getElementById("reged").disabled = POWER;
        document.getElementById("edreg").disabled = POWER;
		stopped = false;
	}
	else {
		MK85CPU = new CPU();
		startEmu();
		DBG.debugStart();
	}

	document.getElementById("stst").disabled = !powst;
	document.getElementById("rst").disabled = !powst;
	document.getElementById("dstst").disabled = !powst;
	document.getElementById("drst").disabled = !powst;

	document.getElementById("disu").disabled = powst;
	document.getElementById("dispu").disabled = powst;
	document.getElementById("disgo").disabled = powst;
	document.getElementById("disgob").disabled = powst;
	document.getElementById("dispd").disabled = powst;
	document.getElementById("disd").disabled = powst;
	document.getElementById("disr").disabled = powst;
	document.getElementById("dised").disabled = powst;
	document.getElementById("diss").disabled = powst;
	
	POWER = powst;
}

function startEmu() {
	if (RAM == null) {RAM = new Uint8Array(16384)};

	glueCPU();
	LcdInit();
	RtcInit();
	IoInit();
	SmpInit();
	RbInit(); 

	LCD.timerCallback = function () {
		MK85CPU.steps = 1;
		for(var steps = 0; steps < MK85CPU.steps; steps++)
		{
			MK85CPU.step();

			if (BREAKPOINT<0) { //|| (SMP_POS[0] == 0x6a51 && BAROCAM)) {
				panelSwState();
				BREAKPOINT = false;
				return;
			}

			if (SKIPBSTEP){SKIPBSTEP=false;}

			// if (MK85CPU.psw&MK85CPU.flags.H){
			// 	console.log( "halt at ", MK85CPU.reg_u16[7].toString(16))
			// }

			MK85CPU.steps = (typeof DEBUG_STEPS == "number") ? DEBUG_STEPS : SPEED;
		}
			
	}
	LCD.animate(LCD_ANIMSPEED);
}

// Attach CPU to everything else
function glueCPU() {

	var ramLastAddr = 0x0000+RAM.length;
	var rotLastAddr = (ROMT == null) ? null : (0x4000+ROMT.length);
	var romLastAddr = 0x8000+ROM.length;
	
	MK85CPU.readCallback = function (addr) {
		if (addr >= 0xE800 && addr <= 0xEBFF) { //TRAP 4 on real MK90
			MK85CPU.flag_halt = true;
		}
		else if (((RB_CFG & (1 << 13)) != 0)&&(addr>=0x4000)&&(addr<0x8000)) { // 92 ROM access
			
			if (((RB_CFG & (1 << 12)) == 0) && ((RB_CFG & (1 << 11)) == 0)) { // Bank 1
				//console.log("ACB1");
				return ROM92_bank1[addr&0x3FFF];
			}
			else if (((RB_CFG & (1 << 12)) == 0) && ((RB_CFG & (1 << 11)) != 0)) { // Bank 2
				//console.log("ACB2")
				return ROM92_bank2[addr&0x3FFF];
			}

			//console.log("NOBANK")
			return 0xFF;
		}
		else if (RdRam(addr)) {
			if((addr>=0x0000)&&(addr<ramLastAddr)) return RAM[addr];
		}
		else if (RdRom(addr)) {
			if((rotLastAddr != null)&&(addr>=0x4000)&&(addr<rotLastAddr)) return ROMT[addr&0x3FFF];
			if((addr>=0x8000)&&(addr<romLastAddr)) return ROM[addr&0x7FFF];
		}
		else 
		return 0xFF;
	};

	MK85CPU.writeCallback = function (addr, byteVal) {
		if (addr >= 0xE800 && addr <= 0xEBFF) {
			MK85CPU.flag_halt = true;
		}
		else if (WrRam(addr)) {
			if((addr>=0x0000)&&(addr<ramLastAddr)) {
				RAM[addr] = byteVal;
				return;
			}
		}
		return;
	};
}
