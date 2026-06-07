import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Perfume, CartItem } from '../models/perfume.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
    cartItems$ = this.cartItemsSubject.asObservable();

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            this.loadCart();
        }
    }

    get cartCount$(): Observable<number> {
        return this.cartItems$.pipe(
            map(items => items.reduce((acc, item) => acc + item.quantity, 0))
        );
    }

    get cartTotal$(): Observable<number> {
        return this.cartItems$.pipe(
            map(items => items.reduce((acc, item) => acc + (item.price * item.quantity), 0))
        );
    }

    addToCart(product: Perfume): void {
        const currentItems = this.cartItemsSubject.value;
        const existingItem = currentItems.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
            this.cartItemsSubject.next([...currentItems]);
        } else {
            const newItem: CartItem = { ...product, quantity: 1, inCart: true };
            this.cartItemsSubject.next([...currentItems, newItem]);
        }
        this.saveCart();
    }

    removeFromCart(productId: number): void {
        const currentItems = this.cartItemsSubject.value;
        const updatedItems = currentItems.filter(item => item.id !== productId);
        this.cartItemsSubject.next(updatedItems);
        this.saveCart();
    }

    updateQuantity(productId: number, quantity: number): void {
        const currentItems = this.cartItemsSubject.value;
        const item = currentItems.find(i => i.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.cartItemsSubject.next([...currentItems]);
                this.saveCart();
            }
        }
    }

    clearCart(): void {
        this.cartItemsSubject.next([]);
        this.saveCart();
    }

    private saveCart(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('mystique_cart', JSON.stringify(this.cartItemsSubject.value));
        }
    }

    private loadCart(): void {
        if (isPlatformBrowser(this.platformId)) {
            const savedCart = localStorage.getItem('mystique_cart');
            if (savedCart) {
                try {
                    this.cartItemsSubject.next(JSON.parse(savedCart));
                } catch (e) {
                    console.error('Could not parse cart from localStorage', e);
                    this.cartItemsSubject.next([]);
                }
            }
        }
    }
}
