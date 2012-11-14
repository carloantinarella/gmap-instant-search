$('document').ready(function(){

	var	map, 
		geocoder, 
		marker,
		extResults;

	function getSuggestRow(singleResult) {
		// return the html of a single suggestion
		var 	row,
				formattesAddress,
				lat,
				lng;

		formattedAddress = singleResult.formatted_address;
		lat = singleResult.geometry.location.Ya;
		lng = singleResult.geometry.location.Za;

		row = 	'<span class="suggestRow" data-lat="' + lat + '" data-lng="' + lng + '">' + formattedAddress + '</span>';
		return row;
	}

	function showSuggests(results, $locationInput, $suggestionsDiv) {
		// var locationValue = locationInput.value;
		
		// fill the target div
		$suggestionsDiv.html('').show();
		for ( var i = 0; i < results.length; i++) {
			$suggestionsDiv.append(getSuggestRow(results[i]));
		}

		// listen for the click-to-suggestion event
		$(".suggestRow").click(function(){
			var lat = $(this).data('lat');
			var lng = $(this).data('lng');
			var latLng = new google.maps.LatLng(lat,lng);
			// center the map to the chosen location
			map.setCenter(latLng);
			map.setOptions({
				zoom: 13
			});
			// move marker
			if (!marker) {
				marker = new google.maps.Marker({
					map: map
				});
			}
			marker.setPosition(latLng);
			// fill the locationInput with the selected location
			$clickedSpan = $(this);
			$locationInput.attr('value', function(){
				return $clickedSpan.text();
			});
			// hide the suggests div
			$suggestionsDiv.html('').hide();
		});
	}

	function locateAddress(address, $locationInput, $suggestonsDiv){
		// if not yet done, instantiate a Geocoder object
		if (!geocoder) {
			geocoder = new google.maps.Geocoder();
		}
		// create a GeocoderRequest object with the only interesting parameter
		var request = {
			address: address
		};
		// perform the geocode request and execute the callback function
		geocoder.geocode(request, function(results, status){
			// before proceeding check if the status is OK
			if ( status == google.maps.GeocoderStatus.OK ) {
				map.setCenter(results[0].geometry.location);
			
				map.setOptions({
					zoom: 13 
				});
				// create a new marker and add it to the map
				if (!marker) {
					marker = new google.maps.Marker({
						map: map
					});
				}
				marker.setPosition(results[0].geometry.location);
				showSuggests(results, $locationInput, $suggestionsDiv);
			}
		});
	}

	function locatePoint(latLng) {
		// check if a geocoder object already exists
		if (!geocoder) {
			geocoder = new google.maps.Geocoder();
		}

		// create a GeocoderRequest object with the only interesting parameter
		var geocoderRequest = {
			latLng: latLng
		};
		geocoder.geocode(geocoderRequest, function(results, status) {
			// check if the request produced some result
			if (status == google.maps.GeocoderStatus.OK) {
				// create a new marker and add it to the map
				if (!marker) {
					marker = new google.maps.Marker({
						map: map,
					});
				} else {
					marker.setPosition(latLng);
				}
				extResults = results;
			}
		});
	}

	var options = {
		center: new google.maps.LatLng(41.8902,12.4925),
		mapTypeId: google.maps.MapTypeId.HYBRID,
		zoom: 3
	}

	map = new google.maps.Map(document.getElementById("map"), options);
	
	var $locationInput = $('#locationInput'),
		$suggestionsDiv = $('#suggests');

	// listen for user typing in the search field
	$locationInput.keyup(function(event){
		var address = $locationInput.val();
		if ( address.length > 2 ) {
			// here goes the geocoder code
			locateAddress(address, $locationInput, $suggestionsDiv);
		}
	});

	google.maps.event.addListener(map, 'click', function(e){
		// get the address of the position clicked
		locatePoint(e.latLng);
		// send the formatted_address to the input field
		var formatted_address = extResults[0].formatted_address;
		$locationInput.attr("value", formatted_address);
	});

});