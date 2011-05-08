// REDIRECTS IN PLAIN JS - IE6, IE7, FF2 (MAC & PC)
var browser		= navigator.appName
var ver			= navigator.appVersion
var thestart	= parseFloat(ver.indexOf("MSIE"))+1 // This finds the start of the MS version string.
var brow_ver	= parseFloat(ver.substring(thestart+4,thestart+7)) // This cuts out the bit of string we need.

if ((browser=="Microsoft Internet Explorer") && (brow_ver < 7)) { // Redirect IE 6/7
	window.location="http://www.image-mapper.com/browser_redirect.html"; // URL to redirect to.
};


if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){ // test for Firefox/x.x or Firefox x.x (ignoring remaining digits);
	var ffversion=new Number(RegExp.$1) // capture x.x portion and store as a number
	if (ffversion < 3)
 	window.location="http://www.image-mapper.com/browser_redirect.html"; // URL to redirect to.
};


$(document).ready(function() {
	
	$('.button').hover(function() {
		$(this).css('opacity', '0.8');
	}, function() {
		$(this).css('opacity', '1');
	});
	
	$('#image_photo').hover(function() {
		$('.browse_btn').css('opacity', '0.8');
	}, function() {
		$('.browse_btn').css('opacity', '1');		
	});
		
	// REMOVES OUTLINES FROM HREFS WHEN CLICKING
	if ($.browser.name == "msie") {      // if IE  
		$("a, .image_button").focus(function () {
			$(this).blur();
		});
	};

	// FUNCTIONS FOR DEFAULT VALUE IN FORM FIELDS
	swapValue = []; 
	$(".swap_value").each(function(i){
		swapValue[i] = $(this).val();
		$(this).focus(function(){
			if ($(this).val() == swapValue[i]) {
				$(this).val("");
			}
			$(this).addClass("focus");
		}).blur(function(){
			if ($.trim($(this).val()) == "") {
				$(this).val(swapValue[i]);
				$(this).removeClass("focus");
			}
		});
	});
	
	// OPEN IN NEW WINDOW
	$(function(){
	    $('a.new_window').click(function(){
	        window.open(this.href);
	        return false;
		});
	});
	
	// FAKE STYLE-ABLE FILE UPLOAD INPUT
	$('input[type=file]').each(function(){
		var $this = $(this)
		var uploadbutton = '<input type="image" class="browse_btn" src="/images/browse_btn.png" value="Browse" />'
		
		$this.wrap('<div class="fileinputs"></div>');
		$this.addClass('file').css('opacity', 0); //set to invisible
		$this.parent().append($('<div class="fakefile" />')
			.append(
				$('<input type="text" />').attr({
					'id': $this.attr('id')+'_fake'
				})
			).append(uploadbutton)
		);

		$this.bind('change', function() {
		$('#'+$this.attr('id')+'_fake').val($this.val());;
		});
		$this.bind('mouseout', function() {
		$('#'+$this.attr('id')+'_fake').val($this.val());;
		});
	});
	
	// DON'T LET USERS UPLOAD NOTHING
	$('p.upload_btn input').click(function() {
		var validation_msg = 'Please select an image.'
		var upload_field_value = $('input#image_photo_fake').val();
		
		
		if (upload_field_value == '') {
			$('input#image_photo_fake').val(validation_msg);
			return false;
		};
		if (upload_field_value == validation_msg) {
			$('input#image_photo_fake').val(validation_msg);
			return false;
		};
		
		// clear upload field value is successful
		$('input#image_photo_fake').val('');
		
	});
	
	// DYNAMICALLY SET WIDTH OF TOOLBAR & ADD IMG BORDER 
	setTimeout(function() { // timeout to let the image load
		var uploaded_img_width = $("#user_image img").width();
		
		// set the width of the toolbar
		if (uploaded_img_width < 205) {
			$('#toolbar').css('width', '205px');		
		} else {
			$('#toolbar').css('width', uploaded_img_width);
		};
		
		// add border to user img div (not the image)
		$('#user_image').css('width', uploaded_img_width);
				
	}, 1000);
	
	// INSERT DIVS FOR ROUNDED CORNERS ON TEXTAREA
	$('#output_code textarea').after('<div class="tl"></div><div class="tr"></div><div class="bl"></div><div class="br"></div>');


}); // end of doc ready