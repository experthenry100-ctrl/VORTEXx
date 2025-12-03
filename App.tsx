import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { Icons } from './components/Icons';
import { Product, CartItem, User, Order, ViewState, ChatMessage } from './types';
import * as db from './services/mockDb';
import * as gemini from './services/geminiService';

// --- Contexts ---

interface AppContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  products: Product[];
  currentView: ViewState;
  setView: (view: ViewState) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// --- Components ---

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled }) => {
  const baseStyle = "px-6 py-2 rounded-lg font-display font-bold transition-all duration-300 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-neon-cyan/90 text-black hover:bg-neon-cyan hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] disabled:opacity-50",
    secondary: "bg-surface border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 hover:border-neon-purple",
    danger: "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/40",
    ghost: "text-gray-400 hover:text-white"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, setView, setSelectedProduct } = useAppContext();

  const handleView = () => {
    setSelectedProduct(product);
    setView('product-detail');
  };

  return (
    <div className="group relative bg-surface/50 border border-gray-800 rounded-xl overflow-hidden hover:border-neon-cyan/50 transition-all duration-300 hover:transform hover:-translate-y-1">
      <div className="aspect-square w-full overflow-hidden bg-gray-900 cursor-pointer" onClick={handleView}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
        />
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-neon-green text-xs px-2 py-1 rounded font-mono border border-neon-green/30">
          In Stock
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-white font-display truncate pr-2" title={product.name}>{product.name}</h3>
          <div className="flex items-center text-yellow-400 text-sm">
            <Icons.Star size={14} className="fill-current mr-1" />
            {product.rating}
          </div>
        </div>
        <p className="text-gray-400 text-sm h-10 overflow-hidden text-ellipsis line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-neon-cyan">${product.price}</span>
          <Button onClick={() => addToCart(product)} variant="secondary" className="!px-3 !py-1 text-sm">
            <Icons.Cart size={16} /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { cart, user, setView, logout } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer flex items-center gap-2" onClick={() => setView('home')}>
            <Icons.Gamepad className="text-neon-purple w-8 h-8" />
            <span className="font-display font-bold text-2xl tracking-wider text-white">VORTEX</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button onClick={() => setView('home')} className="hover:text-neon-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</button>
              <button onClick={() => setView('shop')} className="hover:text-neon-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors">Shop</button>
              {user?.role === 'admin' && (
                <button onClick={() => setView('admin')} className="text-neon-purple hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Admin</button>
              )}
            </div>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setView('cart')}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Icons.Cart size={24} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-black transform translate-x-1/4 -translate-y-1/4 bg-neon-cyan rounded-full">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-300 font-mono">
                  {user.name}
                </span>
                <Button variant="ghost" onClick={logout} className="!px-2">
                  <Icons.Logout size={20} />
                </Button>
              </div>
            ) : (
              <Button onClick={() => setView('login')} variant="secondary" className="!px-4 !py-1 text-sm">
                Login
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white p-2">
              {isMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-surface border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => { setView('home'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Home</button>
            <button onClick={() => { setView('shop'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Shop</button>
            <button onClick={() => { setView('cart'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Cart ({cart.length})</button>
            {!user ? (
               <button onClick={() => { setView('login'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neon-cyan hover:bg-gray-800">Login</button>
            ) : (
               <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-800">Logout</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const AIChat = () => {
  const { selectedProduct, currentView } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Systems online. I am Vortex AI. Ask me about our gear!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Reset chat context when viewing a new product
  useEffect(() => {
    if (currentView === 'product-detail' && selectedProduct) {
       setMessages([{ role: 'model', text: `Analyzing ${selectedProduct.name}... Ready for queries.` }]);
       setIsOpen(true);
    }
  }, [selectedProduct, currentView]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const productContext = currentView === 'product-detail' ? selectedProduct : undefined;
    const response = await gemini.generateProductAdvice(userMsg, productContext || undefined);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-neon-purple hover:bg-purple-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(176,38,255,0.4)] transition-all hover:scale-110"
      >
        <Icons.Bot size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 md:w-96 bg-surface/95 backdrop-blur-xl border border-neon-purple/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-gradient-to-r from-neon-purple/20 to-transparent p-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <Icons.Bot className="text-neon-purple" size={20} />
          <span className="font-display font-bold">Vortex AI</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><Icons.Close size={18} /></button>
      </div>
      
      <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-neon-purple/20 text-white border border-neon-purple/30' 
                : 'bg-gray-800 text-gray-200 border border-gray-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-gray-800 rounded-lg p-3 text-sm text-neon-cyan animate-pulse">
               Processing...
             </div>
           </div>
        )}
      </div>

      <div className="p-3 border-t border-white/10 bg-black/40 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about specs..."
          className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-500"
        />
        <button onClick={handleSend} disabled={loading} className="text-neon-purple hover:text-white disabled:opacity-50">
          <Icons.ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

// --- Views ---

const HomeView = () => {
  const { setView } = useAppContext();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070" 
            alt="Gaming Setup" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
              LEVEL UP YOUR <span className="text-neon-cyan neon-text">REALITY</span>
            </h1>
            <p className="text-xl text-gray-400 border-l-4 border-neon-purple pl-4">
              Premium peripherals for the elite gamer. Powered by AI, designed for victory.
            </p>
            <div className="flex gap-4 pt-4">
              <Button onClick={() => setView('shop')}>Shop Now</Button>
              <Button variant="secondary" onClick={() => setView('login')}>Join Vortex</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Teaser */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-display font-bold mb-10 text-center"><span className="text-neon-purple">GEAR</span> CATEGORIES</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Icons.Mouse, label: 'Precision Mice', desc: 'Zero latency tracking' },
            { icon: Icons.Keyboard, label: 'Mechanical Keyboards', desc: 'Tactile perfection' },
            { icon: Icons.Headphones, label: 'Audio Systems', desc: 'Immersive soundscapes' }
          ].map((cat, idx) => (
            <div key={idx} className="bg-surface border border-white/5 p-8 rounded-2xl hover:border-neon-cyan/30 transition-all cursor-pointer group" onClick={() => setView('shop')}>
              <cat.icon className="w-12 h-12 text-gray-400 group-hover:text-neon-cyan mb-4 transition-colors" />
              <h3 className="text-xl font-bold text-white mb-2">{cat.label}</h3>
              <p className="text-gray-500">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ShopView = () => {
  const { products } = useAppContext();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h2 className="text-3xl font-display font-bold">ARMORY</h2>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['all', 'mouse', 'keyboard', 'headset', 'monitor', 'chair'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-neon-purple text-white shadow-[0_0_10px_rgba(176,38,255,0.4)]' 
                  : 'bg-surface border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

const ProductDetailView = () => {
  const { selectedProduct, addToCart, setView } = useAppContext();

  if (!selectedProduct) return <div className="p-20 text-center">No product selected</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
      <Button variant="ghost" onClick={() => setView('shop')} className="mb-6 pl-0">
        <Icons.Back size={18} /> Back to Shop
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative group">
          <div className="absolute inset-0 bg-neon-cyan/20 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <img 
            src={selectedProduct.image} 
            alt={selectedProduct.name} 
            className="relative w-full rounded-2xl border border-white/10 shadow-2xl z-10" 
          />
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-neon-purple font-mono text-sm uppercase tracking-widest">{selectedProduct.category}</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mt-2">{selectedProduct.name}</h1>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-3xl font-bold text-neon-cyan">${selectedProduct.price}</span>
              <div className="flex items-center text-yellow-400 bg-surface px-3 py-1 rounded-full border border-white/5">
                <Icons.Star size={16} className="fill-current mr-2" />
                <span className="text-white">{selectedProduct.rating} Rating</span>
              </div>
            </div>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed">{selectedProduct.description}</p>

          <div className="bg-surface/50 rounded-xl p-6 border border-white/5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Icons.Cpu size={18} className="text-neon-green" /> Tech Specs
            </h3>
            <ul className="grid grid-cols-2 gap-3">
              {selectedProduct.specs.map((spec, i) => (
                <li key={i} className="text-gray-400 text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-neon-purple rounded-full"></div>
                  {spec}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            <Button onClick={() => addToCart(selectedProduct)} className="w-full py-4 text-lg">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartView = () => {
  const { cart, removeFromCart, clearCart, setView } = useAppContext();
  
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6">
          <Icons.Cart size={40} className="text-gray-600" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Cart Empty</h2>
        <p className="text-gray-400 mb-6">Your inventory is currently void.</p>
        <Button onClick={() => setView('shop')}>Browse Gear</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 min-h-screen">
      <h2 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
        <Icons.Cart /> Inventory
      </h2>

      <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden mb-8">
        {cart.map((item) => (
          <div key={item.id} className="p-6 flex items-center gap-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-black" />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-white">{item.name}</h3>
              <p className="text-gray-400 text-sm">${item.price}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-black/50 px-4 py-2 rounded-lg text-white font-mono border border-white/10">
                x{item.quantity}
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                <Icons.Trash size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-gradient-to-r from-surface to-black border border-white/10 p-8 rounded-2xl">
        <div className="space-y-2">
          <Button variant="ghost" onClick={clearCart} className="text-red-400 hover:text-red-300 pl-0">
            Clear Inventory
          </Button>
        </div>
        <div className="text-right space-y-4">
          <div className="space-y-1">
            <p className="text-gray-400 text-sm">Subtotal</p>
            <p className="text-4xl font-display font-bold text-neon-green">${total.toFixed(2)}</p>
          </div>
          <Button onClick={() => setView('checkout')} className="w-full md:w-auto">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

const CheckoutView = () => {
  const { cart, clearCart, setView, user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      const order: Order = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user ? user.id : 'guest',
        items: [...cart],
        total: total,
        status: 'pending',
        date: new Date().toISOString()
      };
      db.createOrder(order);
      clearCart();
      setLoading(false);
      alert('Order placed successfully! Welcome to the elite.');
      setView('home');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 min-h-screen">
      <h2 className="text-3xl font-display font-bold mb-8">Secure Checkout</h2>
      
      <form onSubmit={handleCheckout} className="space-y-6">
        <div className="bg-surface border border-white/10 p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-lg text-neon-cyan mb-4 flex items-center gap-2">
            <Icons.User size={18} /> Shipping Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <input required type="text" placeholder="First Name" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
            <input required type="text" placeholder="Last Name" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
          </div>
          <input required type="email" placeholder="Email" defaultValue={user?.email} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
          <input required type="text" placeholder="Address" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
          <div className="grid grid-cols-3 gap-4">
            <input required type="text" placeholder="City" className="col-span-2 bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
            <input required type="text" placeholder="ZIP" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-neon-cyan outline-none" />
          </div>
        </div>

        <div className="bg-surface border border-white/10 p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-lg text-neon-purple mb-4 flex items-center gap-2">
            <Icons.Card size={18} /> Payment
          </h3>
          <input required type="text" placeholder="Card Number" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-neon-purple outline-none" />
          <div className="grid grid-cols-2 gap-4">
             <input required type="text" placeholder="MM/YY" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-neon-purple outline-none" />
             <input required type="text" placeholder="CVC" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-neon-purple outline-none" />
          </div>
        </div>

        <Button disabled={loading} className="w-full py-4 text-lg">
          {loading ? 'Processing Transaction...' : `Pay $${total.toFixed(2)}`}
        </Button>
      </form>
    </div>
  );
};

const LoginView = () => {
  const { login, setView } = useAppContext();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    setView('home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center">
      <div className="absolute inset-0 bg-void/90 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md bg-black/80 border border-white/10 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="text-center mb-8">
          <Icons.Gamepad className="w-12 h-12 text-neon-purple mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold text-white">VORTEX ID</h2>
          <p className="text-gray-400 mt-2">Enter the simulation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-neon-cyan mb-2">IDENTIFIER (EMAIL)</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@vortex.com" 
              className="w-full bg-surface border border-gray-700 rounded-lg p-4 text-white focus:border-neon-cyan outline-none transition-colors"
            />
          </div>
          <div className="text-xs text-gray-500">
            * Use 'admin@vortex.com' for Dashboard access.
          </div>
          <Button className="w-full py-3">Initialize Session</Button>
        </form>
      </div>
    </div>
  );
};

const AdminView = () => {
  const { user } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(db.getOrders());
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-mono text-xl">
        ACCESS DENIED. AUTHORIZATION LEVEL INSUFFICIENT.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-display font-bold flex items-center gap-3">
          <Icons.Dashboard /> Command Center
        </h2>
        <div className="bg-surface px-4 py-2 rounded-lg border border-white/10">
          <span className="text-gray-400 text-sm">System Status: </span>
          <span className="text-neon-green font-bold">ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-surface border border-white/10 p-6 rounded-xl">
           <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
           <p className="text-3xl font-bold text-white">
             ${orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}
           </p>
         </div>
         <div className="bg-surface border border-white/10 p-6 rounded-xl">
           <h3 className="text-gray-400 text-sm mb-2">Total Orders</h3>
           <p className="text-3xl font-bold text-white">{orders.length}</p>
         </div>
         <div className="bg-surface border border-white/10 p-6 rounded-xl">
           <h3 className="text-gray-400 text-sm mb-2">Pending Shipments</h3>
           <p className="text-3xl font-bold text-neon-cyan">{orders.filter(o => o.status === 'pending').length}</p>
         </div>
      </div>

      <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="font-bold text-lg">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/50 text-gray-400 text-sm uppercase font-mono">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors text-sm">
                  <td className="px-6 py-4 font-mono text-neon-purple">#{order.id}</td>
                  <td className="px-6 py-4">{order.userId}</td>
                  <td className="px-6 py-4 font-bold text-white">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{new Date(order.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="p-8 text-center text-gray-500">No data found in logs.</div>}
        </div>
      </div>
    </div>
  );
};

// --- Main App Logic ---

const AppContent = () => {
  const { currentView } = useAppContext();

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView />;
      case 'shop': return <ShopView />;
      case 'product-detail': return <ProductDetailView />;
      case 'cart': return <CartView />;
      case 'checkout': return <CheckoutView />;
      case 'login': return <LoginView />;
      case 'admin': return <AdminView />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-void text-gray-200 font-sans selection:bg-neon-purple selection:text-white pb-20">
      <Navbar />
      <main className="animate-in fade-in duration-500">
        {renderView()}
      </main>
      
      <footer className="bg-black border-t border-gray-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Icons.Gamepad className="text-gray-600" />
            <span className="font-display font-bold text-gray-500">VORTEX GAMING</span>
          </div>
          <div className="text-gray-600 text-sm">
            © 2024 Vortex Systems. All rights reserved.
          </div>
        </div>
      </footer>

      <AIChat />
    </div>
  );
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentView, setView] = useState<ViewState>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Init Mock Data
    setProducts(db.getProducts());
    const existingUser = db.getUser();
    if (existingUser) setUser(existingUser);
  }, []);

  const login = (email: string) => {
    const newUser = db.loginUser(email);
    setUser(newUser);
  };

  const logout = () => {
    db.logoutUser();
    setUser(null);
    setView('home');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      cart, addToCart, removeFromCart, clearCart,
      products,
      currentView, setView,
      selectedProduct, setSelectedProduct
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}