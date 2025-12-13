function CPU() {
    this.regBuffer	= new ArrayBuffer(16);
    this.regView	= new DataView(this.regBuffer, 0);
    this.reg_u16	= new Uint16Array(this.regBuffer);
    this.reg_s16	= new Int16Array(this.regBuffer);
    this.reg_u8		= new Uint8Array(this.regBuffer);
    this.reg_s8		= new Int8Array(this.regBuffer);
    
    /* since this is JavaScript and we have no simple solution for static typing and typecasting
     * our registers and variables, we're going to organize a safe static "scratchpad" area where
     * everyhing acts like we expect it to.
     * It's silly, I know :)
     */
    this.scratchpad = new ArrayBuffer(16);
    this.sp_u16		= new Uint16Array(this.scratchpad);
    this.sp_s16		= new Int16Array(this.scratchpad);
    this.sp_u8		= new Uint8Array(this.scratchpad);
    this.sp_s8		= new Int8Array(this.scratchpad);
    
    /* reset state */
    this.nextFun		= CPU.prototype.execCode;
    //this.vector			= this.vectors.RESET;
    
    this.psw            = 0x00E0;
    this.pc             = 0xF600;	// to save immediate R7 while reading multiple word instructions
    this.cpc            = 0x0000;
    this.cps            = 0x0000;
    this.opcode         = 0x0000;

	this.reg_u16[7] = this.pc;
    
    this.flag_reset		= true;
    this.flag_rtt		= false;
    this.flag_wait		= false;
    this.flag_step		= false;
    this.flag_halt		= false;
    this.flag_evnt		= false;
	this.flag_halt_i    = false;
	this.flag_virq_c0   = false;
	this.flag_virq_c4   = false;
	this.flag_virq_c8   = false;
    
    /* gotta assign those before running anything */   
	this.readCallback   = null;
    this.writeCallback  = null;
	this.steps  = null;
	this.execProc = null;
}

CPU.prototype.access = function(addr,writeVal,isByte) {
	// if(!isByte && addr&1) {
	// 	throw this.vectors.TRAP_BUS_ERROR;	// bus error: attempt to read word from odd address
	// } // TRAP 4
	// PDP-11 processor on 588 IC's allows to read word from odd address (and do addr-1)?
	if(!isByte && addr&1) {
		addr--;
	}

	if(writeVal === null) {
		if ((addr & 0xFF00) == 0xEA00) return RtcRd(addr-0xEA00);
		if ((addr & 0xFFF8) == 0xE810) return IoRd(addr-0xE810);
		switch(addr) {
			case 0xE818:
			case 0xE81E:
				return UrRd();
			case 0xE81A:
				return SYREG1 & 0xFFFF;
			case 0xE81C:
				return SYREG2 & 0xFFFF;
			case 0xE880:
				return RbRd();
			default: return this.readCallback(addr)|(isByte?0:this.readCallback(addr+1)<<8);
		}
	} else {
		if ((addr & 0xFF00) == 0xEA00) return RtcWr(addr-0xEA00, writeVal);
		if ((addr & 0xFFF8) == 0xE810) return IoWr(addr-0xE810, writeVal);
		switch(addr) {
			case 0xE818:
			case 0xE81E:
				return UrWr(writeVal);
			case 0xE81A: {
				SYREG1 = writeVal & 0xFFFF;
				return 
			}
			case 0xE81C: {
				SYREG2 = writeVal & 0xFFFF;
				return 
			}
			case 0xE800:
			case 0xE801:
			case 0xE802:
			case 0xE803: {
				return LcdWr(addr-0xE800, writeVal);
			}
			case 0xE880:
				return RbWr(writeVal);
			default: {
				this.writeCallback(addr,writeVal&0xFF);
				if(!isByte) this.writeCallback(addr+1,(writeVal>>8)&0xFF);
				return null;
			}
		}
	}
};


CPU.prototype.getOctet = function(octet, val) {return ((val>>(octet*3))&7);};

CPU.prototype.execTRAP10 = function(code) {
	throw this.vectors.TRAP_RESERVED_OPCODE;
};

CPU.prototype.execTRAP = function(code) {
	throw this.vectors.TRAP_TRAP;
};

CPU.prototype.execIOT = function(code) {
	throw this.vectors.TRAP_IO;
};

CPU.prototype.execBPT = function(code) {
	throw this.vectors.TRAP_T_BIT
};

CPU.prototype.execWAIT = function(code) {
	this.flag_wait = true;
	return CPU.prototype.execCode;
};

CPU.prototype.execEMT = function(code) {
	throw this.vectors.TRAP_EMT;
};

CPU.prototype.execCode = function() {
	this.vector = null;

	if ((typeof BREAKPOINT == "number") && BREAKPOINT==this.reg_u16[7] && !SKIPBSTEP) {
		console.log("STOPE ", BREAKPOINT.toString(16), this.reg_u16[7].toString(16))
		BREAKPOINT = -1;
		return CPU.prototype.execCode;
	}

	var shadowBuffer = this.regBuffer.slice();
	var shadowPSW = this.psw;

	try {
		
		var code=this.access(this.reg_u16[7], null, false);
		//console.log("code", code.toString(8), "(oct) at IP ", this.reg_u16[7].toString(16), "(hex)");
		if(this.flag_halt||this.flag_evnt||this.flag_virq_c0||this.flag_virq_c4||this.flag_virq_c8||this.flag_halt_i) this.flag_wait = false;
		if(this.flag_step||((this.psw&this.flags.H)!=0)) this.flag_halt =false;
		this.step_flag = false;
		if (this.flag_wait) {
			if ((IO_MUT > 0) || (IO_STP > 0)) {
				if (useSound) IO_OSC.disconnect(IO_GNO);
				IO_MUT = 0;
				IO_STP = 0;
			}
			return CPU.prototype.execCode
		};

		if (this.flag_evnt && ((this.psw&this.flags.I)==0)) {this.flag_evnt = false; throw this.vectors.TRAP_EVNT;}
		else if (this.flag_virq_c0 && ((this.psw&this.flags.I)==0)) {this.flag_virq_c0 = false; throw this.vectors.VIRQ_C0;}
		else if (this.flag_virq_c4 && ((this.psw&this.flags.I)==0)) {this.flag_virq_c4 = false; throw this.vectors.VIRQ_C4;}
		else if (this.flag_virq_c8 && ((this.psw&this.flags.I)==0)) {this.flag_virq_c8 = false; throw this.vectors.VIRQ_C8;}
		else if (this.flag_halt_i) {this.flag_halt_i = false; throw this.vectors.HALT_I;}
		else if (this.flag_halt) {
			this.flag_halt = false;
			return this.makeDC0(0x0000);
		}

		if ((BUFKEY != null) && ((IO_DAT[2] & 0x10) == 0)){
			keyPressed = BUFKEY;
			KeyIrq()
			BUFKEY = null;
		}

		if (IO_STP > 1) {IO_STP--; return CPU.prototype.execCode;}
		else if (IO_STP == 1) {
			IO_STP = 0;
			IO_MUT = 500;
		}
				
		if (IO_MUT > 1) {IO_MUT--;}
		else if (IO_MUT == 1) {
			IO_MUT = 0;
			//IO_OSC.frequency.value = 0;
			if (useSound) IO_OSC.disconnect(IO_GNO);
		}
		
		this.reg_u16[7] += 2;

		// //{ complete an optional I/O device write }
		// if (this.execProc != null) {
		// 	this.execProc();
		// 	this.execProc = null;
		// }
		return this.makeDC0(code);
		
	} catch(e) {
		if (typeof e == 'number') {

			/* restore things clean before TRAP */
			this.regBuffer = shadowBuffer;
			this.psw = shadowPSW;

			this.vector = e;
			return CPU.prototype.execVector;
		} else {
			for (let key in e) console.log("ERROR ",key,e[key]);
			throw e;
		}
	}


	/* if we reached down here, then opcode was not understood, therefore reserved code trap */
	this.vector = this.vectors.TRAP_RESERVED_OPCODE;
	return CPU.prototype.execVector;
};

CPU.prototype.halt = function() {
	/* this is what we'll get if we get 2 Bus Errors in a row*/
	return CPU.prototype.halt;
};

CPU.prototype.step = function() {
//	console.log("STEP");
	this.nextFun = this.nextFun();
};
