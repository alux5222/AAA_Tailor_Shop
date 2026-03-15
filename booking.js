/* -----------------------
   EmailJS Initialization
----------------------- */

(function(){
emailjs.init("YOUR_PUBLIC_KEY");
})();



/* -----------------------
   Form Handler
----------------------- */

const form = document.getElementById("bookingForm");
const statusMessage = document.getElementById("statusMessage");

form.addEventListener("submit", async function(e){

e.preventDefault();

statusMessage.innerText = "Booking appointment...";

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const phone = document.getElementById("phone").value;
const service = document.getElementById("service").value;
const date = document.getElementById("date").value;
const time = document.getElementById("time").value;
const notes = document.getElementById("notes").value;

const addGoogle = document.getElementById("addGoogleCalendar").checked;
const downloadICS = document.getElementById("downloadICS").checked;



/* -----------------------
   Prevent Past Bookings
----------------------- */

const selectedDateTime = new Date(`${date}T${time}`);
const now = new Date();

if(selectedDateTime < now){

statusMessage.innerText = "Please select a future time.";

return;

}



/* -----------------------
   Send Email (SMTP)
----------------------- */

const templateParams = {

name,
email,
phone,
service,
date,
time,
notes

};

try{

await emailjs.send(
"YOUR_SERVICE_ID",
"YOUR_TEMPLATE_ID",
templateParams
);

}catch(error){

statusMessage.innerText = "Email failed to send.";
console.error(error);
return;

}



/* -----------------------
   Google Calendar
----------------------- */

if(addGoogle){

createGoogleCalendarEvent(name, service, date, time, notes);

}



/* -----------------------
   ICS Download
----------------------- */

if(downloadICS){

generateICS(name, service, date, time, notes);

}


statusMessage.innerText = "Appointment booked successfully!";

form.reset();

});



/* -----------------------
   Google Calendar Event
----------------------- */

function createGoogleCalendarEvent(name, service, date, time, notes){

const start = new Date(`${date}T${time}`);
const end = new Date(start.getTime() + 60*60*1000);

function formatDate(d){

return d.toISOString().replace(/-|:|\.\d+/g,"");

}

const startStr = formatDate(start);
const endStr = formatDate(end);

const text = encodeURIComponent("Tailor Fitting Appointment");
const details = encodeURIComponent(
`Client: ${name}
Service: ${service}
Notes: ${notes}`
);

const url =
`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startStr}/${endStr}&details=${details}`;

window.open(url, "_blank");

}



/* -----------------------
   ICS File Generator
----------------------- */

function generateICS(name, service, date, time, notes){

const start = new Date(`${date}T${time}`);
const end = new Date(start.getTime() + 60*60*1000);

function formatICSDate(d){

return d.toISOString().replace(/-|:|\.\d+/g,"");

}

const startStr = formatICSDate(start);
const endStr = formatICSDate(end);

const icsContent =
`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Tailor Fitting
DESCRIPTION:Client ${name} Service ${service} Notes ${notes}
DTSTART:${startStr}
DTEND:${endStr}
END:VEVENT
END:VCALENDAR`;

const blob = new Blob([icsContent], {type:"text/calendar"});

const link = document.createElement("a");

link.href = URL.createObjectURL(blob);
link.download = "tailor-booking.ics";

document.body.appendChild(link);

link.click();

document.body.removeChild(link);

}