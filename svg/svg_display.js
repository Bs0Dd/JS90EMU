function MK85_SVG_LCD() {
	this.svgNS = "http://www.w3.org/2000/svg";
	var svg = document.createElementNS(this.svgNS, "svg");
	svg.setAttributeNS(null,"width",  364);
	svg.setAttributeNS(null,"height", 196);
	svg.setAttributeNS(null,"x",      60);
	svg.setAttributeNS(null,"y",      53);
//	svg.setAttributeNS(null,"style", "background-color:gainsboro");
	this.svg = svg;

	var r = document.createElementNS(this.svgNS, "rect");
	r.setAttributeNS(null,"x",      0);
	r.setAttributeNS(null,"y",      0);	
	r.setAttributeNS(null,"width",  364);
	r.setAttributeNS(null,"height", 196);
	r.setAttributeNS(null,"fill",   "white");
	svg.appendChild(r);

	var segmentOn  = "black";	
	var segmentOff = "#e9e9e9";

	// make 2 pages of video memory
	var videoMemorySize = 960;
	this.videoPages = [new Uint8Array(videoMemorySize), new Uint8Array(videoMemorySize)];
	this.videoPage = [0,1];

	/* create 120x64 dot matrix */
	this.characters = createDotMatrix(this.svg,64,120,3,3,2,2,1,1,segmentOn,segmentOff);

	this.mappings = [];
	for (var i = 0; i < 480; i++) {
		this.mappings.push(this.characters[i]);
		this.mappings.push(this.characters[i+480]);
	}

	this.timerHandle = null;
	this.timerCallback = null;
	
	this.animate = function(delay_ms) {
		this.timerHandle = setInterval(this.doFrame.bind(this), delay_ms);
	};
	this.stopAnimating = function() {
		clearInterval(this.timerHandle);
		this.timerHandle = null;
	};

}

MK85_SVG_LCD.prototype.clearScreen = function() {
	for(var x = 0; x < 960; x++) {
			this.characters[x](0);
	}

	var videoMemorySize = 960;
	this.videoPages = [new Uint8Array(videoMemorySize), new Uint8Array(videoMemorySize)];
}

//	this.doFrame = function() {
MK85_SVG_LCD.prototype.doFrame = function() {
		if(typeof this.timerCallback == "function") this.timerCallback();

		var vmemadr = LcdMemAddr();

//		console.log(this.videoPage);
		var newPage = (this.videoPage[1]+1)%2;	
		var oldPage = (this.videoPage[0]+1)%2;
		// copy videomemory into a buffer
		for(var x = 0; x < this.videoPages[newPage].length; x++) {	
			
			this.videoPages[newPage][x] = (vmemadr > RAM.length) ? 0xFF : RAM[vmemadr+x];
										 
			if(this.videoPages[newPage][x]!=this.videoPages[oldPage][x])
				this.mappings[x](this.videoPages[newPage][x]);
		}
		this.videoPage[1]=(this.videoPage[1]+1)%2;
		this.videoPage[0]=(this.videoPage[0]+1)%2;
	};


function arbitraryWriter(mapping) {
	var arr = Array.apply(null, Array(8));
	for(var b in mapping) arr[b] = mapping[b];
	return function(state) {
		var bits = state;
		var bitStates = arr;
		for(var k = 0; k < bitStates.length; k++)
		{
			if(bitStates[k]!=null) bitStates[k](bits&1);
			bits >>= 1;
		}
	};
}

function createDotMatrix(root, rows, cols, x, y, dotWidth, dotHeight, dotHGap, dotVGap, dotColorOn, dotColorOff) {
	var writers = [];
	for(var i = 0; i < rows; i++) {
		for(var j = 0; j < cols; j+=8) {
			var byte = [];
			for (var c = 0; c < 8; c++) {
				// create dot
				var dot = document.createElementNS(svgNS, "rect");
				dot.setAttributeNS(null,"x", x+(j+c)*(dotWidth+dotHGap));
				dot.setAttributeNS(null,"y", y+i*(dotHeight+dotVGap));
				dot.setAttributeNS(null,"width",  dotWidth);
				dot.setAttributeNS(null,"height", dotHeight);
				dot.setAttributeNS(null,"fill", dotColorOff);
				dot.setAttributeNS(null,"stroke", "none");
				root.appendChild(dot);
				byte.unshift(dot);
			}
			writers.push(dotMatrixByteWriter(byte.slice(), dotColorOn, dotColorOff));
		}
		
	}
	return writers;
}

function dotMatrixByteWriter(byte, dotColorOn, dotColorOff) {
	return function(data) {
		var dots = byte;
		var bits = data;
		for(var k = 0; k < 8; k++) {
			dots[k].setAttributeNS(null,"fill", (bits&1)?dotColorOn:dotColorOff);
			bits >>= 1;
		}
	};
}
