document.addEventListener('DOMContentLoaded', () => {
    const heroImageContainer = document.querySelector('.hero-image-container');
    const heroImage = document.querySelector('.hero-image');
    const heroTextContainer = document.querySelector('.hero-text-container');
    const bottomNav = document.querySelector('.bottom-nav');
    const navLinks = document.querySelectorAll('.bottom-nav a');
    const letterWrappers = document.querySelectorAll('.letter-wrapper');

    // Function to run the entry animation
    function animatePageEntry() {
        // Reset elements for animation if they've been manipulated
        gsap.set(heroImageContainer, { height: '100vh' });
        gsap.set(heroImage, { scale: 1, y: 0 });
        gsap.set(heroTextContainer, { opacity: 0, y: 20 });
        gsap.set(letterWrappers, { y: '100%' });
        gsap.set(bottomNav, { y: '100%', opacity: 0 });

        const tl = gsap.timeline({
            defaults: { ease: "power3.out", duration: 1 }
        });

        // Hero image shrinking animation
        tl.to(heroImageContainer, {
            height: '70vh', // Adjust this value to control the final size
            duration: 1.2,
            ease: "power3.inOut"
        })
        .to(heroImage, {
            scale: 0.9, // Shrink image slightly within its container
            duration: 1.2,
            ease: "power3.inOut"
        }, "<") // Start at the same time as the image container height animation

        // Hero text animation (fade in and letter scroll)
        .to(heroTextContainer, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.8") // Start before the image finishes shrinking
        .to(letterWrappers, {
            y: '0%',
            stagger: 0.05, // Stagger each letter's animation
            duration: 0.6,
            ease: "power3.out"
        }, "<0.2") // Start slightly after the hero text container animation

        // Bottom navigation animation
        .to(bottomNav, {
            y: '0%',
            opacity: 1,
            duration: 0.7,
            ease: "power3.out"
        }, "-=0.6"); // Start before the hero text finishes
    }

    // Run the animation on page load
    animatePageEntry();

    // Handle navigation clicks for page transitions
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            const targetUrl = link.href;

            // Animate out the current page
            const tlOut = gsap.timeline({
                defaults: { ease: "power3.inOut", duration: 0.8 },
                onComplete: () => {
                    window.location.href = targetUrl; // Navigate after animation
                }
            });

            tlOut.to(heroImageContainer, {
                height: '100vh', // Expand image back to full
                duration: 1,
                ease: "power3.inOut"
            })
            .to(heroImage, {
                scale: 1, // Reset image scale
                duration: 1,
                ease: "power3.inOut"
            }, "<")
            .to(heroTextContainer, {
                opacity: 0,
                y: -20, // Move text up and fade out
                duration: 0.6
            }, "<0.2")
            .to(bottomNav, {
                y: '100%',
                opacity: 0,
                duration: 0.6
            }, "<0.2");
        });
    });
});
