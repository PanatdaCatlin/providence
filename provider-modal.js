var month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

// Converts the timeslot date format into the MMMM DD format
var fixUnknownDateFormat = function(unknownDateString) {
  var date = unknownDateString.substring(0, unknownDateString.indexOf("*"));
  var nextTimeslotDate = new Date(date);
  return month[nextTimeslotDate.getMonth()] + " " + nextTimeslotDate.getDate();
};

$(document).ready(function() {
  // getUrlParameterByKey stolen from https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  var getUrlParameterByKey = function(key) {
    var url = window.location.href;
    key = key.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + key + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  // Reads doc id from URL, then reads page element with that id to get npi for api
  var npiDoctorId = document
    .getElementById("npi-number-" + getUrlParameterByKey("id"))
    .getAttribute("data-doctor-npi");

  // Construct URL for API
  var apiUrl =
    "https://odhp-api.wheelhousedmg.com/get/provider?id={{id}}&getSched=1";
  apiUrl = apiUrl.replace("{{id}}", npiDoctorId);

  // Make async call to API
  $.ajax({
    url: apiUrl
  }).done(function(response) {
    renderModal(response);
  });
});

// Top level html of the Modal, constructs modal wrapper and kicks off render processes for modal content
var renderModal = function(viewData) {
  var whModalContent = renderWHModalContent(viewData);
  var whModalContainer =
    '<div id="wh-modal-wrapper" class="wh-modal"><div class="wh-modal-content"><div class="wh-modal-close">&times;</div>' +
    whModalContent +
    "</div></div>";

  //append modal html after the footer
  $("footer").append(whModalContainer);
  attachModalEventListeners(viewData);
};

// Hides modal
var disableModal = function() {
  document.getElementById("wh-modal-wrapper").style.display = "none";
};

// Constructs innerHtml of modal
var renderWHModalContent = function(viewData) {
  var html = "<div id='wh-modal-body'>";
  html += renderTitle(viewData);
  html += renderNewPatientCard(viewData);
  html += renderReturningPatientCard(viewData);
  html += "</div>";
  return html;
};

// Renders title of modal
var renderTitle = function(viewData) {
  return (
    "<div id='wh-modal-title'>Book online with " + viewData.name + ", MD</div>"
  );
};

// Renders first card for new patients
var renderNewPatientCard = function(viewData) {
  var displayDate = fixUnknownDateFormat(viewData.timeslots[0]);

  var html = "<div class='wh-modal-card'>";
  html += renderNewPatientButton(viewData);
  html += viewData.acceptingNewPatients
    ? '<img src="https://s3-us-west-2.amazonaws.com/wheelhouse-clients/swedish/images/calendar-icon.jpg" id="wh-calendar-icon" alt="calender icon"><span class="wh-next-opening">Next Opening For New Patients: </span>' +
      displayDate +
      "</span>"
    : renderNewPatientError(viewData);
  return html + "</div>";
};

// Renders second card for returning patients
var renderReturningPatientCard = function(viewData) {
  var html = "<div class='wh-modal-card'>";
  html += " <button> Returning Patient </button>";
  html +=
    "<span>Returning patients have been seen by the doctor in the last 2 years.</span>";
  return html + "</div>";
};

// Renders new patient button and handles disabled states
var renderNewPatientButton = function(viewData) {
  html = "<button id='wh-modal-new-patient-button' ";
  html +=
    "class='" +
    (viewData.acceptingNewPatients ? "" : "wh-button-disabled") +
    "'";
  html += viewData.acceptingNewPatients ? "" : " disabled ";
  html += "> New Patient </button>";
  return html;
};

// Renders the text shown when a doctor is not accepting new patients
var renderNewPatientError = function(viewData) {
  var html = "<div id='wh-not-accept-new-patients'>";
  html +=
    viewData.name +
    ", M.D. is currently not accepting new patients. Please call " +
    viewData.address.newPatientPhone +
    " to schedule this appointment.";
  return html + "</div>";
};

// Click hanlder when you click New Patient
var acceptNewPatients = function(e) {
  e.stopPropagation();
  alert("New Patient Clicked and Doctor accepting new Patients");
};

// Click handler when you click Returning Patient
var returningPatientClicked = function(e) {
  e.stopPropagation();
  alert("Returning patient clicked");
};

// Attaches all event listeners onto Modal content AFTER modal gets injected into DOM
var attachModalEventListeners = function(viewData) {
  // Disable modal if user clicks the close icon or the wrapping gray areas
  $(".wh-modal-close").click(disableModal);
  $("#wh-modal-wrapper").click(disableModal);

  // Prevent clicks from modal itself from triggering close ( since modal is inside #wh-modal-wrapper )
  $("#wh-modal-content").click(function(e) {
    e.stopPropagation();
  });

  $("#wh-modal-returning-patient-button").click(
    viewData,
    returningPatientClicked
  );

  $("#wh-modal-new-patient-button").click(viewData, acceptNewPatients);
};
