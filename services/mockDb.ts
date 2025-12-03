import { Product, User, Order } from '../types';

// Initial Seed Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Viper Ultimate X',
    price: 129.99,
    category: 'mouse',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=500&q=80',
    description: 'Ultra-lightweight wireless gaming mouse with 20K DPI optical sensor and 70 hours battery life.',
    specs: ['20,000 DPI', '74g Weight', 'Wireless', 'RGB Chroma'],
    rating: 4.8
  },
  {
    id: 'p2',
    name: 'BlackWidow Elite',
    price: 169.99,
    category: 'keyboard',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b91a603?auto=format&fit=crop&w=500&q=80',
    description: 'Mechanical gaming keyboard with green switches, dedicated media controls, and wrist rest.',
    specs: ['Mechanical Green Switch', 'N-Key Rollover', 'USB Passthrough'],
    rating: 4.6
  },
  {
    id: 'p3',
    name: 'Kraken V3 Pro',
    price: 199.99,
    category: 'headset',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80',
    description: 'Haptic technology wireless headset with THX Spatial Audio for deep immersion.',
    specs: ['HyperSense Haptics', 'THX Spatial Audio', 'Detachable Mic'],
    rating: 4.5
  },
  {
    id: 'p4',
    name: 'Odyssey G9 Neo',
    price: 1299.99,
    category: 'monitor',
    image: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=800&q=80',
    description: '49-inch curved Mini LED gaming monitor with 240Hz refresh rate and 1ms response time.',
    specs: ['49" Curved', '240Hz', 'Mini LED', 'G-Sync Compatible'],
    rating: 4.9
  },
  {
    id: 'p5',
    name: 'Iskur X Ergonomic',
    price: 399.99,
    category: 'chair',
    image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=500&q=80',
    description: 'Ergonomic gaming chair designed for hardcore gaming with high density foam cushions.',
    specs: ['Steel Reinforced', 'High Density Foam', '2D Armrests'],
    rating: 4.7
  },
    {
    id: 'p6',
    name: 'Spectre Ghost Mouse',
    price: 89.99,
    category: 'mouse',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=500&q=80',
    description: 'Silent click switches with honeycomb shell design for maximum airflow.',
    specs: ['16,000 DPI', '58g Weight', 'Silent Switches'],
    rating: 4.4
  }
];

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem('vortex_products');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('vortex_products', JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
};

export const getOrders = (): Order[] => {
  const stored = localStorage.getItem('vortex_orders');
  return stored ? JSON.parse(stored) : [];
};

export const createOrder = (order: Order): void => {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem('vortex_orders', JSON.stringify(orders));
};

export const getUser = (): User | null => {
  const stored = localStorage.getItem('vortex_user');
  return stored ? JSON.parse(stored) : null;
};

export const loginUser = (email: string): User => {
  const isAdmin = email.includes('admin');
  const user: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name: email.split('@')[0],
    role: isAdmin ? 'admin' : 'customer'
  };
  localStorage.setItem('vortex_user', JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem('vortex_user');
};