import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SAMPLE_MENU = [
  { id: 1, name: 'Masala Dosa', category: 'Mains', sub: 'South Indian', price: 140, desc: 'Crispy rice & lentil crepe filled with spiced potato masala. Served with sambar and chutney.' },
  { id: 2, name: 'Paneer Tikka', category: 'Starters', sub: 'Tandoor', price: 280, desc: 'Marinated cottage cheese cubes roasted in tandoor with bell peppers and onions.' },
  { id: 3, name: 'Mango Lassi', category: 'Beverages', sub: 'Cold', price: 120, desc: 'Sweet yogurt drink blended with fresh mango pulp.' },
  { id: 4, name: 'Butter Chicken', category: 'Mains', sub: 'North Indian', price: 320, desc: 'Tender chicken in a rich, creamy tomato-based curry with aromatic spices.' },
  { id: 5, name: 'Garlic Naan', category: 'Breads', sub: 'Tandoor', price: 60, desc: 'Fluffy tandoor-baked flatbread topped with garlic and butter.' },
  { id: 6, name: 'Gulab Jamun', category: 'Desserts', sub: 'Indian', price: 90, desc: 'Deep-fried milk dumplings soaked in sugar syrup with cardamom.' },
];

const CATEGORIES = ['All Items', 'Starters', 'Mains', 'Breads', 'Desserts', 'Beverages'];

export default function CreateOrder() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [search, setSearch] = useState('');

  const filteredMenu = SAMPLE_MENU.filter((item) => {
    const matchesCategory = activeCategory === 'All Items' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((c) => c.id !== itemId));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  return (
    <main className="flex-1 flex flex-col h-full w-full bg-background">
      {/* Flow Header */}
      <header className="bg-surface border-b border-outline-variant px-lg py-md flex items-center justify-between z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-md">
          <button
            onClick={() => navigate(-1)}
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-sm rounded-full hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">Create Order</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Table 12 • Walk-in Customer</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="hidden md:flex items-center gap-sm">
          <div className="flex items-center gap-xs">
            <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-md text-label-md">1</div>
            <span className="font-label-md text-label-md text-on-surface">Table</span>
          </div>
          <div className="w-8 h-[2px] bg-outline-variant"></div>
          <div className="flex items-center gap-xs">
            <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-md text-label-md">2</div>
            <span className="font-label-md text-label-md text-on-surface">Guest</span>
          </div>
          <div className="w-8 h-[2px] bg-secondary"></div>
          <div className="flex items-center gap-xs">
            <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-md text-label-md">3</div>
            <span className="font-label-md text-label-md text-on-surface font-bold">Menu</span>
          </div>
        </div>

        <div className="flex items-center gap-md">
          <button className="font-label-md text-label-md text-error px-md py-sm border border-outline-variant rounded hover:bg-error-container hover:border-error transition-colors">
            Cancel Order
          </button>
        </div>
      </header>

      {/* Split Screen Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Menu Selection */}
        <div className="flex-1 flex flex-col h-full border-r border-outline-variant">
          {/* Search & Categories */}
          <div className="bg-surface px-lg py-md border-b border-outline-variant shrink-0">
            <div className="relative w-full mb-md">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="w-full pl-xl pr-md py-sm border border-outline-variant rounded bg-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-body-md text-body-md text-on-surface placeholder:text-outline"
                placeholder="Search menu items..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-sm overflow-x-auto pb-sm scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-md py-sm rounded-full font-label-md text-label-md whitespace-nowrap shrink-0 transition-colors ${
                    activeCategory === cat
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-y-auto p-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {filteredMenu.map((item) => {
                const inCart = cart.find((c) => c.id === item.id);
                return (
                  <div key={item.id} className="bg-surface border border-outline-variant rounded-lg p-md flex flex-col hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-sm">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface">{item.name}</h3>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-xs">{item.category} • {item.sub}</p>
                      </div>
                      <span className="font-label-md text-label-md text-on-surface bg-surface-container px-sm py-xs rounded">₹ {item.price}</span>
                    </div>
                    <p className="font-body-md text-body-md text-outline mb-md flex-1 line-clamp-2">{item.desc}</p>
                    <button
                      onClick={() => addToCart(item)}
                      className={`w-full py-sm rounded font-label-md text-label-md transition-colors flex items-center justify-center gap-xs ${
                        inCart
                          ? 'bg-secondary/10 text-secondary border border-secondary'
                          : 'bg-secondary text-on-secondary hover:bg-secondary/90'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      {inCart ? `Added (${inCart.qty})` : 'Add to Cart'}
                    </button>
                  </div>
                );
              })}
              {filteredMenu.length === 0 && (
                <div className="col-span-full text-center py-xl text-outline font-body-md text-body-md">
                  No menu items found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cart Summary */}
        <div className="w-[360px] bg-surface-container-lowest flex flex-col shrink-0 h-full">
          <div className="p-md border-b border-outline-variant shrink-0 bg-surface">
            <h2 className="font-headline-md text-headline-md text-primary font-bold">Current Order</h2>
            {/* Order Status Tracker */}
            <div className="mt-md flex items-center justify-between relative">
              <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-[2px] bg-surface-container-high z-0"></div>
              <div className="absolute left-[10%] right-[50%] top-1/2 -translate-y-1/2 h-[2px] bg-secondary z-0"></div>
              <div className="flex flex-col items-center gap-xs z-10">
                <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[12px]">check</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface">New</span>
              </div>
              <div className="flex flex-col items-center gap-xs z-10">
                <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[12px]">receipt_long</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface">Draft</span>
              </div>
            </div>
          </div>

          {/* Cart Items (Ticket Style) */}
          <div className="flex-1 overflow-y-auto p-md bg-surface-bright relative">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-outline">
                <span className="material-symbols-outlined text-[48px] mb-md">shopping_cart</span>
                <p className="font-body-md text-body-md">No items in cart</p>
                <p className="font-label-sm text-label-sm mt-xs">Select items from the menu to get started.</p>
              </div>
            ) : (
              <>
                {/* Main Ticket */}
                <div className="bg-surface rounded-t-lg shadow-sm border border-outline-variant border-b-0 perforated-edge relative">
                  <div className="p-md pb-lg">
                    <div className="flex justify-between items-center mb-md pb-sm border-b border-surface-variant">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Ticket #4021</span>
                      <span className="font-label-sm text-label-sm bg-surface-variant text-on-surface px-sm py-xs rounded">Draft</span>
                    </div>

                    {cart.map((item, idx) => (
                      <div key={item.id} className="flex items-start justify-between mb-sm group">
                        <div className="flex gap-sm">
                          <div className="w-8 h-8 bg-surface-container rounded flex items-center justify-center font-label-md text-label-md border border-outline-variant">
                            {item.qty}
                          </div>
                          <div>
                            <div className="font-label-md text-label-md text-on-surface">{item.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-md">
                          <span className="font-label-md text-label-md text-on-surface">₹ {item.price * item.qty}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-center font-label-sm text-label-sm text-outline mt-md">New items will be grouped here before sending to kitchen.</p>
              </>
            )}
          </div>

          {/* Footer Summary */}
          <div className="bg-surface p-md border-t border-outline-variant shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-xs">
              <span className="font-body-md text-body-md text-on-surface-variant">Subtotal</span>
              <span className="font-body-md text-body-md text-on-surface">₹ {subtotal}</span>
            </div>
            <div className="flex justify-between items-center mb-md">
              <span className="font-label-sm text-label-sm text-outline">Taxes (5%)</span>
              <span className="font-label-sm text-label-sm text-outline">₹ {tax}</span>
            </div>
            <div className="flex justify-between items-center mb-md pt-sm border-t border-surface-variant">
              <span className="font-headline-md text-headline-md text-primary font-bold">Total</span>
              <span className="font-headline-md text-headline-md text-primary font-bold">₹ {total}</span>
            </div>
            <button
              disabled={cart.length === 0}
              className="w-full py-md bg-secondary text-on-secondary rounded font-label-md text-label-md hover:bg-secondary/90 transition-colors flex items-center justify-center gap-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send to Kitchen <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
