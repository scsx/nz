var thePlaceLat = 0;	 
var thePlaceLng = 0;
var loadedMap = false;
		
function initMap() {
	if (loadedMap) {
		var map = new google.maps.Map(document.getElementById('map'), {
			center: {
				lat: thePlaceLat,
				lng: thePlaceLng - .8 // move a little right because of title
			},
			zoom: 6
		});
		var image = 'assets/marker.png';
		var airportMarker = new google.maps.Marker({
			position: {
				lat: thePlaceLat,
				lng: thePlaceLng
			},
			map: map,
			icon: image
		});
	}
}



function callAjax(query) {
	$.ajax({
		type: 'GET',
		url: 'https://crossorigin.me/https://embed-staging.nezasa.com/api1/airports?query=' + query,
		contentType: 'text/plain',
		xhrFields: {
			withCredentials: false
		},
		headers: {
		},
		success: function (data) {
			data = JSON.parse(data);
			if (data.length > 0) {
				var templateHeader = "";
				var templateInfos = "";
				var templateNav = "";
				for(var i = 0; i < data.length; i++) {

					var apt = data[i];
					templateHeader +=
					`
					<div class="aptdesc" data-apt="${ apt.id }">
						<h2 class="title">${ apt.airport.shortName.texts.en }</h2>
					</div>
					`;
					
					templateInfos +=
					`
					<div class="aptdetails" data-apt="${ apt.id }">
						<div class="half left">
							<h6>Full name</h6>
							<h3>${ apt.label }</h3>
							<h6>City</h6>
							<h3>${ apt.airport.city.texts.en }</h3>
							<h6>Country</h6>
							<h3>${ apt.airport.country } <small>[${ apt.airport.countryCode }]</small></h3>
						</div>
						<div class="half right">
							<table>
								<tr>
									<th>IATA</th>
									<th>ICAO</th>
									<th>Coordinates</th>
									<th>Timezone</th>
								</tr>
								<tr>
									<td>${ apt.airport.iataCode }</td>
									<td>${ apt.airport.icaoCode }</td>
									<td>${ apt.airport.coordinate.lat }, ${ apt.airport.coordinate.lng }</td>
									<td>${ apt.airport.timeZoneId }</td>
								</tr>
							</table>
						</div>
					</div>
					`;
					
					templateNav +=
					`
					<a href="javascript:void(0);" data-apt="${ apt.id }" data-lat="${ apt.airport.coordinate.lat }" data-lng="${ apt.airport.coordinate.lng }">
						${ apt.id }, ${ apt.airport.countryCode }
					</div>
					`
					;
				}
				
				$(".resultheader").append(templateHeader);
				$(".maincontent").append(templateInfos);
				$(".dropdown .dropdown-content").append(templateNav);
				$(".dropdown .dropdown-content a:first").addClass("active");
				$(".loading").slideUp(0);
				$(".resultheader, .maincontent").slideDown(0);
				
				// show google map
				loadedMap = true;
				thePlaceLat = data[0].airport.coordinate.lat;
				thePlaceLng = data[0].airport.coordinate.lng
				initMap();
				
			} else {
				var i = 0;
				if ( !$(".loading").is(':visible') ) {
					$(".loading").slideDown(0);
					$(".resultheader, .maincontent").slideUp(0);
				}
				$(".loading p").html("No results for <i>" + query + "</i> :(<br><a href='javascript:void(0);'>Please try again</a>");
			}
			
			$("header .dropdown span").addClass("inl");
			$("header .dropdown span.query").html(query + "<small>(" + i + ")</small>");
		},
		error: function () {
			$(".loading p").text("DB Error. Please, try reloading the page.");
		}
	});
}


$('body').on('click', '#magnifyingGlass, .loading p a', function() {
	$(".searchbox").addClass("visible");
	$(".searchbox #searchField").focus();
});

$(".searchbox .close").click(function(){
	$(".searchbox").removeClass("visible");
	$(".searchbox #searchField").val("");
});

var query = $("#searchField").val();
$("#theForm").submit(function(e){
	e.preventDefault();
	query = $("#searchField").val();
	$(".searchbox").removeClass("visible");
	$("header .dropdown span").removeClass("inl");
	$(".dropdown .dropdown-content").html("");
	$(".resultheader, .maincontent").html("").addClass("initial").slideUp(0);
	loadedMap = false;
	$(".loading").slideDown(0);
	$(".loading p").text("Searching airports...");
	callAjax(query);
});

$('body').on('click', 'header .dropdown-content a', function() {
	// show/hide results
	$("header .dropdown-content a").removeClass("active");
	$(this).addClass("active");
	$(".resultheader, .maincontent").removeClass("initial");
	var theApt = $(this).attr("data-apt");
	$('.maincontent .aptdetails').slideUp(0);
	$('.resultheader .aptdesc').slideUp(0);
	$(".resultheader").find(`[data-apt='${theApt}']`).slideDown();
	$(".maincontent").find(`[data-apt='${theApt}']`).slideDown();
	$(".dropdown, .dropdown-content").unbind('mouseenter mouseleave')
	
	// update map
	thePlaceLat = Number($(this).attr("data-lat")); 
	thePlaceLng = Number($(this).attr("data-lng"));
	console.log( typeof thePlaceLng );
	initMap();
	
});

$("header h1").click(function(){
	location.reload();
});

$(document).ready(function(){
	// DEV
	//callAjax("lisb");
});


