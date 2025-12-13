// KA1835VG3 (LCD controller) module
// only display address register implemented
// module ported from Pascal (Piotr Piątek) to JS (Bs0Dd)

// 2024 (c) Bs0Dd 

var LCD_DAT;

function LcdInit() {
    LCD_DAT = new Uint16Array(2)
}

function LcdMemAddr() {
    return LCD_DAT[0];
}

function LcdWr(index, val) {
    idx = (index >> 1) && 0x01;
    if (idx > 1) return;
    LCD_DAT[idx] = val;
}