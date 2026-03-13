const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");
const dropdownLinks = document.querySelectorAll(".dropdown > a");
const header = document.querySelector("header");

// Toggle mobile menu
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  menu.classList.toggle("active");
  document.body.classList.toggle("menu-open");
});

// Toggle submenu on click (desktop & mobile)
dropdownLinks.forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault(); // stop link navigation
    const parent = this.parentElement;

    // Toggle current dropdown
    parent.classList.toggle("active");

    // Close other dropdowns
    dropdownLinks.forEach(other => {
      if (other !== this) other.parentElement.classList.remove("active");
    });
  });
});

// Navbar scroll effect
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

/* ===================================
Opens address in maps
====================================*/
const address = "2345 Southern BLVD SE, Rio Rancho, NM 87124";
const encoded = encodeURIComponent(address);
const isApple = /iPhone|iPad|Macintosh/.test(navigator.userAgent);

const link = isApple
    ? `https://maps.apple.com/?q=${encoded}`
    : `https://www.google.com/maps?q=${encoded}`;

    document.getElementById("mapLink").href = link;
