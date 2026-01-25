svgNS = "http://www.w3.org/2000/svg";

function composeGUI() {
	var root = createSVG(790,312,"background-color:gainsboro");
	
	createImageOn(root);
	createOverlayOn(root);
	createButtonsOn(root);
	
	return root;
}

function createOverlayOn(svg){
	var svgimg = document.createElementNS(svgNS,'image');
	svgimg.setAttributeNS(null,"id",`ovl`);
	svgimg.setAttributeNS(null,'height','234');
	svgimg.setAttributeNS(null,'width','281');
	svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', `${BASEPATH}/bitmaps/ovl.png`);
	svgimg.setAttributeNS(null,'x','486');
	svgimg.setAttributeNS(null,'y','24');
	svgimg.setAttributeNS(null, "opacity", 0);
	svgimg.setAttributeNS(null, 'visibility', 'visible');
	svg.append(svgimg);
}

function createSVG(w,h,style) {
	var svg = document.createElementNS(svgNS, "svg");
	svg.setAttributeNS(null,"width",  w);
	svg.setAttributeNS(null,"height", h);
	//svg.setAttributeNS(null,"style", style); // "background-color:gainsboro"
	
	return svg;
}

function createImageOn(svg){
	var svgimg = document.createElementNS(svgNS,'image');
	svgimg.setAttributeNS(null,'height','312');
	svgimg.setAttributeNS(null,'width','790');
	svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', `${BASEPATH}/bitmaps/face.png`);
	svgimg.setAttributeNS(null,'x','0');
	svgimg.setAttributeNS(null,'y','0');
	svgimg.setAttributeNS(null, 'visibility', 'visible');
	svg.append(svgimg);
}

function createButtonsOn(svg) {

	for(var keyKey in faceKeys) {
		var key = faceKeys[keyKey];	// no pun intended =)

		var g = document.createElementNS(svgNS, "g");
		g.setAttributeNS(null,"cursor","pointer");
		g.setAttributeNS(null,"id", keyKey);
		g.setAttributeNS(null,"class", "mk90btn");

		switch(key.type) {
			case 0: // numeric buttons
			{
				var rect = document.createElementNS(svgNS, "image");
				var blockType = blockTypes[key.type];
				
				var x = blockType.off_x+blockType.mul_x*(key.posCode&0xf);
				var y = blockType.off_y+blockType.mul_y*((key.posCode>>4)&0xf);
				
				rect.setAttributeNS(null,"x",x);
				rect.setAttributeNS(null,"y",y);
				rect.setAttributeNS(null,"width",  27);
				rect.setAttributeNS(null,"height", 22);
				rect.setAttributeNS(null, "opacity", 0);
				rect.setAttributeNS('http://www.w3.org/1999/xlink','href', `${BASEPATH}/bitmaps/t0but.png`);
				rect.setAttributeNS(null, 'visibility', 'visible');

				svg.appendChild(rect);
				g.appendChild(rect);
				
				break;
			}
			case 1:	// alphabetic buttons / space
			case 2: // power / reset
			{
				var rect = document.createElementNS(svgNS, "image");
				var blockType = blockTypes[key.type];
				
				var x = blockType.off_x+blockType.mul_x*(key.posCode&0xf);
				var y = blockType.off_y+blockType.mul_y*((key.posCode>>4)&0xf);

				var width = 27;
				if(typeof key.doubleWidth != 'undefined') {
					width += blockType.mul_x;
					rect.setAttributeNS('http://www.w3.org/1999/xlink','href', `${BASEPATH}/bitmaps/t1butw.png`);
				}
				else
					rect.setAttributeNS('http://www.w3.org/1999/xlink','href', `${BASEPATH}/bitmaps/t1but.png`);
				
				rect.setAttributeNS(null,"x",x);
				rect.setAttributeNS(null,"y",y);
				rect.setAttributeNS(null,"width",  width);
				rect.setAttributeNS(null,"height", 18);
				rect.setAttributeNS(null, "opacity", 0);
				rect.setAttributeNS(null, 'visibility', 'visible');
				svg.appendChild(rect);
				g.appendChild(rect);
				
				break;
			}
			default:
			{
				console.log("Unsupported button type");
				break;
			}
		}
		// bind functions
		g.addEventListener("touchstart", GUIKeyPress, false);
		g.addEventListener("touchend", GUIKeyRelease, false);

		g.addEventListener("mousedown",GUIKeyPress, false);
		g.addEventListener("mouseup",GUIKeyRelease, false);
		g.addEventListener("mouseout",GUIKeyRelease, false);

		svg.appendChild(g);
	}
}
