// -- External Endpoints -- //
var api =
  "https://odhp-api.wheelhousedmg.com/get/odhp?all=active&getSched=true&avail=true";
// -- End External Endpoints -- //

// -- Date and Day definitions -- //
var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";
// -- End Date and Day definitions -- //

// Small blue header above doctor panel
var sponserdDoctorHeader = function(nextAvailableAppointment) {
  var nextAppointmentText = "";

  var todaysDate = new Date();
  var futureDate = new Date(fixUnknownDateFormat(nextAvailableAppointment));

  // Check if dates are in same year
  var sameYear = todaysDate.getFullYear() === futureDate.getFullYear();
  // Check if dates are in same month
  var sameMonth = sameYear && todaysDate.getMonth() === futureDate.getMonth();
  // Check if dates are in same week
  var sameWeek =
    sameMonth && getWeekOfYear(todaysDate) === getWeekOfYear(futureDate);
  // Check if dates are in same week
  var nextWeek = getWeekOfYear(todaysDate) + 1 === getWeekOfYear(futureDate);
  // Check if dates are on same day
  var sameDay = todaysDate.getDate() === futureDate.getDate();
  // Check if appointment is tomorrow
  var tomorrow = todaysDate.getDate() + 1 === futureDate.getDate();

  // Some nested terniaries because it works.
  var conditionalText = sameDay
    ? "Today:"
    : tomorrow
      ? "Tomorrow:"
      : sameWeek
        ? "This Week:"
        : nextWeek
          ? "Next Week"
          : sameMonth
            ? "This Month:"
            : "Next Month:";

  // Render the header with some conditional text dependent on when the soonest apointment
  // of the doctors shown in the widget is.
  return (
    ' \
	<div class="row wh-sponsored-header">\
		<div class="col-xs-12">\
			<div>\
        <div>New Patient? See a Provider ' +
    conditionalText +
    "</div>\
			</div>\
		</div>\
	</div> "
  );
};

var getWeekOfYear = function(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  // Return array of year and week number
  return weekNo;
};

// Convert a rating number into Font Awesome stars
var starsRating = function(reviewScore) {
  // Start with an emprt string to return
  var starsIcons = "";

  // Exit early if there is nothing to score
  if(reviewScore === 0){
    return "";
  }

  // We want 5 stars, so loop 5 times
  for (var i = 1; i <= 5; i++) {
    if (i <= reviewScore) {
      // Add a full star if your score is higher than the index of the loop
      starsIcons += '<i class="fa fa-star"></i>';
    } else if (i < reviewScore + 1) {
      // Add a half star if the score is up to one higher than the index
      starsIcons += '<i class="fa fa-star-half-empty"></i>';
    } else {
      // Otherwise add an empty star to fill out 5 stars
      starsIcons += '<i class="fa fa-star-o"></i>';
    }
  }

  // Return the stars icons HTML
  return starsIcons;
};

// A single doctor card, made dynamic with a doctor object
var doctorCard = function(doctor) {
  var doctorContent =
    '\
      <div class="col-xs-12 col-sm-6 col-md-3">\
      <div class="wh-sponsored-box row">\
        <div class="col-xs-12">\
          <img src="' +
          doctor.image +
          '" alt="physician-image" class="wh-profile-photo-image img-responsive">\
        </div>\
        <div class="wh-doctor-review col-xs-12">' + starsRating(doctor.reviewScore) + 
        '</div>\
        <div class="wh-doctor-name col-xs-12"> ' + doctor.name + 
        '</div>\
        <div class="wh-doctor-job-title col-xs-12">' + toTitleCase(doctor.jobTitle) + 
        '</div>\
        <div class="wh-accepting-new-patients col-xs-12">' + 
          '<span class="wh-ok-circle-icon glyphicon glyphicon-ok-circle"></span>' + "Accepting New Patients" + 
        '</div>\
        <div class="wh-opening-text col-xs-12">' + 
          '<img src="https://s3-us-west-2.amazonaws.com/wheelhouse-clients/swedish/images/calendar-icon.jpg" id="wh-calendar-icon" alt="calender icon"><span class="wh-next-opening">Next Opening For New Patients</span>' + 
          '\
        </div>\
        <div class="wh-opening-date col-xs-12"> ' + (doctor.timeslots && convertTime(fixUnknownDateFormat(doctor.timeslots[0]))) + 
        '\
        </div>\
        <a href="www.google.com" class="wh-book-button btn col-xs-12">BOOK NEW PATIENT\
        </a>\
      </div>\
    </div> ';

  return doctorContent;
};

var fixUnknownDateFormat = function(unknownDateString) {
  return unknownDateString.substring(0, unknownDateString.indexOf("*"));
};
// Going to need to be more complex. Takes in a date, but needs to generate different results based on how far away those dates are
var convertTime = function(dateString) {
  // Get todays date and the other date for comparison
  var todaysDate = new Date();
  var futureDate = new Date(dateString);

  // Get the M-DD-YY date format by building a string
  let dateDate =
    futureDate.getMonth() +
    1 +
    "-" +
    futureDate.getDate() +
    "-" +
    ("" + futureDate.getFullYear()).substring(2, 4);

  // Check the date to pick either the Day of the week, or the name of the month, depending on if the date is in the same month or not
  let dateWord =
    todaysDate.getMonth() === futureDate.getMonth()
      ? weekday[futureDate.getDay()]
      : month[futureDate.getMonth()];
  return dateWord + " " + dateDate;
};

// Component repeats a list of doctors
var sponseredBottom = function(visibleDoctors) {
  // Wrap the doctor cards in a div
  var content = ' \
	<div class="wh-sponsored-bottom row"> ';

  // Loop over visible doctors, add a card for each of them
  for (var i = 0; i < visibleDoctors.length; i++) {
    var doctor = visibleDoctors[i];
    content += doctorCard(doctor);
  }

  // Add the bottom portion of the content to close the tags created above
  content += " \
	</div> ";

  return content;
};

// Main wrapping component of injectable widget.
var widgetWrapper = function(visibleDoctors, nextAvailableAppointment) {
  return (
    ' \
	<div id="wh-sponsored-results">\
		<div class="container-fluid"> ' +
    sponserdDoctorHeader(nextAvailableAppointment) +
    sponseredBottom(visibleDoctors) +
    " \
		</div>\
	</div> "
  );
};

// Stack overflow
var toTitleCase = function(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

var selectDoctors = function(doctorsMaster) {
  // Index the doctors by location
  var doctorIndex = {};
  for (var i = 0; i < doctorsMaster.length; i++) {
    var doctor = doctorsMaster[i];
    if (!doctor.isActive) continue;
    if (!doctor.allowsOpenSchedule) continue;
    if (!doctor.acceptingNewPatients) continue;
    if (doctor.address.state !== "CA") continue;
    if (doctor.reviewScore === "UNLISTED") doctor.reviewScore = 0;
    if (doctor.image === "UNLISTED") {
      doctor.image = "https://www.providence.org/doctors/images/m-no-photo.png";
    }
    if (doctor.jobTitle === "UNLISTED") {
      if (
        !doctor.specialties ||
        doctor.specialties.length === 0 ||
        doctor.specialties === "UNLISTED"
      ) {
        doctor.jobTitle = "";
      } else doctor.jobTitle = doctor.specialties; // Bad form to override an existing value, but it makes sense here, to me, right now.
    }

    // Only physicians??? there are none.
    // if (doctor.jobTitle.toLowerCase() !== "primary care physician") continue;

    var location = doctor.address.addr1;
    // Check if location is in index, create index if its not
    if (!doctorIndex[location]) doctorIndex[location] = [];
    // Add the item to the index
    doctorIndex[location].push(doctor);
  }

  // Sort locations arrays by first timeslot
  var locations = Object.keys(doctorIndex);
  for (var i = 0; i < locations.length; i++) {
    var location = locations[i];
    doctorIndex[location].sort(function(a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      var a_date = new Date(fixUnknownDateFormat(a.timeslots[0]));
      var b_date = new Date(fixUnknownDateFormat(b.timeslots[0]));
      return a_date - b_date;
    });
  }

  // Sort indexes keys by best doctors soonest time
  locations.sort(function(a, b) {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return (
      new Date(fixUnknownDateFormat(doctorIndex[a][0].timeslots[0])) -
      new Date(fixUnknownDateFormat(doctorIndex[b][0].timeslots[0]))
    );
    // Return first doctor from first N locations
  });

  // Build an array of the first 4 locations best available doctor
  var visibleDoctors = [];
  for (var i = 0; i < 4 && i < locations.length; i++) {
    visibleDoctors.push(doctorIndex[locations[i]][0]);
  }
  return visibleDoctors;
};

var getSoonestTimeSlot = function(doctors) {
  // Get each of the selected doctors best timeslot into an array
  var timeslots = [];
  for (var i = 0; i < doctors.length; i++) {
    timeslots.push(doctors[i].timeslots[0]);
  }

  // Sort that array so the best timeslot is first
  timeslots.sort(function(a, b) {
    var a_date = new Date(fixUnknownDateFormat(a));
    var b_date = new Date(fixUnknownDateFormat(b));
    return a_date - b_date;
  });

  // Return the best timeslot (index 0);
  return timeslots[0];
};

// Defines a Vanilla JS WebRequest
var xhttp = new XMLHttpRequest();

// Runs when xhttp api call returns
xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    var visibleDoctors = selectDoctors(JSON.parse(xhttp.response));
    var nextAvailableAppointment = getSoonestTimeSlot(visibleDoctors);
    // Injects constructed html into an area of the page
    $(".outlined")
      .first()
      .before(widgetWrapper(visibleDoctors, nextAvailableAppointment));
  }
};

// Runs on script initialization, gets data from the API
xhttp.open("GET", api, true);
xhttp.send();
