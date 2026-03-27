// /* -----------------------
//    EmailJS Initialization
// ----------------------- */
// (function(){
//     emailjs.init("2mgRd_En93geNtQVi"); // Replace with your EmailJS public key
// })();

// /* -----------------------
//    DOM Elements
// ----------------------- */
// const timeSlotsContainer = document.getElementById("timeSlots");
// const hiddenTimeInput = document.getElementById("time");
// const dateInput = document.getElementById("date");
// const weekendNote = document.getElementById("weekendNote");
// const form = document.getElementById("bookingForm");
// const statusMessage = document.getElementById("statusMessage");

// /* -----------------------
//    Business Hours & Time Slots
// ----------------------- */
// function getSlotsForDate(date){
//     const day = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday

//     if(day >= 1 && day <= 5){ // Weekdays
//         return ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
//     }

//     // Weekends
//     return ["10:00","12:00","14:00"];
// }

// function formatTime(time) {
//     return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
// }

// async function generateTimeSlots(){
//     const selectedDate = dateInput.value;
//     if(!selectedDate){
//         timeSlotsContainer.innerHTML = "<p>Select a date first</p>";
//         return;
//     }
//     timeSlotsContainer.innerHTML = "<p>Loading available times...</p>";
//     // Fetch booked slots from Google Apps Script
//     let bookedTimes = [];
//     try{
//       // ADD HERE SCRIPT ID -------------------------------------------
//         const response = await fetch(`https://script.google.com/macros/s/AKfycbyraJcQuOv5EBhtkQUolVS3JaQDQlgVQm3thZMPQcr1s53abiA0kQJmaL9y9SAQ0Uzf/exec?date=${selectedDate}&token=TheSecretToken`);
//         bookedTimes = await response.json(); // expects ["09:00","10:00"]
//     } catch(err){
//     console.error("Failed to fetch booked times", err);
//     timeSlotsContainer.innerHTML = "<p>Could not load booked times. Please try again later.</p>";
//     return;
//    }
//     const slots = getSlotsForDate(selectedDate);
//     timeSlotsContainer.innerHTML = "";
//     hiddenTimeInput.value = "";
//     const now = new Date();

//     slots.forEach(time => {
//     const btn = document.createElement("div");
//     btn.classList.add("slot");
//     const selectedDateObj = new Date(selectedDate + "T" + time);

//     // Disable past times
//     if(selectedDateObj <= now){
//         btn.classList.add("disabled");
//     }

//     // Disable already booked slots
//     if(bookedTimes.includes(time)){
//         btn.classList.add("disabled");
//         btn.innerText = `${formatTime(time)} (Booked)`;
//     } else if(!btn.classList.contains("disabled")){
//         btn.innerText = formatTime(time);
//     }

//     // Only allow click if not disabled
//     btn.addEventListener("click", () => {
//         if(btn.classList.contains("disabled")) return;  // skip click
//         document.querySelectorAll(".slot").forEach(s => s.classList.remove("selected"));
//         btn.classList.add("selected");
//         hiddenTimeInput.value = time;
//     });

//     timeSlotsContainer.appendChild(btn);
// });

//     // Weekend note
//     const day = new Date(selectedDate).getDay();
//     if(day === 0 || day === 6){
//         weekendNote.style.display = "block";
//         weekendNote.innerText = "Limited availability on weekends. Please call for special requests.";
//     } else {
//         weekendNote.style.display = "none";
//     }
// }

// // Regenerate time slots on date change
// dateInput.addEventListener("change", generateTimeSlots);

// // Run on page load
// generateTimeSlots();

// /* -----------------------
//    Booking Form Submission
// ----------------------- */
// form.addEventListener("submit", async function(e){
//     e.preventDefault();

//     const submitBtn = form.querySelector("button");

//     submitBtn.disabled = true;
//     submitBtn.innerText = "Booking...";

//     const name = document.getElementById("name").value.trim();
//     const email = document.getElementById("email").value.trim();
//     const phone = document.getElementById("phone").value.trim();
//     const service = document.getElementById("service").value;
//     const date = document.getElementById("date").value;
//     const time = document.getElementById("time").value;
//     const notes = document.getElementById("notes").value.trim();
//     const addGoogle = document.getElementById("addGoogleCalendar").checked;
//     const downloadICS = document.getElementById("downloadICS").checked;
//     // Validation
//     if(!time){
//         statusMessage.innerText = "Please select a time slot.";
//         submitBtn.disabled = false;
//         submitBtn.innerText = "Book Appointment";
//         return;
//     }
//     let latestBooked = [];
//     try {
//         // Before sending email
//         const checkRes = await fetch(`https://script.google.com/macros/s/AKfycbyraJcQuOv5EBhtkQUolVS3JaQDQlgVQm3thZMPQcr1s53abiA0kQJmaL9y9SAQ0Uzf/exec?date=${date}&token=TheSecretToken`);
//         latestBooked = await checkRes.json();
//     } catch(err){
//         statusMessage.innerText = "Could not verify availability. Try again.";
//         submitBtn.disabled = false;
//         submitBtn.innerText = "Book Appointment";
//         return;
//     }
//     if(latestBooked.includes(time)){
//         statusMessage.innerText = "That time was just booked. Please choose another.";
//         generateTimeSlots();
//         submitBtn.disabled = false;
//         submitBtn.innerText = "Book Appointment";
//         return;
//     }

//     const selectedDateTime = new Date(`${date}T${time}`);
//     if(selectedDateTime <= new Date()){
//         statusMessage.innerText = "Please select a future time.";
//         submitBtn.disabled = false;
//         submitBtn.innerText = "Book Appointment";
//         return;
//     }
//     statusMessage.innerText = "Booking appointment...";
//     // Send Email via EmailJS
//     const templateParams = { name, email, phone, service, date, time, notes };
//     try {
//       // ADD HERE YOUR SERVICE ID AND TEMPLETE ID FROM EmailJS
//         await emailjs.send("service_323gm1m", "template_qec3kgp", templateParams);
//     } catch(error){
//         statusMessage.innerText = "Email failed to send.";
//         console.error(error);
//         submitBtn.disabled = false;
//         submitBtn.innerText = "Book Appointment";
//         return;
//     }
//     // Google Calendar Event
//     if(addGoogle){
//         createGoogleCalendarEvent(name, service, date, time, notes);
//     }
//     // ICS File Download
//     if(downloadICS){
//         generateICS(name, service, date, time, notes);
//     }
//     // Save booking to Apps Script (Business Calendar)
//     try{
//         await fetch("https://script.google.com/macros/s/AKfycbyraJcQuOv5EBhtkQUolVS3JaQDQlgVQm3thZMPQcr1s53abiA0kQJmaL9y9SAQ0Uzf/exec", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             // body: JSON.stringify({ name, email, phone, service, date, time, notes })
//             body: JSON.stringify({
//                 name, email, phone, service, date, time, notes,
//                 token: "TheSecretToken"
//                 })
//         });
//     } catch(err){
//         console.error("Failed to save booking", err);
//     }

//     statusMessage.innerText = "Appointment booked successfully!";
//     form.reset();
//     generateTimeSlots(); // reset slots after booking
// });
// function formatLocalDate(d){
//     const pad = n => String(n).padStart(2, '0');
//     return (
//         d.getFullYear() +
//         pad(d.getMonth()+1) +
//         pad(d.getDate()) + "T" +
//         pad(d.getHours()) +
//         pad(d.getMinutes()) +
//         "00"
//     );
// }
// /* -----------------------
//    Google Calendar Event Creator
// ----------------------- */
// function createGoogleCalendarEvent(name, service, date, time, notes){
//     const start = new Date(`${date}T${time}`);
//     const end = new Date(start.getTime() + 60*60*1000);
//     // const formatDate = d => d.toISOString().replace(/-|:|\.\d+/g,"");
//     const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Tailor Fitting Appointment")}&dates=${formatLocalDate(start)}/${formatLocalDate(end)}&details=${encodeURIComponent(`Client: ${name}\nService: ${service}\nNotes: ${notes}`)}`;
//     window.open(url, "_blank");
// }
// /* -----------------------
//    ICS File Generator
// ----------------------- */
// function formatICSDateLocal(d){
//     const pad = n => String(n).padStart(2, '0');
//     return (
//         d.getFullYear() +
//         pad(d.getMonth()+1) +
//         pad(d.getDate()) + "T" +
//         pad(d.getHours()) +
//         pad(d.getMinutes()) +
//         "00"
//     );
// }
// function generateICS(name, service, date, time, notes){
//     const start = new Date(`${date}T${time}`);
//     const end = new Date(start.getTime() + 60*60*1000);

//     // const formatICSDate = d => d.toISOString().replace(/-|:|\.\d+/g,"");

//     const icsContent =
// `BEGIN:VCALENDAR
// VERSION:2.0
// BEGIN:VEVENT
// SUMMARY:Tailor Fitting
// DESCRIPTION:Client ${name} Service ${service} Notes ${notes}
// DTSTART:${formatICSDateLocal(start)}
// DTEND:${formatICSDateLocal(end)}
// END:VEVENT
// END:VCALENDAR`;

//     const blob = new Blob([icsContent], {type:"text/calendar"});
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "tailor-booking.ics";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// }

/* -----------------------
   EmailJS Initialization
----------------------- */
(function(){
    emailjs.init("2mgRd_En93geNtQVi"); // Your EmailJS public key
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

const SCRIPT_URL = "http://72.62.163.58:3001/bookings"; // VPS IPv4 + port
const SECRET_TOKEN = "TheSecretToken"; // You can keep this if you use it in POST requests

/* -----------------------
   Business Hours
----------------------- */
function getSlotsForDate(date){
    const day = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
    return (day >= 1 && day <= 5)
        ? ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]
        : ["10:00","12:00","14:00"];
}

function formatTime(time){
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

/* -----------------------
   Fetch Booked Times & Render Slots
----------------------- */
async function generateTimeSlots() {
    const selectedDate = dateInput.value;
    if (!selectedDate) {
        timeSlotsContainer.innerHTML = "<p>Select a date first</p>";
        return;
    }

    // Show loading state
    timeSlotsContainer.innerHTML = "<p>Loading available times...</p>";
    hiddenTimeInput.value = "";

    let bookedTimes = [];
    try {
        const response = await fetch(`${SCRIPT_URL}?date=${selectedDate}&token=${SECRET_TOKEN}`, {
            method: "GET",
            mode: "cors"
        });
        bookedTimes = await response.json();
    } catch (err) {
        console.error("Failed to fetch booked times", err);
        timeSlotsContainer.innerHTML = "<p>Could not load booked times. Try again later.</p>";
        return;
    }

    const slots = getSlotsForDate(selectedDate);
    timeSlotsContainer.innerHTML = "";
    const now = new Date();

    slots.forEach(time => {
        const slotDiv = document.createElement("div");
        slotDiv.classList.add("slot");

        const slotDate = new Date(`${selectedDate}T${time}`);
        const isPast = slotDate <= now;
        const isBooked = bookedTimes.includes(time);

        slotDiv.innerText = formatTime(time) + (isBooked ? " (Booked)" : "");

        if (isPast || isBooked) {
            slotDiv.classList.add("disabled");
        } else {
            slotDiv.addEventListener("click", () => {
                // Remove previous selection
                document.querySelectorAll(".slot").forEach(s => s.classList.remove("selected"));
                // Add new selection
                slotDiv.classList.add("selected");
                hiddenTimeInput.value = time;
                // Optional: small bounce effect
                slotDiv.style.transform = "scale(1.05)";
                setTimeout(() => slotDiv.style.transform = "", 150);
            });
        }

        timeSlotsContainer.appendChild(slotDiv);
    });

    // Show weekend note if Saturday or Sunday
    const day = new Date(selectedDate).getDay();
    if (day === 0 || day === 6) {
        weekendNote.style.display = "block";
        weekendNote.innerText = "Limited availability on weekends. Please call for special requests.";
    } else {
        weekendNote.style.display = "none";
    }
}

dateInput.addEventListener("change", generateTimeSlots);
generateTimeSlots();

/* -----------------------
   Booking Form Submission
----------------------- */
form.addEventListener("submit", async function(e){
    e.preventDefault();
    const submitBtn = form.querySelector("button");
    submitBtn.disabled = true;
    submitBtn.innerText = "Booking...";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const date = dateInput.value;
    const time = hiddenTimeInput.value;
    const notes = document.getElementById("notes").value.trim();
    const addGoogle = document.getElementById("addGoogleCalendar").checked;
    const downloadICS = document.getElementById("downloadICS").checked;


function validateForm() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const date = dateInput.value;
    const time = hiddenTimeInput.value;
    const notes = document.getElementById("notes").value.trim();

    const errors = [];

    // Name (letters + spaces, at least 2 chars)
    if (!/^[a-zA-Z\s]{2,}$/.test(name)) {
        errors.push("Name must be at least 2 characters and contain only letters.");
    }

    // Email (basic but strong enough)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Invalid email address.");
    }

    // Phone (supports multiple formats)
    if (!/^\+?\d{10,15}$/.test(phone.replace(/[\s()-]/g, ""))) {
        errors.push("Phone must be 10–15 digits.");
    }

    // Service (must be selected)
    if (!service) {
        errors.push("Please select a service.");
    }

    // Notes (optional but limit length)
    if (notes.length > 500) {
        errors.push("Notes cannot exceed 500 characters.");
    }

    return errors;
}



    if(!time){
        statusMessage.innerText = "Please select a time slot.";
        submitBtn.disabled = false;
        submitBtn.innerText = "Book Appointment";
        return;
    }

    // Re-check booked times
    try{
        const checkRes = await fetch(`${SCRIPT_URL}?date=${date}&token=${SECRET_TOKEN}`, { method: "GET", mode: "cors" });
        const latestBooked = await checkRes.json();
        if(latestBooked.includes(time)){
            statusMessage.innerText = "That time was just booked. Please choose another.";
            generateTimeSlots();
            submitBtn.disabled = false;
            submitBtn.innerText = "Book Appointment";
            return;
        }
    } catch(err){
        statusMessage.innerText = "Could not verify availability. Try again.";
        submitBtn.disabled = false;
        submitBtn.innerText = "Book Appointment";
        return;
    }

    // Send Email
    try{
        await emailjs.send("service_323gm1m", "template_qec3kgp", { name, email, phone, service, date, time, notes });
    } catch(err){
        console.error(err);
        statusMessage.innerText = "Email failed to send.";
        submitBtn.disabled = false;
        submitBtn.innerText = "Book Appointment";
        return;
    }

    // Google Calendar
    if(addGoogle){
        const start = new Date(`${date}T${time}`);
        const end = new Date(start.getTime() + 60*60*1000);
        const pad = n => String(n).padStart(2,'0');
        const formatLocal = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Tailor Fitting Appointment&dates=${formatLocal(start)}/${formatLocal(end)}&details=Client:${name}\nService:${service}\nNotes:${notes}`;
        window.open(url, "_blank");
    }

    // ICS download
    if(downloadICS){
        const start = new Date(`${date}T${time}`);
        const end = new Date(start.getTime() + 60*60*1000);
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Tailor Fitting
DESCRIPTION:Client ${name} Service ${service} Notes ${notes}
DTSTART:${formatLocalDate(start)}
DTEND:${formatLocalDate(end)}
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

    // Save booking
    try{
        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, service, date, time, notes, token: SECRET_TOKEN })
        });
    } catch(err){
        console.error("Failed to save booking", err);
    }

    statusMessage.innerText = "Appointment booked successfully!";
    form.reset();
    generateTimeSlots();
});

/* -----------------------
   Helper for ICS dates
----------------------- */
function formatLocalDate(d){
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}