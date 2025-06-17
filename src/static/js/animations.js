// Animations using GSAP
// Floating chat panel animation
function animateChatPanel() {
    gsap.fromTo("#chat", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 });
}

// HUD animations
function animateHUD() {
    gsap.fromTo("#inventory", { x: -200 }, { x: 0, duration: 1 });
    gsap.fromTo("#header", { y: -100 }, { y: 0, duration: 1 });
}

// Call animations on page load
window.onload = function () {
    animateChatPanel();
    animateHUD();
};

// Transition to the next room
function transitionToNextRoom() {
    gsap.to("#game-container", {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            // Logic to load the next room
            document.querySelector("#game-container").style.display = "none";
            document.querySelector("#next-room").style.display = "block";
            gsap.fromTo("#next-room", { opacity: 0 }, { opacity: 1, duration: 1 });
        }
    });
}

// Win animation
function playWinAnimation() {
    gsap.to("body", {
        backgroundColor: "#FFD700",
        duration: 2,
        onComplete: () => {
            alert("Congratulations! You've won the game!");
        }
    });
}
