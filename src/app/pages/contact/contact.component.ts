import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss'
})
export class ContactComponent implements AfterViewInit, OnDestroy {
    // Contact Form Model
    contactData = {
        name: '',
        email: '',
        inquiryType: 'atelier',
        message: ''
    };

    // State Management
    contactFocusedField: string | null = null;
    showContactSuccessModal: boolean = false;
    isContactSubmitting: boolean = false;

    private gsapContext?: gsap.Context;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    ngAfterViewInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.animateContactSection();
        }
    }

    ngOnDestroy(): void {
        if (this.gsapContext) {
            this.gsapContext.revert();
        }
        ScrollTrigger.getAll().filter(t => t.vars['id'] === 'contact-scroll').forEach(t => t.kill());
    }

    // Handle contact input focus
    setContactFocus(field: string): void {
        this.contactFocusedField = field;
    }

    // Handle contact input blur
    clearContactFocus(): void {
        this.contactFocusedField = null;
    }

    // Submit Contact Form
    submitContactForm(event: Event): void {
        event.preventDefault();
        if (!this.contactData.name || !this.contactData.email || !this.contactData.message) {
            return;
        }

        this.isContactSubmitting = true;

        // Simulate luxury API call with high-end micro-animations
        setTimeout(() => {
            this.isContactSubmitting = false;
            this.showContactSuccessModal = true;
            this.animateContactSuccessModal();
        }, 1200);
    }

    closeContactSuccessModal(): void {
        if (isPlatformBrowser(this.platformId)) {
            gsap.to('.success-modal-backdrop', {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.inOut'
            });
            gsap.to('.success-modal-content', {
                scale: 0.9,
                y: 20,
                opacity: 0,
                duration: 0.4,
                ease: 'power2.inOut',
                onComplete: () => {
                    this.showContactSuccessModal = false;
                    // Reset form data
                    this.contactData = {
                        name: '',
                        email: '',
                        inquiryType: 'atelier',
                        message: ''
                    };
                }
            });
        } else {
            this.showContactSuccessModal = false;
        }
    }

    private animateContactSection(): void {
        this.gsapContext = gsap.context(() => {
            gsap.fromTo(['.embedded-contact-header', '.form-column', '.image-column'],
                { opacity: 0, y: 50, scale: 0.96 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.85,
                    ease: 'power3.out',
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: '.embedded-contact-section',
                        start: 'top 78%',
                        id: 'contact-scroll'
                    }
                }
            );
        });
    }

    private animateContactSuccessModal(): void {
        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
                // Animate success modal backdrop
                gsap.fromTo('.success-modal-backdrop',
                    { opacity: 0 },
                    { opacity: 1, duration: 0.4, ease: 'power2.out' }
                );
                // Animate success modal card
                gsap.fromTo('.success-modal-content',
                    { scale: 0.85, y: 30, opacity: 0 },
                    { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }
                );
                // Gold seal rotation & sparkle
                gsap.fromTo('.success-seal',
                    { scale: 0.2, rotation: -180, opacity: 0 },
                    { scale: 1, rotation: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'back.out(1.7)' }
                );
            }, 50);
        }
    }
}
