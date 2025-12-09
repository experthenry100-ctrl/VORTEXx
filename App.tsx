import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { Icons } from './components/Icons';
import { Product, CartItem, User, Order, ViewState, ChatMessage } from './types';
import * as db from './services/mockDb';
import * as gemini from './services/geminiService';
import * as paymentService from './services/paymentService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// --- Stripe Initialization ---
// Public Key is safe for client-side use.
const stripePromise = loadStripe('pk_test_51Sbo8ELhEcchiBDBuSFdGjSvLN3A2sV5VTyyrqMEAqTS4jOjBPA5noka7a6GmnRjf7isDYwihLuNLcdURpz4nmcn00SKGWNj5j');

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
  shopFilter: string;
  setShopFilter: (category: string) => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
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
  onClick?: (e?: any) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}> = ({ children, onClick, variant = 'primary', className = '', disabled, type = "button" }) => {
  const baseStyle = "px-6 py-2 rounded-lg font-display font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 hover:shadow-lg hover:-translate-y-0.5";
  const variants = {
    primary: "bg-neon-cyan/90 text-black hover:bg-neon-cyan hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100 disabled:cursor-not-allowed",
    secondary: "bg-surface border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 hover:border-neon-purple disabled:opacity-50",
    danger: "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/40 disabled:opacity-50",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50"
  };

  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, setView, setSelectedProduct, toggleWishlist, isInWishlist } = useAppContext();
  const isWishlisted = isInWishlist(product.id);

  const handleView = () => {
    setSelectedProduct(product);
    setView('product-detail');
  };

  return (
    <div className="group relative bg-surface/50 border border-gray-800 rounded-xl overflow-hidden hover:border-neon-cyan/50 transition-all duration-300 hover:transform hover:-translate-y-1 h-full flex flex-col hover:shadow-xl hover:shadow-neon-cyan/10">
      <div className="aspect-square w-full overflow-hidden bg-gray-900 cursor-pointer relative" onClick={handleView}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
           <div className="bg-black/80 backdrop-blur text-neon-green text-xs px-2 py-1 rounded font-mono border border-neon-green/30 text-center">
            In Stock
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
            className={`p-1.5 rounded-full backdrop-blur border transition-colors ${isWishlisted ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-black/50 border-white/20 text-gray-400 hover:text-white'}`}
          >
            <Icons.Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        {product.rating >= 4.8 && (
          <div className="absolute top-2 left-2 bg-neon-purple/80 backdrop-blur text-white text-xs px-2 py-1 rounded font-mono border border-neon-purple/30">
            Top Rated
          </div>
        )}
      </div>
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          {/* Added line-clamp-2 to handle longer CJ-style names */}
          <h3 className="text-lg font-bold text-white font-display leading-tight line-clamp-2 min-h-[3.5rem]" title={product.name}>
            {product.name}
          </h3>
          <div className="flex items-center text-yellow-400 text-sm whitespace-nowrap shrink-0">
            <Icons.Star size={14} className="fill-current mr-1" />
            {product.rating.toFixed(1)}
          </div>
        </div>
        <p className="text-gray-400 text-sm line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-800">
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
  const { cart, user, setView, logout, wishlist } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer flex items-center gap-2 group" onClick={() => setView('home')}>
            <Icons.Zap className="text-neon-cyan w-8 h-8 group-hover:animate-spin" />
            <span className="font-display font-bold text-2xl tracking-wider text-white group-hover:text-neon-cyan transition-colors">VORTEX</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button onClick={() => setView('home')} className="hover:text-neon-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/5">Home</button>
              <button onClick={() => setView('categories')} className="hover:text-neon-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/5">Categories</button>
              <button onClick={() => setView('shop')} className="hover:text-neon-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/5">Shop</button>
              <button onClick={() => setView('order-tracking')} className="hover:text-neon-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/5">Track Order</button>
              {user?.role === 'admin' && (
                <button onClick={() => setView('admin')} className="text-neon-purple hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neon-purple/10">Admin</button>
              )}
            </div>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setView('wishlist')}
              className="relative p-2 text-gray-400 hover:text-red-400 transition-all hover:scale-110"
              title="Wishlist"
            >
              <Icons.Heart size={24} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setView('cart')}
              className="relative p-2 text-gray-400 hover:text-white transition-all hover:scale-110"
            >
              <Icons.Cart size={24} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-black transform translate-x-1/4 -translate-y-1/4 bg-neon-cyan rounded-full animate-bounce">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setView('profile')} 
                  className="!px-3 !py-1 text-sm font-mono text-neon-cyan border border-neon-cyan/30"
                >
                  <Icons.User size={16} />
                  <span className="hidden lg:block">{user.name}</span>
                </Button>
                <Button variant="ghost" onClick={logout} className="!px-2 text-red-400 hover:text-red-300">
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
        <div className="md:hidden bg-surface border-b border-gray-800 animate-in slide-in-from-top-5">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => { setView('home'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Home</button>
            <button onClick={() => { setView('categories'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Categories</button>
            <button onClick={() => { setView('shop'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Shop</button>
            <button onClick={() => { setView('wishlist'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Wishlist ({wishlist.length})</button>
            <button onClick={() => { setView('order-tracking'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Track Order</button>
            <button onClick={() => { setView('cart'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Cart ({cart.length})</button>
            {user && (
               <button onClick={() => { setView('profile'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">My Profile</button>
            )}
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
    { role: 'model', text: "Systems online. I am Vortex AI. Ready to upgrade your setup?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (currentView === 'product-detail' && selectedProduct) {
       setMessages([{ role: 'model', text: `Accessing data for ${selectedProduct.name}... Ask me anything about specs or performance.` }]);
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
        className="fixed bottom-6 right-6 z-40 bg-neon-purple hover:bg-purple-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(176,38,255,0.4)] transition-all hover:scale-110 active:scale-95 animate-bounce-slow"
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
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-transform hover:rotate-90"><Icons.Close size={18} /></button>
      </div>
      
      <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm animate-in fade-in slide-in-from-bottom-2 ${
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
               Calculating...
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
          placeholder="Ask AI assistant..."
          className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-500"
        />
        <button onClick={handleSend} disabled={loading} className="text-neon-purple hover:text-white disabled:opacity-50 transition-transform hover:translate-x-1">
          <Icons.ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

// --- Views ---

const HomeView = () => {
  const { setView, products } = useAppContext();
  
  // Get random 6 products for the homepage
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[600px] flex items-center overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070" 
            alt="Gaming Setup" 
            className="w-full h-full object-cover opacity-40 transition-transform duration-[10s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl space-y-6 animate-in slide-in-from-left duration-700">
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              DOMINATE <br/><span className="text-neon-cyan neon-text">THE GAME</span>
            </h1>
            <p className="text-xl text-gray-400 border-l-4 border-neon-purple pl-4">
              Equip yourself with elite tier peripherals. Verified by Vortex.
            </p>
            <div className="flex gap-4 pt-4">
              <Button onClick={() => setView('shop')}>Shop All Gear</Button>
              <Button variant="secondary" onClick={() => setView('categories')}>Browse Categories</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Christmas Promotion Banner */}
      <div className="bg-gradient-to-r from-red-900/40 via-green-900/40 to-red-900/40 border-y border-red-500/20 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/snow.png')] opacity-30 animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-red-600 rounded-full shadow-[0_0_20px_rgba(255,0,0,0.5)]">
               <Icons.Gift className="text-white w-8 h-8" />
             </div>
             <div>
               <h2 className="text-2xl font-display font-bold text-white tracking-widest">CYBER <span className="text-red-500">HOLIDAY</span> OPS</h2>
               <p className="text-gray-300">Seasonal discount protocols active. Secure your upgrade before the new year reset.</p>
             </div>
           </div>
           <Button onClick={() => setView('shop')} className="bg-red-600 hover:bg-red-500 text-white border-none shadow-lg shadow-red-900/50">
             ACCESS HOLIDAY DEALS <Icons.ArrowRight size={18} />
           </Button>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-display font-bold"><span className="text-neon-purple">TRENDING</span> GEAR</h2>
          <button onClick={() => setView('shop')} className="text-neon-cyan hover:text-white text-sm font-mono flex items-center gap-1 group">
            VIEW ALL <Icons.ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* Features Banner */}
      <div className="bg-surface border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 hover:bg-white/5 rounded-xl transition-colors">
            <Icons.Zap className="w-12 h-12 text-neon-green mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">Ultra Low Latency</h3>
            <p className="text-gray-500">Gear tested for sub-millisecond response times.</p>
          </div>
          <div className="p-6 hover:bg-white/5 rounded-xl transition-colors">
            <Icons.Bot className="w-12 h-12 text-neon-purple mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">AI Powered Support</h3>
            <p className="text-gray-500">Get real-time compatibility advice from Vortex AI.</p>
          </div>
          <div className="p-6 hover:bg-white/5 rounded-xl transition-colors">
            <Icons.ShieldCheck className="w-12 h-12 text-neon-cyan mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Pro Circuit Verified</h3>
            <p className="text-gray-500">Trusted by top esports athletes worldwide.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoriesView = () => {
  const { setView, setShopFilter } = useAppContext();

  const categories = [
    { id: 'mouse', label: 'Mice', image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80', desc: 'Precision Aiming Tools' },
    { id: 'keyboard', label: 'Keyboards', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80', desc: 'Mechanical Domination' },
    { id: 'headset', label: 'Audio', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80', desc: 'Immersive Soundscapes' },
    { id: 'monitor', label: 'Displays', image: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=600&q=80', desc: 'High Refresh Rates' },
    { id: 'chair', label: 'Chairs', image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=600&q=80', desc: 'Ergonomic Support' },
    { id: 'controller', label: 'Controllers', image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=600&q=80', desc: 'Console Control' },
    { id: 'streaming', label: 'Streaming', image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=600&q=80', desc: 'Broadcast Quality' },
  ];

  const handleSelect = (catId: string) => {
    setShopFilter(catId);
    setView('shop');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
       <h2 className="text-4xl font-display font-bold mb-10 text-center">COMMAND <span className="text-neon-cyan">SECTORS</span></h2>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => handleSelect(cat.id)}
              className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-neon-cyan/50 transition-all hover:shadow-[0_0_25px_rgba(0,255,255,0.15)] active:scale-95 duration-200"
            >
              <div className="absolute inset-0">
                <img src={cat.image} alt={cat.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-neon-cyan transition-colors">{cat.label}</h3>
                <p className="text-gray-400 text-sm group-hover:text-white transition-colors">{cat.desc}</p>
              </div>
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur p-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                <Icons.ArrowRight size={20} className="text-neon-cyan" />
              </div>
            </div>
          ))}
       </div>
    </div>
  );
};

const ShopView = () => {
  const { products, shopFilter, setShopFilter } = useAppContext();
  
  const filtered = shopFilter === 'all' 
    ? products 
    : products.filter(p => p.category === shopFilter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h2 className="text-3xl font-display font-bold">ARMORY</h2>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {['all', 'mouse', 'keyboard', 'headset', 'monitor', 'chair', 'controller', 'streaming'].map(cat => (
            <button
              key={cat}
              onClick={() => setShopFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                shopFilter === cat 
                  ? 'bg-neon-purple text-white shadow-[0_0_10px_rgba(176,38,255,0.4)]' 
                  : 'bg-surface border border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <p className="text-gray-400 mb-6 font-mono text-sm">{filtered.length} UNITS AVAILABLE</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-gray-500 text-lg">No equipment found in this sector.</p>
          <Button onClick={() => setShopFilter('all')} variant="ghost" className="mt-4">View All Gear</Button>
        </div>
      )}
    </div>
  );
};

const WishlistView = () => {
  const { wishlist, setView } = useAppContext();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
      <h2 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
        <Icons.Heart className="text-red-500" /> WISHLIST PROTOCOL
      </h2>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface/30 rounded-2xl border border-white/5">
          <div className="p-6 bg-surface rounded-full mb-6">
             <Icons.Heart className="w-12 h-12 text-gray-700" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Target List Empty</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">You haven't marked any gear for acquisition yet. Browse the armory to tag equipment.</p>
          <Button onClick={() => setView('shop')}>Browse Gear</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-5">
          {wishlist.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductDetailView = () => {
  const { selectedProduct, addToCart, setView, toggleWishlist, isInWishlist } = useAppContext();
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  if (!selectedProduct) return <div className="p-20 text-center">No product selected</div>;
  const isWishlisted = isInWishlist(selectedProduct.id);

  // Mock reviews based on rating
  const reviews = [
    { user: 'Alex G.', rating: 5, date: '2 days ago', text: 'Absolutely insane performance. Verified purchase.' },
    { user: 'Sam K.', rating: 4, date: '1 week ago', text: 'Great value for the price, but shipping took a while.' },
    { user: 'Jordan M.', rating: 5, date: '3 weeks ago', text: 'Best upgrade I have made to my setup this year.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => setView('shop')} className="mb-6 pl-0">
        <Icons.Back size={18} /> Back to Shop
      </Button>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 animate-in slide-in-from-bottom-5 duration-500">
        {/* Image */}
        <div className="relative group h-fit">
           <div className="absolute inset-0 bg-neon-cyan/20 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
           <img 
             src={selectedProduct.image} 
             alt={selectedProduct.name} 
             className="relative w-full rounded-2xl border border-white/10 shadow-2xl z-10" 
           />
        </div>

        {/* Right Column: Key Info & Actions */}
        <div className="space-y-8">
           {/* Header info */}
           <div>
             <span className="text-neon-purple font-mono text-sm uppercase tracking-widest">{selectedProduct.category}</span>
             <h1 className="text-4xl md:text-5xl font-display font-bold mt-2">{selectedProduct.name}</h1>
             <div className="flex items-center gap-4 mt-4">
               <span className="text-3xl font-bold text-neon-cyan">${selectedProduct.price}</span>
               <div className="flex items-center text-yellow-400 bg-surface px-3 py-1 rounded-full border border-white/5">
                 <Icons.Star size={16} className="fill-current mr-2" />
                 <span className="text-white">{selectedProduct.rating.toFixed(1)} Rating</span>
               </div>
             </div>
           </div>
           
           {/* Short Description */}
           <p className="text-gray-300 text-lg leading-relaxed line-clamp-3">{selectedProduct.description}</p>
           
           {/* Action Buttons */}
           <div className="pt-4 flex gap-4">
             <Button onClick={() => addToCart(selectedProduct)} className="flex-1 py-4 text-lg">
               Add to Cart
             </Button>
             <Button 
               onClick={() => toggleWishlist(selectedProduct)} 
               variant="secondary" 
               className={`px-4 border-2 ${isWishlisted ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
             >
               <Icons.Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
             </Button>
           </div>
           
           {/* Key Benefits / Quick Specs Preview */}
           <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 bg-surface/50 rounded-lg border border-white/5">
                <Icons.Truck className="mx-auto mb-2 text-neon-cyan" size={20} />
                <p className="text-xs text-gray-400">Fast Shipping</p>
              </div>
              <div className="text-center p-3 bg-surface/50 rounded-lg border border-white/5">
                <Icons.ShieldCheck className="mx-auto mb-2 text-neon-green" size={20} />
                <p className="text-xs text-gray-400">2 Year Warranty</p>
              </div>
              <div className="text-center p-3 bg-surface/50 rounded-lg border border-white/5">
                <Icons.RotateCcw className="mx-auto mb-2 text-neon-purple" size={20} />
                <p className="text-xs text-gray-400">30 Day Returns</p>
              </div>
           </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-700 delay-100">
        <div className="flex border-b border-white/10 overflow-x-auto">
          {['Description', 'Specifications', 'Reviews'].map((tab) => {
             const key = tab.toLowerCase().slice(0, 4) === 'desc' ? 'desc' : tab.toLowerCase().slice(0, 5) === 'spec' ? 'specs' : 'reviews';
             const isActive = activeTab === key;
             return (
               <button
                 key={key}
                 onClick={() => setActiveTab(key as any)}
                 className={`px-8 py-5 text-sm font-bold uppercase tracking-wider transition-all relative ${
                   isActive ? 'text-neon-cyan bg-white/5' : 'text-gray-500 hover:text-white hover:bg-white/5'
                 }`}
               >
                 {tab}
                 {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.8)]"></div>}
               </button>
             )
          })}
        </div>
        
        <div className="p-8 min-h-[300px]">
           {activeTab === 'desc' && (
             <div className="max-w-3xl space-y-4 animate-in fade-in slide-in-from-left-2">
               <h3 className="text-2xl font-bold font-display text-white">Product Overview</h3>
               <p className="text-gray-300 leading-relaxed text-lg">{selectedProduct.description}</p>
               <p className="text-gray-400 leading-relaxed">
                 Engineered for elite performance, the {selectedProduct.name} represents the pinnacle of {selectedProduct.category} technology. 
                 Whether you are grinding rank in competitive shooters or immersing yourself in open-world RPGs, this gear delivers the reliability and precision required by professional esports athletes.
               </p>
             </div>
           )}
           
           {activeTab === 'specs' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-left-2">
                <div>
                   <h3 className="text-2xl font-bold font-display text-white mb-6">Technical Specifications</h3>
                   <ul className="space-y-4">
                     {selectedProduct.specs.map((spec, i) => (
                       <li key={i} className="flex items-center gap-4 p-4 bg-black/30 rounded-lg border border-white/5 hover:border-neon-purple/50 transition-colors">
                         <div className="w-2 h-2 bg-neon-purple rounded-full shadow-[0_0_5px_rgba(176,38,255,0.8)]"></div>
                         <span className="text-gray-200">{spec}</span>
                       </li>
                     ))}
                   </ul>
                </div>
                <div className="bg-black/30 rounded-xl p-6 border border-white/5 flex flex-col justify-center items-center text-center">
                   <Icons.Cpu size={48} className="text-neon-cyan mb-4 opacity-50" />
                   <p className="text-gray-500">Full datasheet available for download.</p>
                   <Button variant="secondary" className="mt-4">Download PDF</Button>
                </div>
             </div>
           )}

           {activeTab === 'reviews' && (
             <div className="animate-in fade-in slide-in-from-left-2">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-bold font-display text-white">Verified Player Feedback</h3>
                 <Button variant="secondary">Write a Review</Button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {reviews.map((review, i) => (
                   <div key={i} className="bg-black/30 p-6 rounded-xl border border-white/5">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-purple to-neon-cyan flex items-center justify-center text-xs font-bold text-black">
                            {review.user.charAt(0)}
                          </div>
                          <span className="font-bold text-white">{review.user}</span>
                        </div>
                        <span className="text-xs text-gray-500">{review.date}</span>
                     </div>
                     <div className="flex text-yellow-400 mb-3">
                       {[...Array(5)].map((_, starI) => (
                         <Icons.Star key={starI} size={14} className={starI < review.rating ? "fill-current" : "text-gray-700"} />
                       ))}
                     </div>
                     <p className="text-gray-300">"{review.text}"</p>
                   </div>
                 ))}
               </div>
             </div>
           )}
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
                className="text-gray-500 hover:text-red-400 transition-all hover:scale-110 active:scale-95"
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

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart, setView, user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setLoading(false);
      return;
    }

    // 1. Create a Token/PaymentMethod on the client
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        email: user?.email || 'guest@example.com',
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setLoading(false);
    } else {
      // 2. Send the PaymentMethod ID to the backend
      const result = await paymentService.processPayment(paymentMethod.id, total);
      
      if (result.success) {
        // Success
        const orderId = result.transactionId || Math.random().toString(36).substr(2, 9);
        const order: Order = {
          id: orderId,
          userId: user ? user.id : 'guest',
          items: [...cart],
          total: total,
          status: 'pending',
          date: new Date().toISOString()
        };
        db.createOrder(order);
        clearCart();
        alert(`Payment Authorized! Order confirmed. Your Order ID is: ${orderId}`);
        setView('home');
      } else {
        setError(result.error || 'Server rejected payment');
      }
      setLoading(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: "#ffffff",
        fontFamily: '"Outfit", sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#6b7280"
        },
        iconColor: "#00ffff"
      },
      invalid: {
        color: "#ef4444",
        iconColor: "#ef4444"
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <Icons.Card size={18} /> Secure Payment (Stripe)
        </h3>
        <div className="bg-black/50 border border-white/10 rounded-lg p-4">
          <CardElement options={cardStyle} />
        </div>
        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
      </div>

      <Button type="submit" disabled={!stripe || loading} className="w-full py-4 text-lg">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            Processing...
          </span>
        ) : `Pay $${total.toFixed(2)}`}
      </Button>
      
      <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
        <Icons.ShieldCheck size={12} /> Encrypted & Secured by Stripe
      </p>
    </form>
  );
};

const CheckoutView = () => {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 min-h-screen">
      <h2 className="text-3xl font-display font-bold mb-8">Secure Checkout</h2>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

const OrderTrackingView = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const allOrders = db.getOrders();
    const cleanId = orderId.trim().replace(/^#/, '');
    const found = allOrders.find(o => o.id === cleanId);
    setOrder(found || null);
    setSearched(true);
  };

  const steps = [
    { id: 'pending', label: 'Processing', icon: Icons.Clock },
    { id: 'shipped', label: 'In Transit', icon: Icons.Truck },
    { id: 'delivered', label: 'Delivered', icon: Icons.CheckCircle },
  ];

  const getCurrentStepIndex = (status: string) => {
    return steps.findIndex(s => s.id === status);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 min-h-screen">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-display font-bold mb-4">TRACK <span className="text-neon-cyan">ORDER</span></h2>
        <p className="text-gray-400">Enter your order ID to get real-time status updates from the Vortex logistics network.</p>
      </div>

      <div className="max-w-lg mx-auto mb-16">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. tx_3j92k..." 
              className="w-full bg-surface border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-cyan outline-none transition-colors"
            />
          </div>
          <Button type="submit">Track</Button>
        </form>
      </div>

      {searched && !order && (
        <div className="text-center p-8 bg-surface/50 rounded-xl border border-red-500/20">
          <Icons.Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Order Not Found</h3>
          <p className="text-gray-500">Could not locate shipment data for ID: <span className="text-red-400 font-mono">{orderId}</span></p>
        </div>
      )}

      {order && (
        <div className="animate-in slide-in-from-bottom-5 duration-500">
          <div className="bg-surface border border-white/10 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-white/5 pb-6">
              <div>
                <p className="text-gray-500 text-sm font-mono">ORDER ID</p>
                <h3 className="text-2xl font-bold text-neon-cyan font-mono">#{order.id}</h3>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">ESTIMATED DELIVERY</p>
                <p className="text-white font-bold">{new Date(new Date(order.date).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-12 px-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 rounded-full"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-neon-green -translate-y-1/2 rounded-full transition-all duration-1000"
                style={{ width: `${((getCurrentStepIndex(order.status) / (steps.length - 1)) * 100)}%` }}
              ></div>
              
              <div className="relative flex justify-between">
                {steps.map((step, idx) => {
                  const currentIdx = getCurrentStepIndex(order.status);
                  const isActive = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 ${
                        isActive 
                          ? 'bg-black border-neon-green text-neon-green shadow-[0_0_15px_rgba(57,255,20,0.4)]' 
                          : 'bg-gray-900 border-gray-700 text-gray-600'
                      }`}>
                        <step.icon size={18} />
                      </div>
                      <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-600'}`}>{step.label}</span>
                      {isCurrent && <span className="text-xs text-neon-green animate-pulse">Current Status</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-6">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <Icons.Package size={18} className="text-neon-purple" /> Shipment Contents
              </h4>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded bg-gray-800 object-cover" />
                    <div className="flex-1">
                      <p className="text-white text-sm font-bold line-clamp-1">{item.name}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-white font-mono">${item.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total Paid</span>
                <span className="text-xl font-bold text-neon-cyan">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
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
      
      <div className="relative z-10 w-full max-w-md bg-black/80 border border-white/10 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <Icons.Zap className="w-12 h-12 text-neon-purple mx-auto mb-4" />
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
          <Button type="submit" className="w-full py-3">Initialize Session</Button>
        </form>
      </div>
    </div>
  );
};

const ProfileView = () => {
  const { user, setView } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      const allOrders = db.getOrders();
      // Filter orders by user ID
      const myOrders = allOrders.filter(o => o.userId === user.id);
      setOrders(myOrders.reverse()); // Newest first
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <p className="text-red-400 mb-4">Secure Channel Required.</p>
        <Button onClick={() => setView('login')}>Log In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
           <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
             <Icons.User className="text-neon-cyan" /> OPERATOR PROFILE
           </h2>
           <p className="text-gray-400 mt-2 font-mono">ID: {user.id}</p>
        </div>
        <div className="bg-surface border border-white/10 px-6 py-4 rounded-xl">
           <p className="text-xs text-gray-500 uppercase tracking-wider">Account Status</p>
           <p className="text-neon-green font-bold text-lg flex items-center gap-2">
             <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span> ACTIVE
           </p>
           <p className="text-sm text-gray-300 mt-1">{user.email}</p>
        </div>
      </div>

      <div className="bg-surface/50 border border-white/10 rounded-2xl overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white">Combat Logistics History</h3>
          <span className="text-xs font-mono text-neon-purple">{orders.length} RECORDS FOUND</span>
        </div>

        {orders.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
             <Icons.Cart className="w-16 h-16 text-gray-700 mb-4" />
             <p className="text-gray-500 text-lg">No equipment requisitioned yet.</p>
             <Button onClick={() => setView('shop')} variant="ghost" className="mt-4">Go to Armory</Button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                       <span className="font-mono text-neon-cyan">#{order.id}</span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                       }`}>
                         {order.status}
                       </span>
                     </div>
                     <p className="text-gray-500 text-xs">{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-xl font-bold text-white">${order.total.toFixed(2)}</p>
                     <p className="text-xs text-gray-500">{order.items.length} Items</p>
                   </div>
                </div>
                
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex-shrink-0 w-16 h-16 bg-black rounded-lg overflow-hidden border border-white/10 relative group">
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                       {item.quantity > 1 && (
                         <span className="absolute bottom-0 right-0 bg-neon-purple text-white text-[10px] px-1 font-bold">x{item.quantity}</span>
                       )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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

// --- Legal Views ---

const TermsView = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen">
      <h2 className="text-4xl font-display font-bold mb-8 text-neon-cyan">TERMS OF SERVICE</h2>
      <div className="space-y-8 text-gray-300 leading-relaxed">
        <div className="bg-surface border border-white/10 p-8 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">1. ACCEPTANCE OF TERMS</h3>
          <p>By accessing or using the Vortex Gaming platform ("The System"), you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions, you are not authorized to access the armory or make requisitions.</p>
        </div>
        
        <div className="bg-surface border border-white/10 p-8 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">2. ACCOUNTS & SECURITY</h3>
          <p>You are responsible for maintaining the confidentiality of your Vortex ID and password. Any activity occurring under your account is your responsibility. Report any unauthorized breach of your perimeter immediately to command.</p>
        </div>

        <div className="bg-surface border border-white/10 p-8 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">3. PRODUCT AVAILABILITY</h3>
          <p>All hardware listed in the armory is subject to availability. We reserve the right to limit quantities or discontinue items without notice. Prices are subject to change based on global supply chain fluctuations.</p>
        </div>

        <div className="bg-surface border border-white/10 p-8 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">4. RETURNS & REFUNDS</h3>
          <p>You have 30 days from the date of delivery to initiate a return request ("Extraction Protocol"). Items must be in original condition. Opened software or consumables cannot be refunded.</p>
        </div>
      </div>
    </div>
  );
};

const PrivacyView = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen">
      <h2 className="text-4xl font-display font-bold mb-8 text-neon-purple">PRIVACY PROTOCOLS</h2>
      <div className="space-y-8 text-gray-300 leading-relaxed">
        <div className="bg-surface border border-white/10 p-8 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">1. DATA EXTRACTION</h3>
          <p>We collect personal information that you voluntarily provide when you register a Vortex ID or execute a purchase. This includes your designation (name), communication channel (email), and physical coordinates (shipping address).</p>
        </div>
        
        <div className="bg-surface border border-white/10 p-8 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">2. AI PROCESSING</h3>
          <p>Vortex AI processes your search queries and product interactions to optimize your loadout recommendations. This data is anonymized and used solely to improve system efficiency.</p>
        </div>

        <div className="bg-surface border border-white/10 p-8 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">3. PAYMENT SECURITY</h3>
          <p>Financial transactions are handled by Stripe, a secure third-party processor. Vortex does not store complete credit card numbers on our local servers. All transmissions are encrypted via SSL/TLS protocols.</p>
        </div>

        <div className="bg-surface border border-white/10 p-8 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">4. COOKIES & LOCAL STORAGE</h3>
          <p>We use local storage mechanisms to persist your shopping cart and wishlist status across sessions. By using the platform, you consent to these essential data storage operations.</p>
        </div>
      </div>
    </div>
  );
};

// --- Main App Logic ---

const AppContent = () => {
  const { currentView, setView } = useAppContext();

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView />;
      case 'categories': return <CategoriesView />;
      case 'shop': return <ShopView />;
      case 'product-detail': return <ProductDetailView />;
      case 'cart': return <CartView />;
      case 'checkout': return <CheckoutView />;
      case 'login': return <LoginView />;
      case 'admin': return <AdminView />;
      case 'profile': return <ProfileView />;
      case 'order-tracking': return <OrderTrackingView />;
      case 'wishlist': return <WishlistView />;
      case 'terms': return <TermsView />;
      case 'privacy': return <PrivacyView />;
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
            <Icons.Zap className="text-gray-600" />
            <span className="font-display font-bold text-gray-500">VORTEX GAMING</span>
          </div>
          <div className="flex items-center gap-6 text-gray-600 text-sm">
            <button onClick={() => setView('order-tracking')} className="hover:text-neon-cyan transition-colors">Track Order</button>
            <button onClick={() => setView('terms')} className="hover:text-white transition-colors">Terms</button>
            <button onClick={() => setView('privacy')} className="hover:text-white transition-colors">Privacy</button>
            <span>© 2024 Vortex Systems.</span>
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
  const [shopFilter, setShopFilter] = useState<string>('all');
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    // Init Mock Data
    setProducts(db.getProducts());
    const existingUser = db.getUser();
    if (existingUser) setUser(existingUser);
    
    // Init Wishlist
    const storedWishlist = localStorage.getItem('vortex_wishlist');
    if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
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

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      let newList;
      if (exists) {
        newList = prev.filter(p => p.id !== product.id);
      } else {
        newList = [...prev, product];
      }
      localStorage.setItem('vortex_wishlist', JSON.stringify(newList));
      return newList;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      cart, addToCart, removeFromCart, clearCart,
      products,
      currentView, setView,
      selectedProduct, setSelectedProduct,
      shopFilter, setShopFilter,
      wishlist, toggleWishlist, isInWishlist
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