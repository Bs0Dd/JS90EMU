// KA1835VG6 (MK92 docking station controller) module
// only embedded ROM switching implemented

// 2024 (c) Bs0Dd

var M92_STAT;
var M92_CMD;

function DockInit() {
    M92_STAT = 0;
    M92_CMD = 0;
}

function DockStatWr(val) {
    M92_STAT = val & 0xFFFF;
    //console.log("M92STAT W:", val.toString(2))
}

function DockCmdWr(val) {
    M92_CMD = val & 0xFFFF;
    //console.log("M92CMD W:", val.toString(2))
}

function DockStatRd() {
    return M92_STAT;
}

function DockCmdRd() {
    return M92_CMD;
}