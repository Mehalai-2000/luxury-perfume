import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/perfume.model';
import { Subscription } from 'rxjs';
import { gsap } from 'gsap';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, OnDestroy {
    cartItems: CartItem[] = [];
    cartTotal: number = 0;
    private cartSub?: Subscription;

    constructor(
        private cartService: CartService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        this.cartSub = this.cartService.cartItems$.subscribe(items => {
            this.cartItems = items;
            this.cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        });

        if (isPlatformBrowser(this.platformId)) {
            window.scrollTo(0, 0);
            this.runAnimations();
        }
    }

    ngOnDestroy(): void {
        if (this.cartSub) this.cartSub.unsubscribe();
    }

    updateQuantity(productId: number, delta: number): void {
        const item = this.cartItems.find(i => i.id === productId);
        if (item) {
            this.cartService.updateQuantity(productId, item.quantity + delta);
        }
    }

    removeItem(productId: number): void {
        this.cartService.removeFromCart(productId);
    }

    clearCart(): void {
        this.cartService.clearCart();
    }

    checkout(): void {
        // Placeholder for checkout logic
        alert('Thank you for your choice. This is a demonstration of the checkout flow.');
    }

    private runAnimations(): void {
        gsap.from('.cart-container', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power3.out'
        });
    }
}
