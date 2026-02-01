// Options panel module
// Panel with standard functions to configure emulator
// (load from files, save to disk and etc.)

// 2024 (c) Bs0Dd

var stopped = false;

var actsmp = 0;

var realConsoleLog = console.log;

function PANEL() {

    const pnl = document.createElement("table");
    pnl.id = "mk90_panel_int";

    var dwsmp = document.createElement('a');
    dwsmp.id = "dwsmp";
    dwsmp.style.display = "none";
    pnl.appendChild(dwsmp);

    var dbgm = DEBUG ? "checked" : "";
    var b2fx = b2fix ? "checked" : "";
    var b1fx = b1fix ? "checked" : "";
    var sou = useSound ? "checked" : "";
    var gmar = gameArrows ? "checked" : "";

    var m92sn = (usem92 == 0) ? "checked" : "";
    var m92s1 = (usem92 == 1) ? "checked" : "";
    var m92s2 = (usem92 == 2) ? "checked" : "";

    if (!DEBUG) {
        console.log = function() {};
    }

    var tabcont = [[],[],[]];

    tabcont[0][0] = `<button onClick="RtcRealt()">Real t/d</button> ||
    <button onClick="panelResetRTC()">Reset RTC</button> <label for="astim">& set t/d</label>
    <input type="checkbox" id="astim" name="astim" checked> || <button onClick="panelResetRAM()">Reset RAM</button>`

    tabcont[0][1] = `<button id="stst" onClick="panelSwState()">Pause</button>
            <button id="rst" onClick="panelDevRestart()">Restart</button>
            | <label for="sou">Sound:</label> <input type="checkbox" onChange="panelSwSou()" id="sou" name="sou" ${sou}>`;

    if (supportsVibrate) {
        var vib = useVibrate ? "checked" : "";

        tabcont[0][1] += `| <label for="vib">Vibro (keys):</label> <input type="checkbox" onChange="panelSwVibro()" id="vib" name="vib" ${vib}>`;
    }

    tabcont[1][0] = `Memory cartridge:
            <input type="radio" onchange="actsmp=0;panelUpdSMP();" id="smpn0" name="smpn" value="smpn0" checked><label for="smpn0">SMP0</label>
            <input type="radio" onchange="actsmp=1;panelUpdSMP();" id="smpn1" name="smpn" value="smpn1"><label for="smpn1">SMP1</label><br>
            SMP file: <span id="rfi"></span><br><button onClick="panelSaveSMP()">Save SMP</button>
            <button onClick="SmpRemove(actsmp);panelUpdSMP();">Remove SMP</button><br>
            <button onClick="panelLoadSMP()">Load SMP from file</button>: <input type="file" id="smpf" name="smpf" accept=".bin"><br>
            SMP size: <span id="csz"></span>KB&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;New size: <span id="nsz"></span>KB<br>
            <input type="range" id="msiz" onChange="panelUpdNSz()" name="msiz" min="4" max="64" step="2"/>
            <button onClick="panelNewSMP()">New SMP</button><br>
            <i>BASIC's INIT: 1.0 - 10KB fixed, 2.0 - 63.5KB max</i><br>`;

    tabcont[1][1] = `
            <button onClick="panelLoadROM(1, 3)">Load BASIC 1.0</button> || <button onClick="panelLoadROM(2, 3)">Load BASIC 2.0</button>&nbsp;&nbsp;<br><br>
            ROM file (32KB): <span id="rofi"></span><br>
            <button onClick="panelLoadROM(0, 1)">Load ROM from file</button>: <input type="file" id="romf" name="romf" accept=".bin"><br><br>
            ROMT file (16KB): <span id="rofti"></span><br>
            <button onClick="panelLoadROM(0, 2)">Load ROMT from file</button>: <input type="file" id="romtf" name="romtf" accept=".bin">`

    tabcont[2][0] = `Speed: <input type="number" style="width:80px;" min="100" max="1000000" id="sped"
    onkeydown="panelOnEnter(this, event.keyCode, panelSetSP);" onfocus="panelEditFocus()" onblur="panelEditNoFocus()">
    <label for="sped">Op/s</label>
    <button onClick="panelSetSP()">Set</button> <button onClick="panelResetSP()">Reset</button><br><br>
    MK92 dock:
    <input type="radio" onchange="usem92=0;panelUpdM92();" id="m92sn" name="mk92" value="m92sn" ${m92sn}><label for="m92sn">None</label>
    <input type="radio" onchange="usem92=1;panelUpdM92();" id="m92s1" name="mk92" value="m92s1" ${m92s1} disabled><label for="m92s1">Rev. 1.0</label>
    <input type="radio" onchange="usem92=2;panelUpdM92();" id="m92s2" name="mk92" value="m92s2" ${m92s2}><label for="m92s2">Rev. 2.0</label><br>
    <label for="yfix">B1.0 SMP test fix:</label> <input onchange="panelEnFix1()" type="checkbox" id="yfix1" name="yfix1" ${b1fx}> |
    <label for="yfix">B2.0 year fix:</label> <input onchange="panelEnFix2()" type="checkbox" id="yfix2" name="yfix2" ${b2fx}>
    `

    tabcont[2][1] = `<button onClick="panelOpenLay()">Keyboard layout</button> <button onClick="panelOpenDbg()">Debugger</button>
    <button onClick="panelOpenHelp()">Help</button> <button onClick="panelOpenInfo()">About</button><br>
    <label for="dbgm">Show debug messages in console:</label> <input type="checkbox" onChange="panelSWDbgMsg()" id="dbgm" name="dbgm" ${dbgm}><br>
    <label for="gmar">Tsvetotron arrows layout:</label> <input type="checkbox" onChange="panelSwGmar()" id="gmar" name="gmar" ${gmar}>`;

    for (let i=0; i < 3; i++){
        const row = document.createElement("tr");
        for (let c=0; c < 2; c++) {

            const td = document.createElement("td");
            td.id = `cl${i}-${c}`;
            //td.style.lineHeight = "1.8";

            if (typeof tabcont[i][c] != "undefined") {
                td.innerHTML = tabcont[i][c];
            }

            if (c == 0 && i == 0) {
                td.style.width = "370px";
                td.style.height = "50px";
            }

            row.appendChild(td);
        }
        pnl.appendChild(row);
    }
    
    const row = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 2;
    td.innerText = `JS90EMU v${VERVAR}`;
    td.style.textAlign = "center";
    td.style.fontWeight = "bold";
    row.appendChild(td);
    pnl.appendChild(row);

    pnl.panelInit = function(){
        panelUpdSMP();
        document.getElementById("sped").value = SPEED * 100;
        document.getElementById("rofi").innerText = (romn != null) ? romn : "<no ROM>";
        document.getElementById("rofti").innerText = (romtn != null) ? romtn : "<no ROM>";
    }

    return pnl;
}

function panelUpdM92() {
    window.localStorage.setItem('mk90_mk92type', usem92);

    if (usem92 == 2) {
        alert("Warning: at the moment, only ROM banks are emulated!");
    }
}

function panelSetSP(){
    var nval = Number(document.getElementById("sped").value);

    if (nval > 1000000) {
        nval = 1000000;
        document.getElementById("sped").value = nval;
    }
    else if (nval < 100) {
        nval = 100;
        document.getElementById("sped").value = nval;
    }

    SPEED = nval / 100;
    window.localStorage.setItem('mk90_speed', SPEED);
}

function panelResetSP(){
    document.getElementById("sped").value = "120000";
    panelSetSP();
}

function panelResetRAM(){
    LCD.stopAnimating();
    LCD.clearScreen();
    RAM = new Uint8Array(16384);
    if (POWER){
        MK85CPU = new CPU();
        startEmu();
    }
}

function panelOnEnter(th, kc, fun) {
    if (kc == 13) {
        th.blur();
        fun();
    }
}

function panelRoFil(file, romt, restart) {
    const reader = new FileReader();

    reader.onload = function() {
        var RF = romt ? "ROMT" : "ROM";
        var SZ = romt ? 16384 : 32768;
        var BIN = new Uint8Array(reader.result);

        if (BIN.length > SZ) {  // 32KB for ROM, 16KB for ROMT
            BIN = BIN.subarray(0, SZ);
            console.log(`Maximum ${RF} size is ${SZ/1024}KB, memory area reduced`);
        }
        else if (BIN.length < SZ) {  // ROM must be 32/16KB min
            var nBIN = new Uint8Array(SZ);
            nBIN.set(BIN);
            BIN = nBIN;
            console.log(`Minimal ${RF} size is ${SZ/1024}KB, increasing area`);
        }

        
        if (romt) {
            ROMT = BIN;
            window.localStorage.setItem('mk90_romt', btoa(String.fromCharCode.apply(null, ROMT)));
            romtn = file.name;
            window.localStorage.setItem('mk90_romtname', romtn);
            document.getElementById("rofti").innerText = romtn;
        }
        else {
            ROM = BIN;
            window.localStorage.setItem('mk90_rom', btoa(String.fromCharCode.apply(null, ROM)));
            romn = file.name;
            window.localStorage.setItem('mk90_romname', romn);
            document.getElementById("rofi").innerText = romn;
        }

        if (POWER && restart) {
            MK85CPU = new CPU();
            RAM = new Uint8Array(16384);
            startEmu();
        }
        else {
            RAM = new Uint8Array(16384);
        }
    };

    reader.readAsArrayBuffer(file);
}

function panelLoadROM(ver, typ) {
    LCD.stopAnimating();
    LCD.clearScreen();

    if ((IO_MUT > 0) || (IO_STP > 0)) {
        if (useSound) IO_OSC.disconnect(IO_GNO);
        IO_MUT = 0;
        IO_STP = 0;
    }

    if (stopped) {
        panelUnStop();
    }

    if ((typ & 2) != 0) {
        switch(ver) {
            case 0:
                const rofi = document.getElementById("romtf").files[0];
    
                if (typeof rofi == "undefined") {
                    return;
                }

                panelRoFil(rofi, true, ((typ & 1) == 0));
                break;
            case 1:
                ROMT = null;
                romtn = null;
                break;
            case 2:
                ROMT = new Uint8Array(ROMT_int); // Internal ROMT 2.0 image constant
                romtn = "internal B2.0 tests";
        }
        usebast = ver;
        window.localStorage.setItem('mk90_bromtv', usebast);

        if (usebast > 0) {
            window.localStorage.removeItem('mk90_romt');
            window.localStorage.removeItem('mk90_romtname');
            document.getElementById("rofti").innerText = (romtn != null) ? romtn : "<no ROM>";
        }
    }

    if ((typ & 1) != 0) {
        switch(ver) {
            case 0:
                const rofi = document.getElementById("romf").files[0];
    
                if (typeof rofi == "undefined") {
                    return;
                }
                
                panelRoFil(rofi, false, true);
                break;
            case 1:
                ROM = new Uint8Array(ROM_int10); // Internal ROM 1.0 image constant
                romn = "internal BASIC 1.0";
                if (b1fix) {
                    ROM[0x6EF9] = 0x0A; //Fix bug in SMP test program;
                }
                break;
            case 2:
                ROM = new Uint8Array(ROM_int20); // Internal ROM 2.0 image constant
                romn = "internal BASIC 2.0";
                if (b2fix) {
                    ROM[0x491F] = 0; //Change supported years range from 89-99 to 00-99;
                }
        }
        usebas = ver;
        window.localStorage.setItem('mk90_bromv', usebas);

        if (usebas > 0) {
            window.localStorage.removeItem('mk90_rom');
            window.localStorage.removeItem('mk90_romname');
            document.getElementById("rofi").innerText = (romn != null) ? romn : "<no ROM>";
        }
    }

    if (POWER && ver > 0){
        MK85CPU = new CPU();
        RAM = new Uint8Array(16384);
        startEmu();
    }
    else {
        RAM = new Uint8Array(16384);
    }
}

function panelEnFix1() {
    b1fix = document.getElementById("yfix1").checked;
    window.localStorage.setItem('mk90_b1fix', b1fix);
}

function panelEnFix2() {
    b2fix = document.getElementById("yfix2").checked;
    window.localStorage.setItem('mk90_b2fix', b2fix);
}

function panelResetRTC() {
    RtcFormat(document.getElementById("astim").checked);
}

function panelLoadSMP() {
    const ramf = document.getElementById("smpf").files[0];

    if (typeof ramf == "undefined") {
        return;
    }

    const reader = new FileReader();

    reader.onload = function() {
        SMP_RAM[actsmp] = new Uint8Array(reader.result);

        if (SMP_RAM[actsmp].length > 2097152) {  // 2MB soft-limit
            SMP_RAM[actsmp] = SMP_RAM[actsmp].subarray(0, 2097152);
            console.log("Maximum SMP memory size (soft-limit) is 2MB, memory area reduced");
        }
        // else if (SMP_RAM[actsmp].length % 2048 != 0) {  // SMP must be multiple of 2KB min
        //     var nRAM = new Uint8Array((Math.floor(SMP_RAM[actsmp].length / 2048)+1)*2048);
        //     nRAM.set(SMP_RAM[actsmp]);
        //     SMP_RAM[actsmp] = nRAM;
        //     console.log(`The SMP size must be a multiple of 2KB, increasing the area to ${SMP_RAM[actsmp].length / 1024}KB.`);
        // }

        SMP_NMS[actsmp] = ramf.name;
        window.localStorage.setItem(`mk90_smp${actsmp}`, arrayBufferToBase64(SMP_RAM[actsmp]));
        window.localStorage.setItem(`mk90_smp${actsmp}n`, ramf.name);
        panelUpdSMP();
    };

    reader.readAsArrayBuffer(ramf);
}

function panelSaveSMP(){
    if (SMP_RAM[actsmp] == null) return;
    window.localStorage.setItem(`mk90_smp${actsmp}`, arrayBufferToBase64(SMP_RAM[actsmp]));
    var dwram = document.getElementById("dwsmp");
    var blob = new Blob([SMP_RAM[actsmp]], {'type':'application/octet-stream'});
    dwram.href = URL.createObjectURL(blob);
    dwram.download = `mk90_smp${actsmp}.bin`;
    dwram.click();
}

function panelNewSMP() {
    var nmemsiz = document.getElementById("msiz").value
    SmpCreate(actsmp, nmemsiz*1024);
    document.getElementById("csz").innerText = nmemsiz;
    window.localStorage.removeItem(`mk90_smp${actsmp}n`);

    panelUpdSMP();
}

function panelUpdSMP() {
    var smnam = (SMP_RAM[actsmp] == null) ? "<no SMP>" : ((SMP_NMS[actsmp] == null) ? "internal" : SMP_NMS[actsmp]);

    var ssiz = (SMP_RAM[actsmp] == null) ? 0 : ((Math.round((SMP_RAM[actsmp].length/1024) + Number.EPSILON) * 100) / 100);

    document.getElementById("csz").innerText = ssiz
    document.getElementById("rfi").innerText = smnam;

    document.getElementById("msiz").value = (ssiz < 4) ? 4 : ((ssiz > 64) ? 64 : ssiz);
    document.getElementById("nsz").innerText = (ssiz < 4) ? 4 : ((ssiz > 64) ? 64 : ssiz);
}

function panelUpdNSz() {
    document.getElementById("nsz").innerText = document.getElementById("msiz").value;
}

function panelOpenHelp() {
    window.open(`${BASEPATH}/help/help.html`,'90_helpWindow', `toolbar=no, location=no, status=no, menubar=no,
        scrollbars=no, resizable=no, width=820, height=660`)
}

function panelOpenDbg() {
    const hidp = document.getElementById("mk90_dbg_int");
    hidp.style.display = (hidp.style.display == "none") ? "" : "none";
    document.getElementById("mk90_dbg_br").style.display = hidp.style.display;
    var active = (!stopped && POWER);
    if (hidp.style.display == "" && active) {
        DBG.debugStart();
    }
    else if (hidp.style.display == "" && !active) {
        debugUpdate();
        debugUpdRegIn();
    }
    else{
        DBG.debugStop();
    }
}

function panelSWDbgMsg(){
    DEBUG = !DEBUG;
    window.localStorage.setItem('mk90_debugmsg', DEBUG);

    if (DEBUG) {
        console.log = realConsoleLog;
    }
    else {
        console.log = function() {};
    }

}

function panelOpenInfo() {
    window.open(`${BASEPATH}/about.html`,'90_aboutWindow', `toolbar=no, location=no, status=no, menubar=no,
        scrollbars=no, resizable=no, width=820, height=710`)
}

function panelOpenLay() {
    window.open(`${BASEPATH}/layout.html`,'90_layoutWindow', `toolbar=no, location=no, status=no, menubar=no,
        scrollbars=no, resizable=no, width=820, height=340`)
}

function panelSwGmar() {
    gameArrows = !gameArrows;
    window.localStorage.setItem('mk90_gamearrows', gameArrows);
}

function panelSwSou() {
    useSound = !useSound;
    window.localStorage.setItem('mk90_sound', useSound);

    if (((IO_MUT > 0) || (IO_STP > 0))) {
        if (useSound) {
            IO_OSC.connect(IO_GNO);
        }
        else {
            IO_OSC.disconnect(IO_GNO);
        }
    }
}

function panelSwVibro() {
    useVibrate = !useVibrate;
    window.localStorage.setItem('mk90_vibro', useVibrate);
}

function panelUnStop() {
    if (document.getElementById("mk90_dbg_int").style.display == "") {
        DBG.debugStart();
    }
    document.getElementById("stst").innerText="Pause";
    document.getElementById("dstst").innerText="Pause";

    document.getElementById("dbst").disabled = true;
    document.getElementById("dbsts").disabled = true;
    document.getElementById("dbbr").disabled = true;
    document.getElementById("stps").disabled = true;
    document.getElementById("brkp").disabled = true;
    document.getElementById("regist").disabled = true;
    document.getElementById("reged").disabled = true;
    document.getElementById("edreg").disabled = true;
    
    document.getElementById("disu").disabled = true;
    document.getElementById("dispu").disabled = true;
    document.getElementById("disgo").disabled = true;
    document.getElementById("disgob").disabled = true;
    document.getElementById("dispd").disabled = true;
    document.getElementById("disd").disabled = true;
    document.getElementById("disr").disabled = true;
    document.getElementById("dised").disabled = true;
    document.getElementById("diss").disabled = true;
    stopped = false;
}

function panelDevRestart() {
    LCD.stopAnimating();
    LCD.clearScreen();

    if ((IO_MUT > 0) || (IO_STP > 0)) {
        if (useSound) IO_OSC.disconnect(IO_GNO);
        IO_MUT = 0;
        IO_STP = 0;
    }

    if (stopped) {
        panelUnStop();
    }

    MK85CPU = new CPU();
    startEmu();
}

function panelSwState(stat) {
    if (stat == stopped) {
        return;
    }
    else if (typeof stat == "boolean") {
        stopped = stat
    }
    else {
        stopped = !stopped;
    }

    if (!stopped) {
        LCD.animate(LCD_ANIMSPEED);
        document.getElementById("stst").innerText="Pause";
        document.getElementById("dstst").innerText="Pause";
        if (document.getElementById("mk90_dbg_int").style.display == "") {
            DBG.debugStart();
        }
    }
    else {
        if ((IO_MUT > 0) || (IO_STP > 0)) {
            if (useSound) IO_OSC.disconnect(IO_GNO);
            IO_MUT = 0;
            IO_STP = 0;
        }
        LCD.stopAnimating();
        document.getElementById("stst").innerText="Resume";
        document.getElementById("dstst").innerText="Resume";
        if (document.getElementById("mk90_dbg_int").style.display == "") {
            DBG.debugStop();
            debugUpdRegIn();
            debugUpdate();
        }
        
    }

    document.getElementById("dbst").disabled = !stopped;
	document.getElementById("dbsts").disabled = !stopped;
	document.getElementById("dbbr").disabled = !stopped;
    document.getElementById("stps").disabled = !stopped;
    document.getElementById("brkp").disabled = !stopped;
    document.getElementById("regist").disabled = !stopped;
    document.getElementById("reged").disabled = !stopped;
    document.getElementById("edreg").disabled = !stopped;

    document.getElementById("disu").disabled = !stopped;
    document.getElementById("dispu").disabled = !stopped;
    document.getElementById("disgo").disabled = !stopped;
    document.getElementById("disgob").disabled = !stopped;
    document.getElementById("dispd").disabled = !stopped;
    document.getElementById("disd").disabled = !stopped;
    document.getElementById("disr").disabled = !stopped;
    document.getElementById("dised").disabled = !stopped;
    document.getElementById("diss").disabled = !stopped;
}

function panelEditFocus() {
    window.removeEventListener('keydown', KBKeyPress, true);
    window.removeEventListener('keyup', KBKeyRelease, true);
} 

function panelEditNoFocus() {
    window.addEventListener('keydown', KBKeyPress, true);
    window.addEventListener('keyup', KBKeyRelease, true);
}