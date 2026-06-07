import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // Simulating a dynamic backend property
  public brandText: string = '';

  // DOM References
  @ViewChild('luxuryTitle') luxuryTitle!: ElementRef<HTMLHeadingElement>;
  @ViewChild('luxurySubtitle') luxurySubtitle!: ElementRef<HTMLSpanElement>;
  @ViewChild('scrollIndicator') scrollIndicator!: ElementRef<HTMLDivElement>;
  @ViewChild('glowOrb1') glowOrb1!: ElementRef<HTMLDivElement>;
  @ViewChild('glowOrb2') glowOrb2!: ElementRef<HTMLDivElement>;
  @ViewChild('bottleContainer') bottleContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('closedBottle') closedBottle!: ElementRef<HTMLImageElement>;
  @ViewChild('bottleBody') bottleBody!: ElementRef<HTMLImageElement>;
  @ViewChild('bottleLid') bottleLid!: ElementRef<HTMLImageElement>;
  @ViewChild('revealedBrand') revealedBrand!: ElementRef<HTMLDivElement>;
  @ViewChild('leftHeroContent') leftHeroContent!: ElementRef<HTMLDivElement>;
  @ViewChild('bottleEffects') bottleEffects!: ElementRef<HTMLDivElement>;
  @ViewChild('bottleBgImage') bottleBgImage!: ElementRef<HTMLImageElement>;

  // GSAP Context for scoping/cleanup
  private gsapContext?: gsap.Context;

  // Scroll transition state
  private scrollEnabled = false;       // Only active after intro finishes
  private isTransitioning = false;     // Prevent double-trigger
  private touchStartY = 0;             // Touch tracking

  // Event listener references for clean teardown
  private resizeListener?: () => void;
  private wheelListener?: (e: WheelEvent) => void;
  private touchStartListener?: (e: TouchEvent) => void;
  private touchMoveListener?: (e: TouchEvent) => void;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) { }

  ngOnInit(): void {
    // Dynamically setting the luxury text from a simulated "backend" source
    this.brandText = 'LUMIÈRE';
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Disable native scrolling on home page
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Check if returning from shop — skip the 8.7s cinematic intro
      const skipIntro = history.state?.skipIntro === true;

      // Clear the history state transition flags to ensure that refreshes/reloads play the intro from scratch
      if (skipIntro || history.state?.fromShopScroll) {
        window.history.replaceState({
          ...window.history.state,
          skipIntro: false,
          fromShopScroll: false
        }, '');
      }

      // Play cinematic intro — instantly completes if returning from shop
      this.playCinematicIntro(skipIntro);

      // Register resize listener
      this.registerEventListeners();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Re-enable native scrolling
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      // 1. Revert GSAP animations
      if (this.gsapContext) {
        this.gsapContext.revert();
      }

      // 2. Unbind events
      if (this.resizeListener) {
        window.removeEventListener('resize', this.resizeListener);
      }
      if (this.wheelListener) {
        window.removeEventListener('wheel', this.wheelListener);
      }
      if (this.touchStartListener) {
        window.removeEventListener('touchstart', this.touchStartListener);
      }
      if (this.touchMoveListener) {
        window.removeEventListener('touchmove', this.touchMoveListener);
      }

      // 3. Force destroy all ScrollTriggers
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }

  // -----------------------------------------------------------------
  // PLAY CINEMATIC INTRO (Runs automatically on load without scrolling!)
  // When instantComplete=true: jumps to the final state instantly
  // and fades out the exit curtain to reveal — used when returning from shop
  // -----------------------------------------------------------------
  private playCinematicIntro(instantComplete: boolean = false): void {
    this.gsapContext = gsap.context(() => {
      // Create a master automatic timeline
      const tl = gsap.timeline();

      // 1. Set starting properties (completely hidden and compressed)
      gsap.set(this.luxuryTitle.nativeElement, {
        opacity: 0,
        scale: 0.05,
        filter: 'blur(30px)',
        letterSpacing: '0.02em',
        y: '0vh'
      });

      gsap.set(this.luxurySubtitle.nativeElement, {
        opacity: 0,
        scale: 0.8,
        filter: 'blur(15px)',
        letterSpacing: '0.1em',
        y: '0vh'
      });

      // Initialize bottle container starting properties (completely hidden at bottom of screen)
      gsap.set(this.bottleContainer.nativeElement, {
        opacity: 0,
        xPercent: -50,
        yPercent: -50,
        y: '80vh',
        scale: 0.7,
        filter: 'blur(15px)'
      });

      // Set starting layers: closed bottle is visible, separate open layers are hidden
      gsap.set(this.closedBottle.nativeElement, { opacity: 1 });
      gsap.set(this.bottleBody.nativeElement, { opacity: 0 });
      gsap.set(this.bottleLid.nativeElement, { opacity: 0, yPercent: 18 });
      gsap.set(this.revealedBrand.nativeElement, { opacity: 0, xPercent: -50, yPercent: -50, y: 25, scale: 0.35, filter: 'blur(15px)' });

      // Initialize navbar starting state (hidden off-screen at the top for normal intro, visible for instant skip)
      if (!instantComplete) {
        gsap.set('.luxury-navbar', { yPercent: -100, opacity: 0 });
      } else {
        gsap.set('.luxury-navbar', { yPercent: 0, opacity: 1 });
      }

      // Initialize left-side luxury hero content starting state (hidden, slightly offset, and blurred)
      gsap.set(this.leftHeroContent.nativeElement, { opacity: 0 });
      gsap.set('.hero-pre-title', { opacity: 0, y: 15, filter: 'blur(10px)' });
      gsap.set('.hero-main-title', { opacity: 0, scale: 0.9, filter: 'blur(15px)' });
      gsap.set('.hero-post-title', { opacity: 0, y: -15, filter: 'blur(10px)' });
      gsap.set('.hero-btn', { opacity: 0, y: 20, scale: 0.95 });
      // Initialize bottle background image: tiny (deep back in 3D space) — zooms forward after bottle settles
      gsap.set(this.bottleBgImage.nativeElement, { opacity: 0, scale: 0.05 });
      // Initialize bottle effects (smoke/light) starting state (hidden — revealed after bottle settles)
      gsap.set('.bottle-effects', { opacity: 0 });





      // 2. Animate brand text zooming forward and spreading letter spacing (0s to 0.65s)
      tl.to(this.luxuryTitle.nativeElement, {
        opacity: 1,
        scale: 1.0,
        filter: 'blur(0px)',
        letterSpacing: '0.22em', // Grand typographic kerning reveal
        duration: 0.65,
        ease: 'power2.out'
      }, 0);

      tl.to(this.luxurySubtitle.nativeElement, {
        opacity: 0.85,
        scale: 1.0,
        filter: 'blur(0px)',
        letterSpacing: '0.6em', // Wide luxury spacing
        duration: 0.65,
        ease: 'power2.out'
      }, 0);

      // Fade in background glowing orbs concurrently
      tl.to('.ambient-glow', {
        opacity: 1,
        scale: 1.0,
        duration: 0.5,
        ease: 'power1.out'
      }, 0.2);

      tl.to(this.glowOrb1.nativeElement, {
        opacity: 1,
        y: '-6vh',
        x: '-4vw',
        scale: 1.25,
        duration: 0.7,
        ease: 'power2.out'
      }, 0.25);

      tl.to(this.glowOrb2.nativeElement, {
        opacity: 1,
        y: '6vh',
        x: '4vw',
        scale: 1.25,
        duration: 0.7,
        ease: 'power2.out'
      }, 0.25);

      tl.to('.smoke-overlay', {
        opacity: 1,
        duration: 0.5
      }, 0.25);

      // 3. Glide brand text majestically up off the screen and hide it completely
      // Starts at 0.75s, creating a perfect 0.1s pause in the center. Completely vanishes by 1.45s.
      tl.to(this.luxuryTitle.nativeElement, {
        y: '-52vh', // Float it completely off-screen at the top
        scale: 0.62,
        opacity: 0, // Vanish completely
        filter: 'blur(15px)', // Premium blur-out effect
        duration: 0.7,
        ease: 'power2.inOut'
      }, 0.75);

      tl.to(this.luxurySubtitle.nativeElement, {
        y: '-56vh', // Float it slightly higher
        scale: 0.8,
        opacity: 0, // Vanish completely
        filter: 'blur(15px)',
        duration: 0.7,
        ease: 'power2.inOut'
      }, 0.75);

      // 4. Animate the luxury perfume bottle rising from the bottom to the center of the screen
      // Starts at 0.75s (in tandem with the brand text gliding up)
      tl.to(this.bottleContainer.nativeElement, {
        opacity: 1,
        xPercent: -50,
        yPercent: -50,
        y: '8vh', // Shifted downward to provide ample headroom for the floating lid
        scale: 0.85, // Scaled down slightly to fit beautifully on all screen heights
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out'
      }, 0.75);

      // 5. Slide down the luxury navbar from the top (only during normal intro)
      if (!instantComplete) {
        tl.to('.luxury-navbar', {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out'
        }, 1.4);
      }

      // 6. Instantly swap closed bottle for separate body/lid layers (at 1.55s when rising settles)
      tl.set(this.closedBottle.nativeElement, { opacity: 0 }, 1.55);
      tl.set(this.bottleBody.nativeElement, { opacity: 1 }, 1.55);
      tl.set(this.bottleLid.nativeElement, { opacity: 1 }, 1.55);

      // 7. Animate bottle lid removing and slowly moving to the top
      tl.to(this.bottleLid.nativeElement, {
        yPercent: -15,
        duration: 1.8,
        ease: 'power2.out'
      }, 1.55);

      // 8. Slowly fade, blur-in, and lift the luxury text in the opening gap (dramatic zoom in!)
      tl.to(this.revealedBrand.nativeElement, {
        opacity: 1,
        xPercent: -50,
        yPercent: -50,
        y: 0,
        scale: 1.0,
        filter: 'blur(0px)',
        duration: 1.4,
        ease: 'power3.out'
      }, 1.85);

      // 9. Pause for 1.0 second, then shrink and hide the revealed gap text (starts at 4.25s)
      tl.to(this.revealedBrand.nativeElement, {
        opacity: 0,
        xPercent: -50,
        yPercent: -50,
        scale: 0.2, // Shrinks down
        filter: 'blur(15px)', // Blurs out
        y: 10,
        duration: 0.8,
        ease: 'power2.in'
      }, 4.25);

      // 10. Slowly close the bottle lid back to its seated position (starts at 5.05s)
      tl.to(this.bottleLid.nativeElement, {
        yPercent: 18, // Seated/closed position
        duration: 1.2,
        ease: 'power2.inOut'
      }, 5.05);

      // 11. Instantly swap separate layers back to pristine closed bottle image (at 6.25s when lid is seated)
      tl.set(this.closedBottle.nativeElement, { opacity: 1 }, 6.25);
      tl.set(this.bottleBody.nativeElement, { opacity: 0 }, 6.25);
      tl.set(this.bottleLid.nativeElement, { opacity: 0 }, 6.25);

      // 12. Move closed perfume bottle container to its final position (starts at 6.35s)
      const isMobile = window.innerWidth <= 768;
      const finalX = isMobile ? '0vw' : '24vw'; // Center horizontally on mobile, shift to right on desktop
      const finalY = isMobile ? '-27vh' : '0vh'; // Move up on mobile, center vertically on desktop (since top: 50%)
      const finalScale = isMobile ? 0.75 : 0.88; // Slightly smaller on mobile for better fit

      tl.to(this.bottleContainer.nativeElement, {
        xPercent: -50,
        yPercent: -50,
        x: finalX,
        y: finalY,
        scale: finalScale,
        duration: 1.5,
        ease: 'power3.inOut'
      }, 6.35);

      // 12b. AFTER bottle settles on the right (7.85s), zoom in the background from far back to front
      tl.to(this.bottleBgImage.nativeElement, {
        opacity: 1,
        scale: 1.3,     // Zooms past 1.0 to push aggressively forward — strong back-to-front depth feel
        duration: 1.3,
        ease: 'power3.out'
      }, 7.85);

      // 13. Animate Left-Side Luxury Hero Content (starts at 6.85s in tandem with bottle right-side glide)
      tl.to(this.leftHeroContent.nativeElement, {
        opacity: 1,
        duration: 0.1
      }, 6.85);

      tl.to('.hero-pre-title', {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        ease: 'power2.out'
      }, 6.85);

      tl.to('.hero-main-title', {
        opacity: 1,
        scale: 1.0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out'
      }, 7.00);

      tl.to('.hero-post-title', {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        ease: 'power2.out'
      }, 7.20);

      tl.to('.hero-btn', {
        opacity: 1,
        y: 0,
        scale: 1.0,
        duration: 1.0,
        ease: 'power2.out'
      }, 7.45);

      // 14. Fade in bottle luxury effects (smoke, light cone, glow) after bottle settles on the right (7.85s)
      tl.to('.bottle-effects', {
        opacity: 1,
        duration: 2.0,
        ease: 'power2.out'
      }, 7.85);

      // 15. Fade in scroll indicator at the bottom (if present, starts after bottle settles on the right)
      if (this.scrollIndicator) {
        tl.fromTo(this.scrollIndicator.nativeElement,
          { opacity: 0, y: 15 },
          { opacity: 0.55, y: 0, duration: 0.45, ease: 'power2.out' },
          7.85
        );
      }

      // 16. Fade in the "SCROLL TO SHOP" hint at the bottom after everything settles (8.5s)
      tl.fromTo('.scroll-to-shop-hint',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        8.5
      );

      // 17. After intro is complete, enable scroll-to-shop transition
      tl.call(() => {
        this.scrollEnabled = true;
        this.enableScrollTransition();
      }, [], 8.7);

      // ── INSTANT RETURN (returning from shop) ─────────────────────
      // Problem with tl.progress(1): GSAP "to" tweens capture their
      // FROM state lazily on first render — jumping to progress=1 before
      // any tick means some tweens never initialize, causing wrong positions.
      //
      // Solution: timeScale(100) plays the full 8.7s intro in ~87ms.
      // Every tween runs through the exact same code path as the normal
      // intro, so all positions are guaranteed correct. The black curtain
      // hides the 87ms flash; fading out at 150ms reveals the hero cleanly.
      if (instantComplete) {
        // 1. Cover screen with opaque black curtain (instant — before any frame)
        gsap.set('.page-exit-curtain', { opacity: 1, pointerEvents: 'none' });

        // 2. Run the full timeline at 100× speed (~87ms to complete)
        tl.timeScale(100);

        // 3. Fade the curtain out AFTER the timeline has completed
        gsap.to('.page-exit-curtain', {
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          delay: 0.15  // 150ms > 87ms, so the timeline is guaranteed done
        });
      }
      // ─────────────────────────────────────────────────────────────

    });
  }


  // -----------------------------------------------------------------
  // BROWSER EVENT BINDINGS
  // -----------------------------------------------------------------
  private registerEventListeners(): void {
    // High-performance browser resize tracking
    this.resizeListener = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', this.resizeListener);
  }

  // -----------------------------------------------------------------
  // ENABLE SCROLL TRANSITION (called after intro completes)
  // -----------------------------------------------------------------
  private enableScrollTransition(): void {
    // Wheel (desktop)
    this.wheelListener = (e: WheelEvent) => {
      // Prevent browser default native scroll/bounce
      e.preventDefault();

      if (e.deltaY > 10 && this.scrollEnabled && !this.isTransitioning) {
        this.triggerExitToShop();
      }
    };

    // Touch (mobile) – track direction
    this.touchStartListener = (e: TouchEvent) => {
      this.touchStartY = e.touches[0].clientY;
    };
    this.touchMoveListener = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }

      const delta = this.touchStartY - e.touches[0].clientY;
      if (delta > 20 && this.scrollEnabled && !this.isTransitioning) {
        this.triggerExitToShop();
      }
    };

    window.addEventListener('wheel', this.wheelListener, { passive: false });
    window.addEventListener('touchstart', this.touchStartListener, { passive: true });
    window.addEventListener('touchmove', this.touchMoveListener, { passive: false });
  }

  // -----------------------------------------------------------------
  // CINEMATIC EXIT → SHOP PAGE
  // -----------------------------------------------------------------
  private triggerExitToShop(): void {
    this.isTransitioning = true;
    this.scrollEnabled = false;

    // Re-enable native scrolling for the next page before navigating
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    const tl = gsap.timeline({
      onComplete: () => {
        this.router.navigate(['/shop']);
      }
    });

    // 1. Slide the entire cinematic viewport upward + fade to black
    tl.to('.cinematic-viewport', {
      y: '-100vh',
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.9,
      ease: 'power3.inOut'
    }, 0);

    // 2. Flash a black curtain over everything
    tl.to('.page-exit-curtain', {
      opacity: 1,
      duration: 0.55,
      ease: 'power2.in'
    }, 0.35);
  }
}
