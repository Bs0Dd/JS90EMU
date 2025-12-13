// KA1835VG2 (SMP embedded controller) module
// module ported from Pascal (Piotr Piątek) to JS (Bs0Dd)

// 2024 (c) Bs0Dd   

var SMP_CMD;
var SMP_RAM;
var SMP_POS;
var SMP_NMS;

function SmpInit() {
    SMP_CMD = new Uint8Array(2);
    SMP_NMS = [window.localStorage.getItem('mk90_smp0n'),
        window.localStorage.getItem('mk90_smp1n')];

    if (typeof SMP_RAM == "undefined") {
        var s0b = window.localStorage.getItem('mk90_smp0');
        if (s0b != null) {

            s0b = new Uint8Array(base64ToArrayBuffer(s0b));
        }

        var s1b = window.localStorage.getItem('mk90_smp1');
        if (s1b != null) {
            s1b = new Uint8Array(base64ToArrayBuffer(s1b));
        }

        SMP_RAM = [s0b, s1b];
    }

    SMP_POS = [0, 0];
}

function SmpCreate(num, size) {
    if (num > 1) return;
    SMP_RAM[num] = new Uint8Array(size);
    SMP_NMS[num] = null;
    window.localStorage.removeItem(`mk90_smp${num}n`);
    window.localStorage.setItem(`mk90_smp${num}`, arrayBufferToBase64(SMP_RAM[num]));
}

function SmpRemove(num) {
    if (num > 1) return;
    SMP_RAM[num] = null;
    window.localStorage.removeItem(`mk90_smp${num}`);
}

function SmpSave() {
    for (let i=0; i < 2; i++) {
        if (SMP_RAM[i] != null) {
            window.localStorage.setItem(`mk90_smp${i}`,  arrayBufferToBase64(SMP_RAM[i]));
        }
    }
}

function SmpCmd(num, code) {
    if (num > 1) return;
    SMP_CMD[num] = code;
    //console.log("SMPC", num, "SET", code.toString(16))
}

function SmpData(num, byte) {
    byte &= 0xFF;

    if ((num > 1) || (SMP_RAM[num] == null)) return 0xFF;

    var retb = 0xFF;

    //console.log("SMPD", num, "OP", SMP_CMD[num].toString(16))

    switch(SMP_CMD[num] & 0xF0) {
        case 0x00:
            retb = 0x00;
            break;
        case 0xA0:
            SMP_POS[num] = (SMP_POS[num] << 8) | byte;
            SMP_POS[num] &= (((SMP_CMD[num] & 0xF) == 8) && (SMP_RAM[num].length > 0xFFFF)) ? 0xFFFFFF : 0xFFFF;
            console.log("SMPD ASET (",SMP_CMD[num].toString(16),SMP_CMD[num] & 0xF,") BYTE", byte.toString(16), "ADDR", SMP_POS[num].toString(16));
            break;
        case 0x10:
        case 0xD0:
            if (SMP_POS[num] < SMP_RAM[num].length) {
                retb = SMP_RAM[num][SMP_POS[num]];
            }
            if ((SMP_CMD[num] & 0x80) == 0) SMP_POS[num]--;
            else SMP_POS[num]++;
            SMP_POS[num] &= (SMP_RAM[num].length > 0xFFFF) ? 0xFFFFFF : 0xFFFF;
            console.log("SMPD READ BYTE", retb.toString(16), ((SMP_CMD[num] & 0x80) == 0 ? "PDEC" : "PINC"), "ADDR", SMP_POS[num].toString(16), "PC", MK85CPU.reg_u16[7].toString(16));
            break;
        case 0x20:
        case 0xC0:
        case 0xE0:
            if (SMP_POS[num] < SMP_RAM[num].length) {
                SMP_RAM[num][SMP_POS[num]] = byte;
            }
            if ((SMP_CMD[num] & 0x20) == 0) SMP_POS[num]++;
            else SMP_POS[num]--;
            SMP_POS[num] &= (SMP_RAM[num].length > 0xFFFF) ? 0xFFFFFF : 0xFFFF;
            console.log("SMPD WRIT BYTE", byte.toString(16), ((SMP_CMD[num] & 0x20) == 0 ? "PINC" : "PDEC"), "ADDR", SMP_POS[num].toString(16));
    }

    return retb;
}