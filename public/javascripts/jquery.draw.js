/**
 * jQuery Plugin Draw v1.3.0
 * Requires jQuery 1.2.1+ (Not tested with earlier versions).
 * Based off of the work of Walter Zorn. In fact I've included his copyright as well.
 * I removed the draw string functionality, becuase really if you don't know how to create text in html you really shouldn't be doing this.. 
 * In fact, pack up your computer and take up knitting.
 *
 * Copyright (c) 2008 Aaron E. [jquery at happinessinmycheeks dot com] 
 * 
 *	All functions return jQuery.
 *	All functions share common options which are placed at the end of the arguments listed below.
 *		* Color
 *		* Stroke
 *		* Alpha
 *
 *	Functions include:
 *	drawRect - x location, y location, width, height 
 *	drawPolyLine - Array of x locations, Array of y locations
 *	drawPolygon - Array of x locations, Array of y locations
 *	drawEllipse - x location, y location, width, height 
 *	drawBezier - x[4] locations, y[4] locations, autoClose (close the bezier)
 *	drawArrow - x location, y location, length of arrow
 *	fillRect - x location, y location, width, height 
 *	fillPolygon - Array of x locations, Array of y locations
 *	fillEllipse - x location, y location, width, height 
 *	fillArc - x location, y location, width, height, float angle A, float angle Z
 *	fillBezier - x[4] locations, y[4] locations
 *
 *	Examples:
 *		$(document).ready(function(){
 *			$("#myCanvas").drawRect(10, 10, 20, 20, {color:'blue', alpha: .5});
 *			$("#myCanvas").drawPolygon([100, 100, 90, 30], [20, 30, 40, 60], {color:'#00FF00', alpha: .9});
 *			$("#myCanvas").drawEllipse(100, 200, 40, 40, {color:'orange', stroke: 10});
 *			$("#myCanvas").fillArc(50, 200, 40, 40, 90.0, 180.0, {color:'#336699', alpha: .2});
 *			$("#myCanvas").fillPolygon([150, 300, 90, 30], [20, 30, 40, 60], {color:'yellow', alpha: 1});
 *		});
 *		My canvas would be a div in which you want to draw in. 
 *		<div id="myCanvas"></div>
 *
 *	Additions:
 *		1.1.0
 *			* Added drawBezier and fillBezier
 *		1.2.0
 *			* Added ability to optionally close the bezier.
 *		1.3.0
 *			* Added drawArrow. Thanks to samiraek for the code.
 */

/* This notice must be untouched at all times.

wz_jsgraphics.js    v. 3.03
The latest version is available at
http://www.walterzorn.com
or http://www.devira.com
or http://www.walterzorn.de

Copyright (c) 2002-2004 Walter Zorn. All rights reserved.
Created 3. 11. 2002 by Walter Zorn (Web: http://www.walterzorn.com )
Last modified: 28. 1. 2008

Performance optimizations for Internet Explorer
by Thomas Frank and John Holdsworth.
fillPolygon method implemented by Matthieu Haller.

High Performance JavaScript Graphics Library.
Provides methods
- to draw lines, rectangles, ellipses, polygons
	with specifiable line thickness,
- to fill rectangles, polygons, ellipses and arcs
- to draw text.
NOTE: Operations, functions and branching have rather been optimized
to efficiency and speed than to shortness of source code.

LICENSE: LGPL

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License (LGPL) as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA,
or see http://www.gnu.org/copyleft/lesser.html
*/

(function($) {
	var version = '1.2.0';
	
	$.fn.settings = {
		color: "#000000"
		,stroke: 1
		,alpha: 1
	};

	$.fn.fillRect = function(x, y, w, h, opts)
	{
		var elm = AssignOpts($(this), opts);
		_mkDiv(elm, x, y, w, h);
		return $(this);
	};

	$.fn.drawRect = function(x, y, w, h, opts)
	{
		var elm = AssignOpts($(this), opts);
		elm.drawRect(elm, x, y, w, h);
		return $(this);
	};
	
	$.fn.drawBezier = function(x, y, autoClose, opts)
	{
		var elm = $(this);
		var xr = [], yr = [];
		for(var i = 1;i <= 100;i++) {
			var p = getBezier(i*.01, x, y);
			xr[xr.length] = Math.round(p.x);
			yr[yr.length] = Math.round(p.y);
		}
		if(autoClose) {
			elm.drawPolygon(xr, yr, opts);
		} else {
			elm.drawPolyline(xr, yr, opts);
		}
		return $(this);
	};

	$.fn.fillBezier = function(x, y, opts)
	{
		var elm = $(this);
		var xr = [], yr = [];
		for(var i = 1;i <= 100;i++) {
			var p = getBezier(i*.01, x, y);
			xr[xr.length] = Math.round(p.x);
			yr[yr.length] = Math.round(p.y);
		}
		elm.fillPolygon(xr, yr, opts);
		return $(this);
	};

	$.fn.drawPolyline = function(x, y, opts)
	{
		var elm = AssignOpts($(this), opts);
		for (var i=x.length - 1; i;)
		{
			--i;
			elm.drawLine(elm, x[i], y[i], x[i+1], y[i+1]);
		}
		return $(this);
	};

	$.fn.drawPolygon = function(x, y, opts)
	{
		var elm = AssignOpts($(this), opts);
		elm.drawPolyline(x, y, opts);
		elm.drawLine(elm, x[x.length-1], y[x.length-1], x[0], y[0]);
		return $(this);
	};

	$.fn.drawEllipse = function(x, y, w, h, opts)
	{
		var elm = AssignOpts($(this), opts);
		elm._mkOv(elm, x, y, w, h);
		return $(this);
	};

	$.fn.fillEllipse = function(left, top, w, h, opts)
	{
		var elm = AssignOpts($(this), opts);
		var a = w>>1, b = h>>1,
		wod = w&1, hod = h&1,
		cx = left+a, cy = top+b,
		x = 0, y = b, oy = b,
		aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
		st = (aa2>>1)*(1-(b<<1)) + bb2,
		tt = (bb2>>1) - aa2*((b<<1)-1),
		xl, dw, dh;
		if(w) while(y > 0)
		{
			if(st < 0)
			{
				st += bb2*((x<<1)+3);
				tt += bb4*(++x);
			}
			else if(tt < 0)
			{
				st += bb2*((x<<1)+3) - aa4*(y-1);
				xl = cx-x;
				dw = (x<<1)+wod;
				tt += bb4*(++x) - aa2*(((y--)<<1)-3);
				dh = oy-y;
				_mkDiv(elm, xl, cy-oy, dw, dh);
				_mkDiv(elm, xl, cy+y+hod, dw, dh);
				oy = y;
			}
			else
			{
				tt -= aa2*((y<<1)-3);
				st -= aa4*(--y);
			}
		}
		_mkDiv(elm, cx-a, cy-oy, w, (oy<<1)+hod);
		return $(this);
	};

	$.fn.fillArc = function(iL, iT, iW, iH, fAngA, fAngZ, opts)
	{
		var elm = AssignOpts($(this), opts);
		var a = iW>>1, b = iH>>1,
		iOdds = (iW&1) | ((iH&1) << 16),
		cx = iL+a, cy = iT+b,
		x = 0, y = b, ox = x, oy = y,
		aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
		st = (aa2>>1)*(1-(b<<1)) + bb2,
		tt = (bb2>>1) - aa2*((b<<1)-1),
		// Vars for radial boundary lines
		xEndA, yEndA, xEndZ, yEndZ,
		iSects = (1 << (Math.floor((fAngA %= 360.0)/180.0) << 3))
				| (2 << (Math.floor((fAngZ %= 360.0)/180.0) << 3))
				| ((fAngA >= fAngZ) << 16),
		aBndA = new Array(b+1), aBndZ = new Array(b+1);
		
		// Set up radial boundary lines
		fAngA *= Math.PI/180.0;
		fAngZ *= Math.PI/180.0;
		xEndA = cx+Math.round(a*Math.cos(fAngA));
		yEndA = cy+Math.round(-b*Math.sin(fAngA));
		_mkLinVirt(aBndA, cx, cy, xEndA, yEndA);
		xEndZ = cx+Math.round(a*Math.cos(fAngZ));
		yEndZ = cy+Math.round(-b*Math.sin(fAngZ));
		_mkLinVirt(aBndZ, cx, cy, xEndZ, yEndZ);

		while(y > 0)
		{
			if(st < 0) // Advance x
			{
				st += bb2*((x<<1)+3);
				tt += bb4*(++x);
			}
			else if(tt < 0) // Advance x and y
			{
				st += bb2*((x<<1)+3) - aa4*(y-1);
				ox = x;
				tt += bb4*(++x) - aa2*(((y--)<<1)-3);
				_mkArcDiv(elm, ox, y, oy, cx, cy, iOdds, aBndA, aBndZ, iSects);
				oy = y;
			}
			else // Advance y
			{
				tt -= aa2*((y<<1)-3);
				st -= aa4*(--y);
				if(y && (aBndA[y] != aBndA[y-1] || aBndZ[y] != aBndZ[y-1]))
				{
					_mkArcDiv(elm, x, y, oy, cx, cy, iOdds, aBndA, aBndZ, iSects);
					ox = x;
					oy = y;
				}
			}
		}
		_mkArcDiv(elm, x, 0, oy, cx, cy, iOdds, aBndA, aBndZ, iSects);
		if(iOdds >> 16) // Odd height
		{
			if(iSects >> 16) // Start-angle > end-angle
			{
				var xl = (yEndA <= cy || yEndZ > cy)? (cx - x) : cx;
				_mkDiv(elm, xl, cy, x + cx - xl + (iOdds & 0xffff), 1);
			}
			else if((iSects & 0x01) && yEndZ > cy)
				_mkDiv(elm, cx - x, cy, x, 1);
		}
		return $(this);
	};

	/* fillPolygon method, implemented by Matthieu Haller.
	This javascript function is an adaptation of the gdImageFilledPolygon for Walter Zorn lib.
	C source of GD 1.8.4 found at http://www.boutell.com/gd/

	THANKS to Kirsten Schulz for the polygon fixes!

	The intersection finding technique of this code could be improved
	by remembering the previous intertersection, and by using the slope.
	That could help to adjust intersections to produce a nice
	interior_extrema. */
	$.fn.fillPolygon = function(array_x, array_y, opts)
	{
		var elm = AssignOpts($(this), opts);
		var i;
		var y;
		var miny, maxy;
		var x1, y1;
		var x2, y2;
		var ind1, ind2;
		var ints;

		var n = array_x.length;
		if(!n) return;

		miny = array_y[0];
		maxy = array_y[0];
		for(i = 1; i < n; i++)
		{
			if(array_y[i] < miny) {
				miny = array_y[i];
			}
			if(array_y[i] > maxy) {
				maxy = array_y[i];
			}
		}
		for(y = miny; y <= maxy; y++)
		{
			var polyInts = new Array();
			ints = 0;
			for(i = 0; i < n; i++)
			{
				if(!i)
				{
					ind1 = n-1;
					ind2 = 0;
				}
				else
				{
					ind1 = i-1;
					ind2 = i;
				}
				y1 = array_y[ind1];
				y2 = array_y[ind2];
				if(y1 < y2)
				{
					x1 = array_x[ind1];
					x2 = array_x[ind2];
				}
				else if(y1 > y2)
				{
					y2 = array_y[ind1];
					y1 = array_y[ind2];
					x2 = array_x[ind1];
					x1 = array_x[ind2];
				}
				else {
					continue;
				}

				 //  Modified 11. 2. 2004 Walter Zorn
				if((y >= y1) && (y < y2)) {
					polyInts[ints++] = Math.round((y-y1) * (x2-x1) / (y2-y1) + x1);
				}
				else if((y == maxy) && (y > y1) && (y <= y2)) {
					polyInts[ints++] = Math.round((y-y1) * (x2-x1) / (y2-y1) + x1);
				}
			}
			polyInts.sort(function CompInt(x, y){
				return (x-y);
			});
			
			for(i = 0; i < ints; i+=2) {
				_mkDiv(elm, polyInts[i], y, polyInts[i+1]-polyInts[i]+1, 1);
			}
		}
		return $(this);
	};

	$.fn.drawArrow = function(x, y, l, angle, opts) {
		var elm = AssignOpts($(this), opts);
		var x1 = x+Math.floor(l*Math.cos(angle));
		var y1 = y-Math.floor(l*Math.sin(angle));
		elm.drawLine(elm, x, y, x1, y1);

		var x2 = x1+Math.floor(l/2*Math.cos(angle-5*Math.PI/6));
		var y2 = y1-Math.floor(l/2*Math.sin(angle-5*Math.PI/6));
		elm.drawLine(elm, x2, y2, x1, y1);

		var x3 = x1+Math.floor(l/2*Math.cos(angle+5*Math.PI/6));
		var y3 = y1-Math.floor(l/2*Math.sin(angle+5*Math.PI/6));
		elm.drawLine(elm, x3, y3, x1, y1);

		return $(this);
	}


	function AssignOpts($cont, opts) 
	{
		$cont.opts = $.extend({}, $.fn.settings, opts);
		return SetStroke($cont);
	}
	
	function SetStroke(elm) 
	{
		var x = elm.opts.stroke;
		if(!(x+1))
		{
			elm.drawLine = _mkLinDott;
			elm._mkOv = _mkOvDott;
			elm.drawRect = _mkRectDott;
		}
		else if(x-1 > 0)
		{
			elm.drawLine = _mkLin2D;
			elm._mkOv = _mkOv2D;
			elm.drawRect = _mkRect;
		}
		else
		{
			elm.drawLine = _mkLin;
			elm._mkOv = _mkOv;
			elm.drawRect = _mkRect;
		}
		return elm;
	}
	
	function _mkLin(elm, x1, y1, x2, y2)
	{
		if(x1 > x2)
		{
			var _x2 = x2;
			var _y2 = y2;
			x2 = x1;
			y2 = y1;
			x1 = _x2;
			y1 = _y2;
		}
		var dx = x2-x1, dy = Math.abs(y2-y1),
		x = x1, y = y1,
		yIncr = (y1 > y2)? -1 : 1;

		if(dx >= dy)
		{
			var pr = dy<<1,
			pru = pr - (dx<<1),
			p = pr-dx,
			ox = x;
			while(dx > 0)
			{--dx;
				++x;
				if(p > 0)
				{
					_mkDiv(elm, ox, y, x-ox, 1);
					y += yIncr;
					p += pru;
					ox = x;
				}
				else {
					p += pr;
				}
			}
			_mkDiv(elm, ox, y, x2-ox+1, 1);
		}
		else
		{
			var pr = dx<<1,
			pru = pr - (dy<<1),
			p = pr-dy,
			oy = y;
			if(y2 <= y1)
			{
				while(dy > 0)
				{--dy;
					if(p > 0)
					{
						_mkDiv(elm, x++, y, 1, oy-y+1);
						y += yIncr;
						p += pru;
						oy = y;
					}
					else
					{
						y += yIncr;
						p += pr;
					}
				}
				_mkDiv(elm, x2, y2, 1, oy-y2+1);
			}
			else
			{
				while(dy > 0)
				{--dy;
					y += yIncr;
					if(p > 0)
					{
						_mkDiv(elm, x++, oy, 1, y-oy);
						p += pru;
						oy = y;
					}
					else {
						p += pr;
					}
				}
				_mkDiv(elm, x2, oy, 1, y2-oy+1);
			}
		}
	}

	function _mkLin2D(elm, x1, y1, x2, y2)
	{
		if(x1 > x2)
		{
			var _x2 = x2;
			var _y2 = y2;
			x2 = x1;
			y2 = y1;
			x1 = _x2;
			y1 = _y2;
		}
		var dx = x2-x1, dy = Math.abs(y2-y1),
		x = x1, y = y1,
		yIncr = (y1 > y2)? -1 : 1;

		var s = elm.opts.stroke;
		if(dx >= dy)
		{
			var _s;
			if(dx > 0 && s-3 > 0)
			{
				_s = (s*dx*Math.sqrt(1+dy*dy/(dx*dx))-dx-(s>>1)*dy) / dx;
				_s = (!(s-4)? Math.ceil(_s) : Math.round(_s)) + 1;
			}
			else {
				_s = s;
			}

			var ad = Math.ceil(s/2);

			var pr = dy<<1,
			pru = pr - (dx<<1),
			p = pr-dx,
			ox = x;
			while(dx > 0)
			{--dx;
				++x;
				if(p > 0)
				{
					_mkDiv(elm, ox, y, x-ox+ad, _s);
					y += yIncr;
					p += pru;
					ox = x;
				}
				else {
					p += pr;
				}
			}
			_mkDiv(elm, ox, y, x2-ox+ad+1, _s);
		}
		else
		{
			var _s;
			if(s-3 > 0)
			{
				_s = (s*dy*Math.sqrt(1+dx*dx/(dy*dy))-(s>>1)*dx-dy) / dy;
				_s = (!(s-4)? Math.ceil(_s) : Math.round(_s)) + 1;
			}
			else {
				_s = s;
			}
			var ad = Math.round(s/2);

			var pr = dx<<1,
			pru = pr - (dy<<1),
			p = pr-dy,
			oy = y;
			if(y2 <= y1)
			{
				++ad;
				while(dy > 0)
				{--dy;
					if(p > 0)
					{
						_mkDiv(elm, x++, y, _s, oy-y+ad);
						y += yIncr;
						p += pru;
						oy = y;
					}
					else
					{
						y += yIncr;
						p += pr;
					}
				}
				_mkDiv(elm, x2, y2, _s, oy-y2+ad);
			}
			else
			{
				while(dy > 0)
				{--dy;
					y += yIncr;
					if(p > 0)
					{
						_mkDiv(elm, x++, oy, _s, y-oy+ad);
						p += pru;
						oy = y;
					}
					else p += pr;
				}
				_mkDiv(elm, x2, oy, _s, y2-oy+ad+1);
			}
		}
	}

	function _mkLinDott(elm, x1, y1, x2, y2)
	{
		if(x1 > x2)
		{
			var _x2 = x2;
			var _y2 = y2;
			x2 = x1;
			y2 = y1;
			x1 = _x2;
			y1 = _y2;
		}
		var dx = x2-x1, dy = Math.abs(y2-y1),
		x = x1, y = y1,
		yIncr = (y1 > y2)? -1 : 1,
		drw = true;
		if(dx >= dy)
		{
			var pr = dy<<1,
			pru = pr - (dx<<1),
			p = pr-dx;
			while(dx > 0)
			{--dx;
				if(drw) {_mkDiv(elm, x, y, 1, 1);}
				drw = !drw;
				if(p > 0)
				{
					y += yIncr;
					p += pru;
				}
				else p += pr;
				++x;
			}
		}
		else
		{
			var pr = dx<<1,
			pru = pr - (dy<<1),
			p = pr-dy;
			while(dy > 0)
			{--dy;
				if(drw) { _mkDiv(elm, x, y, 1, 1); }
				drw = !drw;
				y += yIncr;
				if(p > 0)
				{
					++x;
					p += pru;
				}
				else p += pr;
			}
		}
		if(drw){ _mkDiv(elm, x, y, 1, 1); }
	}

	function _mkLinVirt(aLin, x1, y1, x2, y2)
	{
		var dx = Math.abs(x2-x1), dy = Math.abs(y2-y1),
		x = x1, y = y1,
		xIncr = (x1 > x2)? -1 : 1,
		yIncr = (y1 > y2)? -1 : 1,
		p,
		i = 0;
		if(dx >= dy)
		{
			var pr = dy<<1,
			pru = pr - (dx<<1);
			p = pr-dx;
			while(dx > 0)
			{--dx;
				if(p > 0)    //  Increment y
				{
					aLin[i++] = x;
					y += yIncr;
					p += pru;
				}
				else {
					p += pr;
				}
				x += xIncr;
			}
		}
		else
		{
			var pr = dx<<1,
			pru = pr - (dy<<1);
			p = pr-dy;
			while(dy > 0)
			{--dy;
				y += yIncr;
				aLin[i++] = x;
				if(p > 0)    //  Increment x
				{
					x += xIncr;
					p += pru;
				}
				else {
					p += pr;
				}
			}
		}
		for(var len = aLin.length, i = len-i; i;) {
			aLin[len-(i--)] = x;
		}
	};


	function _mkOv(elm, left, top, width, height)
	{
		var a = (++width)>>1, b = (++height)>>1,
		wod = width&1, hod = height&1,
		cx = left+a, cy = top+b,
		x = 0, y = b,
		ox = 0, oy = b,
		aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
		st = (aa2>>1)*(1-(b<<1)) + bb2,
		tt = (bb2>>1) - aa2*((b<<1)-1),
		w, h;
		while(y > 0)
		{
			if(st < 0)
			{
				st += bb2*((x<<1)+3);
				tt += bb4*(++x);
			}
			else if(tt < 0)
			{
				st += bb2*((x<<1)+3) - aa4*(y-1);
				tt += bb4*(++x) - aa2*(((y--)<<1)-3);
				w = x-ox;
				h = oy-y;
				if((w&2) && (h&2))
				{
					_mkOvQds(elm, cx, cy, x-2, y+2, 1, 1, wod, hod);
					_mkOvQds(elm, cx, cy, x-1, y+1, 1, 1, wod, hod);
				}
				else {_mkOvQds(elm, cx, cy, x-1, oy, w, h, wod, hod);}
				ox = x;
				oy = y;
			}
			else
			{
				tt -= aa2*((y<<1)-3);
				st -= aa4*(--y);
			}
		}
		w = a-ox+1;
		h = (oy<<1)+hod;
		y = cy-oy;
		_mkDiv(elm, cx-a, y, w, h);
		_mkDiv(elm, cx+ox+wod-1, y, w, h);
	}

	function _mkOv2D(elm, left, top, width, height)
	{
		var s = elm.opts.stroke;
		width += s+1;
		height += s+1;
		var a = width>>1, b = height>>1,
		wod = width&1, hod = height&1,
		cx = left+a, cy = top+b,
		x = 0, y = b,
		aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
		st = (aa2>>1)*(1-(b<<1)) + bb2,
		tt = (bb2>>1) - aa2*((b<<1)-1);

		if(s-4 < 0 && (!(s-2) || width-51 > 0 && height-51 > 0))
		{
			var ox = 0, oy = b,
			w, h,
			pxw;
			while(y > 0)
			{
				if(st < 0)
				{
					st += bb2*((x<<1)+3);
					tt += bb4*(++x);
				}
				else if(tt < 0)
				{
					st += bb2*((x<<1)+3) - aa4*(y-1);
					tt += bb4*(++x) - aa2*(((y--)<<1)-3);
					w = x-ox;
					h = oy-y;

					if(w-1)
					{
						pxw = w+1+(s&1);
						h = s;
					}
					else if(h-1)
					{
						pxw = s;
						h += 1+(s&1);
					}
					else {pxw = h = s;}
					_mkOvQds(elm, cx, cy, x-1, oy, pxw, h, wod, hod);
					ox = x;
					oy = y;
				}
				else
				{
					tt -= aa2*((y<<1)-3);
					st -= aa4*(--y);
				}
			}
			_mkDiv(elm, cx-a, cy-oy, s, (oy<<1)+hod);
			_mkDiv(elm, cx+a+wod-s, cy-oy, s, (oy<<1)+hod);
		}
		else
		{
			var _a = (width-(s<<1))>>1,
			_b = (height-(s<<1))>>1,
			_x = 0, _y = _b,
			_aa2 = (_a*_a)<<1, _aa4 = _aa2<<1, _bb2 = (_b*_b)<<1, _bb4 = _bb2<<1,
			_st = (_aa2>>1)*(1-(_b<<1)) + _bb2,
			_tt = (_bb2>>1) - _aa2*((_b<<1)-1),

			pxl = new Array(),
			pxt = new Array(),
			_pxb = new Array();
			pxl[0] = 0;
			pxt[0] = b;
			_pxb[0] = _b-1;
			while(y > 0)
			{
				if(st < 0)
				{
					pxl[pxl.length] = x;
					pxt[pxt.length] = y;
					st += bb2*((x<<1)+3);
					tt += bb4*(++x);
				}
				else if(tt < 0)
				{
					pxl[pxl.length] = x;
					st += bb2*((x<<1)+3) - aa4*(y-1);
					tt += bb4*(++x) - aa2*(((y--)<<1)-3);
					pxt[pxt.length] = y;
				}
				else
				{
					tt -= aa2*((y<<1)-3);
					st -= aa4*(--y);
				}

				if(_y > 0)
				{
					if(_st < 0)
					{
						_st += _bb2*((_x<<1)+3);
						_tt += _bb4*(++_x);
						_pxb[_pxb.length] = _y-1;
					}
					else if(_tt < 0)
					{
						_st += _bb2*((_x<<1)+3) - _aa4*(_y-1);
						_tt += _bb4*(++_x) - _aa2*(((_y--)<<1)-3);
						_pxb[_pxb.length] = _y-1;
					}
					else
					{
						_tt -= _aa2*((_y<<1)-3);
						_st -= _aa4*(--_y);
						_pxb[_pxb.length-1]--;
					}
				}
			}

			var ox = -wod, oy = b,
			_oy = _pxb[0],
			l = pxl.length,
			w, h;
			for(var i = 0; i < l; i++)
			{
				if(typeof _pxb[i] != "undefined")
				{
					if(_pxb[i] < _oy || pxt[i] < oy)
					{
						x = pxl[i];
						_mkOvQds(elm, cx, cy, x, oy, x-ox, oy-_oy, wod, hod);
						ox = x;
						oy = pxt[i];
						_oy = _pxb[i];
					}
				}
				else
				{
					x = pxl[i];
					_mkDiv(elm, cx-x, cy-oy, 1, (oy<<1)+hod);
					_mkDiv(elm, cx+ox+wod, cy-oy, 1, (oy<<1)+hod);
					ox = x;
					oy = pxt[i];
				}
			}
			_mkDiv(elm, cx-a, cy-oy, 1, (oy<<1)+hod);
			_mkDiv(elm, cx+ox+wod, cy-oy, 1, (oy<<1)+hod);
		}
	}

	function _mkOvDott(left, top, width, height)
	{
		var a = (++width)>>1, b = (++height)>>1,
		wod = width&1, hod = height&1, hodu = hod^1,
		cx = left+a, cy = top+b,
		x = 0, y = b,
		aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
		st = (aa2>>1)*(1-(b<<1)) + bb2,
		tt = (bb2>>1) - aa2*((b<<1)-1),
		drw = true;
		while(y > 0)
		{
			if(st < 0)
			{
				st += bb2*((x<<1)+3);
				tt += bb4*(++x);
			}
			else if(tt < 0)
			{
				st += bb2*((x<<1)+3) - aa4*(y-1);
				tt += bb4*(++x) - aa2*(((y--)<<1)-3);
			}
			else
			{
				tt -= aa2*((y<<1)-3);
				st -= aa4*(--y);
			}
			if(drw && y >= hodu){_mkOvQds(elm, cx, cy, x, y, 1, 1, wod, hod);}
			drw = !drw;
		}
	}

	function _mkOvQds(elm, cx, cy, x, y, w, h, wod, hod)
	{
		var xl = cx - x, xr = cx + x + wod - w, yt = cy - y, yb = cy + y + hod - h;
		if(xr > xl+w)
		{
			_mkDiv(elm, xr, yt, w, h);
			_mkDiv(elm, xr, yb, w, h);
		}
		else {
			w = xr - xl + w;
		}
		_mkDiv(elm, xl, yt, w, h);
		_mkDiv(elm, xl, yb, w, h);
	};

	function _mkArcDiv(elm, x, y, oy, cx, cy, iOdds, aBndA, aBndZ, iSects)
	{
		var xrDef = cx + x + (iOdds & 0xffff), y2, h = oy - y, xl, xr, w;

		if(!h) h = 1;
		x = cx - x;

		if(iSects & 0xff0000) // Start-angle > end-angle
		{
			y2 = cy - y - h;
			if(iSects & 0x00ff)
			{
				if(iSects & 0x02)
				{
					xl = Math.max(x, aBndZ[y]);
					w = xrDef - xl;
					if(w > 0) _mkDiv(elm, xl, y2, w, h);
				}
				if(iSects & 0x01)
				{
					xr = Math.min(xrDef, aBndA[y]);
					w = xr - x;
					if(w > 0) _mkDiv(elm, x, y2, w, h);
				}
			}
			else {
				_mkDiv(elm, x, y2, xrDef - x, h);
			}
			y2 = cy + y + (iOdds >> 16);
			if(iSects & 0xff00)
			{
				if(iSects & 0x0100)
				{
					xl = Math.max(x, aBndA[y]);
					w = xrDef - xl;
					if(w > 0) _mkDiv(elm, xl, y2, w, h);
				}
				if(iSects & 0x0200)
				{
					xr = Math.min(xrDef, aBndZ[y]);
					w = xr - x;
					if(w > 0) _mkDiv(elm, x, y2, w, h);
				}
			}
			else {
				_mkDiv(elm, x, y2, xrDef - x, h);
			}
		}
		else
		{
			if(iSects & 0x00ff)
			{
				if(iSects & 0x02) {
					xl = Math.max(x, aBndZ[y]);
				}
				else {
					xl = x;
				}
				if(iSects & 0x01) {
					xr = Math.min(xrDef, aBndA[y]);
				}
				else {
					xr = xrDef;
				}
				y2 = cy - y - h;
				w = xr - xl;
				if(w > 0) {_mkDiv(elm, xl, y2, w, h);}
			}
			if(iSects & 0xff00)
			{
				if(iSects & 0x0100) {
					xl = Math.max(x, aBndA[y]);
				}
				else {
					xl = x;
				}
				if(iSects & 0x0200) {
					xr = Math.min(xrDef, aBndZ[y]);
				}
				else {
					xr = xrDef;
				}
				y2 = cy + y + (iOdds >> 16);
				w = xr - xl;
				if(w > 0){_mkDiv(elm, xl, y2, w, h);}
			}
		}
	};

	function _mkRect(elm, x, y, w, h)
	{
		var s = elm.opts.stroke;
		_mkDiv(elm, x, y, w, s);
		_mkDiv(elm, x+w, y, s, h);
		_mkDiv(elm, x, y+h, w+s, s);
		_mkDiv(elm, x, y+s, s, h-s);
	}

	function _mkRectDott(elm, x, y, w, h)
	{
		elm.drawLine(elm, x, y, x+w, y);
		elm.drawLine(elm, x+w, y, x+w, y+h);
		elm.drawLine(elm, x, y+h, x+w, y+h);
		elm.drawLine(elm, x, y, x, y+h);
	}

	function coord(x,y) {
		if(!x) var x=0;
		if(!y) var y=0;
		return {x: x, y: y};
	}

	function B1(t) { return t*t*t }
	function B2(t) { return 3*t*t*(1-t) }
	function B3(t) { return 3*t*(1-t)*(1-t) }
	function B4(t) { return (1-t)*(1-t)*(1-t) }
		
	function getBezier(percent, x, y) {
	  var pos = new coord();
	  pos.x = x[0]*B1(percent) + x[1]*B2(percent) + x[2]*B3(percent) + x[3]*B4(percent);
	  pos.y = y[0]*B1(percent) + y[1]*B2(percent) + y[2]*B3(percent) + y[3]*B4(percent);
	  return pos;
	}

	function _mkDiv(elm, x, y, w, h)
	{
		var res = [];
		res[res.length] = '<div style="position:absolute;';
		res[res.length] = 'left:' + x + 'px;';
		res[res.length] = 'top:' + y + 'px;';
		res[res.length] = 'width:' + w + 'px;';
		res[res.length] = 'height:' + h + 'px;';
		res[res.length] = 'clip:rect(0,'+w+'px,'+h+'px,0);';
		res[res.length] = 'padding:0px;margin:0px;';
		res[res.length] = 'background-color:' + elm.opts.color + ';';
		res[res.length] = 'overflow:hidden;'; 
		res[res.length] = '"><\/div>';
		var result = $(res.join(''));
		result.css("opacity", elm.opts.alpha);
		elm.append(result);
	}
})(jQuery);