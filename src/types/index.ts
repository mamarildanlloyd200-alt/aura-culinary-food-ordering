export type DietaryOption = 'vegetarian' | 'vegan' | 'gluten-free' | 'spicy' | 'chef-special';

export interface DishCustomization {
  sizes?: { name: string; priceDelta: number; label: string }[];
  spiceLevels?: string[];
  addOns?: { id: string; name: string; price: number }[];
}

export interface Dish {
  id: string;
  name: string;
  category: 'burgers' | 'pizzas' | 'bowls' | 'pastas' | 'desserts' | 'beverages';
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  prepTimeMinutes: number;
  calories: number;
  dietary: DietaryOption[];
  image: string;
  ingredients: string[];
  isAvailable: boolean;
  customization?: DishCustomization;
}

export interface CartItem {
  id: string; // unique item instance id
  dish: Dish;
  quantity: number;
  selectedSize?: string;
  selectedSizePriceDelta: number;
  selectedSpice?: string;
  selectedAddOns: { id: string; name: string; price: number }[];
  specialInstructions?: string;
  unitPrice: number;
  itemTotal: number;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  streetAddress: string;
  aptSuite?: string;
  city: string;
  postalCode: string;
  deliveryNotes?: string;
}

export type PaymentMethod = 'credit-card' | 'cod' | 'digital-wallet';

export interface PaymentDetails {
  method: PaymentMethod;
  cardNumberMasked?: string;
  cardBrand?: 'Visa' | 'MasterCard' | 'Amex';
}

export type OrderStatus = 'confirmed' | 'preparing' | 'dispatched' | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  deliveryFee: number;
  tax: number;
  tip: number;
  total: number;
  customer: CustomerDetails;
  payment: PaymentDetails;
  estimatedDeliveryTime: string;
  estimatedMinutesLeft: number;
  courier: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    currentStepIndex: number;
  };
  reviewSubmitted?: boolean;
}

export interface UserAddress {
  id: string;
  label: string;
  streetAddress: string;
  aptSuite?: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarInitials: string;
  savedAddresses: UserAddress[];
  createdAt: string;
}

export interface Review {
  id: string;
  dishId: string;
  dishName: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
}

export type ActivePage = 'explore' | 'menu' | 'checkout' | 'orders' | 'account';
