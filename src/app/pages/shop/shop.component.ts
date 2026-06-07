import { Component, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AboutComponent } from '../about/about.component';
import { FaqComponent } from '../faq/faq.component';
import { ContactComponent } from '../contact/contact.component';
import { Perfume } from '../../models/perfume.model';
import { CartService } from '../../services/cart.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Subscription } from 'rxjs';

gsap.registerPlugin(ScrollTrigger);

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AboutComponent, FaqComponent, ContactComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit, AfterViewInit, OnDestroy {

  activeFilter: string = 'all';
  cartCount: number = 0;
  cartItems: Perfume[] = [];
  cartTotal: number = 0;
  cartVisible: boolean = false;
  addedToCartId: number | null = null;
  hoveredId: number | null = null;

  // Carousel slide state variables
  startIndex: number = 0;
  cardsPerPage: number = 3;

  // FAQ active item state
  faqActiveId: number | null = null;

  private cartSub?: Subscription;
  private gsapContext?: gsap.Context;

  // Scroll-back state
  private isTransitioning = false;
  private touchStartY = 0;
  private wheelListener?: (e: WheelEvent) => void;
  private touchStartListener?: (e: TouchEvent) => void;
  private touchMoveListener?: (e: TouchEvent) => void;

  readonly filters = ['all', 'floral', 'woody', 'oriental', 'fresh'];

  readonly products: Perfume[] = [
    {
      id: 1,
      name: 'LUMIÈRE NOIR',
      subtitle: 'Eau de Parfum',
      price: 285,
      size: '100ml',
      category: 'oriental',
      badge: 'BESTSELLER',
      description: 'A seductive dance of dark amber and smoked vetiver, crowned with rare oud from the Arabian peninsula.',
      notes: ['Dark Amber', 'Oud', 'Vetiver', 'Sandalwood'],
      image: 'assets/wine.webp',
      inCart: false,
      quantity: 0,
      inWishlist: false
    },
    {
      id: 2,
      name: 'VELOURS ROSE',
      subtitle: 'Eau de Parfum',
      price: 220,
      size: '75ml',
      category: 'floral',
      badge: 'NEW',
      description: 'Midnight Bulgarian rose wrapped in the softest white musk, leaving a trail of powdery elegance.',
      notes: ['Bulgarian Rose', 'White Musk', 'Peony', 'Cashmere'],
      image: 'assets/rose.webp',
      inCart: false,
      quantity: 0,
      inWishlist: false
    },
    {
      id: 3,
      name: 'CÈDRE BLANC',
      subtitle: 'Eau de Parfum',
      price: 195,
      size: '50ml',
      category: 'woody',
      description: 'Sun-warmed white cedar meeting cold mountain air, a scent of pristine alpine forests at dawn.',
      notes: ['White Cedar', 'Bergamot', 'Tonka Bean', 'Birch'],
      image: 'assets/white.webp',
      inCart: false,
      quantity: 0,
      inWishlist: false
    },
    {
      id: 4,
      name: 'AQUA ROYALE',
      subtitle: 'Eau de Cologne',
      price: 165,
      size: '100ml',
      category: 'fresh',
      badge: 'LIMITED',
      description: 'A crashing wave of Mediterranean citrus and sea salt, capturing the essence of royal coastal estates.',
      notes: ['Sea Salt', 'Lemon Zest', 'Ambergris', 'Driftwood'],
      image: 'assets/aqua.webp',
      inCart: false,
      quantity: 0,
      inWishlist: false
    },
    {
      id: 5,
      name: 'OPIUM DORÉ',
      subtitle: 'Parfum',
      price: 395,
      size: '50ml',
      category: 'oriental',
      badge: 'EXCLUSIVE',
      description: 'The crown jewel of our collection. Rare saffron and liquid gold benzoin in an intoxicating oriental masterpiece.',
      notes: ['Saffron', 'Benzoin', 'Iris', 'Myrrh'],
      image: 'assets/black.webp',
      inCart: false,
      quantity: 0,
      inWishlist: false
    },
    {
      id: 6,
      name: 'JARDIN SECRET',
      subtitle: 'Eau de Parfum',
      price: 240,
      size: '75ml',
      category: 'floral',
      description: 'A hidden garden at golden hour — blooming jasmine and tuberose in a veil of warm amber.',
      notes: ['Jasmine', 'Tuberose', 'Amber', 'Ylang-Ylang'],
      image: 'assets/golden.webp',
      inCart: false,
      quantity: 0,
      inWishlist: false
    }
  ];


  // Reactive filtered list
  get filteredProducts(): Perfume[] {
    if (this.activeFilter === 'all') return this.products;
    return this.products.filter(p => p.category === this.activeFilter);
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private cartService: CartService
  ) { }

  get maxStartIndex(): number {
    return Math.max(0, this.filteredProducts.length - this.cardsPerPage);
  }

  get trackTransform(): string {
    let step = '0px';
    if (this.cardsPerPage === 3) {
      step = 'calc(100% / 3 + 10px)';
    } else if (this.cardsPerPage === 2) {
      step = 'calc(100% / 2 + 10px)';
    } else {
      step = 'calc(100% + 20px)';
    }
    return `translateX(calc(-${this.startIndex} * ${step}))`;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateCardsPerPage();
    }
  }

  updateCardsPerPage(): void {
    const width = window.innerWidth;
    if (width <= 768) {
      this.cardsPerPage = 1;
    } else if (width <= 992) {
      this.cardsPerPage = 2;
    } else {
      this.cardsPerPage = 3;
    }
    this.startIndex = Math.min(this.startIndex, this.maxStartIndex);
  }

  slidePrev(): void {
    if (this.startIndex > 0) {
      this.startIndex--;
    }
  }

  slideNext(): void {
    if (this.startIndex < this.maxStartIndex) {
      this.startIndex++;
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateCardsPerPage();
    }
    this.cartSub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartCount = items.reduce((acc, i) => acc + i.quantity, 0);
      this.cartTotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Always start at the very top — prevents browser fragment restoration
      // or GSAP layout-pass from jumping to a mid-page section on load
      window.scrollTo(0, 0);
      this.runEntranceAnimations();
      this.registerScrollBackListeners();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.gsapContext) this.gsapContext.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
      // Clean up scroll-back listeners
      if (this.wheelListener) window.removeEventListener('wheel', this.wheelListener);
      if (this.touchStartListener) window.removeEventListener('touchstart', this.touchStartListener);
      if (this.touchMoveListener) window.removeEventListener('touchmove', this.touchMoveListener);
    }
    if (this.cartSub) this.cartSub.unsubscribe();
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.startIndex = 0; // Reset to card index 0
    // Re-animate cards after filter change
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.animateCards(), 50);
    }
  }

  addToCart(product: Perfume, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(product);
    this.addedToCartId = product.id;
    setTimeout(() => (this.addedToCartId = null), 1800);
  }

  removeFromCart(product: Perfume): void {
    this.cartService.removeFromCart(product.id);
  }

  toggleCart(): void {
    this.cartVisible = !this.cartVisible;
  }

  toggleWishlist(product: Perfume, event: Event): void {
    event.stopPropagation(); // Prevents click overlay triggers
    product.inWishlist = !product.inWishlist;
  }

  toggleFaq(id: number): void {
    this.faqActiveId = this.faqActiveId === id ? null : id;
  }

  private runEntranceAnimations(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Global ScrollTrigger optimization
      ScrollTrigger.config({
        limitCallbacks: true,
        ignoreMobileResize: true
      });
    }

    this.gsapContext = gsap.context(() => {
      const tl = gsap.timeline();

      // Hero section
      tl.fromTo('.shop-hero-tag',
        { opacity: 0, y: 20, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power2.out' }, 0.2
      );
      tl.fromTo('.shop-hero-title',
        { opacity: 0, scale: 0.85, filter: 'blur(20px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' }, 0.45
      );
      tl.fromTo('.shop-hero-subtitle',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.75
      );
      tl.fromTo('.shop-hero-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0.6
      );

      // Filter bar
      tl.fromTo('.filter-bar',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.0
      );

      // Animate cards on scroll
      this.animateCards();

      // Delay scroll-spy init so ScrollTrigger doesn't fire during
      // the initial layout pass before the page has settled at top
      setTimeout(() => this.initScrollSpy(), 300);
    });
  }

  private initScrollSpy(): void {
    const sections = [
      { id: '', trigger: '.shop-hero' },
      { id: 'about-section', trigger: '.embedded-about-section' },
      { id: 'faq-section', trigger: '.faq-section' },
      { id: 'contact-section', trigger: '.embedded-contact-section' }
    ];

    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section.trigger,
        start: 'top 15%',
        end: 'bottom 15%',
        onToggle: self => {
          if (self.isActive && isPlatformBrowser(this.platformId)) {
            const currentFragment = this.router.url.split('#')[1] || '';
            const targetFragment = section.id || '';

            if (currentFragment !== targetFragment) {
              // Use silent navigation to prevent jumping/flickering
              this.router.navigate([], {
                fragment: section.id || undefined,
                replaceUrl: true,
                queryParamsHandling: 'preserve'
              });
            }
          }
        }
      });
    });
  }

  private animateCards(): void {
    ScrollTrigger.getAll().filter(t => t.vars['id'] === 'cards').forEach(t => t.kill());

    gsap.fromTo('.product-card',
      { opacity: 0, y: 60, scale: 0.94 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.75,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: '.products-carousel-container',
          start: 'top 85%',
          id: 'cards'
        }
      }
    );
  }


  // SCROLL-BACK TO HOME LISTENERS
  // -----------------------------------------------------------------
  private registerScrollBackListeners(): void {
    // Wheel — desktop scroll up at the very top of the page
    this.wheelListener = (e: WheelEvent) => {
      if (e.deltaY < -30 && window.scrollY === 0 && !this.isTransitioning) {
        this.triggerExitToHome();
      }
    };

    // Touch — swipe down (finger moves down = scroll up intent) at the top
    this.touchStartListener = (e: TouchEvent) => {
      this.touchStartY = e.touches[0].clientY;
    };
    this.touchMoveListener = (e: TouchEvent) => {
      const delta = e.touches[0].clientY - this.touchStartY; // positive = swipe down
      if (delta > 50 && window.scrollY === 0 && !this.isTransitioning) {
        this.triggerExitToHome();
      }
    };

    window.addEventListener('wheel', this.wheelListener, { passive: true });
    window.addEventListener('touchstart', this.touchStartListener, { passive: true });
    window.addEventListener('touchmove', this.touchMoveListener, { passive: true });
  }

  // -----------------------------------------------------------------
  // CINEMATIC EXIT → HOME PAGE
  // -----------------------------------------------------------------
  private triggerExitToHome(): void {
    this.isTransitioning = true;

    const tl = gsap.timeline({
      onComplete: () => {
        // Pass skipIntro flag so home skips the long 8.7s cinematic
        this.router.navigate(['/'], { state: { skipIntro: true } });
      }
    });

    // Slide the shop page DOWN (away from viewport — revealing "below" it)
    tl.to('.shop-page', {
      y: '60px',
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.65,
      ease: 'power3.in'
    }, 0);

    // Black curtain wipes in
    tl.to('.shop-exit-curtain', {
      opacity: 1,
      duration: 0.45,
      ease: 'power2.in'
    }, 0.25);
  }
}
