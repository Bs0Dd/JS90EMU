// KA1835VG5 (System controller) module
// module ported from Pascal (Piotr Piątek) to JS (Bs0Dd)

// 2024 (c) Bs0Dd 

var SYREG1 = 0;
var SYREG2 = 0;

var SPLIT = [0xE000, 0x4000, 0x8000, 0x2000, 0, 0, 0, 0]

function WrRam(addr) {
    return ((addr < SPLIT[(SYREG1 >> 9) & 3]) || ( (addr >= 0xE800) && (addr < 0xEC00) ));
}

function RdRam(addr) {
    var i = (SYREG1 >> 11) & 7;

	return (addr < SPLIT[i & 3]) || ( (addr >= 0xE800) && (addr < 0xEC00) );
}

function RdRom(addr) {
    return ((SYREG2 & 0x2000) == 0) &&
    (
      ( (addr >= SPLIT[(SYREG1 >>> 11) & 7]) && (addr < 0xE000) )
      ||
      ( ((SYREG2 & 0x0200) != 0) &&
          (addr >= 0xE000) && (addr < 0xE800) )
      ||
      ( (addr >= 0xEC00) && (addr < 0xFE00) )
    );
}