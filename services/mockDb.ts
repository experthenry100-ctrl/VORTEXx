import { Product, User, Order } from '../types';

// Image banks for realistic variety (CJ Dropshipping style simulation)
const IMAGE_BANK = {
  mouse: [
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', // RGB Gaming Mouse
    'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80', // Wireless Mouse
    'https://images.unsplash.com/photo-1629367494173-c78a56567877?auto=format&fit=crop&w=800&q=80', // Vertical Mouse
    'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?auto=format&fit=crop&w=800&q=80', // Dark Gaming Mouse
    'https://images.unsplash.com/photo-1603525253816-56a8f154fb4a?auto=format&fit=crop&w=800&q=80', // White Mouse
    'https://images.unsplash.com/photo-1610484795034-73895eb48833?auto=format&fit=crop&w=800&q=80', // Cyberpunk Mouse
    'https://images.unsplash.com/photo-1607677686475-ad54538dce26?auto=format&fit=crop&w=800&q=80', // Razer Style
    'https://images.unsplash.com/photo-1586349906319-5a1262d19113?auto=format&fit=crop&w=800&q=80', // Minimalist
    'https://images.unsplash.com/photo-1594911850125-9c5cdabb0d99?auto=format&fit=crop&w=800&q=80', // Multi-button
    'https://images.unsplash.com/photo-1613141411244-0e42a9f5d345?auto=format&fit=crop&w=800&q=80'  // Clean White
  ],
  keyboard: [
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80', // Custom Keycaps
    'https://images.unsplash.com/photo-1587829741301-dc798b91a603?auto=format&fit=crop&w=800&q=80', // Blue Switch
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80', // RGB Mechanical
    'https://images.unsplash.com/photo-1626218174397-5780d006be91?auto=format&fit=crop&w=800&q=80', // Compact 60%
    'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80', // Workstation
    'https://images.unsplash.com/photo-1566598484642-d204db847eb0?auto=format&fit=crop&w=800&q=80', // Ergonomic
    'https://images.unsplash.com/photo-1568019853965-c96765798034?auto=format&fit=crop&w=800&q=80', // Backlit
    'https://images.unsplash.com/photo-1625948515291-696131d62b3d?auto=format&fit=crop&w=800&q=80', // RGB Glow
    'https://images.unsplash.com/photo-1655890782352-782875152864?auto=format&fit=crop&w=800&q=80', // White Setup
    'https://images.unsplash.com/photo-1544652478-6653e09f1826?auto=format&fit=crop&w=800&q=80'  // Magic Keyboard Style
  ],
  headset: [
    'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=800&q=80', // Red Gaming
    'https://images.unsplash.com/photo-1583573636246-18cb2246697f?auto=format&fit=crop&w=800&q=80', // Studio
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', // Earbuds
    'https://images.unsplash.com/photo-1612444530582-fc66183b16f7?auto=format&fit=crop&w=800&q=80', // Green Gaming
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', // Wireless Black
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=800&q=80', // White Clean
    'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=800&q=80', // Luxury
    'https://images.unsplash.com/photo-1610397648930-477b8c7f0943?auto=format&fit=crop&w=800&q=80'  // Sony Style
  ],
  monitor: [
    'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=800&q=80', // Code Screen
    'https://images.unsplash.com/photo-1527434065445-5120678ebc66?auto=format&fit=crop&w=800&q=80', // Dual Monitor
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80', // Gaming
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80', // Ultrawide
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80', // Clean Desk
    'https://images.unsplash.com/photo-1552831388-6a0b3575b32a?auto=format&fit=crop&w=800&q=80'  // Curved
  ],
  chair: [
    'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=800&q=80', // Gaming Chair
    'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80', // Lounge
    'https://images.unsplash.com/photo-1616428469345-534d0b04b61c?auto=format&fit=crop&w=800&q=80', // Office
    'https://images.unsplash.com/photo-1617364852223-75f57e78dc96?auto=format&fit=crop&w=800&q=80', // Modern
    'https://images.unsplash.com/photo-1688578736340-92807f43db48?auto=format&fit=crop&w=800&q=80', // Ergonomic
    'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80'  // Leather
  ],
  controller: [
    'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=800&q=80', // PS5
    'https://images.unsplash.com/photo-1600080972464-8e5f35f63d88?auto=format&fit=crop&w=800&q=80', // Xbox White
    'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&w=800&q=80', // Retro
    'https://images.unsplash.com/photo-1507457379470-08b800bebc67?auto=format&fit=crop&w=800&q=80', // PlayStation Classic
    'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80', // Switch Joycon
    'https://images.unsplash.com/photo-1599582522066-6b2ae349386d?auto=format&fit=crop&w=800&q=80'  // Xbox Black
  ],
  streaming: [
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80', // Mic
    'https://images.unsplash.com/photo-1617781358042-45e0d4734947?auto=format&fit=crop&w=800&q=80', // Podcast
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', // Matrix
    'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=800&q=80', // Camera
    'https://images.unsplash.com/photo-1520529986492-5e48b1e60052?auto=format&fit=crop&w=800&q=80', // Mixer
    'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&w=800&q=80'  // Studio
  ]
};

// CJ Dropshipping Style naming components
const PREFIXES = ['New Arrival', 'Hot Sale', '2024 Upgraded', 'Professional', 'Luxury', 'Custom', 'High Quality', 'Top Rated'];
const ADJECTIVES = ['RGB Backlit', 'Wireless', 'Ergonomic', 'Waterproof', 'Noise Cancelling', 'Bluetooth 5.0', '4K Resolution', 'Mechanical', 'Silent Click', 'Rechargeable', 'Ultra-Slim', 'Pro-Grade'];
const NOUNS = {
  mouse: ['Optical Mouse', 'Gaming Mouse', 'Honeycomb Shell Mouse', 'Vertical Mouse', 'Macro Programmable Mouse'],
  keyboard: ['Mechanical Keyboard', 'Gaming Keypad', 'Membrane Keyboard', 'Typewriter Style Keyboard', '60% Compact Keyboard'],
  headset: ['Surround Sound Headset', 'Studio Headphones', 'In-Ear Monitors', 'Bass Gaming Headset'],
  monitor: ['Curved Monitor', 'IPS Gaming Display', 'Portable Screen', '144Hz Monitor'],
  chair: ['Racing Gaming Chair', 'Ergonomic Office Chair', 'Reclining Desk Chair', 'Mesh Computer Chair'],
  controller: ['Wireless Gamepad', 'Mobile Controller', 'Joystick Trigger', 'Racing Wheel'],
  streaming: ['Condenser Microphone', 'Ring Light Kit', 'Capture Card 1080p', 'HD Webcam']
};
const SUFFIXES = ['for PC Laptop', 'for Esports', 'for Streamers', 'USB Interface', 'with Mic', 'Gift for Gamers'];

const generateProducts = (): Product[] => {
  const products: Product[] = [];
  let idCounter = 1;

  // Specific simulation of CJ Dropshipping import process
  const categories = Object.keys(IMAGE_BANK) as (keyof typeof IMAGE_BANK)[];

  // Distribute 50 products
  const counts: Record<string, number> = {
    mouse: 10, keyboard: 10, headset: 8, monitor: 6, chair: 6, controller: 5, streaming: 5
  };

  categories.forEach(cat => {
    const limit = counts[cat] || 5;
    const images = IMAGE_BANK[cat];
    const catNouns = NOUNS[cat as keyof typeof NOUNS];

    for (let i = 0; i < limit; i++) {
      // Create dropshipping style title
      const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = catNouns[Math.floor(Math.random() * catNouns.length)];
      const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
      
      const name = `${prefix} ${adj} ${noun} ${suffix}`;
      const baseImg = images[i % images.length];

      let price = 0;
      let specs: string[] = [];
      let desc = '';

      switch(cat) {
        case 'mouse':
          price = 15 + Math.floor(Math.random() * 60);
          specs = [`${1200 + (i*1200)} DPI`, 'RGB Breath Light', 'Ergonomic Design'];
          desc = 'High precision optical sensor suitable for competitive gaming and office work. Features customized RGB lighting zones.';
          break;
        case 'keyboard':
          price = 35 + Math.floor(Math.random() * 120);
          specs = ['Mechanical Axis', 'Double-shot Keycaps', 'Water Resistant'];
          desc = 'Durable mechanical switches providing tactile feedback. Compact design saves desk space for mouse movement.';
          break;
        case 'headset':
          price = 25 + Math.floor(Math.random() * 80);
          specs = ['7.1 Surround', 'Noise Cancelling Mic', 'Memory Foam'];
          desc = 'Immersive audio experience with deep bass and crystal clear highs. Comfortable for long gaming sessions.';
          break;
        case 'monitor':
          price = 120 + Math.floor(Math.random() * 350);
          specs = ['165Hz Refresh Rate', '1ms Response', 'Flicker-Free'];
          desc = 'Experience smooth gameplay with high refresh rate technology. Borderless design for multi-monitor setups.';
          break;
        case 'chair':
          price = 99 + Math.floor(Math.random() * 250);
          specs = ['Lumbar Support', '150° Recline', 'Heavy Duty Base'];
          desc = 'Racing style ergonomics designed to support your posture during marathon gaming sessions.';
          break;
        case 'controller':
          price = 20 + Math.floor(Math.random() * 70);
          specs = ['Wireless 2.4G', 'Vibration Motors', 'Phone Clip'];
          desc = 'Multi-platform compatibility including PC, Console, and Android. Precise analog sticks and responsive triggers.';
          break;
        case 'streaming':
          price = 30 + Math.floor(Math.random() * 100);
          specs = ['USB Plug & Play', 'Cardioid Pattern', 'Adjustable Stand'];
          desc = 'Professional grade recording equipment for streaming, podcasting, and voice overs.';
          break;
      }

      // Add "CJ style" discount pricing visual sometimes
      
      products.push({
        id: `cj_${cat}_${idCounter++}`,
        name,
        price,
        category: cat as any,
        image: baseImg, // Using the realistic unsplash images
        description: desc,
        specs,
        rating: 3.0 + (Math.random() * 2.0),
      });
    }
  });

  return products;
};

export const getProducts = (): Product[] => {
  // Updated version key to force refresh of images
  const products = generateProducts();
  localStorage.setItem('vortex_cj_products_v4', JSON.stringify(products));
  return products;
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
  // Create a stable ID from the email so order history persists across logins
  const stableId = btoa(email).substring(0, 12);
  
  const user: User = {
    id: stableId,
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