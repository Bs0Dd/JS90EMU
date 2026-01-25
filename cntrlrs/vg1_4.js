// KA1835VG4 (Serial bus interface) and KA1835VG1 (keyboard interface) module
// module ported from Pascal (Piotr Piątek) to JS (Bs0Dd)

// 2024 (c) Bs0Dd  

var IO_DAT;
var IO_SRG;
var IO_RGQ;
var IO_SES;
var IO_STP;
var IO_SND;
var IO_OSC;
var IO_MUT;
var IO_GNO;

var BUFKEY = null;

function IoInit() {
    IO_DAT = new Uint16Array(4);
    IO_SRG = 0xFFFF;
    IO_RGQ = 0xFFFF;
    IO_SES = false;
    IO_STP = 0;
    IO_MUT = 0;
}

function IoWr(index, val) {
    index = (index >> 1) & 0x03;
    IO_DAT[index] = val;
    switch(index) {
        case 0: // {data register}
            IO_SRG = val & 0xFFFF;
            IO_RGQ |= 1 << (IO_DAT[2] & 7);
            if (IO_SES) {
                if ((!stopped) && ((IO_DAT[2] & 0x20) == 0)) { // {if the system isn't stopped and data register interrupts are enabled}
                    MK85CPU.flag_virq_c4 = true;
                }
                var typ = IO_DAT[2] & 0x0F;
                if (typ == 0){ // SMP0DR
                    IO_SRG = SmpData(0, 0);
                }
                else if (typ == 1) { // SMP1DR
                    IO_SRG = SmpData(1, 0);
                }
                else if (typ == 2) { // KEYB
                    IO_SRG = keyCode();
                }
                else if (typ == 3) { // SPEAKER
                    IoSpeaker();
                }
                else if (typ == 8) { // SMP0DW
                    SmpData(0, IO_SRG);
                }
                else if (typ == 9) { // SMP1DW
                    SmpData(1, IO_SRG);
                }
                else if (typ == 11) { // SPEAKER
                    IoSpeaker();
                }
                else {
                    console.log("VG4 rg0 write - invalid op type:", typ);
                }
            }
            break;
        case 1: // {transfer rate}
            break
        case 2:
            if (IO_SES) {
                if ((!stopped) && ((IO_DAT[2] & 0x20) == 0)) { // {if the system isn't stopped and data register interrupts are enabled}
                    MK85CPU.flag_virq_c4 = true;
                }
                var typ = IO_DAT[2] & 0x0F;
                if (typ == 0){ // SMP0DR
                    IO_SRG = SmpData(0, 0);
                }
                else if (typ == 1) { // SMP1DR
                    IO_SRG = SmpData(1, 0);
                }
                else if (typ == 2) { // KEYB
                    IO_SRG = keyCode();
                }
                else if (typ == 3) { // SPEAKER
                    IoSpeaker();
                }
                else {
                    console.log("VG4 rg2 write - invalid op type:", typ);
                }
            }
            break;
        case 3: // {command register}
            IO_SES = true;
            IO_SRG = val & 0xFFFF;
            IO_RGQ |= 1 << (IO_DAT[2] & 7);
            if ((!stopped) && ((IO_DAT[2] & 0x20) == 0)) { // {if the system isn't stopped and data register interrupts are enabled}
                MK85CPU.flag_virq_c4 = true;
            }
            var typ = IO_DAT[2] & 0x0F;
            if (typ == 0){ // SMP0CR
                IO_SRG = SmpCmd(0, 0);
            }
            else if (typ == 1) { // SMP1CR
                IO_SRG = SmpCmd(1, 0);
            }
            else if (typ == 2) { // KEYB
                IO_SRG = keyCode();
            }
            else if (typ == 3) { // SPEAKER
                IoSpeaker();
            }
            else if (typ == 8) { // SMP0CW
                SmpCmd(0, IO_SRG);
            }
            else if (typ == 9) { // SMP1CW
                SmpCmd(1, IO_SRG);
            }
            else if (typ == 11) { // SPEAKER
                IoSpeaker();
            }
            else {
                console.log("VG4 rg3 write - invalid op type:", typ);
            }
    }
}

function IoRd(index) {
    var index = (index >> 1) & 0x03;
    var wrd;
    switch(index) {
        case 0: // {data register}
            wrd = IO_SRG;
            IO_SRG = 0xFFFF; // {default value}
            IO_RGQ |= (1 << (IO_DAT[2] & 7));
            if (IO_SES) {
                if ((!stopped) && ((IO_DAT[2] & 0x20) == 0)) { // {if the system isn't stopped and data register interrupts are enabled}
                    MK85CPU.flag_virq_c4 = true;
                }
                var typ = IO_DAT[2] & 0x0F;
                if (typ == 0){ // SMP0DR
                    IO_SRG = SmpData(0, 0);
                }
                else if (typ == 1) { // SMP1DR
                    IO_SRG = SmpData(1, 0);
                }
                else if (typ == 2) { // KEYB
                    IO_SRG = keyCode();
                }
                else if (typ == 3) { // SPEAKER
                    IoSpeaker();
                }
                else {
                    console.log("VG4 rg0 read - invalid op type:", typ);
                }
            }
            break;
        case 1: // {interrupt request latches}
            wrd = IO_RGQ;
            break;
        case 2: // {status register}
            wrd = (IO_DAT[2] & 0x70) | 0xFF84;
            if (!IO_SES) wrd |= 0x08;
            break;
        case 3: // {command register}
            if (IO_SES && (!stopped) && ((IO_DAT[2] & 0x20) == 0)) { // {if the system isn't stopped and data register interrupts are enabled}
                MK85CPU.flag_virq_c4 = true;
            }
            wrd = IO_SRG;
            IO_SES = false;
    }
    return wrd & 0xFF; // Looks like VG4 returns only byte, since AD8-15 lines marked as input only
}

function TimerIrq() {
    if ((!stopped) && ((IO_DAT[2] & 0x40) == 0)) MK85CPU.flag_virq_c0 = true;
}

function KeyIrq() {
    if (!stopped) {
        IO_RGQ &= ~4;
        //console.log((IO_DAT[2] & 0x10) == 0)
        if ((IO_DAT[2] & 0x10) == 0) MK85CPU.flag_virq_c8 = true;
        else BUFKEY = keyPressed;
    }
}

function IoSpeaker() {
    if (IO_SND == null) {
        IO_SND = new AudioContext();
        IO_OSC = IO_SND.createOscillator()
        IO_OSC.volume = 0.2;
        IO_OSC.type = "square";
        IO_GNO = IO_SND.createGain();
        IO_GNO.connect(IO_SND.destination);
        IO_GNO.gain.value = 0.1;
        IO_OSC.start();
    }

    if (IO_MUT == 0 && useSound) {
        IO_OSC.connect(IO_GNO);
    }

    IO_OSC.frequency.value = 800000/IO_DAT[1];

    IO_STP = Math.floor(IO_DAT[1]);
    //console.log(IO_DAT[1]);
}
