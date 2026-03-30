// cal_live_5149d90ddd53f7f5519d00ef58eb9779
// calBooking.js
document.addEventListener("DOMContentLoaded", () => {

  // ----------------------------
  // 1️⃣ Load Cal.com embed script
  // ----------------------------
  function loadCal() {
    return new Promise((resolve) => {
      if (window.Cal) return resolve();

      const script = document.createElement("script");
      script.src = "https://app.cal.com/embed/embed.js";
      script.async = true;
      script.onload = () => resolve();

      document.head.appendChild(script);
    });
  }

  // ----------------------------
  // 2️⃣ Populate time slots
  // ----------------------------
  const availableTimes = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00"
  ];

  const timeContainer = document.getElementById("timeSlots");

  function formatTime(time) {
    const [hour, minute] = time.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  }

  availableTimes.forEach(time => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = formatTime(time);
    btn.className = "time-slot";

    btn.addEventListener("click", () => {
      document.getElementById("time").value = time;

      // Highlight selected
      document.querySelectorAll(".time-slot").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });

    timeContainer.appendChild(btn);
  });

  const form = document.getElementById("bookingForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    await loadCal();

    if (!window.Cal) {
      console.error("Cal is still undefined after loading!");
      return;
    }

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const notes = document.getElementById("notes").value.trim();

    // Validate
    if (!service || !date || !time) {
      alert("Please select a service, date, and time.");
      return;
    }

    // Map service to Cal.com link
    let calLink = "alux5222/dress";
    switch(service) {
      case "Suit": calLink = "alux5222/suit"; break;
      case "Dress": calLink = "alux5222/dress"; break;
      case "Custom": calLink = "alux5222/custom"; break;
      case "Measurement": calLink = "alux5222/measurement"; break;
    }

    const start = `${date}T${time}:00`;

    // Open Cal.com modal
    Cal("ui", { theme: "light" });
    Cal("open", {
      calLink,
      config: { name, email, phone, notes, start }
    });
  });

});
// https://cal.com/alux5222