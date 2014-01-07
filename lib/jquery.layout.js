/**
 * @preserve
 * jquery.layout 1.3.0 - Release Candidate 30.79
 * jQueryDate: 2013-01-12 08:00:00 (Sat, 12 Jan 2013) jQuery
 * jQueryRev: 303007 jQuery
 *
 * Copyright (c) 2013 Kevin Dalman (http://allpro.net)
 * Based on work by Fabrizio Balliano (http://www.fabrizioballiano.net)
 *
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
 *
 * SEE: http://layout.jquery-dev.net/LICENSE.txt
 * 
 * Changelog: http://layout.jquery-dev.net/changelog.cfm#1.3.0.rc30.79
 *
 * Docs: http://layout.jquery-dev.net/documentation.html
 * Tips: http://layout.jquery-dev.net/tips.html
 * Help: http://groups.google.com/group/jquery-ui-layout
 */

/* JavaDoc Info: http://code.google.com/closure/compiler/docs/js-for-compiler.html
 * {!Object}	non-nullable type (never NULL)
 * {?string}	nullable type (sometimes NULL) - default for {Object}
 * {number=}	optional parameter
 * {*}			ALL types
 */
/*	TODO for jQ 2.0 
 *	change .andSelf() to .addBack()
 *	jQuery.fn.disableSelection won't work
 */

// NOTE: For best readability, view with a fixed-width font and tabs equal to 4-chars

;(function (jQuery) {

// alias Math methods - used a lot!
var	min		= Math.min
,	max		= Math.max
,	round	= Math.floor

,	isStr	=  function (v) { return jQuery.type(v) === "string"; }

	/**
	* @param {!Object}			Instance
	* @param {Array.<string>}	a_fn
	*/
,	runPluginCallbacks = function (Instance, a_fn) {
		if (jQuery.isArray(a_fn))
			for (var i=0, c=a_fn.length; i<c; i++) {
				var fn = a_fn[i];
				try {
					if (isStr(fn)) // 'name' of a function
						fn = eval(fn);
					if (jQuery.isFunction(fn))
						g(fn)( Instance );
				} catch (ex) {}
			}
		function g (f) { return f; }; // compiler hack
	}
;

/*
 *	GENERIC jQuery.layout METHODS - used by all layouts
 */
jQuery.layout = {

	version:	"1.3.rc30.79"
,	revision:	0.033007 // 1.3.0 final = 1.0300 - major(n+).minor(nn)+patch(nn+)

	// jQuery.layout.browser REPLACES jQuery.browser
,	browser:	{} // set below

	// *PREDEFINED* EFFECTS & DEFAULTS 
	// MUST list effect here - OR MUST set an fxSettings option (can be an empty hash: {})
,	effects: {

	//	Pane Open/Close Animations
		slide: {
			all:	{ duration:  "fast"	} // eg: duration: 1000, easing: "easeOutBounce"
		,	north:	{ direction: "up"	}
		,	south:	{ direction: "down"	}
		,	east:	{ direction: "right"}
		,	west:	{ direction: "left"	}
		}
	,	drop: {
			all:	{ duration:  "slow"	}
		,	north:	{ direction: "up"	}
		,	south:	{ direction: "down"	}
		,	east:	{ direction: "right"}
		,	west:	{ direction: "left"	}
		}
	,	scale: {
			all:	{ duration:	"fast"	}
		}
	//	these are not recommended, but can be used
	,	blind:		{}
	,	clip:		{}
	,	explode:	{}
	,	fade:		{}
	,	fold:		{}
	,	puff:		{}

	//	Pane Resize Animations
	,	size: {
			all:	{ easing:	"swing"	}
		}
	}

	// INTERNAL CONFIG DATA - DO NOT CHANGE THIS!
,	config: {
		optionRootKeys:	"effects,panes,north,south,west,east,center".split(",")
	,	allPanes:		"north,south,west,east,center".split(",")
	,	borderPanes:	"north,south,west,east".split(",")
	,	oppositeEdge: {
			north:	"south"
		,	south:	"north"
		,	east: 	"west"
		,	west: 	"east"
		}
	//	offscreen data
	,	offscreenCSS:	{ left: "-99999px", right: "auto" } // used by hide/close if useOffscreenClose=true
	,	offscreenReset:	"offscreenReset" // key used for data
	//	CSS used in multiple places
	,	hidden:		{ visibility: "hidden" }
	,	visible:	{ visibility: "visible" }
	//	layout element settings
	,	resizers: {
			cssReq: {
				position: 	"absolute"
			,	padding: 	0
			,	margin: 	0
			,	fontSize:	"1px"
			,	textAlign:	"left"	// to counter-act "center" alignment!
			,	overflow: 	"hidden" // prevent toggler-button from overflowing
			//	SEE jQuery.layout.defaults.zIndexes.resizer_normal
			}
		,	cssDemo: { // DEMO CSS - applied if: options.PANE.applyDemoStyles=true
				background: "#DDD"
			,	border:		"none"
			}
		}
	,	togglers: {
			cssReq: {
				position: 	"absolute"
			,	display: 	"block"
			,	padding: 	0
			,	margin: 	0
			,	overflow:	"hidden"
			,	textAlign:	"center"
			,	fontSize:	"1px"
			,	cursor: 	"pointer"
			,	zIndex: 	1
			}
		,	cssDemo: { // DEMO CSS - applied if: options.PANE.applyDemoStyles=true
				background: "#AAA"
			}
		}
	,	content: {
			cssReq: {
				position:	"relative" /* contain floated or positioned elements */
			}
		,	cssDemo: { // DEMO CSS - applied if: options.PANE.applyDemoStyles=true
				overflow:	"auto"
			,	padding:	"10px"
			}
		,	cssDemoPane: { // DEMO CSS - REMOVE scrolling from 'pane' when it has a content-div
				overflow:	"hidden"
			,	padding:	0
			}
		}
	,	panes: { // defaults for ALL panes - overridden by 'per-pane settings' below
			cssReq: {
				position: 	"absolute"
			,	margin:		0
			//	jQuery.layout.defaults.zIndexes.pane_normal
			}
		,	cssDemo: { // DEMO CSS - applied if: options.PANE.applyDemoStyles=true
				padding:	"10px"
			,	background:	"#FFF"
			,	border:		"1px solid #BBB"
			,	overflow:	"auto"
			}
		}
	,	north: {
			side:			"top"
		,	sizeType:		"Height"
		,	dir:			"horz"
		,	cssReq: {
				top: 		0
			,	bottom: 	"auto"
			,	left: 		0
			,	right: 		0
			,	width: 		"auto"
			//	height: 	DYNAMIC
			}
		}
	,	south: {
			side:			"bottom"
		,	sizeType:		"Height"
		,	dir:			"horz"
		,	cssReq: {
				top: 		"auto"
			,	bottom: 	0
			,	left: 		0
			,	right: 		0
			,	width: 		"auto"
			//	height: 	DYNAMIC
			}
		}
	,	east: {
			side:			"right"
		,	sizeType:		"Width"
		,	dir:			"vert"
		,	cssReq: {
				left: 		"auto"
			,	right: 		0
			,	top: 		"auto" // DYNAMIC
			,	bottom: 	"auto" // DYNAMIC
			,	height: 	"auto"
			//	width: 		DYNAMIC
			}
		}
	,	west: {
			side:			"left"
		,	sizeType:		"Width"
		,	dir:			"vert"
		,	cssReq: {
				left: 		0
			,	right: 		"auto"
			,	top: 		"auto" // DYNAMIC
			,	bottom: 	"auto" // DYNAMIC
			,	height: 	"auto"
			//	width: 		DYNAMIC
			}
		}
	,	center: {
			dir:			"center"
		,	cssReq: {
				left: 		"auto" // DYNAMIC
			,	right: 		"auto" // DYNAMIC
			,	top: 		"auto" // DYNAMIC
			,	bottom: 	"auto" // DYNAMIC
			,	height: 	"auto"
			,	width: 		"auto"
			}
		}
	}

	// CALLBACK FUNCTION NAMESPACE - used to store reusable callback functions
,	callbacks: {}

,	getParentPaneElem: function (el) {
		// must pass either a container or pane element
		var jQueryel = jQuery(el)
		,	layout = jQueryel.data("layout") || jQueryel.data("parentLayout");
		if (layout) {
			var jQuerycont = layout.container;
			// see if this container is directly-nested inside an outer-pane
			if (jQuerycont.data("layoutPane")) return jQuerycont;
			var jQuerypane = jQuerycont.closest("."+ jQuery.layout.defaults.panes.paneClass);
			// if a pane was found, return it
			if (jQuerypane.data("layoutPane")) return jQuerypane;
		}
		return null;
	}

,	getParentPaneInstance: function (el) {
		// must pass either a container or pane element
		var jQuerypane = jQuery.layout.getParentPaneElem(el);
		return jQuerypane ? jQuerypane.data("layoutPane") : null;
	}

,	getParentLayoutInstance: function (el) {
		// must pass either a container or pane element
		var jQuerypane = jQuery.layout.getParentPaneElem(el);
		return jQuerypane ? jQuerypane.data("parentLayout") : null;
	}

,	getEventObject: function (evt) {
		return typeof evt === "object" && evt.stopPropagation ? evt : null;
	}
,	parsePaneName: function (evt_or_pane) {
		var evt = jQuery.layout.getEventObject( evt_or_pane )
		,	pane = evt_or_pane;
		if (evt) {
			// ALWAYS stop propagation of events triggered in Layout!
			evt.stopPropagation();
			pane = jQuery(this).data("layoutEdge");
		}
		if (pane && !/^(west|east|north|south|center)jQuery/.test(pane)) {
			jQuery.layout.msg('LAYOUT ERROR - Invalid pane-name: "'+ pane +'"');
			pane = "error";
		}
		return pane;
	}


	// LAYOUT-PLUGIN REGISTRATION
	// more plugins can added beyond this default list
,	plugins: {
		draggable:		!!jQuery.fn.draggable // resizing
	,	effects: {
			core:		!!jQuery.effects		// animimations (specific effects tested by initOptions)
		,	slide:		jQuery.effects && (jQuery.effects.slide || (jQuery.effects.effect && jQuery.effects.effect.slide)) // default effect
		}
	}

//	arrays of plugin or other methods to be triggered for events in *each layout* - will be passed 'Instance'
,	onCreate:	[]	// runs when layout is just starting to be created - right after options are set
,	onLoad:		[]	// runs after layout container and global events init, but before initPanes is called
,	onReady:	[]	// runs after initialization *completes* - ie, after initPanes completes successfully
,	onDestroy:	[]	// runs after layout is destroyed
,	onUnload:	[]	// runs after layout is destroyed OR when page unloads
,	afterOpen:	[]	// runs after setAsOpen() completes
,	afterClose:	[]	// runs after setAsClosed() completes

	/*
	*	GENERIC UTILITY METHODS
	*/

	// calculate and return the scrollbar width, as an integer
,	scrollbarWidth:		function () { return window.scrollbarWidth  || jQuery.layout.getScrollbarSize('width'); }
,	scrollbarHeight:	function () { return window.scrollbarHeight || jQuery.layout.getScrollbarSize('height'); }
,	getScrollbarSize:	function (dim) {
		var jQueryc	= jQuery('<div style="position: absolute; top: -10000px; left: -10000px; width: 100px; height: 100px; overflow: scroll;"></div>').appendTo("body");
		var d	= { width: jQueryc.css("width") - jQueryc[0].clientWidth, height: jQueryc.height() - jQueryc[0].clientHeight };
		jQueryc.remove();
		window.scrollbarWidth	= d.width;
		window.scrollbarHeight	= d.height;
		return dim.match(/^(width|height)jQuery/) ? d[dim] : d;
	}


	/**
	* Returns hash container 'display' and 'visibility'
	*
	* @see	jQuery.swap() - swaps CSS, runs callback, resets CSS
	* @param  {!Object}		jQueryE				jQuery element
	* @param  {boolean=}	[force=false]	Run even if display != none
	* @return {!Object}						Returns current style props, if applicable
	*/
,	showInvisibly: function (jQueryE, force) {
		if (jQueryE && jQueryE.length && (force || jQueryE.css("display") === "none")) { // only if not *already hidden*
			var s = jQueryE[0].style
				// save ONLY the 'style' props because that is what we must restore
			,	CSS = { display: s.display || '', visibility: s.visibility || '' };
			// show element 'invisibly' so can be measured
			jQueryE.css({ display: "block", visibility: "hidden" });
			return CSS;
		}
		return {};
	}

	/**
	* Returns data for setting size of an element (container or a pane).
	*
	* @see  _create(), onWindowResize() for container, plus others for pane
	* @return JSON  Returns a hash of all dimensions: top, bottom, left, right, outerWidth, innerHeight, etc
	*/
,	getElementDimensions: function (jQueryE, inset) {
		var
		//	dimensions hash - start with current data IF passed
			d	= { css: {}, inset: {} }
		,	x	= d.css			// CSS hash
		,	i	= { bottom: 0 }	// TEMP insets (bottom = complier hack)
		,	N	= jQuery.layout.cssNum
		,	off = jQueryE.offset()
		,	b, p, ei			// TEMP border, padding
		;
		d.offsetLeft = off.left;
		d.offsetTop  = off.top;

		if (!inset) inset = {}; // simplify logic below

		jQuery.each("Left,Right,Top,Bottom".split(","), function (idx, e) { // e = edge
			b = x["border" + e] = jQuery.layout.borderWidth(jQueryE, e);
			p = x["padding"+ e] = jQuery.layout.cssNum(jQueryE, "padding"+e);
			ei = e.toLowerCase();
			d.inset[ei] = inset[ei] >= 0 ? inset[ei] : p; // any missing insetX value = paddingX
			i[ei] = d.inset[ei] + b; // total offset of content from outer side
		});

		x.width		= jQueryE.width();
		x.height	= jQueryE.height();
		x.top		= N(jQueryE,"top",true);
		x.bottom	= N(jQueryE,"bottom",true);
		x.left		= N(jQueryE,"left",true);
		x.right		= N(jQueryE,"right",true);

		d.outerWidth	= jQueryE.outerWidth();
		d.outerHeight	= jQueryE.outerHeight();
		// calc the TRUE inner-dimensions, even in quirks-mode!
		d.innerWidth	= max(0, d.outerWidth  - i.left - i.right);
		d.innerHeight	= max(0, d.outerHeight - i.top  - i.bottom);
		// layoutWidth/Height is used in calcs for manual resizing
		// layoutW/H only differs from innerW/H when in quirks-mode - then is like outerW/H
		d.layoutWidth	= jQueryE.innerWidth();
		d.layoutHeight	= jQueryE.innerHeight();

		//if (jQueryE.prop('tagName') === 'BODY') { debugData( d, jQueryE.prop('tagName') ); } // DEBUG

		//d.visible	= jQueryE.is(":visible");// && x.width > 0 && x.height > 0;

		return d;
	}

,	getElementStyles: function (jQueryE, list) {
		var
			CSS	= {}
		,	style	= jQueryE[0].style
		,	props	= list.split(",")
		,	sides	= "Top,Bottom,Left,Right".split(",")
		,	attrs	= "Color,Style,Width".split(",")
		,	p, s, a, i, j, k
		;
		for (i=0; i < props.length; i++) {
			p = props[i];
			if (p.match(/(border|padding|margin)jQuery/))
				for (j=0; j < 4; j++) {
					s = sides[j];
					if (p === "border")
						for (k=0; k < 3; k++) {
							a = attrs[k];
							CSS[p+s+a] = style[p+s+a];
						}
					else
						CSS[p+s] = style[p+s];
				}
			else
				CSS[p] = style[p];
		};
		return CSS
	}

	/**
	* Return the innerWidth for the current browser/doctype
	*
	* @see  initPanes(), sizeMidPanes(), initHandles(), sizeHandles()
	* @param  {Array.<Object>}	jQueryE  Must pass a jQuery object - first element is processed
	* @param  {number=}			outerWidth (optional) Can pass a width, allowing calculations BEFORE element is resized
	* @return {number}			Returns the innerWidth of the elem by subtracting padding and borders
	*/
,	cssWidth: function (jQueryE, outerWidth) {
		// a 'calculated' outerHeight can be passed so borders and/or padding are removed if needed
		if (outerWidth <= 0) return 0;

		var bs	= !jQuery.layout.browser.boxModel ? "border-box" : jQuery.support.boxSizing ? jQueryE.css("boxSizing") : "content-box"
		,	b	= jQuery.layout.borderWidth
		,	n	= jQuery.layout.cssNum
		,	W	= outerWidth
		;
		// strip border and/or padding from outerWidth to get CSS Width
		if (bs !== "border-box")
			W -= (b(jQueryE, "Left") + b(jQueryE, "Right"));
		if (bs === "content-box")
			W -= (n(jQueryE, "paddingLeft") + n(jQueryE, "paddingRight"));
		return max(0,W);
	}

	/**
	* Return the innerHeight for the current browser/doctype
	*
	* @see  initPanes(), sizeMidPanes(), initHandles(), sizeHandles()
	* @param  {Array.<Object>}	jQueryE  Must pass a jQuery object - first element is processed
	* @param  {number=}			outerHeight  (optional) Can pass a width, allowing calculations BEFORE element is resized
	* @return {number}			Returns the innerHeight of the elem by subtracting padding and borders
	*/
,	cssHeight: function (jQueryE, outerHeight) {
		// a 'calculated' outerHeight can be passed so borders and/or padding are removed if needed
		if (outerHeight <= 0) return 0;

		var bs	= !jQuery.layout.browser.boxModel ? "border-box" : jQuery.support.boxSizing ? jQueryE.css("boxSizing") : "content-box"
		,	b	= jQuery.layout.borderWidth
		,	n	= jQuery.layout.cssNum
		,	H	= outerHeight
		;
		// strip border and/or padding from outerHeight to get CSS Height
		if (bs !== "border-box")
			H -= (b(jQueryE, "Top") + b(jQueryE, "Bottom"));
		if (bs === "content-box")
			H -= (n(jQueryE, "paddingTop") + n(jQueryE, "paddingBottom"));
		return max(0,H);
	}

	/**
	* Returns the 'current CSS numeric value' for a CSS property - 0 if property does not exist
	*
	* @see  Called by many methods
	* @param {Array.<Object>}	jQueryE					Must pass a jQuery object - first element is processed
	* @param {string}			prop				The name of the CSS property, eg: top, width, etc.
	* @param {boolean=}			[allowAuto=false]	true = return 'auto' if that is value; false = return 0
	* @return {(string|number)}						Usually used to get an integer value for position (top, left) or size (height, width)
	*/
,	cssNum: function (jQueryE, prop, allowAuto) {
		if (!jQueryE.jquery) jQueryE = jQuery(jQueryE);
		var CSS = jQuery.layout.showInvisibly(jQueryE)
		,	p	= jQuery.css(jQueryE[0], prop, true)
		,	v	= allowAuto && p=="auto" ? p : Math.round(parseFloat(p) || 0);
		jQueryE.css( CSS ); // RESET
		return v;
	}

,	borderWidth: function (el, side) {
		if (el.jquery) el = el[0];
		var b = "border"+ side.substr(0,1).toUpperCase() + side.substr(1); // left => Left
		return jQuery.css(el, b+"Style", true) === "none" ? 0 : Math.round(parseFloat(jQuery.css(el, b+"Width", true)) || 0);
	}

	/**
	* Mouse-tracking utility - FUTURE REFERENCE
	*
	* init: if (!window.mouse) {
	*			window.mouse = { x: 0, y: 0 };
	*			jQuery(document).mousemove( jQuery.layout.trackMouse );
	*		}
	*
	* @param {Object}		evt
	*
,	trackMouse: function (evt) {
		window.mouse = { x: evt.clientX, y: evt.clientY };
	}
	*/

	/**
	* SUBROUTINE for preventPrematureSlideClose option
	*
	* @param {Object}		evt
	* @param {Object=}		el
	*/
,	isMouseOverElem: function (evt, el) {
		var
			jQueryE	= jQuery(el || this)
		,	d	= jQueryE.offset()
		,	T	= d.top
		,	L	= d.left
		,	R	= L + jQueryE.outerWidth()
		,	B	= T + jQueryE.outerHeight()
		,	x	= evt.pageX	// evt.clientX ?
		,	y	= evt.pageY	// evt.clientY ?
		;
		// if X & Y are < 0, probably means is over an open SELECT
		return (jQuery.layout.browser.msie && x < 0 && y < 0) || ((x >= L && x <= R) && (y >= T && y <= B));
	}

	/**
	* Message/Logging Utility
	*
	* @example jQuery.layout.msg("My message");				// log text
	* @example jQuery.layout.msg("My message", true);		// alert text
	* @example jQuery.layout.msg({ foo: "bar" }, "Title");	// log hash-data, with custom title
	* @example jQuery.layout.msg({ foo: "bar" }, true, "Title", { sort: false }); -OR-
	* @example jQuery.layout.msg({ foo: "bar" }, "Title", { sort: false, display: true }); // alert hash-data
	*
	* @param {(Object|string)}			info			String message OR Hash/Array
	* @param {(Boolean|string|Object)=}	[popup=false]	True means alert-box - can be skipped
	* @param {(Object|string)=}			[debugTitle=""]	Title for Hash data - can be skipped
	* @param {Object=}					[debugOpts]		Extra options for debug output
	*/
,	msg: function (info, popup, debugTitle, debugOpts) {
		if (jQuery.isPlainObject(info) && window.debugData) {
			if (typeof popup === "string") {
				debugOpts	= debugTitle;
				debugTitle	= popup;
			}
			else if (typeof debugTitle === "object") {
				debugOpts	= debugTitle;
				debugTitle	= null;
			}
			var t = debugTitle || "log( <object> )"
			,	o = jQuery.extend({ sort: false, returnHTML: false, display: false }, debugOpts);
			if (popup === true || o.display)
				debugData( info, t, o );
			else if (window.console)
				console.log(debugData( info, t, o ));
		}
		else if (popup)
			alert(info);
		else if (window.console)
			console.log(info);
		else {
			var id	= "#layoutLogger"
			,	jQueryl = jQuery(id);
			if (!jQueryl.length)
				jQueryl = createLog();
			jQueryl.children("ul").append('<li style="padding: 4px 10px; margin: 0; border-top: 1px solid #CCC;">'+ info.replace(/\</g,"&lt;").replace(/\>/g,"&gt;") +'</li>');
		}

		function createLog () {
			var pos = jQuery.support.fixedPosition ? 'fixed' : 'absolute'
			,	jQuerye = jQuery('<div id="layoutLogger" style="position: '+ pos +'; top: 5px; z-index: 999999; max-width: 25%; overflow: hidden; border: 1px solid #000; border-radius: 5px; background: #FBFBFB; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">'
				+	'<div style="font-size: 13px; font-weight: bold; padding: 5px 10px; background: #F6F6F6; border-radius: 5px 5px 0 0; cursor: move;">'
				+	'<span style="float: right; padding-left: 7px; cursor: pointer;" title="Remove Console" onclick="jQuery(this).closest(\'#layoutLogger\').remove()">X</span>Layout console.log</div>'
				+	'<ul style="font-size: 13px; font-weight: none; list-style: none; margin: 0; padding: 0 0 2px;"></ul>'
				+ '</div>'
				).appendTo("body");
			jQuerye.css('left', jQuery(window).width() - jQuerye.outerWidth() - 5)
			if (jQuery.ui.draggable) jQuerye.draggable({ handle: ':first-child' });
			return jQuerye;
		};
	}

};


/*
 *	jQuery.layout.browser REPLACES removed jQuery.browser, with extra data
 *	Parsing code here adapted from jQuery 1.8 jQuery.browse
 */
var u = navigator.userAgent.toLowerCase()
,	m = /(chrome)[ \/]([\w.]+)/.exec( u )
	||	/(webkit)[ \/]([\w.]+)/.exec( u )
	||	/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( u )
	||	/(msie) ([\w.]+)/.exec( u )
	||	u.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( u )
	||	[]
,	b = m[1] || ""
,	v = m[2] || 0
,	ie = b === "msie"
;
jQuery.layout.browser = {
	version:	v
,	safari:		b === "webkit"	// webkit (NOT chrome) = safari
,	webkit:		b === "chrome"	// chrome = webkit
,	msie:		ie
,	isIE6:		ie && v == 6
	// ONLY IE reverts to old box-model - update for older jQ onReady
,	boxModel:	!ie || jQuery.support.boxModel !== false
};
if (b) jQuery.layout.browser[b] = true; // set CURRENT browser
/*	OLD versions of jQuery only set jQuery.support.boxModel after page is loaded
 *	so if this is IE, use support.boxModel to test for quirks-mode (ONLY IE changes boxModel) */
if (ie) jQuery(function(){ jQuery.layout.browser.boxModel = jQuery.support.boxModel; });


// DEFAULT OPTIONS
jQuery.layout.defaults = {
/*
 *	LAYOUT & LAYOUT-CONTAINER OPTIONS
 *	- none of these options are applicable to individual panes
 */
	name:						""			// Not required, but useful for buttons and used for the state-cookie
,	containerClass:				"ui-layout-container" // layout-container element
,	inset:						null		// custom container-inset values (override padding)
,	scrollToBookmarkOnLoad:		true		// after creating a layout, scroll to bookmark in URL (.../page.htm#myBookmark)
,	resizeWithWindow:			true		// bind thisLayout.resizeAll() to the window.resize event
,	resizeWithWindowDelay:		200			// delay calling resizeAll because makes window resizing very jerky
,	resizeWithWindowMaxDelay:	0			// 0 = none - force resize every XX ms while window is being resized
,	maskPanesEarly:				false		// true = create pane-masks on resizer.mouseDown instead of waiting for resizer.dragstart
,	onresizeall_start:			null		// CALLBACK when resizeAll() STARTS	- NOT pane-specific
,	onresizeall_end:			null		// CALLBACK when resizeAll() ENDS	- NOT pane-specific
,	onload_start:				null		// CALLBACK when Layout inits - after options initialized, but before elements
,	onload_end:					null		// CALLBACK when Layout inits - after EVERYTHING has been initialized
,	onunload_start:				null		// CALLBACK when Layout is destroyed OR onWindowUnload
,	onunload_end:				null		// CALLBACK when Layout is destroyed OR onWindowUnload
,	initPanes:					true		// false = DO NOT initialize the panes onLoad - will init later
,	showErrorMessages:			true		// enables fatal error messages to warn developers of common errors
,	showDebugMessages:			false		// display console-and-alert debug msgs - IF this Layout version _has_ debugging code!
//	Changing this zIndex value will cause other zIndex values to automatically change
,	zIndex:						null		// the PANE zIndex - resizers and masks will be +1
//	DO NOT CHANGE the zIndex values below unless you clearly understand their relationships
,	zIndexes: {								// set _default_ z-index values here...
		pane_normal:			0			// normal z-index for panes
	,	content_mask:			1			// applied to overlays used to mask content INSIDE panes during resizing
	,	resizer_normal:			2			// normal z-index for resizer-bars
	,	pane_sliding:			100			// applied to *BOTH* the pane and its resizer when a pane is 'slid open'
	,	pane_animate:			1000		// applied to the pane when being animated - not applied to the resizer
	,	resizer_drag:			10000		// applied to the CLONED resizer-bar when being 'dragged'
	}
,	errors: {
		pane:					"pane"		// description of "layout pane element" - used only in error messages
	,	selector:				"selector"	// description of "jQuery-selector" - used only in error messages
	,	addButtonError:			"Error Adding Button\nInvalid "
	,	containerMissing:		"UI Layout Initialization Error\nThe specified layout-container does not exist."
	,	centerPaneMissing:		"UI Layout Initialization Error\nThe center-pane element does not exist.\nThe center-pane is a required element."
	,	noContainerHeight:		"UI Layout Initialization Warning\nThe layout-container \"CONTAINER\" has no height.\nTherefore the layout is 0-height and hence 'invisible'!"
	,	callbackError:			"UI Layout Callback Error\nThe EVENT callback is not a valid function."
	}
/*
 *	PANE DEFAULT SETTINGS
 *	- settings under the 'panes' key become the default settings for *all panes*
 *	- ALL pane-options can also be set specifically for each panes, which will override these 'default values'
 */
,	panes: { // default options for 'all panes' - will be overridden by 'per-pane settings'
		applyDemoStyles: 		false		// NOTE: renamed from applyDefaultStyles for clarity
	,	closable:				true		// pane can open & close
	,	resizable:				true		// when open, pane can be resized 
	,	slidable:				true		// when closed, pane can 'slide open' over other panes - closes on mouse-out
	,	initClosed:				false		// true = init pane as 'closed'
	,	initHidden: 			false 		// true = init pane as 'hidden' - no resizer-bar/spacing
	//	SELECTORS
	//,	paneSelector:			""			// MUST be pane-specific - jQuery selector for pane
	,	contentSelector:		".ui-layout-content" // INNER div/element to auto-size so only it scrolls, not the entire pane!
	,	contentIgnoreSelector:	".ui-layout-ignore"	// element(s) to 'ignore' when measuring 'content'
	,	findNestedContent:		false		// true = jQueryP.find(contentSelector), false = jQueryP.children(contentSelector)
	//	GENERIC ROOT-CLASSES - for auto-generated classNames
	,	paneClass:				"ui-layout-pane"	// Layout Pane
	,	resizerClass:			"ui-layout-resizer"	// Resizer Bar
	,	togglerClass:			"ui-layout-toggler"	// Toggler Button
	,	buttonClass:			"ui-layout-button"	// CUSTOM Buttons	- eg: '[ui-layout-button]-toggle/-open/-close/-pin'
	//	ELEMENT SIZE & SPACING
	//,	size:					100			// MUST be pane-specific -initial size of pane
	,	minSize:				0			// when manually resizing a pane
	,	maxSize:				0			// ditto, 0 = no limit
	,	spacing_open:			6			// space between pane and adjacent panes - when pane is 'open'
	,	spacing_closed:			6			// ditto - when pane is 'closed'
	,	togglerLength_open:		50			// Length = WIDTH of toggler button on north/south sides - HEIGHT on east/west sides
	,	togglerLength_closed: 	50			// 100% OR -1 means 'full height/width of resizer bar' - 0 means 'hidden'
	,	togglerAlign_open:		"center"	// top/left, bottom/right, center, OR...
	,	togglerAlign_closed:	"center"	// 1 => nn = offset from top/left, -1 => -nn == offset from bottom/right
	,	togglerContent_open:	""			// text or HTML to put INSIDE the toggler
	,	togglerContent_closed:	""			// ditto
	//	RESIZING OPTIONS
	,	resizerDblClickToggle:	true		// 
	,	autoResize:				true		// IF size is 'auto' or a percentage, then recalc 'pixel size' whenever the layout resizes
	,	autoReopen:				true		// IF a pane was auto-closed due to noRoom, reopen it when there is room? False = leave it closed
	,	resizerDragOpacity:		1			// option for ui.draggable
	//,	resizerCursor:			""			// MUST be pane-specific - cursor when over resizer-bar
	,	maskContents:			false		// true = add DIV-mask over-or-inside this pane so can 'drag' over IFRAMES
	,	maskObjects:			false		// true = add IFRAME-mask over-or-inside this pane to cover objects/applets - content-mask will overlay this mask
	,	maskZindex:				null		// will override zIndexes.content_mask if specified - not applicable to iframe-panes
	,	resizingGrid:			false		// grid size that the resizers will snap-to during resizing, eg: [20,20]
	,	livePaneResizing:		false		// true = LIVE Resizing as resizer is dragged
	,	liveContentResizing:	false		// true = re-measure header/footer heights as resizer is dragged
	,	liveResizingTolerance:	1			// how many px change before pane resizes, to control performance
	//	SLIDING OPTIONS
	,	sliderCursor:			"pointer"	// cursor when resizer-bar will trigger 'sliding'
	,	slideTrigger_open:		"click"		// click, dblclick, mouseenter
	,	slideTrigger_close:		"mouseleave"// click, mouseleave
	,	slideDelay_open:		300			// applies only for mouseenter event - 0 = instant open
	,	slideDelay_close:		300			// applies only for mouseleave event (300ms is the minimum!)
	,	hideTogglerOnSlide:		false		// when pane is slid-open, should the toggler show?
	,	preventQuickSlideClose:	jQuery.layout.browser.webkit // Chrome triggers slideClosed as it is opening
	,	preventPrematureSlideClose: false	// handle incorrect mouseleave trigger, like when over a SELECT-list in IE
	//	PANE-SPECIFIC TIPS & MESSAGES
	,	tips: {
			Open:				"Open"		// eg: "Open Pane"
		,	Close:				"Close"
		,	Resize:				"Resize"
		,	Slide:				"Slide Open"
		,	Pin:				"Pin"
		,	Unpin:				"Un-Pin"
		,	noRoomToOpen:		"Not enough room to show this panel."	// alert if user tries to open a pane that cannot
		,	minSizeWarning:		"Panel has reached its minimum size"	// displays in browser statusbar
		,	maxSizeWarning:		"Panel has reached its maximum size"	// ditto
		}
	//	HOT-KEYS & MISC
	,	showOverflowOnHover:	false		// will bind allowOverflow() utility to pane.onMouseOver
	,	enableCursorHotkey:		true		// enabled 'cursor' hotkeys
	//,	customHotkey:			""			// MUST be pane-specific - EITHER a charCode OR a character
	,	customHotkeyModifier:	"SHIFT"		// either 'SHIFT', 'CTRL' or 'CTRL+SHIFT' - NOT 'ALT'
	//	PANE ANIMATION
	//	NOTE: fxSss_open, fxSss_close & fxSss_size options (eg: fxName_open) are auto-generated if not passed
	,	fxName:					"slide" 	// ('none' or blank), slide, drop, scale -- only relevant to 'open' & 'close', NOT 'size'
	,	fxSpeed:				null		// slow, normal, fast, 200, nnn - if passed, will OVERRIDE fxSettings.duration
	,	fxSettings:				{}			// can be passed, eg: { easing: "easeOutBounce", duration: 1500 }
	,	fxOpacityFix:			true		// tries to fix opacity in IE to restore anti-aliasing after animation
	,	animatePaneSizing:		false		// true = animate resizing after dragging resizer-bar OR sizePane() is called
	/*  NOTE: Action-specific FX options are auto-generated from the options above if not specifically set:
		fxName_open:			"slide"		// 'Open' pane animation
		fnName_close:			"slide"		// 'Close' pane animation
		fxName_size:			"slide"		// 'Size' pane animation - when animatePaneSizing = true
		fxSpeed_open:			null
		fxSpeed_close:			null
		fxSpeed_size:			null
		fxSettings_open:		{}
		fxSettings_close:		{}
		fxSettings_size:		{}
	*/
	//	CHILD/NESTED LAYOUTS
	,	children:				null		// Layout-options for nested/child layout - even {} is valid as options
	,	containerSelector:		''			// if child is NOT 'directly nested', a selector to find it/them (can have more than one child layout!)
	,	initChildren:			true		// true = child layout will be created as soon as _this_ layout completes initialization
	,	destroyChildren:		true		// true = destroy child-layout if this pane is destroyed
	,	resizeChildren:			true		// true = trigger child-layout.resizeAll() when this pane is resized
	//	EVENT TRIGGERING
	,	triggerEventsOnLoad:	false		// true = trigger onopen OR onclose callbacks when layout initializes
	,	triggerEventsDuringLiveResize: true	// true = trigger onresize callback REPEATEDLY if livePaneResizing==true
	//	PANE CALLBACKS
	,	onshow_start:			null		// CALLBACK when pane STARTS to Show	- BEFORE onopen/onhide_start
	,	onshow_end:				null		// CALLBACK when pane ENDS being Shown	- AFTER  onopen/onhide_end
	,	onhide_start:			null		// CALLBACK when pane STARTS to Close	- BEFORE onclose_start
	,	onhide_end:				null		// CALLBACK when pane ENDS being Closed	- AFTER  onclose_end
	,	onopen_start:			null		// CALLBACK when pane STARTS to Open
	,	onopen_end:				null		// CALLBACK when pane ENDS being Opened
	,	onclose_start:			null		// CALLBACK when pane STARTS to Close
	,	onclose_end:			null		// CALLBACK when pane ENDS being Closed
	,	onresize_start:			null		// CALLBACK when pane STARTS being Resized ***FOR ANY REASON***
	,	onresize_end:			null		// CALLBACK when pane ENDS being Resized ***FOR ANY REASON***
	,	onsizecontent_start:	null		// CALLBACK when sizing of content-element STARTS
	,	onsizecontent_end:		null		// CALLBACK when sizing of content-element ENDS
	,	onswap_start:			null		// CALLBACK when pane STARTS to Swap
	,	onswap_end:				null		// CALLBACK when pane ENDS being Swapped
	,	ondrag_start:			null		// CALLBACK when pane STARTS being ***MANUALLY*** Resized
	,	ondrag_end:				null		// CALLBACK when pane ENDS being ***MANUALLY*** Resized
	}
/*
 *	PANE-SPECIFIC SETTINGS
 *	- options listed below MUST be specified per-pane - they CANNOT be set under 'panes'
 *	- all options under the 'panes' key can also be set specifically for any pane
 *	- most options under the 'panes' key apply only to 'border-panes' - NOT the the center-pane
 */
,	north: {
		paneSelector:			".ui-layout-north"
	,	size:					"auto"		// eg: "auto", "30%", .30, 200
	,	resizerCursor:			"n-resize"	// custom = url(myCursor.cur)
	,	customHotkey:			""			// EITHER a charCode (43) OR a character ("o")
	}
,	south: {
		paneSelector:			".ui-layout-south"
	,	size:					"auto"
	,	resizerCursor:			"s-resize"
	,	customHotkey:			""
	}
,	east: {
		paneSelector:			".ui-layout-east"
	,	size:					200
	,	resizerCursor:			"e-resize"
	,	customHotkey:			""
	}
,	west: {
		paneSelector:			".ui-layout-west"
	,	size:					200
	,	resizerCursor:			"w-resize"
	,	customHotkey:			""
	}
,	center: {
		paneSelector:			".ui-layout-center"
	,	minWidth:				0
	,	minHeight:				0
	}
};

jQuery.layout.optionsMap = {
	// layout/global options - NOT pane-options
	layout: ("name,instanceKey,stateManagement,effects,inset,zIndexes,errors,"
	+	"zIndex,scrollToBookmarkOnLoad,showErrorMessages,maskPanesEarly,"
	+	"outset,resizeWithWindow,resizeWithWindowDelay,resizeWithWindowMaxDelay,"
	+	"onresizeall,onresizeall_start,onresizeall_end,onload,onload_start,onload_end,onunload,onunload_start,onunload_end").split(",")
//	borderPanes: [ ALL options that are NOT specified as 'layout' ]
	// default.panes options that apply to the center-pane (most options apply _only_ to border-panes)
,	center: ("paneClass,contentSelector,contentIgnoreSelector,findNestedContent,applyDemoStyles,triggerEventsOnLoad,"
	+	"showOverflowOnHover,maskContents,maskObjects,liveContentResizing,"
	+	"containerSelector,children,initChildren,resizeChildren,destroyChildren,"
	+	"onresize,onresize_start,onresize_end,onsizecontent,onsizecontent_start,onsizecontent_end").split(",")
	// options that MUST be specifically set 'per-pane' - CANNOT set in the panes (defaults) key
,	noDefault: ("paneSelector,resizerCursor,customHotkey").split(",")
};

/**
 * Processes options passed in converts flat-format data into subkey (JSON) format
 * In flat-format, subkeys are _currently_ separated with 2 underscores, like north__optName
 * Plugins may also call this method so they can transform their own data
 *
 * @param  {!Object}	hash			Data/options passed by user - may be a single level or nested levels
 * @param  {boolean=}	[addKeys=false]	Should the primary layout.options keys be added if they do not exist?
 * @return {Object}						Returns hash of minWidth & minHeight
 */
jQuery.layout.transformData = function (hash, addKeys) {
	var	json = addKeys ? { panes: {}, center: {} } : {} // init return object
	,	branch, optKey, keys, key, val, i, c;

	if (typeof hash !== "object") return json; // no options passed

	// convert all 'flat-keys' to 'sub-key' format
	for (optKey in hash) {
		branch	= json;
		val		= hash[ optKey ];
		keys	= optKey.split("__"); // eg: west__size or north__fxSettings__duration
		c		= keys.length - 1;
		// convert underscore-delimited to subkeys
		for (i=0; i <= c; i++) {
			key = keys[i];
			if (i === c) {	// last key = value
				if (jQuery.isPlainObject( val ))
					branch[key] = jQuery.layout.transformData( val ); // RECURSE
				else
					branch[key] = val;
			}
			else {
				if (!branch[key])
					branch[key] = {}; // create the subkey
				// recurse to sub-key for next loop - if not done
				branch = branch[key];
			}
		}
	}
	return json;
};

// INTERNAL CONFIG DATA - DO NOT CHANGE THIS!
jQuery.layout.backwardCompatibility = {
	// data used by renameOldOptions()
	map: {
	//	OLD Option Name:			NEW Option Name
		applyDefaultStyles:			"applyDemoStyles"
	//	CHILD/NESTED LAYOUTS
	,	childOptions:				"children"
	,	initChildLayout:			"initChildren"
	,	destroyChildLayout:			"destroyChildren"
	,	resizeChildLayout:			"resizeChildren"
	,	resizeNestedLayout:			"resizeChildren"
	//	MISC Options
	,	resizeWhileDragging:		"livePaneResizing"
	,	resizeContentWhileDragging:	"liveContentResizing"
	,	triggerEventsWhileDragging:	"triggerEventsDuringLiveResize"
	,	maskIframesOnResize:		"maskContents"
	//	STATE MANAGEMENT
	,	useStateCookie:				"stateManagement.enabled"
	,	"cookie.autoLoad":			"stateManagement.autoLoad"
	,	"cookie.autoSave":			"stateManagement.autoSave"
	,	"cookie.keys":				"stateManagement.stateKeys"
	,	"cookie.name":				"stateManagement.cookie.name"
	,	"cookie.domain":			"stateManagement.cookie.domain"
	,	"cookie.path":				"stateManagement.cookie.path"
	,	"cookie.expires":			"stateManagement.cookie.expires"
	,	"cookie.secure":			"stateManagement.cookie.secure"
	//	OLD Language options
	,	noRoomToOpenTip:			"tips.noRoomToOpen"
	,	togglerTip_open:			"tips.Close"	// open   = Close
	,	togglerTip_closed:			"tips.Open"		// closed = Open
	,	resizerTip:					"tips.Resize"
	,	sliderTip:					"tips.Slide"
	}

/**
* @param {Object}	opts
*/
,	renameOptions: function (opts) {
		var map = jQuery.layout.backwardCompatibility.map
		,	oldData, newData, value
		;
		for (var itemPath in map) {
			oldData	= getBranch( itemPath );
			value	= oldData.branch[ oldData.key ];
			if (value !== undefined) {
				newData = getBranch( map[itemPath], true );
				newData.branch[ newData.key ] = value;
				delete oldData.branch[ oldData.key ];
			}
		}

		/**
		* @param {string}	path
		* @param {boolean=}	[create=false]	Create path if does not exist
		*/
		function getBranch (path, create) {
			var a = path.split(".") // split keys into array
			,	c = a.length - 1
			,	D = { branch: opts, key: a[c] } // init branch at top & set key (last item)
			,	i = 0, k, undef;
			for (; i<c; i++) { // skip the last key (data)
				k = a[i];
				if (D.branch[ k ] == undefined) { // child-key does not exist
					if (create) {
						D.branch = D.branch[ k ] = {}; // create child-branch
					}
					else // can't go any farther
						D.branch = {}; // branch is undefined
				}
				else
					D.branch = D.branch[ k ]; // get child-branch
			}
			return D;
		};
	}

/**
* @param {Object}	opts
*/
,	renameAllOptions: function (opts) {
		var ren = jQuery.layout.backwardCompatibility.renameOptions;
		// rename root (layout) options
		ren( opts );
		// rename 'defaults' to 'panes'
		if (opts.defaults) {
			if (typeof opts.panes !== "object")
				opts.panes = {};
			jQuery.extend(true, opts.panes, opts.defaults);
			delete opts.defaults;
		}
		// rename options in the the options.panes key
		if (opts.panes) ren( opts.panes );
		// rename options inside *each pane key*, eg: options.west
		jQuery.each(jQuery.layout.config.allPanes, function (i, pane) {
			if (opts[pane]) ren( opts[pane] );
		});	
		return opts;
	}
};




/*	============================================================
 *	BEGIN WIDGET: jQuery( selector ).layout( {options} );
 *	============================================================
 */
jQuery.fn.layout = function (opts) {
	var

	// local aliases to global data
	browser	= jQuery.layout.browser
,	_c		= jQuery.layout.config

	// local aliases to utlity methods
,	cssW	= jQuery.layout.cssWidth
,	cssH	= jQuery.layout.cssHeight
,	elDims	= jQuery.layout.getElementDimensions
,	styles	= jQuery.layout.getElementStyles
,	evtObj	= jQuery.layout.getEventObject
,	evtPane	= jQuery.layout.parsePaneName

/**
 * options - populated by initOptions()
 */
,	options = jQuery.extend(true, {}, jQuery.layout.defaults)
,	effects	= options.effects = jQuery.extend(true, {}, jQuery.layout.effects)

/**
 * layout-state object
 */
,	state = {
		// generate unique ID to use for event.namespace so can unbind only events added by 'this layout'
		id:				"layout"+ jQuery.now()	// code uses alias: sID
	,	initialized:	false
	,	paneResizing:	false
	,	panesSliding:	{}
	,	container:	{ 	// list all keys referenced in code to avoid compiler error msgs
			innerWidth:		0
		,	innerHeight:	0
		,	outerWidth:		0
		,	outerHeight:	0
		,	layoutWidth:	0
		,	layoutHeight:	0
		}
	,	north:		{ childIdx: 0 }
	,	south:		{ childIdx: 0 }
	,	east:		{ childIdx: 0 }
	,	west:		{ childIdx: 0 }
	,	center:		{ childIdx: 0 }
	}

/**
 * parent/child-layout pointers
 */
//,	hasParentLayout	= false	- exists ONLY inside Instance so can be set externally
,	children = {
		north:		null
	,	south:		null
	,	east:		null
	,	west:		null
	,	center:		null
	}

/*
 * ###########################
 *  INTERNAL HELPER FUNCTIONS
 * ###########################
 */

	/**
	* Manages all internal timers
	*/
,	timer = {
		data:	{}
	,	set:	function (s, fn, ms) { timer.clear(s); timer.data[s] = setTimeout(fn, ms); }
	,	clear:	function (s) { var t=timer.data; if (t[s]) {clearTimeout(t[s]); delete t[s];} }
	}

	/**
	* Alert or console.log a message - IF option is enabled.
	*
	* @param {(string|!Object)}	msg				Message (or debug-data) to display
	* @param {boolean=}			[popup=false]	True by default, means 'alert', false means use console.log
	* @param {boolean=}			[debug=false]	True means is a widget debugging message
	*/
,	_log = function (msg, popup, debug) {
		var o = options;
		if ((o.showErrorMessages && !debug) || (debug && o.showDebugMessages))
			jQuery.layout.msg( o.name +' / '+ msg, (popup !== false) );
		return false;
	}

	/**
	* Executes a Callback function after a trigger event, like resize, open or close
	*
	* @param {string}				evtName					Name of the layout callback, eg "onresize_start"
	* @param {(string|boolean)=}	[pane=""]				This is passed only so we can pass the 'pane object' to the callback
	* @param {(string|boolean)=}	[skipBoundEvents=false]	True = do not run events bound to the elements - only the callbacks set in options
	*/
,	_runCallbacks = function (evtName, pane, skipBoundEvents) {
		var	hasPane	= pane && isStr(pane)
		,	s		= hasPane ? state[pane] : state
		,	o		= hasPane ? options[pane] : options
		,	lName	= options.name
			// names like onopen and onopen_end separate are interchangeable in options...
		,	lng		= evtName + (evtName.match(/_/) ? "" : "_end")
		,	shrt	= lng.match(/_endjQuery/) ? lng.substr(0, lng.length - 4) : ""
		,	fn		= o[lng] || o[shrt]
		,	retVal	= "NC" // NC = No Callback
		,	args	= []
		,	jQueryP
		;
		if ( !hasPane && jQuery.type(pane) === 'boolean' ) {
			skipBoundEvents = pane; // allow pane param to be skipped for Layout callback
			pane = "";
		}

		// first trigger the callback set in the options
		if (fn) {
			try {
				// convert function name (string) to function object
				if (isStr( fn )) {
					if (fn.match(/,/)) {
						// function name cannot contain a comma, 
						// so must be a function name AND a parameter to pass
						args = fn.split(",")
						,	fn = eval(args[0]);
					}
					else // just the name of an external function?
						fn = eval(fn);
				}
				// execute the callback, if exists
				if (jQuery.isFunction( fn )) {
					if (args.length)
						retVal = g(fn)(args[1]); // pass the argument parsed from 'list'
					else if ( hasPane )
						// pass data: pane-name, pane-element, pane-state, pane-options, and layout-name
						retVal = g(fn)( pane, jQueryPs[pane], s, o, lName );
					else // must be a layout/container callback - pass suitable info
						retVal = g(fn)( Instance, s, o, lName );
				}
			}
			catch (ex) {
				_log( options.errors.callbackError.replace(/EVENT/, jQuery.trim((pane || "") +" "+ lng)), false );
				if (jQuery.type(ex) === 'string' && string.length)
					_log('Exception:  '+ ex, false );
			}
		}

		// trigger additional events bound directly to the pane
		if (!skipBoundEvents && retVal !== false) {
			if ( hasPane ) { // PANE events can be bound to each pane-elements
				jQueryP	= jQueryPs[pane];
				o	= options[pane];
				s	= state[pane];
				jQueryP.triggerHandler('layoutpane'+ lng, [ pane, jQueryP, s, o, lName ]);
				if (shrt)
					jQueryP.triggerHandler('layoutpane'+ shrt, [ pane, jQueryP, s, o, lName ]);
			}
			else { // LAYOUT events can be bound to the container-element
				jQueryN.triggerHandler('layout'+ lng, [ Instance, s, o, lName ]);
				if (shrt)
					jQueryN.triggerHandler('layout'+ shrt, [ Instance, s, o, lName ]);
			}
		}

		// ALWAYS resizeChildren after an onresize_end event - even during initialization
		// IGNORE onsizecontent_end event because causes child-layouts to resize TWICE
		if (hasPane && evtName === "onresize_end") // BAD: || evtName === "onsizecontent_end"
			resizeChildren(pane+"", true); // compiler hack -force string

		return retVal;

		function g (f) { return f; }; // compiler hack
	}


	/**
	* cure iframe display issues in IE & other browsers
	*/
,	_fixIframe = function (pane) {
		if (browser.mozilla) return; // skip FireFox - it auto-refreshes iframes onShow
		var jQueryP = jQueryPs[pane];
		// if the 'pane' is an iframe, do it
		if (state[pane].tagName === "IFRAME")
			jQueryP.css(_c.hidden).css(_c.visible); 
		else // ditto for any iframes INSIDE the pane
			jQueryP.find('IFRAME').css(_c.hidden).css(_c.visible);
	}

	/**
	* @param  {string}		pane		Can accept ONLY a 'pane' (east, west, etc)
	* @param  {number=}		outerSize	(optional) Can pass a width, allowing calculations BEFORE element is resized
	* @return {number}		Returns the innerHeight/Width of el by subtracting padding and borders
	*/
,	cssSize = function (pane, outerSize) {
		var fn = _c[pane].dir=="horz" ? cssH : cssW;
		return fn(jQueryPs[pane], outerSize);
	}

	/**
	* @param  {string}		pane		Can accept ONLY a 'pane' (east, west, etc)
	* @return {Object}		Returns hash of minWidth & minHeight
	*/
,	cssMinDims = function (pane) {
		// minWidth/Height means CSS width/height = 1px
		var	jQueryP	= jQueryPs[pane]
		,	dir	= _c[pane].dir
		,	d	= {
				minWidth:	1001 - cssW(jQueryP, 1000)
			,	minHeight:	1001 - cssH(jQueryP, 1000)
			}
		;
		if (dir === "horz") d.minSize = d.minHeight;
		if (dir === "vert") d.minSize = d.minWidth;
		return d;
	}

	// TODO: see if these methods can be made more useful...
	// TODO: *maybe* return cssW/H from these so caller can use this info

	/**
	* @param {(string|!Object)}		el
	* @param {number=}				outerWidth
	* @param {boolean=}				[autoHide=false]
	*/
,	setOuterWidth = function (el, outerWidth, autoHide) {
		var jQueryE = el, w;
		if (isStr(el)) jQueryE = jQueryPs[el]; // west
		else if (!el.jquery) jQueryE = jQuery(el);
		w = cssW(jQueryE, outerWidth);
		jQueryE.css({ width: w });
		if (w > 0) {
			if (autoHide && jQueryE.data('autoHidden') && jQueryE.innerHeight() > 0) {
				jQueryE.show().data('autoHidden', false);
				if (!browser.mozilla) // FireFox refreshes iframes - IE does not
					// make hidden, then visible to 'refresh' display after animation
					jQueryE.css(_c.hidden).css(_c.visible);
			}
		}
		else if (autoHide && !jQueryE.data('autoHidden'))
			jQueryE.hide().data('autoHidden', true);
	}

	/**
	* @param {(string|!Object)}		el
	* @param {number=}				outerHeight
	* @param {boolean=}				[autoHide=false]
	*/
,	setOuterHeight = function (el, outerHeight, autoHide) {
		var jQueryE = el, h;
		if (isStr(el)) jQueryE = jQueryPs[el]; // west
		else if (!el.jquery) jQueryE = jQuery(el);
		h = cssH(jQueryE, outerHeight);
		jQueryE.css({ height: h, visibility: "visible" }); // may have been 'hidden' by sizeContent
		if (h > 0 && jQueryE.innerWidth() > 0) {
			if (autoHide && jQueryE.data('autoHidden')) {
				jQueryE.show().data('autoHidden', false);
				if (!browser.mozilla) // FireFox refreshes iframes - IE does not
					jQueryE.css(_c.hidden).css(_c.visible);
			}
		}
		else if (autoHide && !jQueryE.data('autoHidden'))
			jQueryE.hide().data('autoHidden', true);
	}


	/**
	* Converts any 'size' params to a pixel/integer size, if not already
	* If 'auto' or a decimal/percentage is passed as 'size', a pixel-size is calculated
	*
	/**
	* @param  {string}				pane
	* @param  {(string|number)=}	size
	* @param  {string=}				[dir]
	* @return {number}
	*/
,	_parseSize = function (pane, size, dir) {
		if (!dir) dir = _c[pane].dir;

		if (isStr(size) && size.match(/%/))
			size = (size === '100%') ? -1 : parseInt(size, 10) / 100; // convert % to decimal

		if (size === 0)
			return 0;
		else if (size >= 1)
			return parseInt(size, 10);

		var o = options, avail = 0;
		if (dir=="horz") // north or south or center.minHeight
			avail = sC.innerHeight - (jQueryPs.north ? o.north.spacing_open : 0) - (jQueryPs.south ? o.south.spacing_open : 0);
		else if (dir=="vert") // east or west or center.minWidth
			avail = sC.innerWidth - (jQueryPs.west ? o.west.spacing_open : 0) - (jQueryPs.east ? o.east.spacing_open : 0);

		if (size === -1) // -1 == 100%
			return avail;
		else if (size > 0) // percentage, eg: .25
			return round(avail * size);
		else if (pane=="center")
			return 0;
		else { // size < 0 || size=='auto' || size==Missing || size==Invalid
			// auto-size the pane
			var	dim	= (dir === "horz" ? "height" : "width")
			,	jQueryP	= jQueryPs[pane]
			,	jQueryC	= dim === 'height' ? jQueryCs[pane] : false
			,	vis	= jQuery.layout.showInvisibly(jQueryP) // show pane invisibly if hidden
			,	szP	= jQueryP.css(dim) // SAVE current pane size
			,	szC	= jQueryC ? jQueryC.css(dim) : 0 // SAVE current content size
			;
			jQueryP.css(dim, "auto");
			if (jQueryC) jQueryC.css(dim, "auto");
			size = (dim === "height") ? jQueryP.outerHeight() : jQueryP.outerWidth(); // MEASURE
			jQueryP.css(dim, szP).css(vis); // RESET size & visibility
			if (jQueryC) jQueryC.css(dim, szC);
			return size;
		}
	}

	/**
	* Calculates current 'size' (outer-width or outer-height) of a border-pane - optionally with 'pane-spacing' added
	*
	* @param  {(string|!Object)}	pane
	* @param  {boolean=}			[inclSpace=false]
	* @return {number}				Returns EITHER Width for east/west panes OR Height for north/south panes
	*/
,	getPaneSize = function (pane, inclSpace) {
		var 
			jQueryP	= jQueryPs[pane]
		,	o	= options[pane]
		,	s	= state[pane]
		,	oSp	= (inclSpace ? o.spacing_open : 0)
		,	cSp	= (inclSpace ? o.spacing_closed : 0)
		;
		if (!jQueryP || s.isHidden)
			return 0;
		else if (s.isClosed || (s.isSliding && inclSpace))
			return cSp;
		else if (_c[pane].dir === "horz")
			return jQueryP.outerHeight() + oSp;
		else // dir === "vert"
			return jQueryP.outerWidth() + oSp;
	}

	/**
	* Calculate min/max pane dimensions and limits for resizing
	*
	* @param  {string}		pane
	* @param  {boolean=}	[slide=false]
	*/
,	setSizeLimits = function (pane, slide) {
		if (!isInitialized()) return;
		var 
			o				= options[pane]
		,	s				= state[pane]
		,	c				= _c[pane]
		,	dir				= c.dir
		,	type			= c.sizeType.toLowerCase()
		,	isSliding		= (slide != undefined ? slide : s.isSliding) // only open() passes 'slide' param
		,	jQueryP				= jQueryPs[pane]
		,	paneSpacing		= o.spacing_open
		//	measure the pane on the *opposite side* from this pane
		,	altPane			= _c.oppositeEdge[pane]
		,	altS			= state[altPane]
		,	jQueryaltP			= jQueryPs[altPane]
		,	altPaneSize		= (!jQueryaltP || altS.isVisible===false || altS.isSliding ? 0 : (dir=="horz" ? jQueryaltP.outerHeight() : jQueryaltP.outerWidth()))
		,	altPaneSpacing	= ((!jQueryaltP || altS.isHidden ? 0 : options[altPane][ altS.isClosed !== false ? "spacing_closed" : "spacing_open" ]) || 0)
		//	limitSize prevents this pane from 'overlapping' opposite pane
		,	containerSize	= (dir=="horz" ? sC.innerHeight : sC.innerWidth)
		,	minCenterDims	= cssMinDims("center")
		,	minCenterSize	= dir=="horz" ? max(options.center.minHeight, minCenterDims.minHeight) : max(options.center.minWidth, minCenterDims.minWidth)
		//	if pane is 'sliding', then ignore center and alt-pane sizes - because 'overlays' them
		,	limitSize		= (containerSize - paneSpacing - (isSliding ? 0 : (_parseSize("center", minCenterSize, dir) + altPaneSize + altPaneSpacing)))
		,	minSize			= s.minSize = max( _parseSize(pane, o.minSize), cssMinDims(pane).minSize )
		,	maxSize			= s.maxSize = min( (o.maxSize ? _parseSize(pane, o.maxSize) : 100000), limitSize )
		,	r				= s.resizerPosition = {} // used to set resizing limits
		,	top				= sC.inset.top
		,	left			= sC.inset.left
		,	W				= sC.innerWidth
		,	H				= sC.innerHeight
		,	rW				= o.spacing_open // subtract resizer-width to get top/left position for south/east
		;
		switch (pane) {
			case "north":	r.min = top + minSize;
							r.max = top + maxSize;
							break;
			case "west":	r.min = left + minSize;
							r.max = left + maxSize;
							break;
			case "south":	r.min = top + H - maxSize - rW;
							r.max = top + H - minSize - rW;
							break;
			case "east":	r.min = left + W - maxSize - rW;
							r.max = left + W - minSize - rW;
							break;
		};
	}

	/**
	* Returns data for setting the size/position of center pane. Also used to set Height for east/west panes
	*
	* @return JSON  Returns a hash of all dimensions: top, bottom, left, right, (outer) width and (outer) height
	*/
,	calcNewCenterPaneDims = function () {
		var d = {
			top:	getPaneSize("north", true) // true = include 'spacing' value for pane
		,	bottom:	getPaneSize("south", true)
		,	left:	getPaneSize("west", true)
		,	right:	getPaneSize("east", true)
		,	width:	0
		,	height:	0
		};

		// NOTE: sC = state.container
		// calc center-pane outer dimensions
		d.width		= sC.innerWidth - d.left - d.right;  // outerWidth
		d.height	= sC.innerHeight - d.bottom - d.top; // outerHeight
		// add the 'container border/padding' to get final positions relative to the container
		d.top		+= sC.inset.top;
		d.bottom	+= sC.inset.bottom;
		d.left		+= sC.inset.left;
		d.right		+= sC.inset.right;

		return d;
	}


	/**
	* @param {!Object}		el
	* @param {boolean=}		[allStates=false]
	*/
,	getHoverClasses = function (el, allStates) {
		var
			jQueryEl		= jQuery(el)
		,	type	= jQueryEl.data("layoutRole")
		,	pane	= jQueryEl.data("layoutEdge")
		,	o		= options[pane]
		,	root	= o[type +"Class"]
		,	_pane	= "-"+ pane // eg: "-west"
		,	_open	= "-open"
		,	_closed	= "-closed"
		,	_slide	= "-sliding"
		,	_hover	= "-hover " // NOTE the trailing space
		,	_state	= jQueryEl.hasClass(root+_closed) ? _closed : _open
		,	_alt	= _state === _closed ? _open : _closed
		,	classes = (root+_hover) + (root+_pane+_hover) + (root+_state+_hover) + (root+_pane+_state+_hover)
		;
		if (allStates) // when 'removing' classes, also remove alternate-state classes
			classes += (root+_alt+_hover) + (root+_pane+_alt+_hover);

		if (type=="resizer" && jQueryEl.hasClass(root+_slide))
			classes += (root+_slide+_hover) + (root+_pane+_slide+_hover);

		return jQuery.trim(classes);
	}
,	addHover	= function (evt, el) {
		var jQueryE = jQuery(el || this);
		if (evt && jQueryE.data("layoutRole") === "toggler")
			evt.stopPropagation(); // prevent triggering 'slide' on Resizer-bar
		jQueryE.addClass( getHoverClasses(jQueryE) );
	}
,	removeHover	= function (evt, el) {
		var jQueryE = jQuery(el || this);
		jQueryE.removeClass( getHoverClasses(jQueryE, true) );
	}

,	onResizerEnter	= function (evt) { // ALSO called by toggler.mouseenter
		var pane	= jQuery(this).data("layoutEdge")
		,	s		= state[pane]
		;
		// ignore closed-panes and mouse moving back & forth over resizer!
		// also ignore if ANY pane is currently resizing
		if ( s.isClosed || s.isResizing || state.paneResizing ) return;

		if (jQuery.fn.disableSelection)
			jQuery("body").disableSelection();
		if (options.maskPanesEarly)
			showMasks( pane, { resizing: true });
	}
,	onResizerLeave	= function (evt, el) {
		var	e		= el || this // el is only passed when called by the timer
		,	pane	= jQuery(e).data("layoutEdge")
		,	name	= pane +"ResizerLeave"
		;
		timer.clear(pane+"_openSlider"); // cancel slideOpen timer, if set
		timer.clear(name); // cancel enableSelection timer - may re/set below
		// this method calls itself on a timer because it needs to allow
		// enough time for dragging to kick-in and set the isResizing flag
		// dragging has a 100ms delay set, so this delay must be >100
		if (!el) // 1st call - mouseleave event
			timer.set(name, function(){ onResizerLeave(evt, e); }, 200);
		// if user is resizing, then dragStop will enableSelection(), so can skip it here
		else if ( !state.paneResizing ) { // 2nd call - by timer
			if (jQuery.fn.enableSelection)
				jQuery("body").enableSelection();
			if (options.maskPanesEarly)
				hideMasks();
		}
	}

/*
 * ###########################
 *   INITIALIZATION METHODS
 * ###########################
 */

	/**
	* Initialize the layout - called automatically whenever an instance of layout is created
	*
	* @see  none - triggered onInit
	* @return  mixed	true = fully initialized | false = panes not initialized (yet) | 'cancel' = abort
	*/
,	_create = function () {
		// initialize config/options
		initOptions();
		var o = options
		,	s = state;

		// TEMP state so isInitialized returns true during init process
		s.creatingLayout = true;

		// init plugins for this layout, if there are any (eg: stateManagement)
		runPluginCallbacks( Instance, jQuery.layout.onCreate );

		// options & state have been initialized, so now run beforeLoad callback
		// onload will CANCEL layout creation if it returns false
		if (false === _runCallbacks("onload_start"))
			return 'cancel';

		// initialize the container element
		_initContainer();

		// bind hotkey function - keyDown - if required
		initHotkeys();

		// bind window.onunload
		jQuery(window).bind("unload."+ sID, unload);

		// init plugins for this layout, if there are any (eg: customButtons)
		runPluginCallbacks( Instance, jQuery.layout.onLoad );

		// if layout elements are hidden, then layout WILL NOT complete initialization!
		// initLayoutElements will set initialized=true and run the onload callback IF successful
		if (o.initPanes) _initLayoutElements();

		delete s.creatingLayout;

		return state.initialized;
	}

	/**
	* Initialize the layout IF not already
	*
	* @see  All methods in Instance run this test
	* @return  boolean	true = layoutElements have been initialized | false = panes are not initialized (yet)
	*/
,	isInitialized = function () {
		if (state.initialized || state.creatingLayout) return true;	// already initialized
		else return _initLayoutElements();	// try to init panes NOW
	}

	/**
	* Initialize the layout - called automatically whenever an instance of layout is created
	*
	* @see  _create() & isInitialized
	* @param {boolean=}		[retry=false]	// indicates this is a 2nd try
	* @return  An object pointer to the instance created
	*/
,	_initLayoutElements = function (retry) {
		// initialize config/options
		var o = options;
		// CANNOT init panes inside a hidden container!
		if (!jQueryN.is(":visible")) {
			// handle Chrome bug where popup window 'has no height'
			// if layout is BODY element, try again in 50ms
			// SEE: http://layout.jquery-dev.net/samples/test_popup_window.html
			if ( !retry && browser.webkit && jQueryN[0].tagName === "BODY" )
				setTimeout(function(){ _initLayoutElements(true); }, 50);
			return false;
		}

		// a center pane is required, so make sure it exists
		if (!getPane("center").length) {
			return _log( o.errors.centerPaneMissing );
		}

		// TEMP state so isInitialized returns true during init process
		state.creatingLayout = true;

		// update Container dims
		jQuery.extend(sC, elDims( jQueryN, o.inset )); // passing inset means DO NOT include insetX values

		// initialize all layout elements
		initPanes();	// size & position panes - calls initHandles() - which calls initResizable()

		if (o.scrollToBookmarkOnLoad) {
			var l = self.location;
			if (l.hash) l.replace( l.hash ); // scrollTo Bookmark
		}

		// check to see if this layout 'nested' inside a pane
		if (Instance.hasParentLayout)
			o.resizeWithWindow = false;
		// bind resizeAll() for 'this layout instance' to window.resize event
		else if (o.resizeWithWindow)
			jQuery(window).bind("resize."+ sID, windowResize);

		delete state.creatingLayout;
		state.initialized = true;

		// init plugins for this layout, if there are any
		runPluginCallbacks( Instance, jQuery.layout.onReady );

		// now run the onload callback, if exists
		_runCallbacks("onload_end");

		return true; // elements initialized successfully
	}

	/**
	* Initialize nested layouts for a specific pane - can optionally pass layout-options
	*
	* @param {(string|Object)}	evt_or_pane	The pane being opened, ie: north, south, east, or west
	* @param {Object=}			[opts]		Layout-options - if passed, will OVERRRIDE options[pane].children
	* @return  An object pointer to the layout instance created - or null
	*/
,	createChildren = function (evt_or_pane, opts) {
		var	pane = evtPane.call(this, evt_or_pane)
		,	jQueryP	= jQueryPs[pane]
		;
		if (!jQueryP) return;
		var	jQueryC	= jQueryCs[pane]
		,	s	= state[pane]
		,	o	= options[pane]
		,	sm	= options.stateManagement || {}
		,	cos = opts ? (o.children = opts) : o.children
		;
		if ( jQuery.isPlainObject( cos ) )
			cos = [ cos ]; // convert a hash to a 1-elem array
		else if (!cos || !jQuery.isArray( cos ))
			return;

		jQuery.each( cos, function (idx, co) {
			if ( !jQuery.isPlainObject( co ) ) return;

			// determine which element is supposed to be the 'child container'
			// if pane has a 'containerSelector' OR a 'content-div', use those instead of the pane
			var jQuerycontainers = co.containerSelector ? jQueryP.find( co.containerSelector ) : (jQueryC || jQueryP);

			jQuerycontainers.each(function(){
				var jQuerycont	= jQuery(this)
				,	child	= jQuerycont.data("layout") //	see if a child-layout ALREADY exists on this element
				;
				// if no layout exists, but children are set, try to create the layout now
				if (!child) {
					// TODO: see about moving this to the stateManagement plugin, as a method
					// set a unique child-instance key for this layout, if not already set
					setInstanceKey({ container: jQuerycont, options: co }, s );
					// If THIS layout has a hash in stateManagement.autoLoad,
					// then see if it also contains state-data for this child-layout
					// If so, copy the stateData to child.options.stateManagement.autoLoad
					if ( sm.includeChildren && state.stateData[pane] ) {
						//	THIS layout's state was cached when its state was loaded
						var	paneChildren = state.stateData[pane].children || {}
						,	childState	= paneChildren[ co.instanceKey ]
						,	co_sm		= co.stateManagement || (co.stateManagement = { autoLoad: true })
						;
						// COPY the stateData into the autoLoad key
						if ( co_sm.autoLoad === true && childState ) {
							co_sm.autoSave			= false; // disable autoSave because saving handled by parent-layout
							co_sm.includeChildren	= true;  // cascade option - FOR NOW
							co_sm.autoLoad = jQuery.extend(true, {}, childState); // COPY the state-hash
						}
					}

					// create the layout
					child = jQuerycont.layout( co );

					// if successful, update data
					if (child) {
						// add the child and update all layout-pointers
						// MAY have already been done by child-layout calling parent.refreshChildren()
						refreshChildren( pane, child );
					}
				}
			});
		});
	}

,	setInstanceKey = function (child, parentPaneState) {
		// create a named key for use in state and instance branches
		var	jQueryc	= child.container
		,	o	= child.options
		,	sm	= o.stateManagement
		,	key	= o.instanceKey || jQueryc.data("layoutInstanceKey")
		;
		if (!key) key = (sm && sm.cookie ? sm.cookie.name : '') || o.name; // look for a name/key
		if (!key) key = "layout"+ (++parentPaneState.childIdx);	// if no name/key found, generate one
		else key = key.replace(/[^\w-]/gi, '_').replace(/_{2,}/g, '_');	 // ensure is valid as a hash key
		o.instanceKey = key;
		jQueryc.data("layoutInstanceKey", key); // useful if layout is destroyed and then recreated
		return key;
	}

	/**
	* @param {string}		pane		The pane being opened, ie: north, south, east, or west
	* @param {Object=}		newChild	New child-layout Instance to add to this pane
	*/
,	refreshChildren = function (pane, newChild) {
		var	jQueryP	= jQueryPs[pane]
		,	pC	= children[pane]
		,	s	= state[pane]
		,	o
		;
		// check for destroy()ed layouts and update the child pointers & arrays
		if (jQuery.isPlainObject( pC )) {
			jQuery.each( pC, function (key, child) {
				if (child.destroyed) delete pC[key]
			});
			// if no more children, remove the children hash
			if (jQuery.isEmptyObject( pC ))
				pC = children[pane] = null; // clear children hash
		}

		// see if there is a directly-nested layout inside this pane
		// if there is, then there can be only ONE child-layout, so check that...
		if (!newChild && !pC) {
			newChild = jQueryP.data("layout");
		}

		// if a newChild instance was passed, add it to children[pane]
		if (newChild) {
			// update child.state
			newChild.hasParentLayout = true; // set parent-flag in child
			// instanceKey is a key-name used in both state and children
			o = newChild.options;
			// set a unique child-instance key for this layout, if not already set
			setInstanceKey( newChild, s );
			// add pointer to pane.children hash
			if (!pC) pC = children[pane] = {}; // create an empty children hash
			pC[ o.instanceKey ] = newChild.container.data("layout"); // add childLayout instance
		}

		// ALWAYS refresh the pane.children alias, even if null
		Instance[pane].children = children[pane];

		// if newChild was NOT passed - see if there is a child layout NOW
		if (!newChild) {
			createChildren(pane); // MAY create a child and re-call this method
		}
	}

,	windowResize = function () {
		var	o = options
		,	delay = Number(o.resizeWithWindowDelay);
		if (delay < 10) delay = 100; // MUST have a delay!
		// resizing uses a delay-loop because the resize event fires repeatly - except in FF, but delay anyway
		timer.clear("winResize"); // if already running
		timer.set("winResize", function(){
			timer.clear("winResize");
			timer.clear("winResizeRepeater");
			var dims = elDims( jQueryN, o.inset );
			// only trigger resizeAll() if container has changed size
			if (dims.innerWidth !== sC.innerWidth || dims.innerHeight !== sC.innerHeight)
				resizeAll();
		}, delay);
		// ALSO set fixed-delay timer, if not already running
		if (!timer.data["winResizeRepeater"]) setWindowResizeRepeater();
	}

,	setWindowResizeRepeater = function () {
		var delay = Number(options.resizeWithWindowMaxDelay);
		if (delay > 0)
			timer.set("winResizeRepeater", function(){ setWindowResizeRepeater(); resizeAll(); }, delay);
	}

,	unload = function () {
		var o = options;

		_runCallbacks("onunload_start");

		// trigger plugin callabacks for this layout (eg: stateManagement)
		runPluginCallbacks( Instance, jQuery.layout.onUnload );

		_runCallbacks("onunload_end");
	}

	/**
	* Validate and initialize container CSS and events
	*
	* @see  _create()
	*/
,	_initContainer = function () {
		var
			N		= jQueryN[0]	
		,	jQueryH		= jQuery("html")
		,	tag		= sC.tagName = N.tagName
		,	id		= sC.id = N.id
		,	cls		= sC.className = N.className
		,	o		= options
		,	name	= o.name
		,	props	= "position,margin,padding,border"
		,	css		= "layoutCSS"
		,	CSS		= {}
		,	hid		= "hidden" // used A LOT!
		//	see if this container is a 'pane' inside an outer-layout
		,	parent	= jQueryN.data("parentLayout")	// parent-layout Instance
		,	pane	= jQueryN.data("layoutEdge")		// pane-name in parent-layout
		,	isChild	= parent && pane
		,	num		= jQuery.layout.cssNum
		,	jQueryparent, n
		;
		// sC = state.container
		sC.selector = jQueryN.selector.split(".slice")[0];
		sC.ref		= (o.name ? o.name +' layout / ' : '') + tag + (id ? "#"+id : cls ? '.['+cls+']' : ''); // used in messages
		sC.isBody	= (tag === "BODY");

		// try to find a parent-layout
		if (!isChild && !sC.isBody) {
			jQueryparent = jQueryN.closest("."+ jQuery.layout.defaults.panes.paneClass);
			parent	= jQueryparent.data("parentLayout");
			pane	= jQueryparent.data("layoutEdge");
			isChild	= parent && pane;
		}

		jQueryN	.data({
				layout: Instance
			,	layoutContainer: sID // FLAG to indicate this is a layout-container - contains unique internal ID
			})
			.addClass(o.containerClass)
		;
		var layoutMethods = {
			destroy:	''
		,	initPanes:	''
		,	resizeAll:	'resizeAll'
		,	resize:		'resizeAll'
		};
		// loop hash and bind all methods - include layoutID namespacing
		for (name in layoutMethods) {
			jQueryN.bind("layout"+ name.toLowerCase() +"."+ sID, Instance[ layoutMethods[name] || name ]);
		}

		// if this container is another layout's 'pane', then set child/parent pointers
		if (isChild) {
			// update parent flag
			Instance.hasParentLayout = true;
			// set pointers to THIS child-layout (Instance) in parent-layout
			parent.refreshChildren( pane, Instance );
		}

		// SAVE original container CSS for use in destroy()
		if (!jQueryN.data(css)) {
			// handle props like overflow different for BODY & HTML - has 'system default' values
			if (sC.isBody) {
				// SAVE <BODY> CSS
				jQueryN.data(css, jQuery.extend( styles(jQueryN, props), {
					height:		jQueryN.css("height")
				,	overflow:	jQueryN.css("overflow")
				,	overflowX:	jQueryN.css("overflowX")
				,	overflowY:	jQueryN.css("overflowY")
				}));
				// ALSO SAVE <HTML> CSS
				jQueryH.data(css, jQuery.extend( styles(jQueryH, 'padding'), {
					height:		"auto" // FF would return a fixed px-size!
				,	overflow:	jQueryH.css("overflow")
				,	overflowX:	jQueryH.css("overflowX")
				,	overflowY:	jQueryH.css("overflowY")
				}));
			}
			else // handle props normally for non-body elements
				jQueryN.data(css, styles(jQueryN, props+",top,bottom,left,right,width,height,overflow,overflowX,overflowY") );
		}

		try {
			// common container CSS
			CSS = {
				overflow:	hid
			,	overflowX:	hid
			,	overflowY:	hid
			};
			jQueryN.css( CSS );

			if (o.inset && !jQuery.isPlainObject(o.inset)) {
				// can specify a single number for equal outset all-around
				n = parseInt(o.inset, 10) || 0
				o.inset = {
					top:	n
				,	bottom:	n
				,	left:	n
				,	right:	n
				};
			}

			// format html & body if this is a full page layout
			if (sC.isBody) {
				// if HTML has padding, use this as an outer-spacing around BODY
				if (!o.outset) {
					// use padding from parent-elem (HTML) as outset
					o.outset = {
						top:	num(jQueryH, "paddingTop")
					,	bottom:	num(jQueryH, "paddingBottom")
					,	left:	num(jQueryH, "paddingLeft")
					,	right:	num(jQueryH, "paddingRight")
					};
				}
				else if (!jQuery.isPlainObject(o.outset)) {
					// can specify a single number for equal outset all-around
					n = parseInt(o.outset, 10) || 0
					o.outset = {
						top:	n
					,	bottom:	n
					,	left:	n
					,	right:	n
					};
				}
				// HTML
				jQueryH.css( CSS ).css({
					height:		"100%"
				,	border:		"none"	// no border or padding allowed when using height = 100%
				,	padding:	0		// ditto
				,	margin:		0
				});
				// BODY
				if (browser.isIE6) {
					// IE6 CANNOT use the trick of setting absolute positioning on all 4 sides - must have 'height'
					jQueryN.css({
						width:		"100%"
					,	height:		"100%"
					,	border:		"none"	// no border or padding allowed when using height = 100%
					,	padding:	0		// ditto
					,	margin:		0
					,	position:	"relative"
					});
					// convert body padding to an inset option - the border cannot be measured in IE6!
					if (!o.inset) o.inset = elDims( jQueryN ).inset;
				}
				else { // use absolute positioning for BODY to allow borders & padding without overflow
					jQueryN.css({
						width:		"auto"
					,	height:		"auto"
					,	margin:		0
					,	position:	"absolute"	// allows for border and padding on BODY
					});
					// apply edge-positioning created above
					jQueryN.css( o.outset );
				}
				// set current layout-container dimensions
				jQuery.extend(sC, elDims( jQueryN, o.inset )); // passing inset means DO NOT include insetX values
			}
			else {
				// container MUST have 'position'
				var	p = jQueryN.css("position");
				if (!p || !p.match(/(fixed|absolute|relative)/))
					jQueryN.css("position","relative");

				// set current layout-container dimensions
				if ( jQueryN.is(":visible") ) {
					jQuery.extend(sC, elDims( jQueryN, o.inset )); // passing inset means DO NOT change insetX (padding) values
					if (sC.innerHeight < 1) // container has no 'height' - warn developer
						_log( o.errors.noContainerHeight.replace(/CONTAINER/, sC.ref) );
				}
			}

			// if container has min-width/height, then enable scrollbar(s)
			if ( num(jQueryN, "minWidth")  ) jQueryN.parent().css("overflowX","auto");
			if ( num(jQueryN, "minHeight") ) jQueryN.parent().css("overflowY","auto");

		} catch (ex) {}
	}

	/**
	* Bind layout hotkeys - if options enabled
	*
	* @see  _create() and addPane()
	* @param {string=}	[panes=""]	The edge(s) to process
	*/
,	initHotkeys = function (panes) {
		panes = panes ? panes.split(",") : _c.borderPanes;
		// bind keyDown to capture hotkeys, if option enabled for ANY pane
		jQuery.each(panes, function (i, pane) {
			var o = options[pane];
			if (o.enableCursorHotkey || o.customHotkey) {
				jQuery(document).bind("keydown."+ sID, keyDown); // only need to bind this ONCE
				return false; // BREAK - binding was done
			}
		});
	}

	/**
	* Build final OPTIONS data
	*
	* @see  _create()
	*/
,	initOptions = function () {
		var data, d, pane, key, val, i, c, o;

		// reprocess user's layout-options to have correct options sub-key structure
		opts = jQuery.layout.transformData( opts, true ); // panes = default subkey

		// auto-rename old options for backward compatibility
		opts = jQuery.layout.backwardCompatibility.renameAllOptions( opts );

		// if user-options has 'panes' key (pane-defaults), clean it...
		if (!jQuery.isEmptyObject(opts.panes)) {
			// REMOVE any pane-defaults that MUST be set per-pane
			data = jQuery.layout.optionsMap.noDefault;
			for (i=0, c=data.length; i<c; i++) {
				key = data[i];
				delete opts.panes[key]; // OK if does not exist
			}
			// REMOVE any layout-options specified under opts.panes
			data = jQuery.layout.optionsMap.layout;
			for (i=0, c=data.length; i<c; i++) {
				key = data[i];
				delete opts.panes[key]; // OK if does not exist
			}
		}

		// MOVE any NON-layout-options from opts-root to opts.panes
		data = jQuery.layout.optionsMap.layout;
		var rootKeys = jQuery.layout.config.optionRootKeys;
		for (key in opts) {
			val = opts[key];
			if (jQuery.inArray(key, rootKeys) < 0 && jQuery.inArray(key, data) < 0) {
				if (!opts.panes[key])
					opts.panes[key] = jQuery.isPlainObject(val) ? jQuery.extend(true, {}, val) : val;
				delete opts[key]
			}
		}

		// START by updating ALL options from opts
		jQuery.extend(true, options, opts);

		// CREATE final options (and config) for EACH pane
		jQuery.each(_c.allPanes, function (i, pane) {

			// apply 'pane-defaults' to CONFIG.[PANE]
			_c[pane] = jQuery.extend(true, {}, _c.panes, _c[pane]);

			d = options.panes;
			o = options[pane];

			// center-pane uses SOME keys in defaults.panes branch
			if (pane === 'center') {
				// ONLY copy keys from opts.panes listed in: jQuery.layout.optionsMap.center
				data = jQuery.layout.optionsMap.center;		// list of 'center-pane keys'
				for (i=0, c=data.length; i<c; i++) {	// loop the list...
					key = data[i];
					// only need to use pane-default if pane-specific value not set
					if (!opts.center[key] && (opts.panes[key] || !o[key]))
						o[key] = d[key]; // pane-default
				}
			}
			else {
				// border-panes use ALL keys in defaults.panes branch
				o = options[pane] = jQuery.extend(true, {}, d, o); // re-apply pane-specific opts AFTER pane-defaults
				createFxOptions( pane );
				// ensure all border-pane-specific base-classes exist
				if (!o.resizerClass)	o.resizerClass	= "ui-layout-resizer";
				if (!o.togglerClass)	o.togglerClass	= "ui-layout-toggler";
			}
			// ensure we have base pane-class (ALL panes)
			if (!o.paneClass) o.paneClass = "ui-layout-pane";
		});

		// update options.zIndexes if a zIndex-option specified
		var zo	= opts.zIndex
		,	z	= options.zIndexes;
		if (zo > 0) {
			z.pane_normal		= zo;
			z.content_mask		= max(zo+1, z.content_mask);	// MIN = +1
			z.resizer_normal	= max(zo+2, z.resizer_normal);	// MIN = +2
		}

		// DELETE 'panes' key now that we are done - values were copied to EACH pane
		delete options.panes;


		function createFxOptions ( pane ) {
			var	o = options[pane]
			,	d = options.panes;
			// ensure fxSettings key to avoid errors
			if (!o.fxSettings) o.fxSettings = {};
			if (!d.fxSettings) d.fxSettings = {};

			jQuery.each(["_open","_close","_size"], function (i,n) { 
				var
					sName		= "fxName"+ n
				,	sSpeed		= "fxSpeed"+ n
				,	sSettings	= "fxSettings"+ n
					// recalculate fxName according to specificity rules
				,	fxName = o[sName] =
						o[sName]	// options.west.fxName_open
					||	d[sName]	// options.panes.fxName_open
					||	o.fxName	// options.west.fxName
					||	d.fxName	// options.panes.fxName
					||	"none"		// MEANS jQuery.layout.defaults.panes.fxName == "" || false || null || 0
				,	fxExists	= jQuery.effects && (jQuery.effects[fxName] || (jQuery.effects.effect && jQuery.effects.effect[fxName]))
				;
				// validate fxName to ensure is valid effect - MUST have effect-config data in options.effects
				if (fxName === "none" || !options.effects[fxName] || !fxExists)
					fxName = o[sName] = "none"; // effect not loaded OR unrecognized fxName

				// set vars for effects subkeys to simplify logic
				var	fx		= options.effects[fxName] || {}	// effects.slide
				,	fx_all	= fx.all	|| null				// effects.slide.all
				,	fx_pane	= fx[pane]	|| null				// effects.slide.west
				;
				// create fxSpeed[_open|_close|_size]
				o[sSpeed] =
					o[sSpeed]				// options.west.fxSpeed_open
				||	d[sSpeed]				// options.west.fxSpeed_open
				||	o.fxSpeed				// options.west.fxSpeed
				||	d.fxSpeed				// options.panes.fxSpeed
				||	null					// DEFAULT - let fxSetting.duration control speed
				;
				// create fxSettings[_open|_close|_size]
				o[sSettings] = jQuery.extend(
					true
				,	{}
				,	fx_all					// effects.slide.all
				,	fx_pane					// effects.slide.west
				,	d.fxSettings			// options.panes.fxSettings
				,	o.fxSettings			// options.west.fxSettings
				,	d[sSettings]			// options.panes.fxSettings_open
				,	o[sSettings]			// options.west.fxSettings_open
				);
			});

			// DONE creating action-specific-settings for this pane,
			// so DELETE generic options - are no longer meaningful
			delete o.fxName;
			delete o.fxSpeed;
			delete o.fxSettings;
		}
	}

	/**
	* Initialize module objects, styling, size and position for all panes
	*
	* @see  _initElements()
	* @param {string}	pane		The pane to process
	*/
,	getPane = function (pane) {
		var sel = options[pane].paneSelector
		if (sel.substr(0,1)==="#") // ID selector
			// NOTE: elements selected 'by ID' DO NOT have to be 'children'
			return jQueryN.find(sel).eq(0);
		else { // class or other selector
			var jQueryP = jQueryN.children(sel).eq(0);
			// look for the pane nested inside a 'form' element
			return jQueryP.length ? jQueryP : jQueryN.children("form:first").children(sel).eq(0);
		}
	}

	/**
	* @param {Object=}		evt
	*/
,	initPanes = function (evt) {
		// stopPropagation if called by trigger("layoutinitpanes") - use evtPane utility 
		evtPane(evt);

		// NOTE: do north & south FIRST so we can measure their height - do center LAST
		jQuery.each(_c.allPanes, function (idx, pane) {
			addPane( pane, true );
		});

		// init the pane-handles NOW in case we have to hide or close the pane below
		initHandles();

		// now that all panes have been initialized and initially-sized,
		// make sure there is really enough space available for each pane
		jQuery.each(_c.borderPanes, function (i, pane) {
			if (jQueryPs[pane] && state[pane].isVisible) { // pane is OPEN
				setSizeLimits(pane);
				makePaneFit(pane); // pane may be Closed, Hidden or Resized by makePaneFit()
			}
		});
		// size center-pane AGAIN in case we 'closed' a border-pane in loop above
		sizeMidPanes("center");

		//	Chrome/Webkit sometimes fires callbacks BEFORE it completes resizing!
		//	Before RC30.3, there was a 10ms delay here, but that caused layout 
		//	to load asynchrously, which is BAD, so try skipping delay for now

		// process pane contents and callbacks, and init/resize child-layout if exists
		jQuery.each(_c.allPanes, function (idx, pane) {
			afterInitPane(pane);
		});
	}

	/**
	* Add a pane to the layout - subroutine of initPanes()
	*
	* @see  initPanes()
	* @param {string}	pane			The pane to process
	* @param {boolean=}	[force=false]	Size content after init
	*/
,	addPane = function (pane, force) {
		if (!force && !isInitialized()) return;
		var
			o		= options[pane]
		,	s		= state[pane]
		,	c		= _c[pane]
		,	dir		= c.dir
		,	fx		= s.fx
		,	spacing	= o.spacing_open || 0
		,	isCenter = (pane === "center")
		,	CSS		= {}
		,	jQueryP		= jQueryPs[pane]
		,	size, minSize, maxSize, child
		;
		// if pane-pointer already exists, remove the old one first
		if (jQueryP)
			removePane( pane, false, true, false );
		else
			jQueryCs[pane] = false; // init

		jQueryP = jQueryPs[pane] = getPane(pane);
		if (!jQueryP.length) {
			jQueryPs[pane] = false; // logic
			return;
		}

		// SAVE original Pane CSS
		if (!jQueryP.data("layoutCSS")) {
			var props = "position,top,left,bottom,right,width,height,overflow,zIndex,display,backgroundColor,padding,margin,border";
			jQueryP.data("layoutCSS", styles(jQueryP, props));
		}

		// create alias for pane data in Instance - initHandles will add more
		Instance[pane] = {
			name:		pane
		,	pane:		jQueryPs[pane]
		,	content:	jQueryCs[pane]
		,	options:	options[pane]
		,	state:		state[pane]
		,	children:	children[pane]
		};

		// add classes, attributes & events
		jQueryP	.data({
				parentLayout:	Instance		// pointer to Layout Instance
			,	layoutPane:		Instance[pane]	// NEW pointer to pane-alias-object
			,	layoutEdge:		pane
			,	layoutRole:		"pane"
			})
			.css(c.cssReq).css("zIndex", options.zIndexes.pane_normal)
			.css(o.applyDemoStyles ? c.cssDemo : {}) // demo styles
			.addClass( o.paneClass +" "+ o.paneClass+"-"+pane ) // default = "ui-layout-pane ui-layout-pane-west" - may be a dupe of 'paneSelector'
			.bind("mouseenter."+ sID, addHover )
			.bind("mouseleave."+ sID, removeHover )
			;
		var paneMethods = {
				hide:				''
			,	show:				''
			,	toggle:				''
			,	close:				''
			,	open:				''
			,	slideOpen:			''
			,	slideClose:			''
			,	slideToggle:		''
			,	size:				'sizePane'
			,	sizePane:			'sizePane'
			,	sizeContent:		''
			,	sizeHandles:		''
			,	enableClosable:		''
			,	disableClosable:	''
			,	enableSlideable:	''
			,	disableSlideable:	''
			,	enableResizable:	''
			,	disableResizable:	''
			,	swapPanes:			'swapPanes'
			,	swap:				'swapPanes'
			,	move:				'swapPanes'
			,	removePane:			'removePane'
			,	remove:				'removePane'
			,	createChildren:		''
			,	resizeChildren:		''
			,	resizeAll:			'resizeAll'
			,	resizeLayout:		'resizeAll'
			}
		,	name;
		// loop hash and bind all methods - include layoutID namespacing
		for (name in paneMethods) {
			jQueryP.bind("layoutpane"+ name.toLowerCase() +"."+ sID, Instance[ paneMethods[name] || name ]);
		}

		// see if this pane has a 'scrolling-content element'
		initContent(pane, false); // false = do NOT sizeContent() - called later

		if (!isCenter) {
			// call _parseSize AFTER applying pane classes & styles - but before making visible (if hidden)
			// if o.size is auto or not valid, then MEASURE the pane and use that as its 'size'
			size	= s.size = _parseSize(pane, o.size);
			minSize	= _parseSize(pane,o.minSize) || 1;
			maxSize	= _parseSize(pane,o.maxSize) || 100000;
			if (size > 0) size = max(min(size, maxSize), minSize);
			s.autoResize = o.autoResize; // used with percentage sizes

			// state for border-panes
			s.isClosed  = false; // true = pane is closed
			s.isSliding = false; // true = pane is currently open by 'sliding' over adjacent panes
			s.isResizing= false; // true = pane is in process of being resized
			s.isHidden	= false; // true = pane is hidden - no spacing, resizer or toggler is visible!

			// array for 'pin buttons' whose classNames are auto-updated on pane-open/-close
			if (!s.pins) s.pins = [];
		}
		//	states common to ALL panes
		s.tagName	= jQueryP[0].tagName;
		s.edge		= pane;		// useful if pane is (or about to be) 'swapped' - easy find out where it is (or is going)
		s.noRoom	= false;	// true = pane 'automatically' hidden due to insufficient room - will unhide automatically
		s.isVisible	= true;		// false = pane is invisible - closed OR hidden - simplify logic

		// init pane positioning
		setPanePosition( pane );

		// if pane is not visible, 
		if (dir === "horz") // north or south pane
			CSS.height = cssH(jQueryP, size);
		else if (dir === "vert") // east or west pane
			CSS.width = cssW(jQueryP, size);
		//else if (isCenter) {}

		jQueryP.css(CSS); // apply size -- top, bottom & height will be set by sizeMidPanes
		if (dir != "horz") sizeMidPanes(pane, true); // true = skipCallback

		// if manually adding a pane AFTER layout initialization, then...
		if (state.initialized) {
			initHandles( pane );
			initHotkeys( pane );
		}

		// close or hide the pane if specified in settings
		if (o.initClosed && o.closable && !o.initHidden)
			close(pane, true, true); // true, true = force, noAnimation
		else if (o.initHidden || o.initClosed)
			hide(pane); // will be completely invisible - no resizer or spacing
		else if (!s.noRoom)
			// make the pane visible - in case was initially hidden
			jQueryP.css("display","block");
		// ELSE setAsOpen() - called later by initHandles()

		// RESET visibility now - pane will appear IF display:block
		jQueryP.css("visibility","visible");

		// check option for auto-handling of pop-ups & drop-downs
		if (o.showOverflowOnHover)
			jQueryP.hover( allowOverflow, resetOverflow );

		// if manually adding a pane AFTER layout initialization, then...
		if (state.initialized) {
			afterInitPane( pane );
		}
	}

,	afterInitPane = function (pane) {
		var	jQueryP	= jQueryPs[pane]
		,	s	= state[pane]
		,	o	= options[pane]
		;
		if (!jQueryP) return;

		// see if there is a directly-nested layout inside this pane
		if (jQueryP.data("layout"))
			refreshChildren( pane, jQueryP.data("layout") );

		// process pane contents and callbacks, and init/resize child-layout if exists
		if (s.isVisible) { // pane is OPEN
			if (state.initialized) // this pane was added AFTER layout was created
				resizeAll(); // will also sizeContent
			else
				sizeContent(pane);

			if (o.triggerEventsOnLoad)
				_runCallbacks("onresize_end", pane);
			else // automatic if onresize called, otherwise call it specifically
				// resize child - IF inner-layout already exists (created before this layout)
				resizeChildren(pane, true); // a previously existing childLayout
		}

		// init childLayouts - even if pane is not visible
		if (o.initChildren && o.children)
			createChildren(pane);
	}

	/**
	* @param {string=}	panes		The pane(s) to process
	*/
,	setPanePosition = function (panes) {
		panes = panes ? panes.split(",") : _c.borderPanes;

		// create toggler DIVs for each pane, and set object pointers for them, eg: jQueryR.north = north toggler DIV
		jQuery.each(panes, function (i, pane) {
			var jQueryP	= jQueryPs[pane]
			,	jQueryR	= jQueryRs[pane]
			,	o	= options[pane]
			,	s	= state[pane]
			,	side =  _c[pane].side
			,	CSS	= {}
			;
			if (!jQueryP) return; // pane does not exist - skip

			// set css-position to account for container borders & padding
			switch (pane) {
				case "north": 	CSS.top 	= sC.inset.top;
								CSS.left 	= sC.inset.left;
								CSS.right	= sC.inset.right;
								break;
				case "south": 	CSS.bottom	= sC.inset.bottom;
								CSS.left 	= sC.inset.left;
								CSS.right 	= sC.inset.right;
								break;
				case "west": 	CSS.left 	= sC.inset.left; // top, bottom & height set by sizeMidPanes()
								break;
				case "east": 	CSS.right 	= sC.inset.right; // ditto
								break;
				case "center":	// top, left, width & height set by sizeMidPanes()
			}
			// apply position
			jQueryP.css(CSS); 

			// update resizer position
			if (jQueryR && s.isClosed)
				jQueryR.css(side, sC.inset[side]);
			else if (jQueryR && !s.isHidden)
				jQueryR.css(side, sC.inset[side] + getPaneSize(pane));
		});
	}

	/**
	* Initialize module objects, styling, size and position for all resize bars and toggler buttons
	*
	* @see  _create()
	* @param {string=}	[panes=""]	The edge(s) to process
	*/
,	initHandles = function (panes) {
		panes = panes ? panes.split(",") : _c.borderPanes;

		// create toggler DIVs for each pane, and set object pointers for them, eg: jQueryR.north = north toggler DIV
		jQuery.each(panes, function (i, pane) {
			var jQueryP		= jQueryPs[pane];
			jQueryRs[pane]	= false; // INIT
			jQueryTs[pane]	= false;
			if (!jQueryP) return; // pane does not exist - skip

			var	o		= options[pane]
			,	s		= state[pane]
			,	c		= _c[pane]
			,	paneId	= o.paneSelector.substr(0,1) === "#" ? o.paneSelector.substr(1) : ""
			,	rClass	= o.resizerClass
			,	tClass	= o.togglerClass
			,	spacing	= (s.isVisible ? o.spacing_open : o.spacing_closed)
			,	_pane	= "-"+ pane // used for classNames
			,	_state	= (s.isVisible ? "-open" : "-closed") // used for classNames
			,	I		= Instance[pane]
				// INIT RESIZER BAR
			,	jQueryR		= I.resizer = jQueryRs[pane] = jQuery("<div></div>")
				// INIT TOGGLER BUTTON
			,	jQueryT		= I.toggler = (o.closable ? jQueryTs[pane] = jQuery("<div></div>") : false)
			;

			//if (s.isVisible && o.resizable) ... handled by initResizable
			if (!s.isVisible && o.slidable)
				jQueryR.attr("title", o.tips.Slide).css("cursor", o.sliderCursor);

			jQueryR	// if paneSelector is an ID, then create a matching ID for the resizer, eg: "#paneLeft" => "paneLeft-resizer"
				.attr("id", paneId ? paneId +"-resizer" : "" )
				.data({
					parentLayout:	Instance
				,	layoutPane:		Instance[pane]	// NEW pointer to pane-alias-object
				,	layoutEdge:		pane
				,	layoutRole:		"resizer"
				})
				.css(_c.resizers.cssReq).css("zIndex", options.zIndexes.resizer_normal)
				.css(o.applyDemoStyles ? _c.resizers.cssDemo : {}) // add demo styles
				.addClass(rClass +" "+ rClass+_pane)
				.hover(addHover, removeHover) // ALWAYS add hover-classes, even if resizing is not enabled - handle with CSS instead
				.hover(onResizerEnter, onResizerLeave) // ALWAYS NEED resizer.mouseleave to balance toggler.mouseenter
				.appendTo(jQueryN) // append DIV to container
			;
			if (o.resizerDblClickToggle)
				jQueryR.bind("dblclick."+ sID, toggle );

			if (jQueryT) {
				jQueryT	// if paneSelector is an ID, then create a matching ID for the resizer, eg: "#paneLeft" => "#paneLeft-toggler"
					.attr("id", paneId ? paneId +"-toggler" : "" )
					.data({
						parentLayout:	Instance
					,	layoutPane:		Instance[pane]	// NEW pointer to pane-alias-object
					,	layoutEdge:		pane
					,	layoutRole:		"toggler"
					})
					.css(_c.togglers.cssReq) // add base/required styles
					.css(o.applyDemoStyles ? _c.togglers.cssDemo : {}) // add demo styles
					.addClass(tClass +" "+ tClass+_pane)
					.hover(addHover, removeHover) // ALWAYS add hover-classes, even if toggling is not enabled - handle with CSS instead
					.bind("mouseenter", onResizerEnter) // NEED toggler.mouseenter because mouseenter MAY NOT fire on resizer
					.appendTo(jQueryR) // append SPAN to resizer DIV
				;
				// ADD INNER-SPANS TO TOGGLER
				if (o.togglerContent_open) // ui-layout-open
					jQuery("<span>"+ o.togglerContent_open +"</span>")
						.data({
							layoutEdge:		pane
						,	layoutRole:		"togglerContent"
						})
						.data("layoutRole", "togglerContent")
						.data("layoutEdge", pane)
						.addClass("content content-open")
						.css("display","none")
						.appendTo( jQueryT )
						//.hover( addHover, removeHover ) // use ui-layout-toggler-west-hover .content-open instead!
					;
				if (o.togglerContent_closed) // ui-layout-closed
					jQuery("<span>"+ o.togglerContent_closed +"</span>")
						.data({
							layoutEdge:		pane
						,	layoutRole:		"togglerContent"
						})
						.addClass("content content-closed")
						.css("display","none")
						.appendTo( jQueryT )
						//.hover( addHover, removeHover ) // use ui-layout-toggler-west-hover .content-closed instead!
					;
				// ADD TOGGLER.click/.hover
				enableClosable(pane);
			}

			// add Draggable events
			initResizable(pane);

			// ADD CLASSNAMES & SLIDE-BINDINGS - eg: class="resizer resizer-west resizer-open"
			if (s.isVisible)
				setAsOpen(pane);	// onOpen will be called, but NOT onResize
			else {
				setAsClosed(pane);	// onClose will be called
				bindStartSlidingEvents(pane, true); // will enable events IF option is set
			}

		});

		// SET ALL HANDLE DIMENSIONS
		sizeHandles();
	}


	/**
	* Initialize scrolling ui-layout-content div - if exists
	*
	* @see  initPane() - or externally after an Ajax injection
	* @param {string}	pane			The pane to process
	* @param {boolean=}	[resize=true]	Size content after init
	*/
,	initContent = function (pane, resize) {
		if (!isInitialized()) return;
		var 
			o	= options[pane]
		,	sel	= o.contentSelector
		,	I	= Instance[pane]
		,	jQueryP	= jQueryPs[pane]
		,	jQueryC
		;
		if (sel) jQueryC = I.content = jQueryCs[pane] = (o.findNestedContent)
			? jQueryP.find(sel).eq(0) // match 1-element only
			: jQueryP.children(sel).eq(0)
		;
		if (jQueryC && jQueryC.length) {
			jQueryC.data("layoutRole", "content");
			// SAVE original Content CSS
			if (!jQueryC.data("layoutCSS"))
				jQueryC.data("layoutCSS", styles(jQueryC, "height"));
			jQueryC.css( _c.content.cssReq );
			if (o.applyDemoStyles) {
				jQueryC.css( _c.content.cssDemo ); // add padding & overflow: auto to content-div
				jQueryP.css( _c.content.cssDemoPane ); // REMOVE padding/scrolling from pane
			}
			// ensure no vertical scrollbar on pane - will mess up measurements
			if (jQueryP.css("overflowX").match(/(scroll|auto)/)) {
				jQueryP.css("overflow", "hidden");
			}
			state[pane].content = {}; // init content state
			if (resize !== false) sizeContent(pane);
			// sizeContent() is called AFTER init of all elements
		}
		else
			I.content = jQueryCs[pane] = false;
	}


	/**
	* Add resize-bars to all panes that specify it in options
	* -dependancy: jQuery.fn.resizable - will skip if not found
	*
	* @see  _create()
	* @param {string=}	[panes=""]	The edge(s) to process
	*/
,	initResizable = function (panes) {
		var	draggingAvailable = jQuery.layout.plugins.draggable
		,	side // set in start()
		;
		panes = panes ? panes.split(",") : _c.borderPanes;

		jQuery.each(panes, function (idx, pane) {
			var o = options[pane];
			if (!draggingAvailable || !jQueryPs[pane] || !o.resizable) {
				o.resizable = false;
				return true; // skip to next
			}

			var s		= state[pane]
			,	z		= options.zIndexes
			,	c		= _c[pane]
			,	side	= c.dir=="horz" ? "top" : "left"
			,	jQueryP 		= jQueryPs[pane]
			,	jQueryR		= jQueryRs[pane]
			,	base	= o.resizerClass
			,	lastPos	= 0 // used when live-resizing
			,	r, live // set in start because may change
			//	'drag' classes are applied to the ORIGINAL resizer-bar while dragging is in process
			,	resizerClass		= base+"-drag"				// resizer-drag
			,	resizerPaneClass	= base+"-"+pane+"-drag"		// resizer-north-drag
			//	'helper' class is applied to the CLONED resizer-bar while it is being dragged
			,	helperClass			= base+"-dragging"			// resizer-dragging
			,	helperPaneClass		= base+"-"+pane+"-dragging" // resizer-north-dragging
			,	helperLimitClass	= base+"-dragging-limit"	// resizer-drag
			,	helperPaneLimitClass = base+"-"+pane+"-dragging-limit"	// resizer-north-drag
			,	helperClassesSet	= false 					// logic var
			;

			if (!s.isClosed)
				jQueryR.attr("title", o.tips.Resize)
				  .css("cursor", o.resizerCursor); // n-resize, s-resize, etc

			jQueryR.draggable({
				containment:	jQueryN[0] // limit resizing to layout container
			,	axis:			(c.dir=="horz" ? "y" : "x") // limit resizing to horz or vert axis
			,	delay:			0
			,	distance:		1
			,	grid:			o.resizingGrid
			//	basic format for helper - style it using class: .ui-draggable-dragging
			,	helper:			"clone"
			,	opacity:		o.resizerDragOpacity
			,	addClasses:		false // avoid ui-state-disabled class when disabled
			//,	iframeFix:		o.draggableIframeFix // TODO: consider using when bug is fixed
			,	zIndex:			z.resizer_drag

			,	start: function (e, ui) {
					// REFRESH options & state pointers in case we used swapPanes
					o = options[pane];
					s = state[pane];
					// re-read options
					live = o.livePaneResizing;

					// ondrag_start callback - will CANCEL hide if returns false
					// TODO: dragging CANNOT be cancelled like this, so see if there is a way?
					if (false === _runCallbacks("ondrag_start", pane)) return false;

					s.isResizing		= true; // prevent pane from closing while resizing
					state.paneResizing	= pane; // easy to see if ANY pane is resizing
					timer.clear(pane+"_closeSlider"); // just in case already triggered

					// SET RESIZER LIMITS - used in drag()
					setSizeLimits(pane); // update pane/resizer state
					r = s.resizerPosition;
					lastPos = ui.position[ side ]

					jQueryR.addClass( resizerClass +" "+ resizerPaneClass ); // add drag classes
					helperClassesSet = false; // reset logic var - see drag()

					// DISABLE TEXT SELECTION (probably already done by resizer.mouseOver)
					jQuery('body').disableSelection(); 

					// MASK PANES CONTAINING IFRAMES, APPLETS OR OTHER TROUBLESOME ELEMENTS
					showMasks( pane, { resizing: true });
				}

			,	drag: function (e, ui) {
					if (!helperClassesSet) { // can only add classes after clone has been added to the DOM
						//jQuery(".ui-draggable-dragging")
						ui.helper
							.addClass( helperClass +" "+ helperPaneClass ) // add helper classes
							.css({ right: "auto", bottom: "auto" })	// fix dir="rtl" issue
							.children().css("visibility","hidden")	// hide toggler inside dragged resizer-bar
						;
						helperClassesSet = true;
						// draggable bug!? RE-SET zIndex to prevent E/W resize-bar showing through N/S pane!
						if (s.isSliding) jQueryPs[pane].css("zIndex", z.pane_sliding);
					}
					// CONTAIN RESIZER-BAR TO RESIZING LIMITS
					var limit = 0;
					if (ui.position[side] < r.min) {
						ui.position[side] = r.min;
						limit = -1;
					}
					else if (ui.position[side] > r.max) {
						ui.position[side] = r.max;
						limit = 1;
					}
					// ADD/REMOVE dragging-limit CLASS
					if (limit) {
						ui.helper.addClass( helperLimitClass +" "+ helperPaneLimitClass ); // at dragging-limit
						window.defaultStatus = (limit>0 && pane.match(/(north|west)/)) || (limit<0 && pane.match(/(south|east)/)) ? o.tips.maxSizeWarning : o.tips.minSizeWarning;
					}
					else {
						ui.helper.removeClass( helperLimitClass +" "+ helperPaneLimitClass ); // not at dragging-limit
						window.defaultStatus = "";
					}
					// DYNAMICALLY RESIZE PANES IF OPTION ENABLED
					// won't trigger unless resizer has actually moved!
					if (live && Math.abs(ui.position[side] - lastPos) >= o.liveResizingTolerance) {
						lastPos = ui.position[side];
						resizePanes(e, ui, pane)
					}
				}

			,	stop: function (e, ui) {
					jQuery('body').enableSelection(); // RE-ENABLE TEXT SELECTION
					window.defaultStatus = ""; // clear 'resizing limit' message from statusbar
					jQueryR.removeClass( resizerClass +" "+ resizerPaneClass ); // remove drag classes from Resizer
					s.isResizing		= false;
					state.paneResizing	= false; // easy to see if ANY pane is resizing
					resizePanes(e, ui, pane, true); // true = resizingDone
				}

			});
		});

		/**
		* resizePanes
		*
		* Sub-routine called from stop() - and drag() if livePaneResizing
		*
		* @param {!Object}		evt
		* @param {!Object}		ui
		* @param {string}		pane
		* @param {boolean=}		[resizingDone=false]
		*/
		var resizePanes = function (evt, ui, pane, resizingDone) {
			var	dragPos	= ui.position
			,	c		= _c[pane]
			,	o		= options[pane]
			,	s		= state[pane]
			,	resizerPos
			;
			switch (pane) {
				case "north":	resizerPos = dragPos.top; break;
				case "west":	resizerPos = dragPos.left; break;
				case "south":	resizerPos = sC.layoutHeight - dragPos.top  - o.spacing_open; break;
				case "east":	resizerPos = sC.layoutWidth  - dragPos.left - o.spacing_open; break;
			};
			// remove container margin from resizer position to get the pane size
			var newSize = resizerPos - sC.inset[c.side];

			// Disable OR Resize Mask(s) created in drag.start
			if (!resizingDone) {
				// ensure we meet liveResizingTolerance criteria
				if (Math.abs(newSize - s.size) < o.liveResizingTolerance)
					return; // SKIP resize this time
				// resize the pane
				manualSizePane(pane, newSize, false, true); // true = noAnimation
				sizeMasks(); // resize all visible masks
			}
			else { // resizingDone
				// ondrag_end callback
				if (false !== _runCallbacks("ondrag_end", pane))
					manualSizePane(pane, newSize, false, true); // true = noAnimation
				hideMasks(true); // true = force hiding all masks even if one is 'sliding'
				if (s.isSliding) // RE-SHOW 'object-masks' so objects won't show through sliding pane
					showMasks( pane, { resizing: true });
			}
		};
	}

	/**
	*	sizeMask
	*
	*	Needed to overlay a DIV over an IFRAME-pane because mask CANNOT be *inside* the pane
	*	Called when mask created, and during livePaneResizing
	*/
,	sizeMask = function () {
		var jQueryM		= jQuery(this)
		,	pane	= jQueryM.data("layoutMask") // eg: "west"
		,	s		= state[pane]
		;
		// only masks over an IFRAME-pane need manual resizing
		if (s.tagName == "IFRAME" && s.isVisible) // no need to mask closed/hidden panes
			jQueryM.css({
				top:	s.offsetTop
			,	left:	s.offsetLeft
			,	width:	s.outerWidth
			,	height:	s.outerHeight
			});
		/* ALT Method...
		var jQueryP = jQueryPs[pane];
		jQueryM.css( jQueryP.position() ).css({ width: jQueryP[0].offsetWidth, height: jQueryP[0].offsetHeight });
		*/
	}
,	sizeMasks = function () {
		jQueryMs.each( sizeMask ); // resize all 'visible' masks
	}

	/**
	* @param {string}	pane		The pane being resized, animated or isSliding
	* @param {Object=}	[args]		(optional) Options: which masks to apply, and to which panes
	*/
,	showMasks = function (pane, args) {
		var	c		= _c[pane]
		,	panes	=  ["center"]
		,	z		= options.zIndexes
		,	a		= jQuery.extend({
						objectsOnly:	false
					,	animation:		false
					,	resizing:		true
					,	sliding:		state[pane].isSliding
					},	args )
		,	o, s
		;
		if (a.resizing)
			panes.push( pane );
		if (a.sliding)
			panes.push( _c.oppositeEdge[pane] ); // ADD the oppositeEdge-pane

		if (c.dir === "horz") {
			panes.push("west");
			panes.push("east");
		}

		jQuery.each(panes, function(i,p){
			s = state[p];
			o = options[p];
			if (s.isVisible && ( o.maskObjects || (!a.objectsOnly && o.maskContents) )) {
				getMasks(p).each(function(){
					sizeMask.call(this);
					this.style.zIndex = s.isSliding ? z.pane_sliding+1 : z.pane_normal+1
					this.style.display = "block";
				});
			}
		});
	}

	/**
	* @param {boolean=}	force		Hide masks even if a pane is sliding
	*/
,	hideMasks = function (force) {
		// ensure no pane is resizing - could be a timing issue
		if (force || !state.paneResizing) {
			jQueryMs.hide(); // hide ALL masks
		}
		// if ANY pane is sliding, then DO NOT remove masks from panes with maskObjects enabled
		else if (!force && !jQuery.isEmptyObject( state.panesSliding )) {
			var	i = jQueryMs.length - 1
			,	p, jQueryM;
			for (; i >= 0; i--) {
				jQueryM	= jQueryMs.eq(i);
				p	= jQueryM.data("layoutMask");
				if (!options[p].maskObjects) {
					jQueryM.hide();
				}
			}
		}
	}

	/**
	* @param {string}	pane
	*/
,	getMasks = function (pane) {
		var jQueryMasks	= jQuery([])
		,	jQueryM, i = 0, c = jQueryMs.length
		;
		for (; i<c; i++) {
			jQueryM = jQueryMs.eq(i);
			if (jQueryM.data("layoutMask") === pane)
				jQueryMasks = jQueryMasks.add( jQueryM );
		}
		if (jQueryMasks.length)
			return jQueryMasks;
		else
			return createMasks(pane);
	}

	/**
	* createMasks
	*
	* Generates both DIV (ALWAYS used) and IFRAME (optional) elements as masks
	* An IFRAME mask is created *under* the DIV when maskObjects=true, because a DIV cannot mask an applet
	*
	* @param {string}	pane
	*/
,	createMasks = function (pane) {
		var
			jQueryP		= jQueryPs[pane]
		,	s		= state[pane]
		,	o		= options[pane]
		,	z		= options.zIndexes
		//,	objMask	= o.maskObjects && s.tagName != "IFRAME" // check for option
		,	jQueryMasks	= jQuery([])
		,	isIframe, el, jQueryM, css, i
		;
		if (!o.maskContents && !o.maskObjects) return jQueryMasks;
		// if o.maskObjects=true, then loop TWICE to create BOTH kinds of mask, else only create a DIV
		for (i=0; i < (o.maskObjects ? 2 : 1); i++) {
			isIframe = o.maskObjects && i==0;
			el = document.createElement( isIframe ? "iframe" : "div" );
			jQueryM = jQuery(el).data("layoutMask", pane); // add data to relate mask to pane
			el.className = "ui-layout-mask ui-layout-mask-"+ pane; // for user styling
			css = el.style;
			// styles common to both DIVs and IFRAMES
			css.display		= "block";
			css.position	= "absolute";
			css.background	= "#FFF";
			if (isIframe) { // IFRAME-only props
				el.frameborder = 0;
				el.src		= "about:blank";
				//el.allowTransparency = true; - for IE, but breaks masking ability!
				css.opacity	= 0;
				css.filter	= "Alpha(Opacity='0')";
				css.border	= 0;
			}
			// if pane is an IFRAME, then must mask the pane itself
			if (s.tagName == "IFRAME") {
				// NOTE sizing done by a subroutine so can be called during live-resizing
				css.zIndex	= z.pane_normal+1; // 1-higher than pane
				jQueryN.append( el ); // append to LAYOUT CONTAINER
			}
			// otherwise put masks *inside the pane* to mask its contents
			else {
				jQueryM.addClass("ui-layout-mask-inside-pane");
				css.zIndex	= o.maskZindex || z.content_mask; // usually 1, but customizable
				css.top		= 0;
				css.left	= 0;
				css.width	= "100%";
				css.height	= "100%";
				jQueryP.append( el ); // append INSIDE pane element
			}
			// add to return object
			jQueryMasks = jQueryMasks.add( el );
			// add Mask to cached array so can be resized & reused
			jQueryMs = jQueryMs.add( el );
		}
		return jQueryMasks;
	}


	/**
	* Destroy this layout and reset all elements
	*
	* @param {boolean=}	[destroyChildren=false]		Destory Child-Layouts first?
	*/
,	destroy = function (evt_or_destroyChildren, destroyChildren) {
		// UNBIND layout events and remove global object
		jQuery(window).unbind("."+ sID);		// resize & unload
		jQuery(document).unbind("."+ sID);	// keyDown (hotkeys)

		if (typeof evt_or_destroyChildren === "object")
			// stopPropagation if called by trigger("layoutdestroy") - use evtPane utility 
			evtPane(evt_or_destroyChildren);
		else // no event, so transfer 1st param to destroyChildren param
			destroyChildren = evt_or_destroyChildren;

		// need to look for parent layout BEFORE we remove the container data, else skips a level
		//var parentPane = Instance.hasParentLayout ? jQuery.layout.getParentPaneInstance( jQueryN ) : null;

		// reset layout-container
		jQueryN	.clearQueue()
			.removeData("layout")
			.removeData("layoutContainer")
			.removeClass(options.containerClass)
			.unbind("."+ sID) // remove ALL Layout events
		;

		// remove all mask elements that have been created
		jQueryMs.remove();

		// loop all panes to remove layout classes, attributes and bindings
		jQuery.each(_c.allPanes, function (i, pane) {
			removePane( pane, false, true, destroyChildren ); // true = skipResize
		});

		// do NOT reset container CSS if is a 'pane' (or 'content') in an outer-layout - ie, THIS layout is 'nested'
		var css = "layoutCSS";
		if (jQueryN.data(css) && !jQueryN.data("layoutRole")) // RESET CSS
			jQueryN.css( jQueryN.data(css) ).removeData(css);

		// for full-page layouts, also reset the <HTML> CSS
		if (sC.tagName === "BODY" && (jQueryN = jQuery("html")).data(css)) // RESET <HTML> CSS
			jQueryN.css( jQueryN.data(css) ).removeData(css);

		// trigger plugins for this layout, if there are any
		runPluginCallbacks( Instance, jQuery.layout.onDestroy );

		// trigger state-management and onunload callback
		unload();

		// clear the Instance of everything except for container & options (so could recreate)
		// RE-CREATE: myLayout = myLayout.container.layout( myLayout.options );
		for (var n in Instance)
			if (!n.match(/^(container|options)jQuery/)) delete Instance[ n ];
		// add a 'destroyed' flag to make it easy to check
		Instance.destroyed = true;

		// if this is a child layout, CLEAR the child-pointer in the parent
		/* for now the pointer REMAINS, but with only container, options and destroyed keys
		if (parentPane) {
			var layout	= parentPane.pane.data("parentLayout")
			,	key		= layout.options.instanceKey || 'error';
			// THIS SYNTAX MAY BE WRONG!
			parentPane.children[key] = layout.children[ parentPane.name ].children[key] = null;
		}
		*/

		return Instance; // for coding convenience
	}

	/**
	* Remove a pane from the layout - subroutine of destroy()
	*
	* @see  destroy()
	* @param {(string|Object)}	evt_or_pane			The pane to process
	* @param {boolean=}			[remove=false]		Remove the DOM element?
	* @param {boolean=}			[skipResize=false]	Skip calling resizeAll()?
	* @param {boolean=}			[destroyChild=true]	Destroy Child-layouts? If not passed, obeys options setting
	*/
,	removePane = function (evt_or_pane, remove, skipResize, destroyChild) {
		if (!isInitialized()) return;
		var	pane = evtPane.call(this, evt_or_pane)
		,	jQueryP	= jQueryPs[pane]
		,	jQueryC	= jQueryCs[pane]
		,	jQueryR	= jQueryRs[pane]
		,	jQueryT	= jQueryTs[pane]
		;
		// NOTE: elements can still exist even after remove()
		//		so check for missing data(), which is cleared by removed()
		if (jQueryP && jQuery.isEmptyObject( jQueryP.data() )) jQueryP = false;
		if (jQueryC && jQuery.isEmptyObject( jQueryC.data() )) jQueryC = false;
		if (jQueryR && jQuery.isEmptyObject( jQueryR.data() )) jQueryR = false;
		if (jQueryT && jQuery.isEmptyObject( jQueryT.data() )) jQueryT = false;

		if (jQueryP) jQueryP.stop(true, true);

		var	o	= options[pane]
		,	s	= state[pane]
		,	d	= "layout"
		,	css	= "layoutCSS"
		,	pC	= children[pane]
		,	hasChildren	= jQuery.isPlainObject( pC ) && !jQuery.isEmptyObject( pC )
		,	destroy		= destroyChild !== undefined ? destroyChild : o.destroyChildren
		;
		// FIRST destroy the child-layout(s)
		if (hasChildren && destroy) {
			jQuery.each( pC, function (key, child) {
				if (!child.destroyed)
					child.destroy(true);// tell child-layout to destroy ALL its child-layouts too
				if (child.destroyed)	// destroy was successful
					delete pC[key];
			});
			// if no more children, remove the children hash
			if (jQuery.isEmptyObject( pC )) {
				pC = children[pane] = null; // clear children hash
				hasChildren = false;
			}
		}

		// Note: can't 'remove' a pane element with non-destroyed children
		if (jQueryP && remove && !hasChildren)
			jQueryP.remove(); // remove the pane-element and everything inside it
		else if (jQueryP && jQueryP[0]) {
			//	create list of ALL pane-classes that need to be removed
			var	root	= o.paneClass // default="ui-layout-pane"
			,	pRoot	= root +"-"+ pane // eg: "ui-layout-pane-west"
			,	_open	= "-open"
			,	_sliding= "-sliding"
			,	_closed	= "-closed"
			,	classes	= [	root, root+_open, root+_closed, root+_sliding,		// generic classes
							pRoot, pRoot+_open, pRoot+_closed, pRoot+_sliding ]	// pane-specific classes
			;
			jQuery.merge(classes, getHoverClasses(jQueryP, true)); // ADD hover-classes
			// remove all Layout classes from pane-element
			jQueryP	.removeClass( classes.join(" ") ) // remove ALL pane-classes
				.removeData("parentLayout")
				.removeData("layoutPane")
				.removeData("layoutRole")
				.removeData("layoutEdge")
				.removeData("autoHidden")	// in case set
				.unbind("."+ sID) // remove ALL Layout events
				// TODO: remove these extra unbind commands when jQuery is fixed
				//.unbind("mouseenter"+ sID)
				//.unbind("mouseleave"+ sID)
			;
			// do NOT reset CSS if this pane/content is STILL the container of a nested layout!
			// the nested layout will reset its 'container' CSS when/if it is destroyed
			if (hasChildren && jQueryC) {
				// a content-div may not have a specific width, so give it one to contain the Layout
				jQueryC.width( jQueryC.width() );
				jQuery.each( pC, function (key, child) {
					child.resizeAll(); // resize the Layout
				});
			}
			else if (jQueryC)
				jQueryC.css( jQueryC.data(css) ).removeData(css).removeData("layoutRole");
			// remove pane AFTER content in case there was a nested layout
			if (!jQueryP.data(d))
				jQueryP.css( jQueryP.data(css) ).removeData(css);
		}

		// REMOVE pane resizer and toggler elements
		if (jQueryT) jQueryT.remove();
		if (jQueryR) jQueryR.remove();

		// CLEAR all pointers and state data
		Instance[pane] = jQueryPs[pane] = jQueryCs[pane] = jQueryRs[pane] = jQueryTs[pane] = false;
		s = { removed: true };

		if (!skipResize)
			resizeAll();
	}


/*
 * ###########################
 *	   ACTION METHODS
 * ###########################
 */

	/**
	* @param {string}	pane
	*/
,	_hidePane = function (pane) {
		var jQueryP	= jQueryPs[pane]
		,	o	= options[pane]
		,	s	= jQueryP[0].style
		;
		if (o.useOffscreenClose) {
			if (!jQueryP.data(_c.offscreenReset))
				jQueryP.data(_c.offscreenReset, { left: s.left, right: s.right });
			jQueryP.css( _c.offscreenCSS );
		}
		else
			jQueryP.hide().removeData(_c.offscreenReset);
	}

	/**
	* @param {string}	pane
	*/
,	_showPane = function (pane) {
		var jQueryP	= jQueryPs[pane]
		,	o	= options[pane]
		,	off	= _c.offscreenCSS
		,	old	= jQueryP.data(_c.offscreenReset)
		,	s	= jQueryP[0].style
		;
		jQueryP	.show() // ALWAYS show, just in case
			.removeData(_c.offscreenReset);
		if (o.useOffscreenClose && old) {
			if (s.left == off.left)
				s.left = old.left;
			if (s.right == off.right)
				s.right = old.right;
		}
	}


	/**
	* Completely 'hides' a pane, including its spacing - as if it does not exist
	* The pane is not actually 'removed' from the source, so can use 'show' to un-hide it
	*
	* @param {(string|Object)}	evt_or_pane			The pane being hidden, ie: north, south, east, or west
	* @param {boolean=}			[noAnimation=false]	
	*/
,	hide = function (evt_or_pane, noAnimation) {
		if (!isInitialized()) return;
		var	pane = evtPane.call(this, evt_or_pane)
		,	o	= options[pane]
		,	s	= state[pane]
		,	jQueryP	= jQueryPs[pane]
		,	jQueryR	= jQueryRs[pane]
		;
		if (!jQueryP || s.isHidden) return; // pane does not exist OR is already hidden

		// onhide_start callback - will CANCEL hide if returns false
		if (state.initialized && false === _runCallbacks("onhide_start", pane)) return;

		s.isSliding = false; // just in case
		delete state.panesSliding[pane];

		// now hide the elements
		if (jQueryR) jQueryR.hide(); // hide resizer-bar
		if (!state.initialized || s.isClosed) {
			s.isClosed = true; // to trigger open-animation on show()
			s.isHidden  = true;
			s.isVisible = false;
			if (!state.initialized)
				_hidePane(pane); // no animation when loading page
			sizeMidPanes(_c[pane].dir === "horz" ? "" : "center");
			if (state.initialized || o.triggerEventsOnLoad)
				_runCallbacks("onhide_end", pane);
		}
		else {
			s.isHiding = true; // used by onclose
			close(pane, false, noAnimation); // adjust all panes to fit
		}
	}

	/**
	* Show a hidden pane - show as 'closed' by default unless openPane = true
	*
	* @param {(string|Object)}	evt_or_pane			The pane being opened, ie: north, south, east, or west
	* @param {boolean=}			[openPane=false]
	* @param {boolean=}			[noAnimation=false]
	* @param {boolean=}			[noAlert=false]
	*/
,	show = function (evt_or_pane, openPane, noAnimation, noAlert) {
		if (!isInitialized()) return;
		var	pane = evtPane.call(this, evt_or_pane)
		,	o	= options[pane]
		,	s	= state[pane]
		,	jQueryP	= jQueryPs[pane]
		,	jQueryR	= jQueryRs[pane]
		;
		if (!jQueryP || !s.isHidden) return; // pane does not exist OR is not hidden

		// onshow_start callback - will CANCEL show if returns false
		if (false === _runCallbacks("onshow_start", pane)) return;

		s.isShowing = true; // used by onopen/onclose
		//s.isHidden  = false; - will be set by open/close - if not cancelled
		s.isSliding = false; // just in case
		delete state.panesSliding[pane];

		// now show the elements
		//if (jQueryR) jQueryR.show(); - will be shown by open/close
		if (openPane === false)
			close(pane, true); // true = force
		else
			open(pane, false, noAnimation, noAlert); // adjust all panes to fit
	}


	/**
	* Toggles a pane open/closed by calling either open or close
	*
	* @param {(string|Object)}	evt_or_pane		The pane being toggled, ie: north, south, east, or west
	* @param {boolean=}			[slide=false]
	*/
,	toggle = function (evt_or_pane, slide) {
		if (!isInitialized()) return;
		var	evt		= evtObj(evt_or_pane)
		,	pane	= evtPane.call(this, evt_or_pane)
		,	s		= state[pane]
		;
		if (evt) // called from to jQueryR.dblclick OR triggerPaneEvent
			evt.stopImmediatePropagation();
		if (s.isHidden)
			show(pane); // will call 'open' after unhiding it
		else if (s.isClosed)
			open(pane, !!slide);
		else
			close(pane);
	}


	/**
	* Utility method used during init or other auto-processes
	*
	* @param {string}	pane   The pane being closed
	* @param {boolean=}	[setHandles=false]
	*/
,	_closePane = function (pane, setHandles) {
		var
			jQueryP	= jQueryPs[pane]
		,	s	= state[pane]
		;
		_hidePane(pane);
		s.isClosed = true;
		s.isVisible = false;
		if (setHandles) setAsClosed(pane);
	}

	/**
	* Close the specified pane (animation optional), and resize all other panes as needed
	*
	* @param {(string|Object)}	evt_or_pane			The pane being closed, ie: north, south, east, or west
	* @param {boolean=}			[force=false]
	* @param {boolean=}			[noAnimation=false]
	* @param {boolean=}			[skipCallback=false]
	*/
,	close = function (evt_or_pane, force, noAnimation, skipCallback) {
		var	pane = evtPane.call(this, evt_or_pane);
		// if pane has been initialized, but NOT the complete layout, close pane instantly
		if (!state.initialized && jQueryPs[pane]) {
			_closePane(pane, true); // INIT pane as closed
			return;
		}
		if (!isInitialized()) return;

		var
			jQueryP	= jQueryPs[pane]
		,	jQueryR	= jQueryRs[pane]
		,	jQueryT	= jQueryTs[pane]
		,	o	= options[pane]
		,	s	= state[pane]
		,	c	= _c[pane]
		,	doFX, isShowing, isHiding, wasSliding;

		// QUEUE in case another action/animation is in progress
		jQueryN.queue(function( queueNext ){

			if ( !jQueryP
			||	(!o.closable && !s.isShowing && !s.isHiding)	// invalid request // (!o.resizable && !o.closable) ???
			||	(!force && s.isClosed && !s.isShowing)			// already closed
			) return queueNext();

			// onclose_start callback - will CANCEL hide if returns false
			// SKIP if just 'showing' a hidden pane as 'closed'
			var abort = !s.isShowing && false === _runCallbacks("onclose_start", pane);

			// transfer logic vars to temp vars
			isShowing	= s.isShowing;
			isHiding	= s.isHiding;
			wasSliding	= s.isSliding;
			// now clear the logic vars (REQUIRED before aborting)
			delete s.isShowing;
			delete s.isHiding;

			if (abort) return queueNext();

			doFX		= !noAnimation && !s.isClosed && (o.fxName_close != "none");
			s.isMoving	= true;
			s.isClosed	= true;
			s.isVisible	= false;
			// update isHidden BEFORE sizing panes
			if (isHiding) s.isHidden = true;
			else if (isShowing) s.isHidden = false;

			if (s.isSliding) // pane is being closed, so UNBIND trigger events
				bindStopSlidingEvents(pane, false); // will set isSliding=false
			else // resize panes adjacent to this one
				sizeMidPanes(_c[pane].dir === "horz" ? "" : "center", false); // false = NOT skipCallback

			// if this pane has a resizer bar, move it NOW - before animation
			setAsClosed(pane);

			// CLOSE THE PANE
			if (doFX) { // animate the close
				lockPaneForFX(pane, true);	// need to set left/top so animation will work
				jQueryP.hide( o.fxName_close, o.fxSettings_close, o.fxSpeed_close, function () {
					lockPaneForFX(pane, false); // undo
					if (s.isClosed) close_2();
					queueNext();
				});
			}
			else { // hide the pane without animation
				_hidePane(pane);
				close_2();
				queueNext();
			};
		});

		// SUBROUTINE
		function close_2 () {
			s.isMoving	= false;
			bindStartSlidingEvents(pane, true); // will enable if o.slidable = true

			// if opposite-pane was autoClosed, see if it can be autoOpened now
			var altPane = _c.oppositeEdge[pane];
			if (state[ altPane ].noRoom) {
				setSizeLimits( altPane );
				makePaneFit( altPane );
			}

			if (!skipCallback && (state.initialized || o.triggerEventsOnLoad)) {
				// onclose callback - UNLESS just 'showing' a hidden pane as 'closed'
				if (!isShowing)	_runCallbacks("onclose_end", pane);
				// onhide OR onshow callback
				if (isShowing)	_runCallbacks("onshow_end", pane);
				if (isHiding)	_runCallbacks("onhide_end", pane);
			}
		}
	}

	/**
	* @param {string}	pane	The pane just closed, ie: north, south, east, or west
	*/
,	setAsClosed = function (pane) {
		if (!jQueryRs[pane]) return; // handles not initialized yet!
		var
			jQueryP		= jQueryPs[pane]
		,	jQueryR		= jQueryRs[pane]
		,	jQueryT		= jQueryTs[pane]
		,	o		= options[pane]
		,	s		= state[pane]
		,	side	= _c[pane].side
		,	rClass	= o.resizerClass
		,	tClass	= o.togglerClass
		,	_pane	= "-"+ pane // used for classNames
		,	_open	= "-open"
		,	_sliding= "-sliding"
		,	_closed	= "-closed"
		;
		jQueryR
			.css(side, sC.inset[side]) // move the resizer
			.removeClass( rClass+_open +" "+ rClass+_pane+_open )
			.removeClass( rClass+_sliding +" "+ rClass+_pane+_sliding )
			.addClass( rClass+_closed +" "+ rClass+_pane+_closed )
		;
		// DISABLE 'resizing' when closed - do this BEFORE bindStartSlidingEvents?
		if (o.resizable && jQuery.layout.plugins.draggable)
			jQueryR
				.draggable("disable")
				.removeClass("ui-state-disabled") // do NOT apply disabled styling - not suitable here
				.css("cursor", "default")
				.attr("title","")
			;

		// if pane has a toggler button, adjust that too
		if (jQueryT) {
			jQueryT
				.removeClass( tClass+_open +" "+ tClass+_pane+_open )
				.addClass( tClass+_closed +" "+ tClass+_pane+_closed )
				.attr("title", o.tips.Open) // may be blank
			;
			// toggler-content - if exists
			jQueryT.children(".content-open").hide();
			jQueryT.children(".content-closed").css("display","block");
		}

		// sync any 'pin buttons'
		syncPinBtns(pane, false);

		if (state.initialized) {
			// resize 'length' and position togglers for adjacent panes
			sizeHandles();
		}
	}

	/**
	* Open the specified pane (animation optional), and resize all other panes as needed
	*
	* @param {(string|Object)}	evt_or_pane			The pane being opened, ie: north, south, east, or west
	* @param {boolean=}			[slide=false]
	* @param {boolean=}			[noAnimation=false]
	* @param {boolean=}			[noAlert=false]
	*/
,	open = function (evt_or_pane, slide, noAnimation, noAlert) {
		if (!isInitialized()) return;
		var	pane = evtPane.call(this, evt_or_pane)
		,	jQueryP	= jQueryPs[pane]
		,	jQueryR	= jQueryRs[pane]
		,	jQueryT	= jQueryTs[pane]
		,	o	= options[pane]
		,	s	= state[pane]
		,	c	= _c[pane]
		,	doFX, isShowing
		;
		// QUEUE in case another action/animation is in progress
		jQueryN.queue(function( queueNext ){

			if ( !jQueryP
			||	(!o.resizable && !o.closable && !s.isShowing)	// invalid request
			||	(s.isVisible && !s.isSliding)					// already open
			) return queueNext();

			// pane can ALSO be unhidden by just calling show(), so handle this scenario
			if (s.isHidden && !s.isShowing) {
				queueNext(); // call before show() because it needs the queue free
				show(pane, true);
				return;
			}

			if (s.autoResize && s.size != o.size) // resize pane to original size set in options
				sizePane(pane, o.size, true, true, true); // true=skipCallback/noAnimation/forceResize
			else
				// make sure there is enough space available to open the pane
				setSizeLimits(pane, slide);

			// onopen_start callback - will CANCEL open if returns false
			var cbReturn = _runCallbacks("onopen_start", pane);

			if (cbReturn === "abort")
				return queueNext();

			// update pane-state again in case options were changed in onopen_start
			if (cbReturn !== "NC") // NC = "No Callback"
				setSizeLimits(pane, slide);

			if (s.minSize > s.maxSize) { // INSUFFICIENT ROOM FOR PANE TO OPEN!
				syncPinBtns(pane, false); // make sure pin-buttons are reset
				if (!noAlert && o.tips.noRoomToOpen)
					alert(o.tips.noRoomToOpen);
				return queueNext(); // ABORT
			}

			if (slide) // START Sliding - will set isSliding=true
				bindStopSlidingEvents(pane, true); // BIND trigger events to close sliding-pane
			else if (s.isSliding) // PIN PANE (stop sliding) - open pane 'normally' instead
				bindStopSlidingEvents(pane, false); // UNBIND trigger events - will set isSliding=false
			else if (o.slidable)
				bindStartSlidingEvents(pane, false); // UNBIND trigger events

			s.noRoom = false; // will be reset by makePaneFit if 'noRoom'
			makePaneFit(pane);

			// transfer logic var to temp var
			isShowing = s.isShowing;
			// now clear the logic var
			delete s.isShowing;

			doFX		= !noAnimation && s.isClosed && (o.fxName_open != "none");
			s.isMoving	= true;
			s.isVisible	= true;
			s.isClosed	= false;
			// update isHidden BEFORE sizing panes - WHY??? Old?
			if (isShowing) s.isHidden = false;

			if (doFX) { // ANIMATE
				// mask adjacent panes with objects
				lockPaneForFX(pane, true);	// need to set left/top so animation will work
					jQueryP.show( o.fxName_open, o.fxSettings_open, o.fxSpeed_open, function() {
					lockPaneForFX(pane, false); // undo
					if (s.isVisible) open_2(); // continue
					queueNext();
				});
			}
			else { // no animation
				_showPane(pane);// just show pane and...
				open_2();		// continue
				queueNext();
			};
		});

		// SUBROUTINE
		function open_2 () {
			s.isMoving	= false;

			// cure iframe display issues
			_fixIframe(pane);

			// NOTE: if isSliding, then other panes are NOT 'resized'
			if (!s.isSliding) { // resize all panes adjacent to this one
				sizeMidPanes(_c[pane].dir=="vert" ? "center" : "", false); // false = NOT skipCallback
			}

			// set classes, position handles and execute callbacks...
			setAsOpen(pane);
		};
	
	}

	/**
	* @param {string}	pane		The pane just opened, ie: north, south, east, or west
	* @param {boolean=}	[skipCallback=false]
	*/
,	setAsOpen = function (pane, skipCallback) {
		var 
			jQueryP		= jQueryPs[pane]
		,	jQueryR		= jQueryRs[pane]
		,	jQueryT		= jQueryTs[pane]
		,	o		= options[pane]
		,	s		= state[pane]
		,	side	= _c[pane].side
		,	rClass	= o.resizerClass
		,	tClass	= o.togglerClass
		,	_pane	= "-"+ pane // used for classNames
		,	_open	= "-open"
		,	_closed	= "-closed"
		,	_sliding= "-sliding"
		;
		jQueryR
			.css(side, sC.inset[side] + getPaneSize(pane)) // move the resizer
			.removeClass( rClass+_closed +" "+ rClass+_pane+_closed )
			.addClass( rClass+_open +" "+ rClass+_pane+_open )
		;
		if (s.isSliding)
			jQueryR.addClass( rClass+_sliding +" "+ rClass+_pane+_sliding )
		else // in case 'was sliding'
			jQueryR.removeClass( rClass+_sliding +" "+ rClass+_pane+_sliding )

		removeHover( 0, jQueryR ); // remove hover classes
		if (o.resizable && jQuery.layout.plugins.draggable)
			jQueryR	.draggable("enable")
				.css("cursor", o.resizerCursor)
				.attr("title", o.tips.Resize);
		else if (!s.isSliding)
			jQueryR.css("cursor", "default"); // n-resize, s-resize, etc

		// if pane also has a toggler button, adjust that too
		if (jQueryT) {
			jQueryT	.removeClass( tClass+_closed +" "+ tClass+_pane+_closed )
				.addClass( tClass+_open +" "+ tClass+_pane+_open )
				.attr("title", o.tips.Close); // may be blank
			removeHover( 0, jQueryT ); // remove hover classes
			// toggler-content - if exists
			jQueryT.children(".content-closed").hide();
			jQueryT.children(".content-open").css("display","block");
		}

		// sync any 'pin buttons'
		syncPinBtns(pane, !s.isSliding);

		// update pane-state dimensions - BEFORE resizing content
		jQuery.extend(s, elDims(jQueryP));

		if (state.initialized) {
			// resize resizer & toggler sizes for all panes
			sizeHandles();
			// resize content every time pane opens - to be sure
			sizeContent(pane, true); // true = remeasure headers/footers, even if 'pane.isMoving'
		}

		if (!skipCallback && (state.initialized || o.triggerEventsOnLoad) && jQueryP.is(":visible")) {
			// onopen callback
			_runCallbacks("onopen_end", pane);
			// onshow callback - TODO: should this be here?
			if (s.isShowing) _runCallbacks("onshow_end", pane);

			// ALSO call onresize because layout-size *may* have changed while pane was closed
			if (state.initialized)
				_runCallbacks("onresize_end", pane);
		}

		// TODO: Somehow sizePane("north") is being called after this point???
	}


	/**
	* slideOpen / slideClose / slideToggle
	*
	* Pass-though methods for sliding
	*/
,	slideOpen = function (evt_or_pane) {
		if (!isInitialized()) return;
		var	evt		= evtObj(evt_or_pane)
		,	pane	= evtPane.call(this, evt_or_pane)
		,	s		= state[pane]
		,	delay	= options[pane].slideDelay_open
		;
		// prevent event from triggering on NEW resizer binding created below
		if (evt) evt.stopImmediatePropagation();

		if (s.isClosed && evt && evt.type === "mouseenter" && delay > 0)
			// trigger = mouseenter - use a delay
			timer.set(pane+"_openSlider", open_NOW, delay);
		else
			open_NOW(); // will unbind events if is already open

		/**
		* SUBROUTINE for timed open
		*/
		function open_NOW () {
			if (!s.isClosed) // skip if no longer closed!
				bindStopSlidingEvents(pane, true); // BIND trigger events to close sliding-pane
			else if (!s.isMoving)
				open(pane, true); // true = slide - open() will handle binding
		};
	}

,	slideClose = function (evt_or_pane) {
		if (!isInitialized()) return;
		var	evt		= evtObj(evt_or_pane)
		,	pane	= evtPane.call(this, evt_or_pane)
		,	o		= options[pane]
		,	s		= state[pane]
		,	delay	= s.isMoving ? 1000 : 300 // MINIMUM delay - option may override
		;
		if (s.isClosed || s.isResizing)
			return; // skip if already closed OR in process of resizing
		else if (o.slideTrigger_close === "click")
			close_NOW(); // close immediately onClick
		else if (o.preventQuickSlideClose && s.isMoving)
			return; // handle Chrome quick-close on slide-open
		else if (o.preventPrematureSlideClose && evt && jQuery.layout.isMouseOverElem(evt, jQueryPs[pane]))
			return; // handle incorrect mouseleave trigger, like when over a SELECT-list in IE
		else if (evt) // trigger = mouseleave - use a delay
			// 1 sec delay if 'opening', else .3 sec
			timer.set(pane+"_closeSlider", close_NOW, max(o.slideDelay_close, delay));
		else // called programically
			close_NOW();

		/**
		* SUBROUTINE for timed close
		*/
		function close_NOW () {
			if (s.isClosed) // skip 'close' if already closed!
				bindStopSlidingEvents(pane, false); // UNBIND trigger events - TODO: is this needed here?
			else if (!s.isMoving)
				close(pane); // close will handle unbinding
		};
	}

	/**
	* @param {(string|Object)}	evt_or_pane		The pane being opened, ie: north, south, east, or west
	*/
,	slideToggle = function (evt_or_pane) {
		var pane = evtPane.call(this, evt_or_pane);
		toggle(pane, true);
	}


	/**
	* Must set left/top on East/South panes so animation will work properly
	*
	* @param {string}	pane	The pane to lock, 'east' or 'south' - any other is ignored!
	* @param {boolean}	doLock  true = set left/top, false = remove
	*/
,	lockPaneForFX = function (pane, doLock) {
		var jQueryP	= jQueryPs[pane]
		,	s	= state[pane]
		,	o	= options[pane]
		,	z	= options.zIndexes
		;
		if (doLock) {
			showMasks( pane, { animation: true, objectsOnly: true });
			jQueryP.css({ zIndex: z.pane_animate }); // overlay all elements during animation
			if (pane=="south")
				jQueryP.css({ top: sC.inset.top + sC.innerHeight - jQueryP.outerHeight() });
			else if (pane=="east")
				jQueryP.css({ left: sC.inset.left + sC.innerWidth - jQueryP.outerWidth() });
		}
		else { // animation DONE - RESET CSS
			hideMasks();
			jQueryP.css({ zIndex: (s.isSliding ? z.pane_sliding : z.pane_normal) });
			if (pane=="south")
				jQueryP.css({ top: "auto" });
			// if pane is positioned 'off-screen', then DO NOT screw with it!
			else if (pane=="east" && !jQueryP.css("left").match(/\-99999/))
				jQueryP.css({ left: "auto" });
			// fix anti-aliasing in IE - only needed for animations that change opacity
			if (browser.msie && o.fxOpacityFix && o.fxName_open != "slide" && jQueryP.css("filter") && jQueryP.css("opacity") == 1)
				jQueryP[0].style.removeAttribute('filter');
		}
	}


	/**
	* Toggle sliding functionality of a specific pane on/off by adding removing 'slide open' trigger
	*
	* @see  open(), close()
	* @param {string}	pane	The pane to enable/disable, 'north', 'south', etc.
	* @param {boolean}	enable	Enable or Disable sliding?
	*/
,	bindStartSlidingEvents = function (pane, enable) {
		var o		= options[pane]
		,	jQueryP		= jQueryPs[pane]
		,	jQueryR		= jQueryRs[pane]
		,	evtName	= o.slideTrigger_open.toLowerCase()
		;
		if (!jQueryR || (enable && !o.slidable)) return;

		// make sure we have a valid event
		if (evtName.match(/mouseover/))
			evtName = o.slideTrigger_open = "mouseenter";
		else if (!evtName.match(/(click|dblclick|mouseenter)/)) 
			evtName = o.slideTrigger_open = "click";

		// must remove double-click-toggle when using dblclick-slide
		if (o.resizerDblClickToggle && evtName.match(/click/)) {
			jQueryR[enable ? "unbind" : "bind"]('dblclick.'+ sID, toggle)
		}

		jQueryR
			// add or remove event
			[enable ? "bind" : "unbind"](evtName +'.'+ sID, slideOpen)
			// set the appropriate cursor & title/tip
			.css("cursor", enable ? o.sliderCursor : "default")
			.attr("title", enable ? o.tips.Slide : "")
		;
	}

	/**
	* Add or remove 'mouseleave' events to 'slide close' when pane is 'sliding' open or closed
	* Also increases zIndex when pane is sliding open
	* See bindStartSlidingEvents for code to control 'slide open'
	*
	* @see  slideOpen(), slideClose()
	* @param {string}	pane	The pane to process, 'north', 'south', etc.
	* @param {boolean}	enable	Enable or Disable events?
	*/
,	bindStopSlidingEvents = function (pane, enable) {
		var	o		= options[pane]
		,	s		= state[pane]
		,	c		= _c[pane]
		,	z		= options.zIndexes
		,	evtName	= o.slideTrigger_close.toLowerCase()
		,	action	= (enable ? "bind" : "unbind")
		,	jQueryP		= jQueryPs[pane]
		,	jQueryR		= jQueryRs[pane]
		;
		timer.clear(pane+"_closeSlider"); // just in case

		if (enable) {
			s.isSliding = true;
			state.panesSliding[pane] = true;
			// remove 'slideOpen' event from resizer
			// ALSO will raise the zIndex of the pane & resizer
			bindStartSlidingEvents(pane, false);
		}
		else {
			s.isSliding = false;
			delete state.panesSliding[pane];
		}

		// RE/SET zIndex - increases when pane is sliding-open, resets to normal when not
		jQueryP.css("zIndex", enable ? z.pane_sliding : z.pane_normal);
		jQueryR.css("zIndex", enable ? z.pane_sliding+2 : z.resizer_normal); // NOTE: mask = pane_sliding+1

		// make sure we have a valid event
		if (!evtName.match(/(click|mouseleave)/))
			evtName = o.slideTrigger_close = "mouseleave"; // also catches 'mouseout'

		// add/remove slide triggers
		jQueryR[action](evtName, slideClose); // base event on resize
		// need extra events for mouseleave
		if (evtName === "mouseleave") {
			// also close on pane.mouseleave
			jQueryP[action]("mouseleave."+ sID, slideClose);
			// cancel timer when mouse moves between 'pane' and 'resizer'
			jQueryR[action]("mouseenter."+ sID, cancelMouseOut);
			jQueryP[action]("mouseenter."+ sID, cancelMouseOut);
		}

		if (!enable)
			timer.clear(pane+"_closeSlider");
		else if (evtName === "click" && !o.resizable) {
			// IF pane is not resizable (which already has a cursor and tip) 
			// then set the a cursor & title/tip on resizer when sliding
			jQueryR.css("cursor", enable ? o.sliderCursor : "default");
			jQueryR.attr("title", enable ? o.tips.Close : ""); // use Toggler-tip, eg: "Close Pane"
		}

		// SUBROUTINE for mouseleave timer clearing
		function cancelMouseOut (evt) {
			timer.clear(pane+"_closeSlider");
			evt.stopPropagation();
		}
	}


	/**
	* Hides/closes a pane if there is insufficient room - reverses this when there is room again
	* MUST have already called setSizeLimits() before calling this method
	*
	* @param {string}	pane					The pane being resized
	* @param {boolean=}	[isOpening=false]		Called from onOpen?
	* @param {boolean=}	[skipCallback=false]	Should the onresize callback be run?
	* @param {boolean=}	[force=false]
	*/
,	makePaneFit = function (pane, isOpening, skipCallback, force) {
		var	o	= options[pane]
		,	s	= state[pane]
		,	c	= _c[pane]
		,	jQueryP	= jQueryPs[pane]
		,	jQueryR	= jQueryRs[pane]
		,	isSidePane 	= c.dir==="vert"
		,	hasRoom		= false
		;
		// special handling for center & east/west panes
		if (pane === "center" || (isSidePane && s.noVerticalRoom)) {
			// see if there is enough room to display the pane
			// ERROR: hasRoom = s.minHeight <= s.maxHeight && (isSidePane || s.minWidth <= s.maxWidth);
			hasRoom = (s.maxHeight >= 0);
			if (hasRoom && s.noRoom) { // previously hidden due to noRoom, so show now
				_showPane(pane);
				if (jQueryR) jQueryR.show();
				s.isVisible = true;
				s.noRoom = false;
				if (isSidePane) s.noVerticalRoom = false;
				_fixIframe(pane);
			}
			else if (!hasRoom && !s.noRoom) { // not currently hidden, so hide now
				_hidePane(pane);
				if (jQueryR) jQueryR.hide();
				s.isVisible = false;
				s.noRoom = true;
			}
		}

		// see if there is enough room to fit the border-pane
		if (pane === "center") {
			// ignore center in this block
		}
		else if (s.minSize <= s.maxSize) { // pane CAN fit
			hasRoom = true;
			if (s.size > s.maxSize) // pane is too big - shrink it
				sizePane(pane, s.maxSize, skipCallback, true, force); // true = noAnimation
			else if (s.size < s.minSize) // pane is too small - enlarge it
				sizePane(pane, s.minSize, skipCallback, true, force); // true = noAnimation
			// need s.isVisible because new pseudoClose method keeps pane visible, but off-screen
			else if (jQueryR && s.isVisible && jQueryP.is(":visible")) {
				// make sure resizer-bar is positioned correctly
				// handles situation where nested layout was 'hidden' when initialized
				var	pos = s.size + sC.inset[c.side];
				if (jQuery.layout.cssNum( jQueryR, c.side ) != pos) jQueryR.css( c.side, pos );
			}

			// if was previously hidden due to noRoom, then RESET because NOW there is room
			if (s.noRoom) {
				// s.noRoom state will be set by open or show
				if (s.wasOpen && o.closable) {
					if (o.autoReopen)
						open(pane, false, true, true); // true = noAnimation, true = noAlert
					else // leave the pane closed, so just update state
						s.noRoom = false;
				}
				else
					show(pane, s.wasOpen, true, true); // true = noAnimation, true = noAlert
			}
		}
		else { // !hasRoom - pane CANNOT fit
			if (!s.noRoom) { // pane not set as noRoom yet, so hide or close it now...
				s.noRoom = true; // update state
				s.wasOpen = !s.isClosed && !s.isSliding;
				if (s.isClosed){} // SKIP
				else if (o.closable) // 'close' if possible
					close(pane, true, true); // true = force, true = noAnimation
				else // 'hide' pane if cannot just be closed
					hide(pane, true); // true = noAnimation
			}
		}
	}


	/**
	* manualSizePane is an exposed flow-through method allowing extra code when pane is 'manually resized'
	*
	* @param {(string|Object)}	evt_or_pane				The pane being resized
	* @param {number}			size					The *desired* new size for this pane - will be validated
	* @param {boolean=}			[skipCallback=false]	Should the onresize callback be run?
	* @param {boolean=}			[noAnimation=false]
	* @param {boolean=}			[force=false]			Force resizing even if does not seem necessary
	*/
,	manualSizePane = function (evt_or_pane, size, skipCallback, noAnimation, force) {
		if (!isInitialized()) return;
		var	pane = evtPane.call(this, evt_or_pane)
		,	o	= options[pane]
		,	s	= state[pane]
		//	if resizing callbacks have been delayed and resizing is now DONE, force resizing to complete...
		,	forceResize = force || (o.livePaneResizing && !s.isResizing)
		;
		// ANY call to manualSizePane disables autoResize - ie, percentage sizing
		s.autoResize = false;
		// flow-through...
		sizePane(pane, size, skipCallback, noAnimation, forceResize); // will animate resize if option enabled
	}

	/**
	* sizePane is called only by internal methods whenever a pane needs to be resized
	*
	* @param {(string|Object)}	evt_or_pane				The pane being resized
	* @param {number}			size					The *desired* new size for this pane - will be validated
	* @param {boolean=}			[skipCallback=false]	Should the onresize callback be run?
	* @param {boolean=}			[noAnimation=false]
	* @param {boolean=}			[force=false]			Force resizing even if does not seem necessary
	*/
,	sizePane = function (evt_or_pane, size, skipCallback, noAnimation, force) {
		if (!isInitialized()) return;
		var	pane	= evtPane.call(this, evt_or_pane) // probably NEVER called from event?
		,	o		= options[pane]
		,	s		= state[pane]
		,	jQueryP		= jQueryPs[pane]
		,	jQueryR		= jQueryRs[pane]
		,	side	= _c[pane].side
		,	dimName	= _c[pane].sizeType.toLowerCase()
		,	skipResizeWhileDragging = s.isResizing && !o.triggerEventsDuringLiveResize
		,	doFX	= noAnimation !== true && o.animatePaneSizing
		,	oldSize, newSize
		;
		// QUEUE in case another action/animation is in progress
		jQueryN.queue(function( queueNext ){
			// calculate 'current' min/max sizes
			setSizeLimits(pane); // update pane-state
			oldSize = s.size;
			size = _parseSize(pane, size); // handle percentages & auto
			size = max(size, _parseSize(pane, o.minSize));
			size = min(size, s.maxSize);
			if (size < s.minSize) { // not enough room for pane!
				queueNext(); // call before makePaneFit() because it needs the queue free
				makePaneFit(pane, false, skipCallback);	// will hide or close pane
				return;
			}

			// IF newSize is same as oldSize, then nothing to do - abort
			if (!force && size === oldSize)
				return queueNext();

			s.newSize = size;

			// onresize_start callback CANNOT cancel resizing because this would break the layout!
			if (!skipCallback && state.initialized && s.isVisible)
				_runCallbacks("onresize_start", pane);

			// resize the pane, and make sure its visible
			newSize = cssSize(pane, size);

			if (doFX && jQueryP.is(":visible")) { // ANIMATE
				var fx		= jQuery.layout.effects.size[pane] || jQuery.layout.effects.size.all
				,	easing	= o.fxSettings_size.easing || fx.easing
				,	z		= options.zIndexes
				,	props	= {};
				props[ dimName ] = newSize +'px';
				s.isMoving = true;
				// overlay all elements during animation
				jQueryP.css({ zIndex: z.pane_animate })
				  .show().animate( props, o.fxSpeed_size, easing, function(){
					// reset zIndex after animation
					jQueryP.css({ zIndex: (s.isSliding ? z.pane_sliding : z.pane_normal) });
					s.isMoving = false;
					delete s.newSize;
					sizePane_2(); // continue
					queueNext();
				});
			}
			else { // no animation
				jQueryP.css( dimName, newSize );	// resize pane
				delete s.newSize;
				// if pane is visible, then 
				if (jQueryP.is(":visible"))
					sizePane_2(); // continue
				else {
					// pane is NOT VISIBLE, so just update state data...
					// when pane is *next opened*, it will have the new size
					s.size = size;				// update state.size
					jQuery.extend(s, elDims(jQueryP));	// update state dimensions
				}
				queueNext();
			};

		});

		// SUBROUTINE
		function sizePane_2 () {
			/*	Panes are sometimes not sized precisely in some browsers!?
			 *	This code will resize the pane up to 3 times to nudge the pane to the correct size
			 */
			var	actual	= dimName==='width' ? jQueryP.outerWidth() : jQueryP.outerHeight()
			,	tries	= [{
						   	pane:		pane
						,	count:		1
						,	target:		size
						,	actual:		actual
						,	correct:	(size === actual)
						,	attempt:	size
						,	cssSize:	newSize
						}]
			,	lastTry = tries[0]
			,	thisTry	= {}
			,	msg		= 'Inaccurate size after resizing the '+ pane +'-pane.'
			;
			while ( !lastTry.correct ) {
				thisTry = { pane: pane, count: lastTry.count+1, target: size };

				if (lastTry.actual > size)
					thisTry.attempt = max(0, lastTry.attempt - (lastTry.actual - size));
				else // lastTry.actual < size
					thisTry.attempt = max(0, lastTry.attempt + (size - lastTry.actual));

				thisTry.cssSize = cssSize(pane, thisTry.attempt);
				jQueryP.css( dimName, thisTry.cssSize );

				thisTry.actual	= dimName=='width' ? jQueryP.outerWidth() : jQueryP.outerHeight();
				thisTry.correct	= (size === thisTry.actual);

				// log attempts and alert the user of this *non-fatal error* (if showDebugMessages)
				if ( tries.length === 1) {
					_log(msg, false, true);
					_log(lastTry, false, true);
				}
				_log(thisTry, false, true);
				// after 4 tries, is as close as its gonna get!
				if (tries.length > 3) break;

				tries.push( thisTry );
				lastTry = tries[ tries.length - 1 ];
			}
			// END TESTING CODE

			// update pane-state dimensions
			s.size	= size;
			jQuery.extend(s, elDims(jQueryP));

			if (s.isVisible && jQueryP.is(":visible")) {
				// reposition the resizer-bar
				if (jQueryR) jQueryR.css( side, size + sC.inset[side] );
				// resize the content-div
				sizeContent(pane);
			}

			if (!skipCallback && !skipResizeWhileDragging && state.initialized && s.isVisible)
				_runCallbacks("onresize_end", pane);

			// resize all the adjacent panes, and adjust their toggler buttons
			// when skipCallback passed, it means the controlling method will handle 'other panes'
			if (!skipCallback) {
				// also no callback if live-resize is in progress and NOT triggerEventsDuringLiveResize
				if (!s.isSliding) sizeMidPanes(_c[pane].dir=="horz" ? "" : "center", skipResizeWhileDragging, force);
				sizeHandles();
			}

			// if opposite-pane was autoClosed, see if it can be autoOpened now
			var altPane = _c.oppositeEdge[pane];
			if (size < oldSize && state[ altPane ].noRoom) {
				setSizeLimits( altPane );
				makePaneFit( altPane, false, skipCallback );
			}

			// DEBUG - ALERT user/developer so they know there was a sizing problem
			if (tries.length > 1)
				_log(msg +'\nSee the Error Console for details.', true, true);
		}
	}

	/**
	* @see  initPanes(), sizePane(), 	resizeAll(), open(), close(), hide()
	* @param {(Array.<string>|string)}	panes					The pane(s) being resized, comma-delmited string
	* @param {boolean=}					[skipCallback=false]	Should the onresize callback be run?
	* @param {boolean=}					[force=false]
	*/
,	sizeMidPanes = function (panes, skipCallback, force) {
		panes = (panes ? panes : "east,west,center").split(",");

		jQuery.each(panes, function (i, pane) {
			if (!jQueryPs[pane]) return; // NO PANE - skip
			var 
				o		= options[pane]
			,	s		= state[pane]
			,	jQueryP		= jQueryPs[pane]
			,	jQueryR		= jQueryRs[pane]
			,	isCenter= (pane=="center")
			,	hasRoom	= true
			,	CSS		= {}
			//	if pane is not visible, show it invisibly NOW rather than for *each call* in this script
			,	visCSS	= jQuery.layout.showInvisibly(jQueryP)

			,	newCenter	= calcNewCenterPaneDims()
			;

			// update pane-state dimensions
			jQuery.extend(s, elDims(jQueryP));

			if (pane === "center") {
				if (!force && s.isVisible && newCenter.width === s.outerWidth && newCenter.height === s.outerHeight) {
					jQueryP.css(visCSS);
					return true; // SKIP - pane already the correct size
				}
				// set state for makePaneFit() logic
				jQuery.extend(s, cssMinDims(pane), {
					maxWidth:	newCenter.width
				,	maxHeight:	newCenter.height
				});
				CSS = newCenter;
				s.newWidth	= CSS.width;
				s.newHeight	= CSS.height;
				// convert OUTER width/height to CSS width/height 
				CSS.width	= cssW(jQueryP, CSS.width);
				// NEW - allow pane to extend 'below' visible area rather than hide it
				CSS.height	= cssH(jQueryP, CSS.height);
				hasRoom		= CSS.width >= 0 && CSS.height >= 0; // height >= 0 = ALWAYS TRUE NOW

				// during layout init, try to shrink east/west panes to make room for center
				if (!state.initialized && o.minWidth > newCenter.width) {
					var
						reqPx	= o.minWidth - s.outerWidth
					,	minE	= options.east.minSize || 0
					,	minW	= options.west.minSize || 0
					,	sizeE	= state.east.size
					,	sizeW	= state.west.size
					,	newE	= sizeE
					,	newW	= sizeW
					;
					if (reqPx > 0 && state.east.isVisible && sizeE > minE) {
						newE = max( sizeE-minE, sizeE-reqPx );
						reqPx -= sizeE-newE;
					}
					if (reqPx > 0 && state.west.isVisible && sizeW > minW) {
						newW = max( sizeW-minW, sizeW-reqPx );
						reqPx -= sizeW-newW;
					}
					// IF we found enough extra space, then resize the border panes as calculated
					if (reqPx === 0) {
						if (sizeE && sizeE != minE)
							sizePane('east', newE, true, true, force); // true = skipCallback/noAnimation - initPanes will handle when done
						if (sizeW && sizeW != minW)
							sizePane('west', newW, true, true, force); // true = skipCallback/noAnimation
						// now start over!
						sizeMidPanes('center', skipCallback, force);
						jQueryP.css(visCSS);
						return; // abort this loop
					}
				}
			}
			else { // for east and west, set only the height, which is same as center height
				// set state.min/maxWidth/Height for makePaneFit() logic
				if (s.isVisible && !s.noVerticalRoom)
					jQuery.extend(s, elDims(jQueryP), cssMinDims(pane))
				if (!force && !s.noVerticalRoom && newCenter.height === s.outerHeight) {
					jQueryP.css(visCSS);
					return true; // SKIP - pane already the correct size
				}
				// east/west have same top, bottom & height as center
				CSS.top		= newCenter.top;
				CSS.bottom	= newCenter.bottom;
				s.newSize	= newCenter.height
				// NEW - allow pane to extend 'below' visible area rather than hide it
				CSS.height	= cssH(jQueryP, newCenter.height);
				s.maxHeight	= CSS.height;
				hasRoom		= (s.maxHeight >= 0); // ALWAYS TRUE NOW
				if (!hasRoom) s.noVerticalRoom = true; // makePaneFit() logic
			}

			if (hasRoom) {
				// resizeAll passes skipCallback because it triggers callbacks after ALL panes are resized
				if (!skipCallback && state.initialized)
					_runCallbacks("onresize_start", pane);

				jQueryP.css(CSS); // apply the CSS to pane
				if (pane !== "center")
					sizeHandles(pane); // also update resizer length
				if (s.noRoom && !s.isClosed && !s.isHidden)
					makePaneFit(pane); // will re-open/show auto-closed/hidden pane
				if (s.isVisible) {
					jQuery.extend(s, elDims(jQueryP)); // update pane dimensions
					if (state.initialized) sizeContent(pane); // also resize the contents, if exists
				}
			}
			else if (!s.noRoom && s.isVisible) // no room for pane
				makePaneFit(pane); // will hide or close pane

			// reset visibility, if necessary
			jQueryP.css(visCSS);

			delete s.newSize;
			delete s.newWidth;
			delete s.newHeight;

			if (!s.isVisible)
				return true; // DONE - next pane

			/*
			* Extra CSS for IE6 or IE7 in Quirks-mode - add 'width' to NORTH/SOUTH panes
			* Normally these panes have only 'left' & 'right' positions so pane auto-sizes
			* ALSO required when pane is an IFRAME because will NOT default to 'full width'
			*	TODO: Can I use width:100% for a north/south iframe?
			*	TODO: Sounds like a job for jQueryP.outerWidth( sC.innerWidth ) SETTER METHOD
			*/
			if (pane === "center") { // finished processing midPanes
				var fix = browser.isIE6 || !browser.boxModel;
				if (jQueryPs.north && (fix || state.north.tagName=="IFRAME")) 
					jQueryPs.north.css("width", cssW(jQueryPs.north, sC.innerWidth));
				if (jQueryPs.south && (fix || state.south.tagName=="IFRAME"))
					jQueryPs.south.css("width", cssW(jQueryPs.south, sC.innerWidth));
			}

			// resizeAll passes skipCallback because it triggers callbacks after ALL panes are resized
			if (!skipCallback && state.initialized)
				_runCallbacks("onresize_end", pane);
		});
	}


	/**
	* @see  window.onresize(), callbacks or custom code
	* @param {(Object|boolean)=}	evt_or_refresh	If 'true', then also reset pane-positioning
	*/
,	resizeAll = function (evt_or_refresh) {
		var	oldW	= sC.innerWidth
		,	oldH	= sC.innerHeight
		;
		// stopPropagation if called by trigger("layoutdestroy") - use evtPane utility 
		evtPane(evt_or_refresh);

		// cannot size layout when 'container' is hidden or collapsed
		if (!jQueryN.is(":visible")) return;

		if (!state.initialized) {
			_initLayoutElements();
			return; // no need to resize since we just initialized!
		}

		if (evt_or_refresh === true && jQuery.isPlainObject(options.outset)) {
			// update container CSS in case outset option has changed
			jQueryN.css( options.outset );
		}
		// UPDATE container dimensions
		jQuery.extend(sC, elDims( jQueryN, options.inset ));
		if (!sC.outerHeight) return;

		// if 'true' passed, refresh pane & handle positioning too
		if (evt_or_refresh === true) {
			setPanePosition();
		}

		// onresizeall_start will CANCEL resizing if returns false
		// state.container has already been set, so user can access this info for calcuations
		if (false === _runCallbacks("onresizeall_start")) return false;

		var	// see if container is now 'smaller' than before
			shrunkH	= (sC.innerHeight < oldH)
		,	shrunkW	= (sC.innerWidth < oldW)
		,	jQueryP, o, s
		;
		// NOTE special order for sizing: S-N-E-W
		jQuery.each(["south","north","east","west"], function (i, pane) {
			if (!jQueryPs[pane]) return; // no pane - SKIP
			o = options[pane];
			s = state[pane];
			if (s.autoResize && s.size != o.size) // resize pane to original size set in options
				sizePane(pane, o.size, true, true, true); // true=skipCallback/noAnimation/forceResize
			else {
				setSizeLimits(pane);
				makePaneFit(pane, false, true, true); // true=skipCallback/forceResize
			}
		});

		sizeMidPanes("", true, true); // true=skipCallback/forceResize
		sizeHandles(); // reposition the toggler elements

		// trigger all individual pane callbacks AFTER layout has finished resizing
		jQuery.each(_c.allPanes, function (i, pane) {
			jQueryP = jQueryPs[pane];
			if (!jQueryP) return; // SKIP
			if (state[pane].isVisible) // undefined for non-existent panes
				_runCallbacks("onresize_end", pane); // callback - if exists
		});

		_runCallbacks("onresizeall_end");
		//_triggerLayoutEvent(pane, 'resizeall');
	}

	/**
	* Whenever a pane resizes or opens that has a nested layout, trigger resizeAll
	*
	* @param {(string|Object)}	evt_or_pane		The pane just resized or opened
	*/
,	resizeChildren = function (evt_or_pane, skipRefresh) {
		var	pane = evtPane.call(this, evt_or_pane);

		if (!options[pane].resizeChildren) return;

		// ensure the pane-children are up-to-date
		if (!skipRefresh) refreshChildren( pane );
		var pC = children[pane];
		if (jQuery.isPlainObject( pC )) {
			// resize one or more children
			jQuery.each( pC, function (key, child) {
				if (!child.destroyed) child.resizeAll();
			});
		}
	}

	/**
	* IF pane has a content-div, then resize all elements inside pane to fit pane-height
	*
	* @param {(string|Object)}	evt_or_panes		The pane(s) being resized
	* @param {boolean=}			[remeasure=false]	Should the content (header/footer) be remeasured?
	*/
,	sizeContent = function (evt_or_panes, remeasure) {
		if (!isInitialized()) return;

		var panes = evtPane.call(this, evt_or_panes);
		panes = panes ? panes.split(",") : _c.allPanes;

		jQuery.each(panes, function (idx, pane) {
			var
				jQueryP	= jQueryPs[pane]
			,	jQueryC	= jQueryCs[pane]
			,	o	= options[pane]
			,	s	= state[pane]
			,	m	= s.content // m = measurements
			;
			if (!jQueryP || !jQueryC || !jQueryP.is(":visible")) return true; // NOT VISIBLE - skip

			// if content-element was REMOVED, update OR remove the pointer
			if (!jQueryC.length) {
				initContent(pane, false);	// false = do NOT sizeContent() - already there!
				if (!jQueryC) return;			// no replacement element found - pointer have been removed
			}

			// onsizecontent_start will CANCEL resizing if returns false
			if (false === _runCallbacks("onsizecontent_start", pane)) return;

			// skip re-measuring offsets if live-resizing
			if ((!s.isMoving && !s.isResizing) || o.liveContentResizing || remeasure || m.top == undefined) {
				_measure();
				// if any footers are below pane-bottom, they may not measure correctly,
				// so allow pane overflow and re-measure
				if (m.hiddenFooters > 0 && jQueryP.css("overflow") === "hidden") {
					jQueryP.css("overflow", "visible");
					_measure(); // remeasure while overflowing
					jQueryP.css("overflow", "hidden");
				}
			}
			// NOTE: spaceAbove/Below *includes* the pane paddingTop/Bottom, but not pane.borders
			var newH = s.innerHeight - (m.spaceAbove - s.css.paddingTop) - (m.spaceBelow - s.css.paddingBottom);

			if (!jQueryC.is(":visible") || m.height != newH) {
				// size the Content element to fit new pane-size - will autoHide if not enough room
				setOuterHeight(jQueryC, newH, true); // true=autoHide
				m.height = newH; // save new height
			};

			if (state.initialized)
				_runCallbacks("onsizecontent_end", pane);

			function _below (jQueryE) {
				return max(s.css.paddingBottom, (parseInt(jQueryE.css("marginBottom"), 10) || 0));
			};

			function _measure () {
				var
					ignore	= options[pane].contentIgnoreSelector
				,	jQueryFs		= jQueryC.nextAll().not(".ui-layout-mask").not(ignore || ":lt(0)") // not :lt(0) = ALL
				,	jQueryFs_vis	= jQueryFs.filter(':visible')
				,	jQueryF		= jQueryFs_vis.filter(':last')
				;
				m = {
					top:			jQueryC[0].offsetTop
				,	height:			jQueryC.outerHeight()
				,	numFooters:		jQueryFs.length
				,	hiddenFooters:	jQueryFs.length - jQueryFs_vis.length
				,	spaceBelow:		0 // correct if no content footer (jQueryE)
				}
					m.spaceAbove	= m.top; // just for state - not used in calc
					m.bottom		= m.top + m.height;
				if (jQueryF.length)
					//spaceBelow = (LastFooter.top + LastFooter.height) [footerBottom] - Content.bottom + max(LastFooter.marginBottom, pane.paddingBotom)
					m.spaceBelow = (jQueryF[0].offsetTop + jQueryF.outerHeight()) - m.bottom + _below(jQueryF);
				else // no footer - check marginBottom on Content element itself
					m.spaceBelow = _below(jQueryC);
			};
		});
	}


	/**
	* Called every time a pane is opened, closed, or resized to slide the togglers to 'center' and adjust their length if necessary
	*
	* @see  initHandles(), open(), close(), resizeAll()
	* @param {(string|Object)=}		evt_or_panes	The pane(s) being resized
	*/
,	sizeHandles = function (evt_or_panes) {
		var panes = evtPane.call(this, evt_or_panes)
		panes = panes ? panes.split(",") : _c.borderPanes;

		jQuery.each(panes, function (i, pane) {
			var 
				o	= options[pane]
			,	s	= state[pane]
			,	jQueryP	= jQueryPs[pane]
			,	jQueryR	= jQueryRs[pane]
			,	jQueryT	= jQueryTs[pane]
			,	jQueryTC
			;
			if (!jQueryP || !jQueryR) return;

			var
				dir			= _c[pane].dir
			,	_state		= (s.isClosed ? "_closed" : "_open")
			,	spacing		= o["spacing"+ _state]
			,	togAlign	= o["togglerAlign"+ _state]
			,	togLen		= o["togglerLength"+ _state]
			,	paneLen
			,	left
			,	offset
			,	CSS = {}
			;

			if (spacing === 0) {
				jQueryR.hide();
				return;
			}
			else if (!s.noRoom && !s.isHidden) // skip if resizer was hidden for any reason
				jQueryR.show(); // in case was previously hidden

			// Resizer Bar is ALWAYS same width/height of pane it is attached to
			if (dir === "horz") { // north/south
				//paneLen = jQueryP.outerWidth(); // s.outerWidth || 
				paneLen = sC.innerWidth; // handle offscreen-panes
				s.resizerLength = paneLen;
				left = jQuery.layout.cssNum(jQueryP, "left")
				jQueryR.css({
					width:	cssW(jQueryR, paneLen) // account for borders & padding
				,	height:	cssH(jQueryR, spacing) // ditto
				,	left:	left > -9999 ? left : sC.inset.left // handle offscreen-panes
				});
			}
			else { // east/west
				paneLen = jQueryP.outerHeight(); // s.outerHeight || 
				s.resizerLength = paneLen;
				jQueryR.css({
					height:	cssH(jQueryR, paneLen) // account for borders & padding
				,	width:	cssW(jQueryR, spacing) // ditto
				,	top:	sC.inset.top + getPaneSize("north", true) // TODO: what if no North pane?
				//,	top:	jQuery.layout.cssNum(jQueryPs["center"], "top")
				});
			}

			// remove hover classes
			removeHover( o, jQueryR );

			if (jQueryT) {
				if (togLen === 0 || (s.isSliding && o.hideTogglerOnSlide)) {
					jQueryT.hide(); // always HIDE the toggler when 'sliding'
					return;
				}
				else
					jQueryT.show(); // in case was previously hidden

				if (!(togLen > 0) || togLen === "100%" || togLen > paneLen) {
					togLen = paneLen;
					offset = 0;
				}
				else { // calculate 'offset' based on options.PANE.togglerAlign_open/closed
					if (isStr(togAlign)) {
						switch (togAlign) {
							case "top":
							case "left":	offset = 0;
											break;
							case "bottom":
							case "right":	offset = paneLen - togLen;
											break;
							case "middle":
							case "center":
							default:		offset = round((paneLen - togLen) / 2); // 'default' catches typos
						}
					}
					else { // togAlign = number
						var x = parseInt(togAlign, 10); //
						if (togAlign >= 0) offset = x;
						else offset = paneLen - togLen + x; // NOTE: x is negative!
					}
				}

				if (dir === "horz") { // north/south
					var width = cssW(jQueryT, togLen);
					jQueryT.css({
						width:	width  // account for borders & padding
					,	height:	cssH(jQueryT, spacing) // ditto
					,	left:	offset // TODO: VERIFY that toggler  positions correctly for ALL values
					,	top:	0
					});
					// CENTER the toggler content SPAN
					jQueryT.children(".content").each(function(){
						jQueryTC = jQuery(this);
						jQueryTC.css("marginLeft", round((width-jQueryTC.outerWidth())/2)); // could be negative
					});
				}
				else { // east/west
					var height = cssH(jQueryT, togLen);
					jQueryT.css({
						height:	height // account for borders & padding
					,	width:	cssW(jQueryT, spacing) // ditto
					,	top:	offset // POSITION the toggler
					,	left:	0
					});
					// CENTER the toggler content SPAN
					jQueryT.children(".content").each(function(){
						jQueryTC = jQuery(this);
						jQueryTC.css("marginTop", round((height-jQueryTC.outerHeight())/2)); // could be negative
					});
				}

				// remove ALL hover classes
				removeHover( 0, jQueryT );
			}

			// DONE measuring and sizing this resizer/toggler, so can be 'hidden' now
			if (!state.initialized && (o.initHidden || s.isHidden)) {
				jQueryR.hide();
				if (jQueryT) jQueryT.hide();
			}
		});
	}


	/**
	* @param {(string|Object)}	evt_or_pane
	*/
,	enableClosable = function (evt_or_pane) {
		if (!isInitialized()) return;
		var	pane = evtPane.call(this, evt_or_pane)
		,	jQueryT	= jQueryTs[pane]
		,	o	= options[pane]
		;
		if (!jQueryT) return;
		o.closable = true;
		jQueryT	.bind("click."+ sID, function(evt){ evt.stopPropagation(); toggle(pane); })
			.css("visibility", "visible")
			.css("cursor", "pointer")
			.attr("title", state[pane].isClosed ? o.tips.Open : o.tips.Close) // may be blank
			.show();
	}
	/**
	* @param {(string|Object)}	evt_or_pane
	* @param {boolean=}			[hide=false]
	*/
,	disableClosable = function (evt_or_pane, hide) {
		if (!isInitialized()) return;
		var	pane = evtPane.call(this, evt_or_pane)
		,	jQueryT	= jQueryTs[pane]
		;
		if (!jQueryT) return;
		options[pane].closable = false;
		// is closable is disable, then pane MUST be open!
		if (state[pane].isClosed) open(pane, false, true);
		jQueryT	.unbind("."+ sID)
			.css("visibility", hide ? "hidden" : "visible") // instead of hide(), which creates logic issues
			.css("cursor", "default")
			.attr("title", "");
	}


	/**
	* @param {(string|Object)}	evt_or_pane
	*/
,	enableSlidable = function (evt_or_pane) {
		if (!isInitialized()) return;
		var	pane = evtPane.call(this, evt_or_pane)
		,	jQueryR	= jQueryRs[pane]
		;
		if (!jQueryR || !jQueryR.data('draggable')) return;
		options[pane].slidable = true; 
		if (state[pane].isClosed)
			bindStartSlidingEvents(pane, true);
	}
	/**
	* @param {(string|Object)}	evt_or_pane
	*/
,	disableSlidable = function (evt_or_pane) {
		if (!isInitialized()) return;
		var	pane = evtPane.call(this, evt_or_pane)
		,	jQueryR	= jQueryRs[pane]
		;
		if (!jQueryR) return;
		options[pane].slidable = false; 
		if (state[pane].isSliding)
			close(pane, false, true);
		else {
			bindStartSlidingEvents(pane, false);
			jQueryR	.css("cursor", "default")
				.attr("title", "");
			removeHover(null, jQueryR[0]); // in case currently hovered
		}
	}


	/**
	* @param {(string|Object)}	evt_or_pane
	*/
,	enableResizable = function (evt_or_pane) {
		if (!isInitialized()) return;
		var	pane = evtPane.call(this, evt_or_pane)
		,	jQueryR	= jQueryRs[pane]
		,	o	= options[pane]
		;
		if (!jQueryR || !jQueryR.data('draggable')) return;
		o.resizable = true; 
		jQueryR.draggable("enable");
		if (!state[pane].isClosed)
			jQueryR	.css("cursor", o.resizerCursor)
			 	.attr("title", o.tips.Resize);
	}
	/**
	* @param {(string|Object)}	evt_or_pane
	*/
,	disableResizable = function (evt_or_pane) {
		if (!isInitialized()) return;
		var	pane = evtPane.call(this, evt_or_pane)
		,	jQueryR	= jQueryRs[pane]
		;
		if (!jQueryR || !jQueryR.data('draggable')) return;
		options[pane].resizable = false; 
		jQueryR	.draggable("disable")
			.css("cursor", "default")
			.attr("title", "");
		removeHover(null, jQueryR[0]); // in case currently hovered
	}


	/**
	* Move a pane from source-side (eg, west) to target-side (eg, east)
	* If pane exists on target-side, move that to source-side, ie, 'swap' the panes
	*
	* @param {(string|Object)}	evt_or_pane1	The pane/edge being swapped
	* @param {string}			pane2			ditto
	*/
,	swapPanes = function (evt_or_pane1, pane2) {
		if (!isInitialized()) return;
		var pane1 = evtPane.call(this, evt_or_pane1);
		// change state.edge NOW so callbacks can know where pane is headed...
		state[pane1].edge = pane2;
		state[pane2].edge = pane1;
		// run these even if NOT state.initialized
		if (false === _runCallbacks("onswap_start", pane1)
		 ||	false === _runCallbacks("onswap_start", pane2)
		) {
			state[pane1].edge = pane1; // reset
			state[pane2].edge = pane2;
			return;
		}

		var
			oPane1	= copy( pane1 )
		,	oPane2	= copy( pane2 )
		,	sizes	= {}
		;
		sizes[pane1] = oPane1 ? oPane1.state.size : 0;
		sizes[pane2] = oPane2 ? oPane2.state.size : 0;

		// clear pointers & state
		jQueryPs[pane1] = false; 
		jQueryPs[pane2] = false;
		state[pane1] = {};
		state[pane2] = {};
		
		// ALWAYS remove the resizer & toggler elements
		if (jQueryTs[pane1]) jQueryTs[pane1].remove();
		if (jQueryTs[pane2]) jQueryTs[pane2].remove();
		if (jQueryRs[pane1]) jQueryRs[pane1].remove();
		if (jQueryRs[pane2]) jQueryRs[pane2].remove();
		jQueryRs[pane1] = jQueryRs[pane2] = jQueryTs[pane1] = jQueryTs[pane2] = false;

		// transfer element pointers and data to NEW Layout keys
		move( oPane1, pane2 );
		move( oPane2, pane1 );

		// cleanup objects
		oPane1 = oPane2 = sizes = null;

		// make panes 'visible' again
		if (jQueryPs[pane1]) jQueryPs[pane1].css(_c.visible);
		if (jQueryPs[pane2]) jQueryPs[pane2].css(_c.visible);

		// fix any size discrepancies caused by swap
		resizeAll();

		// run these even if NOT state.initialized
		_runCallbacks("onswap_end", pane1);
		_runCallbacks("onswap_end", pane2);

		return;

		function copy (n) { // n = pane
			var
				jQueryP	= jQueryPs[n]
			,	jQueryC	= jQueryCs[n]
			;
			return !jQueryP ? false : {
				pane:		n
			,	P:			jQueryP ? jQueryP[0] : false
			,	C:			jQueryC ? jQueryC[0] : false
			,	state:		jQuery.extend(true, {}, state[n])
			,	options:	jQuery.extend(true, {}, options[n])
			}
		};

		function move (oPane, pane) {
			if (!oPane) return;
			var
				P		= oPane.P
			,	C		= oPane.C
			,	oldPane = oPane.pane
			,	c		= _c[pane]
			//	save pane-options that should be retained
			,	s		= jQuery.extend(true, {}, state[pane])
			,	o		= options[pane]
			//	RETAIN side-specific FX Settings - more below
			,	fx		= { resizerCursor: o.resizerCursor }
			,	re, size, pos
			;
			jQuery.each("fxName,fxSpeed,fxSettings".split(","), function (i, k) {
				fx[k +"_open"]  = o[k +"_open"];
				fx[k +"_close"] = o[k +"_close"];
				fx[k +"_size"]  = o[k +"_size"];
			});

			// update object pointers and attributes
			jQueryPs[pane] = jQuery(P)
				.data({
					layoutPane:		Instance[pane]	// NEW pointer to pane-alias-object
				,	layoutEdge:		pane
				})
				.css(_c.hidden)
				.css(c.cssReq)
			;
			jQueryCs[pane] = C ? jQuery(C) : false;

			// set options and state
			options[pane]	= jQuery.extend(true, {}, oPane.options, fx);
			state[pane]		= jQuery.extend(true, {}, oPane.state);

			// change classNames on the pane, eg: ui-layout-pane-east ==> ui-layout-pane-west
			re = new RegExp(o.paneClass +"-"+ oldPane, "g");
			P.className = P.className.replace(re, o.paneClass +"-"+ pane);

			// ALWAYS regenerate the resizer & toggler elements
			initHandles(pane); // create the required resizer & toggler

			// if moving to different orientation, then keep 'target' pane size
			if (c.dir != _c[oldPane].dir) {
				size = sizes[pane] || 0;
				setSizeLimits(pane); // update pane-state
				size = max(size, state[pane].minSize);
				// use manualSizePane to disable autoResize - not useful after panes are swapped
				manualSizePane(pane, size, true, true); // true/true = skipCallback/noAnimation
			}
			else // move the resizer here
				jQueryRs[pane].css(c.side, sC.inset[c.side] + (state[pane].isVisible ? getPaneSize(pane) : 0));


			// ADD CLASSNAMES & SLIDE-BINDINGS
			if (oPane.state.isVisible && !s.isVisible)
				setAsOpen(pane, true); // true = skipCallback
			else {
				setAsClosed(pane);
				bindStartSlidingEvents(pane, true); // will enable events IF option is set
			}

			// DESTROY the object
			oPane = null;
		};
	}


	/**
	* INTERNAL method to sync pin-buttons when pane is opened or closed
	* Unpinned means the pane is 'sliding' - ie, over-top of the adjacent panes
	*
	* @see  open(), setAsOpen(), setAsClosed()
	* @param {string}	pane   These are the params returned to callbacks by layout()
	* @param {boolean}	doPin  True means set the pin 'down', False means 'up'
	*/
,	syncPinBtns = function (pane, doPin) {
		if (jQuery.layout.plugins.buttons)
			jQuery.each(state[pane].pins, function (i, selector) {
				jQuery.layout.buttons.setPinState(Instance, jQuery(selector), pane, doPin);
			});
	}

;	// END var DECLARATIONS

	/**
	* Capture keys when enableCursorHotkey - toggle pane if hotkey pressed
	*
	* @see  document.keydown()
	*/
	function keyDown (evt) {
		if (!evt) return true;
		var code = evt.keyCode;
		if (code < 33) return true; // ignore special keys: ENTER, TAB, etc

		var
			PANE = {
				38: "north" // Up Cursor	- jQuery.ui.keyCode.UP
			,	40: "south" // Down Cursor	- jQuery.ui.keyCode.DOWN
			,	37: "west"  // Left Cursor	- jQuery.ui.keyCode.LEFT
			,	39: "east"  // Right Cursor	- jQuery.ui.keyCode.RIGHT
			}
		,	ALT		= evt.altKey // no worky!
		,	SHIFT	= evt.shiftKey
		,	CTRL	= evt.ctrlKey
		,	CURSOR	= (CTRL && code >= 37 && code <= 40)
		,	o, k, m, pane
		;

		if (CURSOR && options[PANE[code]].enableCursorHotkey) // valid cursor-hotkey
			pane = PANE[code];
		else if (CTRL || SHIFT) // check to see if this matches a custom-hotkey
			jQuery.each(_c.borderPanes, function (i, p) { // loop each pane to check its hotkey
				o = options[p];
				k = o.customHotkey;
				m = o.customHotkeyModifier; // if missing or invalid, treated as "CTRL+SHIFT"
				if ((SHIFT && m=="SHIFT") || (CTRL && m=="CTRL") || (CTRL && SHIFT)) { // Modifier matches
					if (k && code === (isNaN(k) || k <= 9 ? k.toUpperCase().charCodeAt(0) : k)) { // Key matches
						pane = p;
						return false; // BREAK
					}
				}
			});

		// validate pane
		if (!pane || !jQueryPs[pane] || !options[pane].closable || state[pane].isHidden)
			return true;

		toggle(pane);

		evt.stopPropagation();
		evt.returnValue = false; // CANCEL key
		return false;
	};


/*
 * ######################################
 *	UTILITY METHODS
 *	called externally or by initButtons
 * ######################################
 */

	/**
	* Change/reset a pane overflow setting & zIndex to allow popups/drop-downs to work
	*
	* @param {Object=}   [el]	(optional) Can also be 'bound' to a click, mouseOver, or other event
	*/
	function allowOverflow (el) {
		if (!isInitialized()) return;
		if (this && this.tagName) el = this; // BOUND to element
		var jQueryP;
		if (isStr(el))
			jQueryP = jQueryPs[el];
		else if (jQuery(el).data("layoutRole"))
			jQueryP = jQuery(el);
		else
			jQuery(el).parents().each(function(){
				if (jQuery(this).data("layoutRole")) {
					jQueryP = jQuery(this);
					return false; // BREAK
				}
			});
		if (!jQueryP || !jQueryP.length) return; // INVALID

		var
			pane	= jQueryP.data("layoutEdge")
		,	s		= state[pane]
		;

		// if pane is already raised, then reset it before doing it again!
		// this would happen if allowOverflow is attached to BOTH the pane and an element 
		if (s.cssSaved)
			resetOverflow(pane); // reset previous CSS before continuing

		// if pane is raised by sliding or resizing, or its closed, then abort
		if (s.isSliding || s.isResizing || s.isClosed) {
			s.cssSaved = false;
			return;
		}

		var
			newCSS	= { zIndex: (options.zIndexes.resizer_normal + 1) }
		,	curCSS	= {}
		,	of		= jQueryP.css("overflow")
		,	ofX		= jQueryP.css("overflowX")
		,	ofY		= jQueryP.css("overflowY")
		;
		// determine which, if any, overflow settings need to be changed
		if (of != "visible") {
			curCSS.overflow = of;
			newCSS.overflow = "visible";
		}
		if (ofX && !ofX.match(/(visible|auto)/)) {
			curCSS.overflowX = ofX;
			newCSS.overflowX = "visible";
		}
		if (ofY && !ofY.match(/(visible|auto)/)) {
			curCSS.overflowY = ofX;
			newCSS.overflowY = "visible";
		}

		// save the current overflow settings - even if blank!
		s.cssSaved = curCSS;

		// apply new CSS to raise zIndex and, if necessary, make overflow 'visible'
		jQueryP.css( newCSS );

		// make sure the zIndex of all other panes is normal
		jQuery.each(_c.allPanes, function(i, p) {
			if (p != pane) resetOverflow(p);
		});

	};
	/**
	* @param {Object=}   [el]	(optional) Can also be 'bound' to a click, mouseOver, or other event
	*/
	function resetOverflow (el) {
		if (!isInitialized()) return;
		if (this && this.tagName) el = this; // BOUND to element
		var jQueryP;
		if (isStr(el))
			jQueryP = jQueryPs[el];
		else if (jQuery(el).data("layoutRole"))
			jQueryP = jQuery(el);
		else
			jQuery(el).parents().each(function(){
				if (jQuery(this).data("layoutRole")) {
					jQueryP = jQuery(this);
					return false; // BREAK
				}
			});
		if (!jQueryP || !jQueryP.length) return; // INVALID

		var
			pane	= jQueryP.data("layoutEdge")
		,	s		= state[pane]
		,	CSS		= s.cssSaved || {}
		;
		// reset the zIndex
		if (!s.isSliding && !s.isResizing)
			jQueryP.css("zIndex", options.zIndexes.pane_normal);

		// reset Overflow - if necessary
		jQueryP.css( CSS );

		// clear var
		s.cssSaved = false;
	};

/*
 * #####################
 * CREATE/RETURN LAYOUT
 * #####################
 */

	// validate that container exists
	var jQueryN = jQuery(this).eq(0); // FIRST matching Container element
	if (!jQueryN.length) {
		return _log( options.errors.containerMissing );
	};

	// Users retrieve Instance of a layout with: jQueryN.layout() OR jQueryN.data("layout")
	// return the Instance-pointer if layout has already been initialized
	if (jQueryN.data("layoutContainer") && jQueryN.data("layout"))
		return jQueryN.data("layout"); // cached pointer

	// init global vars
	var 
		jQueryPs	= {}	// Panes x5		- set in initPanes()
	,	jQueryCs	= {}	// Content x5	- set in initPanes()
	,	jQueryRs	= {}	// Resizers x4	- set in initHandles()
	,	jQueryTs	= {}	// Togglers x4	- set in initHandles()
	,	jQueryMs	= jQuery([])	// Masks - up to 2 masks per pane (IFRAME + DIV)
	//	aliases for code brevity
	,	sC	= state.container // alias for easy access to 'container dimensions'
	,	sID	= state.id // alias for unique layout ID/namespace - eg: "layout435"
	;

	// create Instance object to expose data & option Properties, and primary action Methods
	var Instance = {
	//	layout data
		options:			options			// property - options hash
	,	state:				state			// property - dimensions hash
	//	object pointers
	,	container:			jQueryN				// property - object pointers for layout container
	,	panes:				jQueryPs				// property - object pointers for ALL Panes: panes.north, panes.center
	,	contents:			jQueryCs				// property - object pointers for ALL Content: contents.north, contents.center
	,	resizers:			jQueryRs				// property - object pointers for ALL Resizers, eg: resizers.north
	,	togglers:			jQueryTs				// property - object pointers for ALL Togglers, eg: togglers.north
	//	border-pane open/close
	,	hide:				hide			// method - ditto
	,	show:				show			// method - ditto
	,	toggle:				toggle			// method - pass a 'pane' ("north", "west", etc)
	,	open:				open			// method - ditto
	,	close:				close			// method - ditto
	,	slideOpen:			slideOpen		// method - ditto
	,	slideClose:			slideClose		// method - ditto
	,	slideToggle:		slideToggle		// method - ditto
	//	pane actions
	,	setSizeLimits:		setSizeLimits	// method - pass a 'pane' - update state min/max data
	,	_sizePane:			sizePane		// method -intended for user by plugins only!
	,	sizePane:			manualSizePane	// method - pass a 'pane' AND an 'outer-size' in pixels or percent, or 'auto'
	,	sizeContent:		sizeContent		// method - pass a 'pane'
	,	swapPanes:			swapPanes		// method - pass TWO 'panes' - will swap them
	,	showMasks:			showMasks		// method - pass a 'pane' OR list of panes - default = all panes with mask option set
	,	hideMasks:			hideMasks		// method - ditto'
	//	pane element methods
	,	initContent:		initContent		// method - ditto
	,	addPane:			addPane			// method - pass a 'pane'
	,	removePane:			removePane		// method - pass a 'pane' to remove from layout, add 'true' to delete the pane-elem
	,	createChildren:		createChildren	// method - pass a 'pane' and (optional) layout-options (OVERRIDES options[pane].children
	,	refreshChildren:	refreshChildren	// method - pass a 'pane' and a layout-instance
	//	special pane option setting
	,	enableClosable:		enableClosable	// method - pass a 'pane'
	,	disableClosable:	disableClosable	// method - ditto
	,	enableSlidable:		enableSlidable	// method - ditto
	,	disableSlidable:	disableSlidable	// method - ditto
	,	enableResizable:	enableResizable	// method - ditto
	,	disableResizable:	disableResizable// method - ditto
	//	utility methods for panes
	,	allowOverflow:		allowOverflow	// utility - pass calling element (this)
	,	resetOverflow:		resetOverflow	// utility - ditto
	//	layout control
	,	destroy:			destroy			// method - no parameters
	,	initPanes:			isInitialized	// method - no parameters
	,	resizeAll:			resizeAll		// method - no parameters
	//	callback triggering
	,	runCallbacks:		_runCallbacks	// method - pass evtName & pane (if a pane-event), eg: trigger("onopen", "west")
	//	alias collections of options, state and children - created in addPane and extended elsewhere
	,	hasParentLayout:	false			// set by initContainer()
	,	children:			children		// pointers to child-layouts, eg: Instance.children.west.layoutName
	,	north:				false			// alias group: { name: pane, pane: jQueryPs[pane], options: options[pane], state: state[pane], children: children[pane] }
	,	south:				false			// ditto
	,	west:				false			// ditto
	,	east:				false			// ditto
	,	center:				false			// ditto
	};

	// create the border layout NOW
	if (_create() === 'cancel') // onload_start callback returned false to CANCEL layout creation
		return null;
	else // true OR false -- if layout-elements did NOT init (hidden or do not exist), can auto-init later
		return Instance; // return the Instance object

}


})( jQuery );
// END Layout - keep internal vars internal!



// START Plugins - shared wrapper, no global vars
(function (jQuery) {


/**
 * jquery.layout.state 1.0
 * jQueryDate: 2011-07-16 08:00:00 (Sat, 16 July 2011) jQuery
 *
 * Copyright (c) 2012 
 *   Kevin Dalman (http://allpro.net)
 *
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
 *
 * @requires: UI Layout 1.3.0.rc30.1 or higher
 * @requires: jQuery.ui.cookie (above)
 *
 * @see: http://groups.google.com/group/jquery-ui-layout
 */
/*
 *	State-management options stored in options.stateManagement, which includes a .cookie hash
 *	Default options saves ALL KEYS for ALL PANES, ie: pane.size, pane.isClosed, pane.isHidden
 *
 *	// STATE/COOKIE OPTIONS
 *	@example jQuery(el).layout({
				stateManagement: {
					enabled:	true
				,	stateKeys:	"east.size,west.size,east.isClosed,west.isClosed"
				,	cookie:		{ name: "appLayout", path: "/" }
				}
			})
 *	@example jQuery(el).layout({ stateManagement__enabled: true }) // enable auto-state-management using cookies
 *	@example jQuery(el).layout({ stateManagement__cookie: { name: "appLayout", path: "/" } })
 *	@example jQuery(el).layout({ stateManagement__cookie__name: "appLayout", stateManagement__cookie__path: "/" })
 *
 *	// STATE/COOKIE METHODS
 *	@example myLayout.saveCookie( "west.isClosed,north.size,south.isHidden", {expires: 7} );
 *	@example myLayout.loadCookie();
 *	@example myLayout.deleteCookie();
 *	@example var JSON = myLayout.readState();	// CURRENT Layout State
 *	@example var JSON = myLayout.readCookie();	// SAVED Layout State (from cookie)
 *	@example var JSON = myLayout.state.stateData;	// LAST LOADED Layout State (cookie saved in layout.state hash)
 *
 *	CUSTOM STATE-MANAGEMENT (eg, saved in a database)
 *	@example var JSON = myLayout.readState( "west.isClosed,north.size,south.isHidden" );
 *	@example myLayout.loadState( JSON );
 */

/**
 *	UI COOKIE UTILITY
 *
 *	A jQuery.cookie OR jQuery.ui.cookie namespace *should be standard*, but until then...
 *	This creates jQuery.ui.cookie so Layout does not need the cookie.jquery.js plugin
 *	NOTE: This utility is REQUIRED by the layout.state plugin
 *
 *	Cookie methods in Layout are created as part of State Management 
 */
if (!jQuery.ui) jQuery.ui = {};
jQuery.ui.cookie = {

	// cookieEnabled is not in DOM specs, but DOES works in all browsers,including IE6
	acceptsCookies: !!navigator.cookieEnabled

,	read: function (name) {
		var	c		= document.cookie
		,	cs		= c ? c.split(';') : []
		,	pair	// loop var
		;
		for (var i=0, n=cs.length; i < n; i++) {
			pair = jQuery.trim(cs[i]).split('='); // name=value pair
			if (pair[0] == name) // found the layout cookie
				return decodeURIComponent(pair[1]);
		}
		return null;
	}

,	write: function (name, val, cookieOpts) {
		var	params	= ""
		,	date	= ""
		,	clear	= false
		,	o		= cookieOpts || {}
		,	x		= o.expires  || null
		,	t		= jQuery.type(x)
		;
		if (t === "date")
			date = x;
		else if (t === "string" && x > 0) {
			x = parseInt(x,10);
			t = "number";
		}
		if (t === "number") {
			date = new Date();
			if (x > 0)
				date.setDate(date.getDate() + x);
			else {
				date.setFullYear(1970);
				clear = true;
			}
		}
		if (date)		params += ";expires="+ date.toUTCString();
		if (o.path)		params += ";path="+ o.path;
		if (o.domain)	params += ";domain="+ o.domain;
		if (o.secure)	params += ";secure";
		document.cookie = name +"="+ (clear ? "" : encodeURIComponent( val )) + params; // write or clear cookie
	}

,	clear: function (name) {
		jQuery.ui.cookie.write(name, "", {expires: -1});
	}

};
// if cookie.jquery.js is not loaded, create an alias to replicate it
// this may be useful to other plugins or code dependent on that plugin
if (!jQuery.cookie) jQuery.cookie = function (k, v, o) {
	var C = jQuery.ui.cookie;
	if (v === null)
		C.clear(k);
	else if (v === undefined)
		return C.read(k);
	else
		C.write(k, v, o);
};


// tell Layout that the state plugin is available
jQuery.layout.plugins.stateManagement = true;

//	Add State-Management options to layout.defaults
jQuery.layout.config.optionRootKeys.push("stateManagement");
jQuery.layout.defaults.stateManagement = {
	enabled:		false	// true = enable state-management, even if not using cookies
,	autoSave:		true	// Save a state-cookie when page exits?
,	autoLoad:		true	// Load the state-cookie when Layout inits?
,	animateLoad:	true	// animate panes when loading state into an active layout
,	includeChildren: true	// recurse into child layouts to include their state as well
	// List state-data to save - must be pane-specific
,	stateKeys:	"north.size,south.size,east.size,west.size,"+
				"north.isClosed,south.isClosed,east.isClosed,west.isClosed,"+
				"north.isHidden,south.isHidden,east.isHidden,west.isHidden"
,	cookie: {
		name:	""	// If not specified, will use Layout.name, else just "Layout"
	,	domain:	""	// blank = current domain
	,	path:	""	// blank = current page, "/" = entire website
	,	expires: ""	// 'days' to keep cookie - leave blank for 'session cookie'
	,	secure:	false
	}
};
// Set stateManagement as a layout-option, NOT a pane-option
jQuery.layout.optionsMap.layout.push("stateManagement");

/*
 *	State Management methods
 */
jQuery.layout.state = {

	/**
	 * Get the current layout state and save it to a cookie
	 *
	 * myLayout.saveCookie( keys, cookieOpts )
	 *
	 * @param {Object}			inst
	 * @param {(string|Array)=}	keys
	 * @param {Object=}			cookieOpts
	 */
	saveCookie: function (inst, keys, cookieOpts) {
		var o	= inst.options
		,	sm	= o.stateManagement
		,	oC	= jQuery.extend(true, {}, sm.cookie, cookieOpts || null)
		,	data = inst.state.stateData = inst.readState( keys || sm.stateKeys ) // read current panes-state
		;
		jQuery.ui.cookie.write( oC.name || o.name || "Layout", jQuery.layout.state.encodeJSON(data), oC );
		return jQuery.extend(true, {}, data); // return COPY of state.stateData data
	}

	/**
	 * Remove the state cookie
	 *
	 * @param {Object}	inst
	 */
,	deleteCookie: function (inst) {
		var o = inst.options;
		jQuery.ui.cookie.clear( o.stateManagement.cookie.name || o.name || "Layout" );
	}

	/**
	 * Read & return data from the cookie - as JSON
	 *
	 * @param {Object}	inst
	 */
,	readCookie: function (inst) {
		var o = inst.options;
		var c = jQuery.ui.cookie.read( o.stateManagement.cookie.name || o.name || "Layout" );
		// convert cookie string back to a hash and return it
		return c ? jQuery.layout.state.decodeJSON(c) : {};
	}

	/**
	 * Get data from the cookie and USE IT to loadState
	 *
	 * @param {Object}	inst
	 */
,	loadCookie: function (inst) {
		var c = jQuery.layout.state.readCookie(inst); // READ the cookie
		if (c) {
			inst.state.stateData = jQuery.extend(true, {}, c); // SET state.stateData
			inst.loadState(c); // LOAD the retrieved state
		}
		return c;
	}

	/**
	 * Update layout options from the cookie, if one exists
	 *
	 * @param {Object}		inst
	 * @param {Object=}		stateData
	 * @param {boolean=}	animate
	 */
,	loadState: function (inst, data, opts) {
		if (!jQuery.isPlainObject( data ) || jQuery.isEmptyObject( data )) return;

		// normalize data & cache in the state object
		data = inst.state.stateData = jQuery.layout.transformData( data ); // panes = default subkey

		// add missing/default state-restore options
		var smo = inst.options.stateManagement;
		opts = jQuery.extend({
			animateLoad:		false //smo.animateLoad
		,	includeChildren:	smo.includeChildren
		}, opts );

		if (!inst.state.initialized) {
			/*
			 *	layout NOT initialized, so just update its options
			 */
			// MUST remove pane.children keys before applying to options
			// use a copy so we don't remove keys from original data
			var o = jQuery.extend(true, {}, data);
			//delete o.center; // center has no state-data - only children
			jQuery.each(jQuery.layout.config.allPanes, function (idx, pane) {
				if (o[pane]) delete o[pane].children;		   
			 });
			// update CURRENT layout-options with saved state data
			jQuery.extend(true, inst.options, o);
		}
		else {
			/*
			 *	layout already initialized, so modify layout's configuration
			 */
			var noAnimate = !opts.animateLoad
			,	o, c, h, state, open
			;
			jQuery.each(jQuery.layout.config.borderPanes, function (idx, pane) {
				o = data[ pane ];
				if (!jQuery.isPlainObject( o )) return; // no key, skip pane

				s	= o.size;
				c	= o.initClosed;
				h	= o.initHidden;
				ar	= o.autoResize
				state	= inst.state[pane];
				open	= state.isVisible;

				// reset autoResize
				if (ar)
					state.autoResize = ar;
				// resize BEFORE opening
				if (!open)
					inst._sizePane(pane, s, false, false, false); // false=skipCallback/noAnimation/forceResize
				// open/close as necessary - DO NOT CHANGE THIS ORDER!
				if (h === true)			inst.hide(pane, noAnimate);
				else if (c === true)	inst.close(pane, false, noAnimate);
				else if (c === false)	inst.open (pane, false, noAnimate);
				else if (h === false)	inst.show (pane, false, noAnimate);
				// resize AFTER any other actions
				if (open)
					inst._sizePane(pane, s, false, false, noAnimate); // animate resize if option passed
			});

			/*
			 *	RECURSE INTO CHILD-LAYOUTS
			 */
			if (opts.includeChildren) {
				var paneStateChildren, childState;
				jQuery.each(inst.children, function (pane, paneChildren) {
					paneStateChildren = data[pane] ? data[pane].children : 0;
					if (paneStateChildren && paneChildren) {
						jQuery.each(paneChildren, function (stateKey, child) {
							childState = paneStateChildren[stateKey];
							if (child && childState)
								child.loadState( childState );
						});
					}
				});
			}
		}
	}

	/**
	 * Get the *current layout state* and return it as a hash
	 *
	 * @param {Object=}		inst	// Layout instance to get state for
	 * @param {object=}		[opts]	// State-Managements override options
	 */
,	readState: function (inst, opts) {
		// backward compatility
		if (jQuery.type(opts) === 'string') opts = { keys: opts };
		if (!opts) opts = {};
		var	sm		= inst.options.stateManagement
		,	ic		= opts.includeChildren
		,	recurse	= ic !== undefined ? ic : sm.includeChildren
		,	keys	= opts.stateKeys || sm.stateKeys
		,	alt		= { isClosed: 'initClosed', isHidden: 'initHidden' }
		,	state	= inst.state
		,	panes	= jQuery.layout.config.allPanes
		,	data	= {}
		,	pair, pane, key, val
		,	ps, pC, child, array, count, branch
		;
		if (jQuery.isArray(keys)) keys = keys.join(",");
		// convert keys to an array and change delimiters from '__' to '.'
		keys = keys.replace(/__/g, ".").split(',');
		// loop keys and create a data hash
		for (var i=0, n=keys.length; i < n; i++) {
			pair = keys[i].split(".");
			pane = pair[0];
			key  = pair[1];
			if (jQuery.inArray(pane, panes) < 0) continue; // bad pane!
			val = state[ pane ][ key ];
			if (val == undefined) continue;
			if (key=="isClosed" && state[pane]["isSliding"])
				val = true; // if sliding, then *really* isClosed
			( data[pane] || (data[pane]={}) )[ alt[key] ? alt[key] : key ] = val;
		}

		// recurse into the child-layouts for each pane
		if (recurse) {
			jQuery.each(panes, function (idx, pane) {
				pC = inst.children[pane];
				ps = state.stateData[pane];
				if (jQuery.isPlainObject( pC ) && !jQuery.isEmptyObject( pC )) {
					// ensure a key exists for this 'pane', eg: branch = data.center
					branch = data[pane] || (data[pane] = {});
					if (!branch.children) branch.children = {};
					jQuery.each( pC, function (key, child) {
						// ONLY read state from an initialize layout
						if ( child.state.initialized )
							branch.children[ key ] = jQuery.layout.state.readState( child );
						// if we have PREVIOUS (onLoad) state for this child-layout, KEEP IT!
						else if ( ps && ps.children && ps.children[ key ] ) {
							branch.children[ key ] = jQuery.extend(true, {}, ps.children[ key ] );
						}
					});
				}
			});
		}

		return data;
	}

	/**
	 *	Stringify a JSON hash so can save in a cookie or db-field
	 */
,	encodeJSON: function (JSON) {
		return parse(JSON);
		function parse (h) {
			var D=[], i=0, k, v, t // k = key, v = value
			,	a = jQuery.isArray(h)
			;
			for (k in h) {
				v = h[k];
				t = typeof v;
				if (t == 'string')		// STRING - add quotes
					v = '"'+ v +'"';
				else if (t == 'object')	// SUB-KEY - recurse into it
					v = parse(v);
				D[i++] = (!a ? '"'+ k +'":' : '') + v;
			}
			return (a ? '[' : '{') + D.join(',') + (a ? ']' : '}');
		};
	}

	/**
	 *	Convert stringified JSON back to a hash object
	 *	@see		jQuery.parseJSON(), adding in jQuery 1.4.1
	 */
,	decodeJSON: function (str) {
		try { return jQuery.parseJSON ? jQuery.parseJSON(str) : window["eval"]("("+ str +")") || {}; }
		catch (e) { return {}; }
	}


,	_create: function (inst) {
		var _	= jQuery.layout.state
		,	o	= inst.options
		,	sm	= o.stateManagement
		;
		//	ADD State-Management plugin methods to inst
		 jQuery.extend( inst, {
		//	readCookie - update options from cookie - returns hash of cookie data
			readCookie:		function () { return _.readCookie(inst); }
		//	deleteCookie
		,	deleteCookie:	function () { _.deleteCookie(inst); }
		//	saveCookie - optionally pass keys-list and cookie-options (hash)
		,	saveCookie:		function (keys, cookieOpts) { return _.saveCookie(inst, keys, cookieOpts); }
		//	loadCookie - readCookie and use to loadState() - returns hash of cookie data
		,	loadCookie:		function () { return _.loadCookie(inst); }
		//	loadState - pass a hash of state to use to update options
		,	loadState:		function (stateData, opts) { _.loadState(inst, stateData, opts); }
		//	readState - returns hash of current layout-state
		,	readState:		function (keys) { return _.readState(inst, keys); }
		//	add JSON utility methods too...
		,	encodeJSON:		_.encodeJSON
		,	decodeJSON:		_.decodeJSON
		});

		// init state.stateData key, even if plugin is initially disabled
		inst.state.stateData = {};

		// autoLoad MUST BE one of: data-array, data-hash, callback-function, or TRUE
		if ( !sm.autoLoad ) return;

		//	When state-data exists in the autoLoad key USE IT,
		//	even if stateManagement.enabled == false
		if (jQuery.isPlainObject( sm.autoLoad )) {
			if (!jQuery.isEmptyObject( sm.autoLoad )) {
				inst.loadState( sm.autoLoad );
			}
		}
		else if ( sm.enabled ) {
			// update the options from cookie or callback
			// if options is a function, call it to get stateData
			if (jQuery.isFunction( sm.autoLoad )) {
				var d = {};
				try {
					d = sm.autoLoad( inst, inst.state, inst.options, inst.options.name || '' ); // try to get data from fn
				} catch (e) {}
				if (d && jQuery.isPlainObject( d ) && !jQuery.isEmptyObject( d ))
					inst.loadState(d);
			}
			else // any other truthy value will trigger loadCookie
				inst.loadCookie();
		}
	}

,	_unload: function (inst) {
		var sm = inst.options.stateManagement;
		if (sm.enabled && sm.autoSave) {
			// if options is a function, call it to save the stateData
			if (jQuery.isFunction( sm.autoSave )) {
				try {
					sm.autoSave( inst, inst.state, inst.options, inst.options.name || '' ); // try to get data from fn
				} catch (e) {}
			}
			else // any truthy value will trigger saveCookie
				inst.saveCookie();
		}
	}

};

// add state initialization method to Layout's onCreate array of functions
jQuery.layout.onCreate.push( jQuery.layout.state._create );
jQuery.layout.onUnload.push( jQuery.layout.state._unload );




/**
 * jquery.layout.buttons 1.0
 * jQueryDate: 2011-07-16 08:00:00 (Sat, 16 July 2011) jQuery
 *
 * Copyright (c) 2012 
 *   Kevin Dalman (http://allpro.net)
 *
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
 *
 * @requires: UI Layout 1.3.0.rc30.1 or higher
 *
 * @see: http://groups.google.com/group/jquery-ui-layout
 *
 * Docs: [ to come ]
 * Tips: [ to come ]
 */

// tell Layout that the state plugin is available
jQuery.layout.plugins.buttons = true;

//	Add buttons options to layout.defaults
jQuery.layout.defaults.autoBindCustomButtons = false;
// Specify autoBindCustomButtons as a layout-option, NOT a pane-option
jQuery.layout.optionsMap.layout.push("autoBindCustomButtons");

/*
 *	Button methods
 */
jQuery.layout.buttons = {

	/**
	* Searches for .ui-layout-button-xxx elements and auto-binds them as layout-buttons
	*
	* @see  _create()
	*
	* @param  {Object}		inst	Layout Instance object
	*/
	init: function (inst) {
		var pre		= "ui-layout-button-"
		,	layout	= inst.options.name || ""
		,	name;
		jQuery.each("toggle,open,close,pin,toggle-slide,open-slide".split(","), function (i, action) {
			jQuery.each(jQuery.layout.config.borderPanes, function (ii, pane) {
				jQuery("."+pre+action+"-"+pane).each(function(){
					// if button was previously 'bound', data.layoutName was set, but is blank if layout has no 'name'
					name = jQuery(this).data("layoutName") || jQuery(this).attr("layoutName");
					if (name == undefined || name === layout)
						inst.bindButton(this, action, pane);
				});
			});
		});
	}

	/**
	* Helper function to validate params received by addButton utilities
	*
	* Two classes are added to the element, based on the buttonClass...
	* The type of button is appended to create the 2nd className:
	*  - ui-layout-button-pin		// action btnClass
	*  - ui-layout-button-pin-west	// action btnClass + pane
	*  - ui-layout-button-toggle
	*  - ui-layout-button-open
	*  - ui-layout-button-close
	*
	* @param {Object}			inst		Layout Instance object
	* @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"
	* @param {string}   		pane 		Name of the pane the button is for: 'north', 'south', etc.
	*
	* @return {Array.<Object>}	If both params valid, the element matching 'selector' in a jQuery wrapper - otherwise returns null
	*/
,	get: function (inst, selector, pane, action) {
		var jQueryE	= jQuery(selector)
		,	o	= inst.options
		,	err	= o.errors.addButtonError
		;
		if (!jQueryE.length) { // element not found
			jQuery.layout.msg(err +" "+ o.errors.selector +": "+ selector, true);
		}
		else if (jQuery.inArray(pane, jQuery.layout.config.borderPanes) < 0) { // invalid 'pane' sepecified
			jQuery.layout.msg(err +" "+ o.errors.pane +": "+ pane, true);
			jQueryE = jQuery("");  // NO BUTTON
		}
		else { // VALID
			var btn = o[pane].buttonClass +"-"+ action;
			jQueryE	.addClass( btn +" "+ btn +"-"+ pane )
				.data("layoutName", o.name); // add layout identifier - even if blank!
		}
		return jQueryE;
	}


	/**
	* NEW syntax for binding layout-buttons - will eventually replace addToggle, addOpen, etc.
	*
	* @param {Object}			inst		Layout Instance object
	* @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"
	* @param {string}			action
	* @param {string}			pane
	*/
,	bind: function (inst, selector, action, pane) {
		var _ = jQuery.layout.buttons;
		switch (action.toLowerCase()) {
			case "toggle":			_.addToggle	(inst, selector, pane); break;	
			case "open":			_.addOpen	(inst, selector, pane); break;
			case "close":			_.addClose	(inst, selector, pane); break;
			case "pin":				_.addPin	(inst, selector, pane); break;
			case "toggle-slide":	_.addToggle	(inst, selector, pane, true); break;	
			case "open-slide":		_.addOpen	(inst, selector, pane, true); break;
		}
		return inst;
	}

	/**
	* Add a custom Toggler button for a pane
	*
	* @param {Object}			inst		Layout Instance object
	* @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"
	* @param {string}  			pane 		Name of the pane the button is for: 'north', 'south', etc.
	* @param {boolean=}			slide 		true = slide-open, false = pin-open
	*/
,	addToggle: function (inst, selector, pane, slide) {
		jQuery.layout.buttons.get(inst, selector, pane, "toggle")
			.click(function(evt){
				inst.toggle(pane, !!slide);
				evt.stopPropagation();
			});
		return inst;
	}

	/**
	* Add a custom Open button for a pane
	*
	* @param {Object}			inst		Layout Instance object
	* @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"
	* @param {string}			pane 		Name of the pane the button is for: 'north', 'south', etc.
	* @param {boolean=}			slide 		true = slide-open, false = pin-open
	*/
,	addOpen: function (inst, selector, pane, slide) {
		jQuery.layout.buttons.get(inst, selector, pane, "open")
			.attr("title", inst.options[pane].tips.Open)
			.click(function (evt) {
				inst.open(pane, !!slide);
				evt.stopPropagation();
			});
		return inst;
	}

	/**
	* Add a custom Close button for a pane
	*
	* @param {Object}			inst		Layout Instance object
	* @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"
	* @param {string}   		pane 		Name of the pane the button is for: 'north', 'south', etc.
	*/
,	addClose: function (inst, selector, pane) {
		jQuery.layout.buttons.get(inst, selector, pane, "close")
			.attr("title", inst.options[pane].tips.Close)
			.click(function (evt) {
				inst.close(pane);
				evt.stopPropagation();
			});
		return inst;
	}

	/**
	* Add a custom Pin button for a pane
	*
	* Four classes are added to the element, based on the paneClass for the associated pane...
	* Assuming the default paneClass and the pin is 'up', these classes are added for a west-pane pin:
	*  - ui-layout-pane-pin
	*  - ui-layout-pane-west-pin
	*  - ui-layout-pane-pin-up
	*  - ui-layout-pane-west-pin-up
	*
	* @param {Object}			inst		Layout Instance object
	* @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"
	* @param {string}   		pane 		Name of the pane the pin is for: 'north', 'south', etc.
	*/
,	addPin: function (inst, selector, pane) {
		var	_	= jQuery.layout.buttons
		,	jQueryE	= _.get(inst, selector, pane, "pin");
		if (jQueryE.length) {
			var s = inst.state[pane];
			jQueryE.click(function (evt) {
				_.setPinState(inst, jQuery(this), pane, (s.isSliding || s.isClosed));
				if (s.isSliding || s.isClosed) inst.open( pane ); // change from sliding to open
				else inst.close( pane ); // slide-closed
				evt.stopPropagation();
			});
			// add up/down pin attributes and classes
			_.setPinState(inst, jQueryE, pane, (!s.isClosed && !s.isSliding));
			// add this pin to the pane data so we can 'sync it' automatically
			// PANE.pins key is an array so we can store multiple pins for each pane
			s.pins.push( selector ); // just save the selector string
		}
		return inst;
	}

	/**
	* Change the class of the pin button to make it look 'up' or 'down'
	*
	* @see  addPin(), syncPins()
	*
	* @param {Object}			inst	Layout Instance object
	* @param {Array.<Object>}	jQueryPin	The pin-span element in a jQuery wrapper
	* @param {string}			pane	These are the params returned to callbacks by layout()
	* @param {boolean}			doPin	true = set the pin 'down', false = set it 'up'
	*/
,	setPinState: function (inst, jQueryPin, pane, doPin) {
		var updown = jQueryPin.attr("pin");
		if (updown && doPin === (updown=="down")) return; // already in correct state
		var
			o		= inst.options[pane]
		,	pin		= o.buttonClass +"-pin"
		,	side	= pin +"-"+ pane
		,	UP		= pin +"-up "+	side +"-up"
		,	DN		= pin +"-down "+side +"-down"
		;
		jQueryPin
			.attr("pin", doPin ? "down" : "up") // logic
			.attr("title", doPin ? o.tips.Unpin : o.tips.Pin)
			.removeClass( doPin ? UP : DN ) 
			.addClass( doPin ? DN : UP ) 
		;
	}

	/**
	* INTERNAL function to sync 'pin buttons' when pane is opened or closed
	* Unpinned means the pane is 'sliding' - ie, over-top of the adjacent panes
	*
	* @see  open(), close()
	*
	* @param {Object}			inst	Layout Instance object
	* @param {string}	pane	These are the params returned to callbacks by layout()
	* @param {boolean}	doPin	True means set the pin 'down', False means 'up'
	*/
,	syncPinBtns: function (inst, pane, doPin) {
		// REAL METHOD IS _INSIDE_ LAYOUT - THIS IS HERE JUST FOR REFERENCE
		jQuery.each(inst.state[pane].pins, function (i, selector) {
			jQuery.layout.buttons.setPinState(inst, jQuery(selector), pane, doPin);
		});
	}


,	_load: function (inst) {
		var	_	= jQuery.layout.buttons;
		// ADD Button methods to Layout Instance
		// Note: sel = jQuery Selector string
		jQuery.extend( inst, {
			bindButton:		function (sel, action, pane) { return _.bind(inst, sel, action, pane); }
		//	DEPRECATED METHODS
		,	addToggleBtn:	function (sel, pane, slide) { return _.addToggle(inst, sel, pane, slide); }
		,	addOpenBtn:		function (sel, pane, slide) { return _.addOpen(inst, sel, pane, slide); }
		,	addCloseBtn:	function (sel, pane) { return _.addClose(inst, sel, pane); }
		,	addPinBtn:		function (sel, pane) { return _.addPin(inst, sel, pane); }
		});

		// init state array to hold pin-buttons
		for (var i=0; i<4; i++) {
			var pane = jQuery.layout.config.borderPanes[i];
			inst.state[pane].pins = [];
		}

		// auto-init buttons onLoad if option is enabled
		if ( inst.options.autoBindCustomButtons )
			_.init(inst);
	}

,	_unload: function (inst) {
		// TODO: unbind all buttons???
	}

};

// add initialization method to Layout's onLoad array of functions
jQuery.layout.onLoad.push(  jQuery.layout.buttons._load );
//jQuery.layout.onUnload.push( jQuery.layout.buttons._unload );



/**
 * jquery.layout.browserZoom 1.0
 * jQueryDate: 2011-12-29 08:00:00 (Thu, 29 Dec 2011) jQuery
 *
 * Copyright (c) 2012 
 *   Kevin Dalman (http://allpro.net)
 *
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
 *
 * @requires: UI Layout 1.3.0.rc30.1 or higher
 *
 * @see: http://groups.google.com/group/jquery-ui-layout
 *
 * TODO: Extend logic to handle other problematic zooming in browsers
 * TODO: Add hotkey/mousewheel bindings to _instantly_ respond to these zoom event
 */

// tell Layout that the plugin is available
jQuery.layout.plugins.browserZoom = true;

jQuery.layout.defaults.browserZoomCheckInterval = 1000;
jQuery.layout.optionsMap.layout.push("browserZoomCheckInterval");

/*
 *	browserZoom methods
 */
jQuery.layout.browserZoom = {

	_init: function (inst) {
		// abort if browser does not need this check
		if (jQuery.layout.browserZoom.ratio() !== false)
			jQuery.layout.browserZoom._setTimer(inst);
	}

,	_setTimer: function (inst) {
		// abort if layout destroyed or browser does not need this check
		if (inst.destroyed) return;
		var o	= inst.options
		,	s	= inst.state
		//	don't need check if inst has parentLayout, but check occassionally in case parent destroyed!
		//	MINIMUM 100ms interval, for performance
		,	ms	= inst.hasParentLayout ?  5000 : Math.max( o.browserZoomCheckInterval, 100 )
		;
		// set the timer
		setTimeout(function(){
			if (inst.destroyed || !o.resizeWithWindow) return;
			var d = jQuery.layout.browserZoom.ratio();
			if (d !== s.browserZoom) {
				s.browserZoom = d;
				inst.resizeAll();
			}
			// set a NEW timeout
			jQuery.layout.browserZoom._setTimer(inst);
		}
		,	ms );
	}

,	ratio: function () {
		var w	= window
		,	s	= screen
		,	d	= document
		,	dE	= d.documentElement || d.body
		,	b	= jQuery.layout.browser
		,	v	= b.version
		,	r, sW, cW
		;
		// we can ignore all browsers that fire window.resize event onZoom
		if ((b.msie && v > 8)
		||	!b.msie
		) return false; // don't need to track zoom

		if (s.deviceXDPI && s.systemXDPI) // syntax compiler hack
			return calc(s.deviceXDPI, s.systemXDPI);
		// everything below is just for future reference!
		if (b.webkit && (r = d.body.getBoundingClientRect))
			return calc((r.left - r.right), d.body.offsetWidth);
		if (b.webkit && (sW = w.outerWidth))
			return calc(sW, w.innerWidth);
		if ((sW = s.width) && (cW = dE.clientWidth))
			return calc(sW, cW);
		return false; // no match, so cannot - or don't need to - track zoom

		function calc (x,y) { return (parseInt(x,10) / parseInt(y,10) * 100).toFixed(); }
	}

};
// add initialization method to Layout's onLoad array of functions
jQuery.layout.onReady.push( jQuery.layout.browserZoom._init );


})( jQuery );
