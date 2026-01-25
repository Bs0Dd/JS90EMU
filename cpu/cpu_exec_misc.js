CPU.prototype.execHALT = function(code) {
	//HALT vector stores the PSW and the PC registers on the
	//system stack instead of special registers, unlike in the 1801VM1 or 1801VM2 processors.

	console.log("HALT op, PC =", this.reg_u16[7].toString(16), ", PSW =",this.psw.toString(16));

	/* saving values to stack */
	var PSW = this.psw;
	var PC = this.reg_u16[7];
	this.reg_u16[6] -= 2;
	this.access(this.reg_u16[6], PSW, false);
	this.reg_u16[6] -= 2;
	this.access(this.reg_u16[6], PC, false);
	
	//var loc = 0x0078|((this.psw&this.flags.H)?(this.sel&0xff00):0);
	var loc = 0xE002; // 160002, vector in the "System ROM" zone (used by BASIC v2.0)
	/* jumping to address */
	this.reg_u16[7] = this.access(loc, null, false);
	this.psw = this.access(loc+2, null, false); // | this.flags.H;
	return CPU.prototype.execCode;
};


CPU.prototype.execRTI = function(code) {
	var SP1 = this.addressingIP(0x16, false);
	this.reg_u16[7] = SP1.ru() & 0xFFFE;
	//this.reg_u16[6] += 2;
	var SP2 = this.addressingIP(0x16, false);
	this.psw = SP2.ru();
	//this.reg_u16[6] += 2;
	//if (this.reg_u16[7]>=0xe000) this.psw |= this.flags.H; {dubious}
	return CPU.prototype.execCode;
};


CPU.prototype.execRTS = function(code) {
	var r = code&7;
	this.reg_u16[7] = this.reg_u16[r];
	this.reg_u16[r] = this.addressingIP(0x16, false).ru();
	return CPU.prototype.execCode;
};


CPU.prototype.execRESET = function(code) {
	this.flag_reset = true;
	return CPU.prototype.execCode;
};


CPU.prototype.execRTT = function(code) {
	this.flag_rtt = true
	return this.execRTI(code);
};
