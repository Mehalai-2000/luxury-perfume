import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss'
})
export class AboutComponent implements AfterViewInit, OnDestroy {
    private gsapContext?: gsap.Context;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    ngAfterViewInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.animateAboutSection();
        }
    }

    ngOnDestroy(): void {
        if (this.gsapContext) {
            this.gsapContext.revert();
        }
        ScrollTrigger.getAll().filter(t => t.vars['id'] === 'about').forEach(t => t.kill());
    }

    private animateAboutSection(): void {
        this.gsapContext = gsap.context(() => {
            // 1. Stagger headers and philosophy pillars
            gsap.fromTo(['.embedded-about-header', '.pillar-card'],
                { opacity: 0, y: 50, scale: 0.96 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.85,
                    ease: 'power3.out',
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: '.embedded-about-section',
                        start: 'top 78%',
                        id: 'about'
                    }
                }
            );

            // 2. Letters and wax seal manifesto
            gsap.fromTo('.manifesto-card',
                { opacity: 0, y: 60, scale: 0.97 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.05,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.manifesto-container',
                        start: 'top 80%',
                        id: 'about'
                    }
                }
            );
        });
    }
}
