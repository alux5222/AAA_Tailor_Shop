const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");

hamburger.addEventListener("click", () => {

    hamburger.classList.toggle("active");
    menu.classList.toggle("active");
    document.body.classList.toggle("menu-open");

});

/* mobile dropdown toggle */

document.querySelectorAll(".dropdown > a").forEach(link => {

    link.addEventListener("click", function(e){

        if(window.innerWidth <= 768){
            e.preventDefault();
            this.parentElement.classList.toggle("active");
        }
    });
});

/* NAVBAR SCROLL EFFECT */

const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    if(window.scrollY > 50){
        header.classList.add("scrolled");
    }
    else{
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
