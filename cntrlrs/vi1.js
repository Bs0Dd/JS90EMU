// KA512VI1 (RTC controller) module
// module ported from Pascal (Piotr Piątek) to JS (Bs0Dd)

// 2024 (c) Bs0Dd  

RTC_RAM = null;
RTC_SHD = null;
RTC_SRQ = null;

function RtcInit(){
    if (RTC_SHD != null) {
        clearInterval(RTC_SHD)
        RTC_SHD = null;
    }
    if (RTC_SRQ != null) {
        clearInterval(RTC_SRQ)
        RTC_SRQ = null;
    }

    if (RTC_RAM == null) {
        var rtram = window.localStorage.getItem('mk90_rtram');

        if(rtram == null) {
            RtcFormat(true);
        }
        else {
            RTC_RAM = new Uint8Array(base64ToArrayBuffer(rtram));
            RtcRealt();
        }

        window.localStorage.setItem('mk90_rtram', btoa(String.fromCharCode.apply(null, RTC_RAM)));
    }

    RTC_SHD = setInterval(RtcCount, 1000);
    RTC_SRQ = setInterval(RtcIrq, PeIRQr()/1000);
}

function RtcRealt() {
  RTC_RAM[0x0B] = 0x07;

  var cdate = new Date();
  RTC_RAM[9] = cdate.getFullYear() % 100;
  RTC_RAM[8] = cdate.getMonth()+1;
  RTC_RAM[7] = cdate.getDate();
  var dw = cdate.getDay();
  RTC_RAM[6] = (dw == 0) ? 7 : dw;
  RTC_RAM[4] = cdate.getHours();
  RTC_RAM[2] = cdate.getMinutes();
  RTC_RAM[0] = cdate.getSeconds();
}

function RtcFormat(settime) {
    RTC_RAM = new Uint8Array(64);

    RTC_RAM[0x0D] = 0x00;	//{clear the VRT bit}
    RTC_RAM[0x0C] = 0x00;
    RTC_RAM[0x0B] = 0x87;	//{ 0x87 in the real machine, but then the emulated one
                            //expects the time and date to be set, instead of showing the current values
                            //copied by the code below }
    RTC_RAM[0x0A] = 0x7F;
    RTC_RAM[5] = 0x00;
    RTC_RAM[3] = 0x00;
    RTC_RAM[1] = 0x00;

    if (settime) {
      RtcRealt()
    }
}

function RtcRd(index){
    var index = (index >> 1) & 0x3F;
    var rtcword = (RTC_RAM[index] << 1) & 0xFFFF;
    if (index == 0x0D) RTC_RAM[0x0D] = 0x80;	//{set the VRT bit}
    else if (index == 0x0C) RTC_RAM[0x0C] = 0;	//{clear all interrupt flags}
    return rtcword;
}

function RtcWr(index, val) {
    index = (index >> 1) & 0x3F;
    if (index > 63) {
        return;
    }
    if ((index != 0x0C) && (index != 0x0D)) {
        RTC_RAM[index] = val >> 1;
    }
    if ((index == 0x0A) && (RTC_SRQ != null)) {
        clearInterval(RTC_SRQ);
        RTC_SRQ = setInterval(RtcIrq, PeIRQr()/1000);
    }
}

function Binc(x){
    x++;
    if ((x & 0x0F) > 9) x+=6;
    return x;
}

function RtcCount(){
    const days = [31,28,31,30,31,30,31,31,30,31,30,31]

    if ((RTC_RAM[0x0B] & 0x80) != 0)	//{SET bit}
  {
    RTC_RAM[0x0C] &= ~0x10;	//{clear the update-ended interrupt flag}
    return;
  }

//{ time and date registers }
  if ((RTC_RAM[0x0B] & 0x04) == 0)
//{ BCD mode }
  {
    RTC_RAM[0] = Binc (RTC_RAM[0]);				//{seconds}
    if (RTC_RAM[0] >= 0x60)
    {
      RTC_RAM[0] = 0;
      RTC_RAM[2] = Binc (RTC_RAM[2]);			//{minutes}
      if (RTC_RAM[2] >= 0x60)
      {
        RTC_RAM[2] = 0;
        RTC_RAM[4] = Binc (RTC_RAM[4]);			//{hours}
        if (RTC_RAM[4] >= 0x24)
	{
          RTC_RAM[4] = 0;
          RTC_RAM[6] = Binc (RTC_RAM[6]);			//{day of the week};
          if (RTC_RAM[6] > 7) RTC_RAM[6] = 1;
          RTC_RAM[7] = Binc (RTC_RAM[7]);			//{day of the month};
          if (RTC_RAM[7] > days[(RTC_RAM[8] - 1) % 12])
	  {
            RTC_RAM[7] = 1;
            RTC_RAM[8] = Binc (RTC_RAM[8]);			//{month};
            if (RTC_RAM[8] > 0x12)
	    {
              RTC_RAM[8] = 1;
              RTC_RAM[9] = Binc (RTC_RAM[9]);		//{year};
              if (RTC_RAM[8] > 0x99) RTC_RAM[8] = 0;
            }
          }
        }
      }
    }
  }
  else
//{ binary mode }
  {
    RTC_RAM[0]++;				//{seconds}
    if (RTC_RAM[0] >= 60)
    {
      RTC_RAM[0] = 0;
      RTC_RAM[2]++;			//{minutes}
      if (RTC_RAM[2] >= 60)
      {
        RTC_RAM[2] = 0;
        RTC_RAM[4]++;			//{hours}
        if (RTC_RAM[4] >= 24)
	{
          RTC_RAM[4] = 0;
          RTC_RAM[6]++;			//{day of the week};
          if (RTC_RAM[6] > 7) RTC_RAM[6] = 1;
          RTC_RAM[7]++;			//{day of the month};
          if (RTC_RAM[7] > days[(RTC_RAM[8] - 1) % 12])
	  {
            RTC_RAM[7] = 1;
            RTC_RAM[8]++;			//{month};
            if (RTC_RAM[8] > 12)
            {
              RTC_RAM[8] = 1;
              RTC_RAM[9]++;			//{year};
              if (RTC_RAM[8] > 99) RTC_RAM[8] = 0;
            }
          }
        }
      }
    }
  }

//{ alarm }
  if (((RTC_RAM[1] == RTC_RAM[0]) || ((RTC_RAM[1] & 0xC0) != 0)) &&
	((RTC_RAM[3] == RTC_RAM[2]) || ((RTC_RAM[3] & 0xC0) != 0)) &&
	((RTC_RAM[5] == RTC_RAM[4]) || ((RTC_RAM[5] & 0xC0) != 0)))
    RTC_RAM[0x0C] |= 0x20;	//{set the alarm interrupt flag AF}
  else
    RTC_RAM[0x0C] &= ~0x20;	//{clear the flag AF}

//{ update ended }
  RTC_RAM[0x0C] |= 0x10;	//{set the update-ended interrupt flag UF}

//{ IRQF interrupt flag and IRQ pin = (PF and PIE) or (AF and AIE) or (UF and UIE) }
  if ((RTC_RAM[0x0B] & RTC_RAM[0x0C] & 0x70) != 0)
  {
    RTC_RAM[0x0C] |= 0x80;	//{set IRQF}
    TimerIrq();					//{drive the IRQ pin low}
  }
  else
  {
    RTC_RAM[0x0C] &= ~0x80;	//{clear IRQF}
    //{perhaps here some code to drive the IRQ pin high}
  }
}

function PeIRQr(){ //microseconds
    const tb = [0, 3906, 7812, 122, 244, 488, 977, 1953, 3906, 7812, 15625, 31250,
        62500, 125000, 250000, 500000];
    return tb[RTC_RAM[0x0A] & 0x0F];
}

function RtcIrq(){ //default = 31.25ms
    //console.log("irg", PeIRQr()/1000, "ms")
    if ((!stopped) && ((RTC_RAM[0x0B] & 0x08) != 0)) MK85CPU.flag_evnt = true;	//{the system isn't in the debug mode and bit SQWE in the register B is set}
    RTC_RAM[0x0C] |= 0x40;	//{periodic interrupt flag}
                //{ set the IRQF interrupt flag and drive the IRQ pin low, if the periodic
                //interrupt is enabled }
    if ((RTC_RAM[0x0B] & 0x40) != 0) {
        RTC_RAM[0x0C] |=  0x80;
        TimerIrq();				//{drive the IRQ pin low}
    }
}