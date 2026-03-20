/* -----------------------
   EmailJS Initialization
----------------------- */
(function(){
    emailjs.init("2mgRd_En93geNtQVi"); // Replace with your EmailJS public key
})();

/* -----------------------
   DOM Elements
----------------------- */
const timeSlotsContainer = document.getElementById("timeSlots");
const hiddenTimeInput = document.getElementById("time");
const dateInput = document.getElementById("date");
const weekendNote = document.getElementById("weekendNote");
const form = document.getElementById("bookingForm");
const statusMessage = document.getElementById("statusMessage");

/* -----------------------
   Business Hours & Time Slots
----------------------- */
function getSlotsForDate(date){
    const day = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday

    if(day >= 1 && day <= 5){ // Weekdays
        return ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
    }

    // Weekends
    return ["10:00","12:00","14:00"];
}

function formatTime(time) {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

async function generateTimeSlots(){
    const selectedDate = dateInput.value;
    if(!selectedDate){
        timeSlotsContainer.innerHTML = "<p>Select a date first</p>";
        return;
    }

    const slots = getSlotsForDate(selectedDate);
    timeSlotsContainer.innerHTML = "";
    hiddenTimeInput.value = ""; // Reset selected time
    const now = new Date();

    // Fetch booked slots from Google Apps Script
    let bookedTimes = [];
    try{
      // ADD HERE SCRIPT ID -------------------------------------------
        const response = await fetch(`https://script.google.com/macros/s/AKfycbxyBT8amTFKAjIiK3eV9j0KMbx1y-fuQohUTddDLTSiFmThSMX2ppdhOve5Fk0w31st/exec?date=${selectedDate}`);
        bookedTimes = await response.json(); // expects ["09:00","10:00"]
    } catch(err){
    console.error("Failed to fetch booked times", err);
    timeSlotsContainer.innerHTML = "<p>Could not load booked times. Please try again later.</p>";
    return;
   }

    slots.forEach(time => {
    const btn = document.createElement("div");
    btn.classList.add("slot");
    const selectedDateObj = new Date(selectedDate + "T" + time);

    // Disable past times
    if(selectedDateObj <= now){
        btn.classList.add("disabled");
    }

    // Disable already booked slots
    if(bookedTimes.includes(time)){
        btn.classList.add("disabled");
        btn.innerText = `${formatTime(time)} (Booked)`;
    } else if(!btn.classList.contains("disabled")){
        btn.innerText = formatTime(time);
    }

    // Only allow click if not disabled
    btn.addEventListener("click", () => {
        if(btn.classList.contains("disabled")) return;  // skip click
        document.querySelectorAll(".slot").forEach(s => s.classList.remove("selected"));
        btn.classList.add("selected");
        hiddenTimeInput.value = time;
    });

    timeSlotsContainer.appendChild(btn);
});

    // Weekend note
    const day = new Date(selectedDate).getDay();
    if(day === 0 || day === 6){
        weekendNote.style.display = "block";
        weekendNote.innerText = "Limited availability on weekends. Please call for special requests.";
    } else {
        weekendNote.style.display = "none";
    }
}

// Regenerate time slots on date change
dateInput.addEventListener("change", generateTimeSlots);

// Run on page load
generateTimeSlots();

/* -----------------------
   Booking Form Submission
----------------------- */
form.addEventListener("submit", async function(e){
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const notes = document.getElementById("notes").value.trim();
    const addGoogle = document.getElementById("addGoogleCalendar").checked;
    const downloadICS = document.getElementById("downloadICS").checked;

    // Validation
    if(!time){
        statusMessage.innerText = "Please select a time slot.";
        return;
    }

    const selectedDateTime = new Date(`${date}T${time}`);
    if(selectedDateTime <= new Date()){
        statusMessage.innerText = "Please select a future time.";
        return;
    }

    statusMessage.innerText = "Booking appointment...";

    // Send Email via EmailJS
    const templateParams = { name, email, phone, service, date, time, notes };
    try {
      // ADD HERE YOUR SERVICE ID AND TEMPLETE ID FROM EmailJS
        await emailjs.send("service_kfesje7", "template_qmp7djd", templateParams);
    } catch(error){
        statusMessage.innerText = "Email failed to send.";
        console.error(error);
        return;
    }

    // Google Calendar Event
    if(addGoogle){
        createGoogleCalendarEvent(name, service, date, time, notes);
    }

    // ICS File Download
    if(downloadICS){
        generateICS(name, service, date, time, notes);
    }

    // Save booking to Apps Script (Business Calendar)
    try{
        await fetch("https://script.google.com/macros/s/AKfycbxyBT8amTFKAjIiK3eV9j0KMbx1y-fuQohUTddDLTSiFmThSMX2ppdhOve5Fk0w31st/exec", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, service, date, time, notes })
        });
    } catch(err){
        console.error("Failed to save booking", err);
    }

    statusMessage.innerText = "Appointment booked successfully!";
    form.reset();
    generateTimeSlots(); // reset slots after booking
});

/* -----------------------
   Google Calendar Event Creator
----------------------- */
function createGoogleCalendarEvent(name, service, date, time, notes){
    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + 60*60*1000);

    const formatDate = d => d.toISOString().replace(/-|:|\.\d+/g,"");

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Tailor Fitting Appointment")}&dates=${formatDate(start)}/${formatDate(end)}&details=${encodeURIComponent(`Client: ${name}\nService: ${service}\nNotes: ${notes}`)}`;
    window.open(url, "_blank");
}

/* -----------------------
   ICS File Generator
----------------------- */
function generateICS(name, service, date, time, notes){
    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + 60*60*1000);

    const formatICSDate = d => d.toISOString().replace(/-|:|\.\d+/g,"");

    const icsContent =
`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Tailor Fitting
DESCRIPTION:Client ${name} Service ${service} Notes ${notes}
DTSTART:${formatICSDate(start)}
DTEND:${formatICSDate(end)}
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

