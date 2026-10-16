import { Dish, Order, User, Review } from '../types';
import { MENU_ITEMS, INITIAL_REVIEWS } from '../data/menuData';

// LocalStorage Keys
export const STORAGE_KEYS = {
  CART: 'aura_cart_v1',
  ORDERS: 'aura_orders_v1',
  USER: 'aura_user_v1',
  FAVORITES: 'aura_favorites_v1',
  REVIEWS: 'aura_reviews_v1',
  TECH_LOGS: 'aura_api_logs_v1',
};

// Safe LocalStorage Helpers
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage quota or access error', e);
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

// API Request/Response Log for Developer Tech Console
export interface ApiLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  statusCode: number;
  durationMs: number;
  requestBody?: any;
  responseBody?: any;
}

export function recordApiLog(log: Omit<ApiLog, 'id' | 'timestamp'>) {
  const fullLog: ApiLog = {
    ...log,
    id: 'log-' + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString(),
  };
  const currentLogs = storage.get<ApiLog[]>(STORAGE_KEYS.TECH_LOGS, []);
  storage.set(STORAGE_KEYS.TECH_LOGS, [fullLog, ...currentLogs.slice(0, 19)]);
  return fullLog;
}

// REST API & Fetch API Service
export const api = {
  // GET /api/v1/menu
  async getMenu(params?: { category?: string; query?: string; dietary?: string; sortBy?: string }): Promise<{ dishes: Dish[]; total: number }> {
    const startTime = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 80));

    let dishes = [...MENU_ITEMS];

    if (params?.category && params.category !== 'all') {
      dishes = dishes.filter((d) => d.category === params.category);
    }

    if (params?.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      dishes = dishes.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }

    if (params?.dietary && params.dietary !== 'all') {
      dishes = dishes.filter((d) => d.dietary.includes(params.dietary as any));
    }

    if (params?.sortBy) {
      if (params.sortBy === 'price-asc') dishes.sort((a, b) => a.price - b.price);
      else if (params.sortBy === 'price-desc') dishes.sort((a, b) => b.price - a.price);
      else if (params.sortBy === 'rating') dishes.sort((a, b) => b.rating - a.rating);
      else if (params.sortBy === 'prep') dishes.sort((a, b) => a.prepTimeMinutes - b.prepTimeMinutes);
    }

    const duration = Math.round(performance.now() - startTime);
    recordApiLog({
      method: 'GET',
      endpoint: `/api/v1/menu?category=${params?.category || 'all'}&q=${encodeURIComponent(params?.query || '')}`,
      statusCode: 200,
      durationMs: duration,
      responseBody: { count: dishes.length, total: MENU_ITEMS.length, currency: 'PHP' },
    });

    return { dishes, total: dishes.length };
  },

  // GET /api/v1/orders
  async getOrders(): Promise<Order[]> {
    const startTime = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 60));
    const orders = storage.get<Order[]>(STORAGE_KEYS.ORDERS, []);
    recordApiLog({
      method: 'GET',
      endpoint: '/api/v1/orders',
      statusCode: 200,
      durationMs: Math.round(performance.now() - startTime),
      responseBody: { count: orders.length },
    });
    return orders;
  },

  // POST /api/v1/orders
  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status' | 'estimatedMinutesLeft' | 'courier'>): Promise<Order> {
    const startTime = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 150));

    const existingOrders = storage.get<Order[]>(STORAGE_KEYS.ORDERS, []);
    const newOrderNumber = `AUR-${1040 + existingOrders.length + 1}`;
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber: newOrderNumber,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      estimatedMinutesLeft: 28,
      courier: {
        name: 'Mateo Santos',
        phone: '+63 (917) 234-8901',
        vehicle: 'Aura Thermal Scooter #42',
        rating: 4.9,
        currentStepIndex: 0,
      },
    };

    const updated = [newOrder, ...existingOrders];
    storage.set(STORAGE_KEYS.ORDERS, updated);

    recordApiLog({
      method: 'POST',
      endpoint: '/api/v1/orders',
      statusCode: 201,
      durationMs: Math.round(performance.now() - startTime),
      requestBody: { total: orderData.total, currency: 'PHP', itemsCount: orderData.items.length },
      responseBody: { orderId: newOrder.id, orderNumber: newOrder.orderNumber, status: 'confirmed' },
    });

    return newOrder;
  },

  // POST /api/v1/reviews
  async submitReview(review: Omit<Review, 'id' | 'createdAt' | 'isVerified'>): Promise<Review> {
    const startTime = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const newRev: Review = {
      ...review,
      id: 'rev-' + Date.now(),
      createdAt: 'Just now',
      isVerified: true,
    };

    const current = storage.get<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    storage.set(STORAGE_KEYS.REVIEWS, [newRev, ...current]);

    recordApiLog({
      method: 'POST',
      endpoint: '/api/v1/reviews',
      statusCode: 201,
      durationMs: Math.round(performance.now() - startTime),
      requestBody: review,
      responseBody: { id: newRev.id, status: 'approved' },
    });

    return newRev;
  },

  // GET /api/v1/reviews
  async getReviews(): Promise<Review[]> {
    return storage.get<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },

  // POST /api/v1/auth/login
  async login(email: string): Promise<User> {
    const startTime = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 120));

    const user: User = {
      id: 'usr-9281',
      fullName: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      phone: '+63 (917) 349-8120',
      avatarInitials: email.substring(0, 2).toUpperCase(),
      savedAddresses: [
        {
          id: 'addr-1',
          label: 'Home (BGC)',
          streetAddress: '5th Avenue cor. 28th Street, Bonifacio Global City',
          aptSuite: 'Unit 24A, Serendra Tower',
          city: 'Taguig, Metro Manila',
          postalCode: '1634',
          isDefault: true,
        },
        {
          id: 'addr-2',
          label: 'Design Studio (Makati)',
          streetAddress: 'Paseo de Roxas cor. Makati Avenue',
          city: 'Makati City, Metro Manila',
          postalCode: '1226',
          isDefault: false,
        },
      ],
      createdAt: '2026-01-15',
    };

    storage.set(STORAGE_KEYS.USER, user);

    recordApiLog({
      method: 'POST',
      endpoint: '/api/v1/auth/login',
      statusCode: 200,
      durationMs: Math.round(performance.now() - startTime),
      requestBody: { email },
      responseBody: { userId: user.id, token: 'jwt_mock_' + Math.random().toString(36).substring(2) },
    });

    return user;
  },
};

// RELATIONAL DATABASE SCHEMAS (PostgreSQL & MySQL in PHP Currency)
export const RELATIONAL_SCHEMAS = {
  postgresql: `-- PostgreSQL 16 Relational Schema for Aura Food Ordering (Currency: PHP)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL
);

CREATE TABLE dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_slug VARCHAR(50) REFERENCES categories(slug),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL, -- in Philippine Peso (PHP)
    rating NUMERIC(3, 2) DEFAULT 5.0,
    prep_time_minutes INT DEFAULT 20,
    dietary_tags TEXT[],
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(32) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
    currency VARCHAR(5) DEFAULT 'PHP',
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL, -- 12% Philippine VAT
    tip NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- 'gcash-maya', 'credit-card', 'cod'
    delivery_address JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    dish_id UUID REFERENCES dishes(id),
    dish_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    customization_snapshot JSONB
);`,

  mysql: `-- MySQL 8.4 Relational Schema for Aura Food Ordering (Currency: PHP)
CREATE TABLE \`users\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`email\` VARCHAR(255) NOT NULL UNIQUE,
    \`full_name\` VARCHAR(120) NOT NULL,
    \`phone\` VARCHAR(30) NULL,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE \`dishes\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`category_slug\` VARCHAR(50) NOT NULL,
    \`name\` VARCHAR(150) NOT NULL,
    \`description\` TEXT NOT NULL,
    \`price\` DECIMAL(10, 2) NOT NULL, -- PHP
    \`rating\` DECIMAL(3, 2) DEFAULT 5.0,
    \`prep_time_minutes\` INT DEFAULT 20,
    \`is_available\` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE \`orders\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`order_number\` VARCHAR(32) NOT NULL UNIQUE,
    \`user_id\` INT NULL,
    \`status\` ENUM('confirmed', 'preparing', 'dispatched', 'delivered') DEFAULT 'confirmed',
    \`currency\` VARCHAR(5) DEFAULT 'PHP',
    \`subtotal\` DECIMAL(10, 2) NOT NULL,
    \`discount\` DECIMAL(10, 2) DEFAULT 0.00,
    \`delivery_fee\` DECIMAL(10, 2) NOT NULL,
    \`tax\` DECIMAL(10, 2) NOT NULL,
    \`tip\` DECIMAL(10, 2) DEFAULT 0.00,
    \`total_amount\` DECIMAL(10, 2) NOT NULL,
    \`payment_method\` VARCHAR(30) NOT NULL,
    \`delivery_address\` JSON NOT NULL,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
};

// FIREBASE FIRESTORE DATA MODEL (PHP)
export const FIREBASE_FIRESTORE_MODEL = {
  collections: {
    'restaurants/aura_flagship/dishes': [
      {
        id: 'dish_wagyu_burger',
        name: 'Truffle Wagyu Brioche Burger',
        price: 495.0,
        currency: 'PHP',
        category: 'burgers',
        inStock: true,
        nutritional: { calories: 780, protein: '42g' },
      },
      {
        id: 'dish_neapolitan_pizza',
        name: 'Artisanal Neapolitan Margherita Pizza',
        price: 420.0,
        currency: 'PHP',
        category: 'pizzas',
        inStock: true,
        nutritional: { calories: 640, carbs: '72g' },
      },
    ],
    'users/{uid}/active_cart': {
      updatedAt: '2026-10-13T09:12:00Z',
      currency: 'PHP',
      itemsCount: 2,
      subtotal: 915.0,
      deliveryMethod: 'metro_express_courier',
    },
    'orders/{orderId}': {
      status: 'in_transit',
      currency: 'PHP',
      totalAmount: 1045.0,
      courierGeoPoint: { latitude: 14.5547, longitude: 121.0244 }, // Metro Manila coordinates
    },
  },
  securityRules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /restaurants/{restaurantId}/dishes/{dishId} {
      allow read: if true;
      allow write: if request.auth.token.role == 'kitchen_admin';
    }
    match /orders/{orderId} {
      allow read, create: if request.auth != null;
      allow update: if request.auth.token.role in ['courier', 'kitchen_admin'];
    }
  }
}`,
};
