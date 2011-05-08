$(document).ready(function() {
	
	function reset_hotspot_defaults() {
		// set default variable on page load
		x_draw_values = [];
		y_draw_values = [];	

		coordinates = []; // hold each individual hotspot
		// add empty coordinates array to array of existing coordinates
		array_of_all_coordinates.push(coordinates); 	
	};
	
	function change_line_color() {
		color = colors.slice(-1); // current color
		used_colors.splice(0,0,color.join()); // array of previous colors
	};

	function format_code_output() {
		// gather img specific variables 
		src_attr = 'path/to/your/image.png';
		height = $image.height();
		width = $image.width();
		id_attr = 'image_map';
		alt_attr = 'Insert Alt';
		
		temp = used_colors; // duplicate used_colors for manipulation
		areas = []; // empty array to be filled with formated <area> elements
		
		// create a formated array of <area> elements adding the correct color to each alt attr
		$(array_of_all_coordinates).each(function(){
			var current_color = temp.pop();
			areas.push('\n\t<area shape="poly" coords="'+ this +'" href="http://image-mapper.com" alt="'+ current_color +' hotspot"/>\n');
			temp.splice(0,0,current_color);
		});
		
		// create <img> and <map> html elements 
		var img_element = '<img src="'+ src_attr +'" width="'+ width +'" height="'+ height +'" alt="'+ alt_attr +'" usemap="#'+ id_attr +'" border="0">';
		var map_open = '<map name="'+ id_attr +'" id="'+ id_attr +'">';
		var map_close ='</map>'
		
		// concatinate code output string
		var output_code = img_element + '\n\n' + map_open + areas + map_close;
		
		// place output code in textarea - removing unnecessary commas
		$('textarea').val(output_code.replace(/\n,/g,''));
	};
	
	function clear_undo_arrays() {
		// make empty array to hold undos for drawing interface
		undone_x_draws =[];
		undone_y_draws =[];

		// and for the code output coordinates
		undone_coordinates = []; 
	};

	// store the image as a variable for selector proformance
	$image = $("#user_image img");	
	
	// array of different colors to help distinguish between hotspots
	colors = [
		'burlywood', 'chartreuse', 'darkorchid', 'aqua', 'lightcoral', 'crimson', 'darksalmon', 
		'indigo', 'peru', 'maroon', 'darkturquoise', 'firebrick', 'khaki', 'fuchsia',
		'black', 'pink', 'cyan', 'orange', 'navy', 'plum', 'silver', 'lime', 'gray', 'violet',
		'gold', 'magenta', 'blue', 'brown', 'teal', 'olive', 'yellow', 'purple', 'green', 'red'
	];
	used_colors = [];
	array_of_all_coordinates = []; // holds all hotspots
	
	image_has_been_clicked = false
	
	// set both undo and redo buttons to inactive
	$('#undo, #redo').addClass('inactive');
		
	// set empty undo arrays on page load
	clear_undo_arrays();
	
	// set hotspot and color defaults on page load
	reset_hotspot_defaults();
	change_line_color();
	
	$('#new_hotspot').click(function() {
		// shuffle the current color to the front of the array
		current_color = colors.pop();
		colors.splice(0,0,current_color);
		
		reset_hotspot_defaults();
		change_line_color();	
		return false;		
	});
	
	$('#undo').click(function() {
		
		// if there's nothing left to undo
		if (coordinates.length < 2) {

			$('#undo').addClass('inactive');

			undone_coordinate = coordinates.pop(); // remove the last coordinate pair
			undone_coordinates.push(undone_coordinate); // and add it to an array

			undone_x_draw = x_draw_values.pop();
			undone_y_draw = y_draw_values.pop();
			// add the undone values to an array
			undone_x_draws.push(undone_x_draw);
			undone_y_draws.push(undone_y_draw);

			array_of_all_coordinates.pop();
			reset_hotspot_defaults();
			format_code_output();
			return false; 
		};
		
		if (image_has_been_clicked) { $('#redo').removeClass('inactive'); };
		
		
		// --- UNDO CODE OUTPUT ---
		undone_coordinate = coordinates.pop(); // remove the last coordinate pair
		undone_coordinates.push(undone_coordinate); // and add it to an array
		
		// output code to textarea
		format_code_output();

		// --- UNDO UI DRAWING ---
		// undo the last click
		undone_x_draw = x_draw_values.pop();
		undone_y_draw = y_draw_values.pop();
		// add the undone values to an array
		undone_x_draws.push(undone_x_draw);
		undone_y_draws.push(undone_y_draw);
				
		// redraw the ploygon line
		//if ($.browser.name == 'firefox' && $.browser.versionNumber == 3) {
			$('#myCanvas div').each(function(){
				if ($(this).attr('style').match(color)) { $(this).remove(); };
			});			
		//} else {
		//	$('#myCanvas div[style*="'+color+'"]').remove(); // this expression did not work in FF3			
		//};
		$('#myCanvas').drawPolyline( x_draw_values, y_draw_values, { color: color, alpha: 1, stroke: 3 });
		
		return false;		
	});

	$('#redo').click(function() {
		
		// if there's nothing to redo
		if (undone_coordinates.length < 1) { return false; };

		if (image_has_been_clicked) { $('#undo').removeClass('inactive'); };
		
		// --- REDO CODE OUTPUT ---
		redone_coordinate = undone_coordinates.pop(); // remove the last coordinate pair
		coordinates.push(redone_coordinate); // and add it to an array
		
		// output code to textarea
		format_code_output();


		// --- REDO UI DRAWING ---
		// get the last item from the undone draws array
		redone_x_draw = undone_x_draws.pop();
		redone_y_draw = undone_y_draws.pop();
		// and add it to the drawn array values
		x_draw_values.push(redone_x_draw);
		y_draw_values.push(redone_y_draw);		
		
		// redraw the ploygon line
		//if ($.browser.name == 'firefox' && $.browser.versionNumber == 3) {
			$('#myCanvas div').each(function(){
				if ($(this).attr('style').match(color)) { $(this).remove(); };
			});			
		//} else {
		//	$('#myCanvas div[style*="'+color+'"]').remove(); // this expression did not work in FF3			
		//};
		$('#myCanvas').drawPolyline( x_draw_values, y_draw_values, { color: color, alpha: 1, stroke: 3 });		

		// if there's nothing to redo - make button inactive
		if (undone_coordinates.length < 1) { $('#redo').addClass('inactive'); };
				
		return false;		
	});
	
	$image.click(function(e){
		
		image_has_been_clicked = true;
		
		// clear any undo actions 
		clear_undo_arrays();
		$('#undo').removeClass('inactive');
		$('#redo').addClass('inactive');		

		// capture the mouse coordinates
		var x = e.pageX;
		var	y = e.pageY;
		
		// add clicked coordinates to array of existing coordinates for code output and...
		// make mouse coordinates relative to the uploaded image by using the offset method
		coordinates.push(' ' + (x - this.offsetLeft) + ',' + (y - this.offsetTop));
	
		// output code to textarea
		format_code_output();			
		
		// push coordinates into the corresponding array for ui drawing
		x_draw_values.push(x);
		y_draw_values.push(y);	

		// draw ployline
		$("#myCanvas").drawPolyline( x_draw_values, y_draw_values, { color: color, alpha: 1, stroke: 3 });
	});

	// ADD KEYBOARD SHORTCUTS FOR UNDO & REDO
	$(document).ready(function() {
		$.ctrl = function(key, callback, args) {
		    $(document).keydown(function(e) {
		        if(!args) args=[]; // IE barks when args is null
		        if(e.keyCode == key.charCodeAt(0) && e.metaKey) {
		            callback.apply(this, args);
		            return false;
		        }
		    });
		};	
	});
	$.ctrl('Z', function() { $('#undo').trigger("click"); });
	$.ctrl('Y', function() { $('#redo').trigger("click"); });

		
}); // end of doc ready