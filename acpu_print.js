// BASIC 1.0 ACPU simulator
// Simulates unreleased character printer for BASIC 1.0

// 2026 (c) Bs0Dd

function ACPUPRINT() {
    const xp = document.createElement("div");
    xp.id = "mk90_acpu_int";
    xp.style.marginLeft = "auto";
    xp.style.marginRight = "auto";
    xp.style.textAlign = "center";
    xp.style.display = "none";

    const clab = document.createElement("label");
    clab.htmlFor = "acpup";
    clab.innerHTML = "BASIC 1.0 unreleased printer simulation:"
    xp.appendChild(clab);

    const cbox = document.createElement("input");
    cbox.id = "acpup";
    cbox.type = "checkbox";
    cbox.onchange = function() {
        koiprint = document.getElementById("acpup").checked;
        window.localStorage.setItem('mk90_koiprinter', koiprint);
    }
    cbox.checked = koiprint;
    xp.appendChild(cbox);

    xp.appendChild(document.createElement("br"));
    xp.appendChild(document.createElement("br"));

    const code = document.createElement("textarea");
    code.onfocus = function() {
        panelEditFocus();
    }
    code.onblur = function() {
        panelEditNoFocus();
    }
    code.id = "acpu_out";
    code.readOnly = true;
    code.style.width = "160px";
    code.style.height = "200px";
    code.style.resize = "none";
    xp.appendChild(code);

    xp.appendChild(document.createElement("br"));
    xp.appendChild(document.createElement("br"));

    const ext = document.createElement("button");
    ext.onclick = function() {
        xp.style.display = "none";
        document.getElementById("mk90_acpu_br").style.display = "none";
    }
    ext.innerText = "Close";

    xp.appendChild(ext);

    const td2d = document.createElement("span");
    td2d.innerHTML = "&nbsp;||&nbsp;"
    xp.appendChild(td2d);

    const feed = document.createElement("button");
    feed.onclick = function() {
        xp.CODESTR.value += "\n";
        xp.headpos = 0;
        xp.CODESTR.setSelectionRange(xp.CODESTR.value.length, xp.CODESTR.value.length);
    }
    feed.innerText = "Feed";
    xp.appendChild(feed);

    const td7d = document.createElement("span");
    td7d.innerHTML = "&nbsp;"
    xp.appendChild(td7d);

    const rst = document.createElement("button");
    rst.onclick = function() {
        xp.CODESTR.value += "\n";
        xp.headpos = 0;
        xp.koiset1 = false;
        xp.CODESTR.setSelectionRange(xp.CODESTR.value.length, xp.CODESTR.value.length);
    }
    rst.innerText = "Reset";
    xp.appendChild(rst);

    const td19d = document.createElement("span");
    td19d.innerHTML = "&nbsp;||&nbsp;"
    xp.appendChild(td19d);

    const cpbtn = document.createElement("button");
    cpbtn.onclick = function() {
        navigator.clipboard.writeText(xp.CODESTR.value);
    }
    cpbtn.innerText = "Copy";
    xp.appendChild(cpbtn);

    const td8d = document.createElement("span");
    td8d.innerHTML = "&nbsp;"
    xp.appendChild(td8d);

    const clbtn = document.createElement("button");
    clbtn.onclick = function() {
        xp.CODESTR.value = "";
        xp.headpos = 0;
    }
    clbtn.innerText = "Clear";
    xp.appendChild(clbtn);

    xp.CODESTR = code;
    xp.koiset1 = false;
    xp.headpos = 0;

    xp.ready = function() {
        return 0b10000000; // always ready!
    }

    xp.print = function(char) {
        if ((xp.headpos == 20) && (char >= 0x20) && (char <= 0x7F)) {
            xp.CODESTR.value += "\n";
            xp.headpos = 0;
        }

        if ((char >= 0x20) && (char <= 0x3F)) {
            xp.CODESTR.value += KOI7TABG[char-0x20];
            xp.headpos++;
            xp.CODESTR.setSelectionRange(xp.CODESTR.value.length, xp.CODESTR.value.length);
        }
        else if ((char >= 0x40) && (char <= 0x7F)) {
            xp.CODESTR.value += xp.koiset1 ? KOI7TAB1[char-0x40] : KOI7TAB0[char-0x40];
            xp.headpos++;
            xp.CODESTR.setSelectionRange(xp.CODESTR.value.length, xp.CODESTR.value.length);
        }
        else {
            switch (char) {
                case 0xD:
                    xp.CODESTR.value += "\n";
                    xp.headpos = 0;
                    xp.CODESTR.setSelectionRange(xp.CODESTR.value.length, xp.CODESTR.value.length);
                    break;
                case 0xE:
                    xp.koiset1 = true;
                    break;
                case 0xF:
                    xp.koiset1 = false;
                    break;
            }
        }
        return;
    }

    return xp;
}

const KOI7TABG = ` !"#$%&’()*+,-./0123456789:;<=>?`;

const KOI7TAB0 = `@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]¬_‘abcdefghijklmnopqrstuvwxyz{|} ̅█`;

const KOI7TAB1 = `юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧ█`;