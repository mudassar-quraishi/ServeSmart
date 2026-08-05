import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function CreateOrder() {
  const navigate = useNavigate();
  
  // Step State
  const [step, setStep] = useState(1); // 1: Table, 2: Guest, 3: Menu
  
  // Data State
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Guest Search State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [customerNotFound, setCustomerNotFound] = useState(false);

  // Menu State
  const [cart, setCart] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsRes, categoriesRes, tablesRes] = await Promise.all([
          api.get('/menu/items'),
          api.get('/menu/categories'),
          api.get('/tables')
        ]);
        setMenuItems(itemsRes.data);
        setCategories(categoriesRes.data);
        setTables(tablesRes.data);
      } catch (error) {
        toast.error('Failed to load required data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCustomerSubmit = async () => {
    if (!customerPhone || customerPhone.length < 10) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }
    if (!customerName) {
      toast.error('Name is required');
      return;
    }
    try {
      setIsSearchingCustomer(true);
      let customerData = null;
      try {
        const { data } = await api.get(`/customers?phone=${customerPhone}`);
        customerData = data;
        if (customerData) {
          toast.success('Existing customer found');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          const { data } = await api.post('/customers', { phone: customerPhone, fullName: customerName });
          customerData = data;
          toast.success('New customer registered');
        } else {
          throw err;
        }
      }

      if (customerData) {
        setSelectedCustomer(customerData);
        setStep(3); // Auto-advance
      }
    } catch (error) {
      toast.error('Failed to process customer');
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const filteredMenu = menuItems.filter((item) => {
    const matchesCategory = activeCategoryId === 'ALL' || item.category?.id === activeCategoryId;
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

  const submitOrder = async () => {
    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        tableId: selectedTable.id,
        customerId: selectedCustomer?.id || null,
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.qty
        }))
      };
      await api.post('/orders', payload);
      toast.success('Order sent to kitchen!');
      setCart([]);
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit order');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const getStepClass = (s) => {
    if (step === s) return "bg-secondary text-on-secondary border-secondary";
    if (step > s) return "bg-primary-container text-on-primary-container border-primary-container";
    return "bg-surface text-outline border-outline-variant";
  };

  return (
    <main className="flex-1 flex flex-col h-full w-full bg-background">
      {/* Flow Header */}
      <header className="bg-surface border-b border-outline-variant px-lg py-md flex items-center justify-between z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-md">
          <button
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else navigate(-1);
            }}
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-sm rounded-full hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">Create Order</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {selectedTable ? `Table ${selectedTable.tableNumber}` : 'Select a Table'} 
              {selectedCustomer ? ` • ${selectedCustomer.fullName}` : ' • Walk-in Customer'}
            </p>
          </div>
        </div>

        {/* Stepper */}
        <div className="hidden md:flex items-center gap-sm">
          <div className="flex items-center gap-xs">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md border transition-colors ${getStepClass(1)}`}>
              {step > 1 ? <span className="material-symbols-outlined text-[16px]">check</span> : '1'}
            </div>
            <span className={`font-label-md text-label-md ${step >= 1 ? 'text-on-surface' : 'text-outline'}`}>Table</span>
          </div>
          <div className={`w-8 h-[2px] ${step > 1 ? 'bg-secondary' : 'bg-outline-variant'}`}></div>
          <div className="flex items-center gap-xs">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md border transition-colors ${getStepClass(2)}`}>
              {step > 2 ? <span className="material-symbols-outlined text-[16px]">check</span> : '2'}
            </div>
            <span className={`font-label-md text-label-md ${step >= 2 ? 'text-on-surface' : 'text-outline'}`}>Guest</span>
          </div>
          <div className={`w-8 h-[2px] ${step > 2 ? 'bg-secondary' : 'bg-outline-variant'}`}></div>
          <div className="flex items-center gap-xs">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md border transition-colors ${getStepClass(3)}`}>
              3
            </div>
            <span className={`font-label-md text-label-md ${step >= 3 ? 'text-on-surface font-bold' : 'text-outline'}`}>Menu</span>
          </div>
        </div>

        <div className="flex items-center gap-md">
          <button onClick={() => navigate(-1)} className="font-label-md text-label-md text-error px-md py-sm border border-outline-variant rounded hover:bg-error-container hover:border-error transition-colors">
            Cancel Order
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <span className="material-symbols-outlined animate-spin text-primary text-[48px]">progress_activity</span>
        </div>
      ) : (
        <>
          {/* STEP 1: TABLE */}
          {step === 1 && (
            <div className="flex-1 p-xl overflow-y-auto animate-fade-in">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-lg text-center">Select Available Table</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-md max-w-[1000px] mx-auto">
                {tables.filter(t => t.status === 'FREE').map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTable(t); setStep(2); }}
                    className="aspect-square bg-surface border border-outline-variant rounded-xl flex flex-col items-center justify-center gap-sm hover:border-primary hover:bg-primary-container/10 hover:shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[40px] text-tertiary">table_restaurant</span>
                    <span className="font-headline-md text-on-surface">{t.tableNumber}</span>
                    <span className="font-label-sm text-outline">Capacity: {t.capacity}</span>
                  </button>
                ))}
                {tables.filter(t => t.status === 'FREE').length === 0 && (
                  <div className="col-span-full py-xl text-center flex flex-col items-center gap-md">
                    <span className="material-symbols-outlined text-[48px] text-error">event_busy</span>
                    <p className="font-headline-sm text-on-surface">No free tables available right now.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: GUEST */}
          {step === 2 && (
            <div className="flex-1 p-xl overflow-y-auto flex items-center justify-center animate-fade-in">
              <div className="w-full max-w-[448px] bg-surface p-xl rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-lg">
                <div className="text-center">
                  <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Guest Details</h2>
                  <p className="font-body-md text-on-surface-variant mt-xs">Attach a customer to this order</p>
                </div>
                
                <div className="flex flex-col gap-sm">
                  <label className="font-label-md text-on-surface-variant">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary outline-none transition-colors font-body-md"
                  />
                </div>

                <div className="flex flex-col gap-sm">
                  <label className="font-label-md text-on-surface-variant">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-md py-sm border border-outline-variant rounded bg-surface focus:border-secondary outline-none transition-colors font-body-md"
                  />
                </div>

                <button
                  onClick={handleCustomerSubmit}
                  disabled={isSearchingCustomer || !customerPhone || !customerName}
                  className="w-full py-md bg-primary text-on-primary rounded font-label-md hover:bg-primary/90 transition-colors disabled:opacity-50 mt-sm flex items-center justify-center gap-xs"
                >
                  {isSearchingCustomer ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MENU */}
          {step === 3 && (
            <div className="flex-1 flex overflow-hidden animate-fade-in">
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
                    <button
                      onClick={() => setActiveCategoryId('ALL')}
                      className={`px-md py-sm rounded-full font-label-md text-label-md whitespace-nowrap shrink-0 transition-colors ${
                        activeCategoryId === 'ALL'
                          ? 'bg-primary-container text-on-primary-container border-primary-container'
                          : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      All Items
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategoryId(cat.id)}
                        className={`px-md py-sm rounded-full font-label-md text-label-md whitespace-nowrap shrink-0 transition-colors border ${
                          activeCategoryId === cat.id
                            ? 'bg-primary-container text-on-primary-container border-primary-container'
                            : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Items Grid */}
                <div className="flex-1 overflow-y-auto p-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
                    {filteredMenu.map((item) => {
                      const inCart = cart.find((c) => c.id === item.id);
                      return (
                        <div key={item.id} className="bg-surface border border-outline-variant rounded-lg p-md flex flex-col hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start mb-sm">
                            <div>
                              <h3 className="font-headline-md text-headline-md text-on-surface leading-tight">{item.name}</h3>
                              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-xs">{item.category?.name}</p>
                            </div>
                            <span className="font-label-md text-label-md text-on-surface bg-surface-container px-sm py-xs rounded">₹ {item.price}</span>
                          </div>
                          <p className="font-body-md text-body-md text-outline mb-md flex-1 line-clamp-2">{item.description}</p>
                          <button
                            onClick={() => addToCart(item)}
                            className={`w-full py-sm rounded font-label-md text-label-md transition-colors flex items-center justify-center gap-xs ${
                              inCart
                                ? 'bg-secondary/10 text-secondary border border-secondary'
                                : 'bg-secondary text-on-secondary hover:bg-secondary/90'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{inCart ? 'add' : 'shopping_basket'}</span>
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
                      <span className="material-symbols-outlined text-[48px] mb-md opacity-50">shopping_cart</span>
                      <p className="font-body-md text-body-md">No items in cart</p>
                      <p className="font-label-sm text-label-sm mt-xs text-center px-lg">Select items from the menu to get started.</p>
                    </div>
                  ) : (
                    <>
                      {/* Main Ticket */}
                      <div className="bg-surface rounded-t-lg shadow-sm border border-outline-variant border-b-0 perforated-edge relative">
                        <div className="p-md pb-lg">
                          <div className="flex justify-between items-center mb-md pb-sm border-b border-surface-variant">
                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">New Order</span>
                            <span className="font-label-sm text-label-sm bg-surface-variant text-on-surface px-sm py-xs rounded">Draft</span>
                          </div>

                          {cart.map((item, idx) => (
                            <div key={item.id} className="flex items-start justify-between mb-sm group">
                              <div className="flex gap-sm">
                                <div className="w-8 h-8 bg-surface-container rounded flex items-center justify-center font-label-md text-label-md border border-outline-variant text-primary font-bold">
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
                    onClick={submitOrder}
                    disabled={cart.length === 0 || isSubmitting}
                    className="w-full py-md bg-secondary text-on-secondary rounded font-label-md text-label-md hover:bg-secondary/90 transition-colors flex items-center justify-center gap-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : 'Send to Kitchen'}
                    {!isSubmitting && <span className="material-symbols-outlined text-[18px]">send</span>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
