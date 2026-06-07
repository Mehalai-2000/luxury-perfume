import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements AfterViewInit, OnDestroy {
  faqActiveId: number | null = null;
  private gsapContext?: gsap.Context;

  readonly faqItems: FaqItem[] = [
    {
      id: 1,
      category: 'DISTRIBUTION',
      question: 'How are Mystique Aroma fragrances shipped?',
      answer: 'To preserve the sensitive botanical compounds, every crystal flacon is secured in a climate-controlled, velvet-lined presentation case. We ship internationally via express, fully insured courier networks to guarantee perfect delivery conditions.'
    },
    {
      id: 2,
      category: 'ATELIER',
      question: 'Can I request a custom, bespoke scent profile?',
      answer: 'Absolutely. Our Private Atelier offers a personal consultations service with our master nose, Jacques L\'Aromatique. We meticulously curate custom scent stories, sourcing rare single-origin botanicals exclusively for your custom signature perfume.'
    },
    {
      id: 3,
      category: 'CIRCULARITY',
      question: 'What is your flacon recycling refill program?',
      answer: 'In alignment with sustainable luxury, our crystal flacons are designed for permanent use. You may return your empty flacon to any of our physical boutiques or via mail to receive a fresh refill of your signature scent at a 20% boutique credit.'
    },
    {
      id: 4,
      category: 'CRAFT',
      question: 'What makes your perfumes last for 24+ hours?',
      answer: 'Our fragrances are formulated at an ultra-high concentration of 30% pure essential oil extracts (Extraits de Parfum). We distill our ingredients in traditional micro-batches, allowing the base accords to bond deeply and evolve naturally with body heat.'
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  toggleFaq(id: number): void {
    this.faqActiveId = this.faqActiveId === id ? null : id;
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.runAnimations();
    }
  }

  ngOnDestroy(): void {
    if (this.gsapContext) {
      this.gsapContext.revert();
    }
    ScrollTrigger.getAll().filter(t => t.vars['id'] === 'faq-scroll').forEach(t => t.kill());
  }

  private runAnimations(): void {
    this.gsapContext = gsap.context(() => {
      // Header Animation
      gsap.fromTo('.faq-header-content',
        { opacity: 0, y: 40, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.faq-section',
            start: 'top 80%',
            id: 'faq-scroll'
          }
        }
      );

      // Faq Items Staggered Reveal
      gsap.fromTo('.faq-item-card',
        { opacity: 0, x: -30, rotationY: -15, filter: 'blur(5px)' },
        {
          opacity: 1,
          x: 0,
          rotationY: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.faq-list',
            start: 'top 85%',
            id: 'faq-scroll'
          }
        }
      );

      // Particles drift
      gsap.to('.faq-particle', {
        y: '-100px',
        opacity: 0.5,
        duration: 'random(4, 8)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.5,
          from: 'random'
        }
      });
    });
  }
}
