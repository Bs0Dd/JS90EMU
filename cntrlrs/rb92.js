// MK-92 ROM banks support module

// 2024 (c) Bs0Dd

var RB_CFG;
var UNKREG;

function RbInit() {
    RB_CFG = 0;
    UNKREG = 0; //0xE81E on real MK with BASIC 1.0, without dock
}

function RbWr(val) {
    RB_CFG = val & 0xFFFF;
    //console.log("ROMBANK W:", val.toString(2))
}

function UrWr(val) {
    UNKREG = val & 0xFFFF;
    //console.log("UNKKWR W:", val.toString(2))
}

function RbRd() {
    return RB_CFG;
}

function UrRd() {
    return UNKREG;
}