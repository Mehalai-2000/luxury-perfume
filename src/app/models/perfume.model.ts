export interface Perfume {
    id: number;
    name: string;
    subtitle: string;
    price: number;
    size: string;
    category: string;
    badge?: string;
    description: string;
    notes: string[];
    image: string;
    inCart: boolean;
    quantity: number;
    inWishlist?: boolean;
}

export interface CartItem extends Perfume {
    // We can add additional properties here if needed, 
    // like selected variant or personalized message
}
