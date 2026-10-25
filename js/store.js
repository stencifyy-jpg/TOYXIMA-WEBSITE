// TOYXIMA Toys - Store State Management & Persistence
import { DEFAULT_PRODUCTS } from './products.js';

const STORAGE_KEYS = {
  PRODUCTS: 'toyxima_products_v1',
  CART: 'toyxima_cart_v1',
  WISHLIST: 'toyxima_wishlist_v1',
  ORDERS: 'toyxima_orders_v1',
  SETTINGS: 'toyxima_settings_v1',
  SOUND_ENABLED: 'toyxima_sound_enabled'
};

class Store {
  constructor() {
    this.listeners = new Set();
    this.products = this.loadProducts();
    this.cart = this.loadCart();
    this.wishlist = this.loadWishlist();
    this.orders = this.loadOrders();
    this.promoCode = null;
    this.discountPercent = 0;
    this.giftWrap = false;
    this.soundEnabled = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED) !== 'false';
  }

  // Event Subscription
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, data) {
    for (const listener of this.listeners) {
      try {
        listener(event, data);
      } catch (err) {
        console.error('Store listener error:', err);
      }
    }
  }

  // Product Methods
  loadProducts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS) || localStorage.getItem('wonderland_products_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse stored products, using defaults', e);
    }
    return [...DEFAULT_PRODUCTS];
  }

  saveProducts() {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    return this.products.find(p => p.id === id) || null;
  }

  addProduct(newProduct) {
    const id = 'toy-custom-' + Date.now();
    const product = {
      id,
      rating: 5.0,
      reviewsCount: 1,
      inStock: true,
      stockCount: 10,
      badge: "New Toy",
      badgeColor: "bg-emerald-400 text-emerald-950",
      additionalImages: [newProduct.image],
      ...newProduct
    };
    this.products.unshift(product);
    this.saveProducts();
    this.notify('products_updated', this.products);
    return product;
  }

  updateProduct(id, updatedFields) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updatedFields };
      this.saveProducts();
      this.notify('products_updated', this.products);
      return this.products[index];
    }
    return null;
  }

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    // Also remove from cart if present
    this.removeFromCart(id);
    this.saveProducts();
    this.notify('products_updated', this.products);
  }

  resetProductsToDefault() {
    this.products = [...DEFAULT_PRODUCTS];
    this.saveProducts();
    this.notify('products_updated', this.products);
  }

  exportProductsJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `toyxima-toys-catalog-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importProductsJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.products = parsed;
        this.saveProducts();
        this.notify('products_updated', this.products);
        return { success: true, count: parsed.length };
      }
      return { success: false, error: "Invalid JSON format: array of products expected." };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Cart Methods
  loadCart() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CART);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(this.cart));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }

  getCart() {
    return this.cart;
  }

  getCartCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  addToCart(productId, quantity = 1) {
    const product = this.getProductById(productId);
    if (!product) return;

    const existingIndex = this.cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        categoryLabel: product.categoryLabel,
        quantity: quantity
      });
    }

    this.saveCart();
    this.notify('cart_updated', this.cart);
    return true;
  }

  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const item = this.cart.find(i => i.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
      this.notify('cart_updated', this.cart);
    }
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.notify('cart_updated', this.cart);
  }

  clearCart() {
    this.cart = [];
    this.promoCode = null;
    this.discountPercent = 0;
    this.giftWrap = false;
    this.saveCart();
    this.notify('cart_updated', this.cart);
  }

  applyPromoCode(code) {
    const clean = (code || '').trim().toUpperCase();
    if (clean === 'MAGIC10' || clean === 'TOY10') {
      this.promoCode = clean;
      this.discountPercent = 10;
      this.notify('cart_updated', this.cart);
      return { success: true, message: "✨ Magic 10% discount applied!", discountPercent: 10 };
    } else if (clean === 'WONDER20') {
      this.promoCode = clean;
      this.discountPercent = 20;
      this.notify('cart_updated', this.cart);
      return { success: true, message: "🎉 20% Wonder discount applied!", discountPercent: 20 };
    } else if (clean === 'FREESHIP') {
      this.promoCode = clean;
      this.discountPercent = 0;
      this.freeShippingPromo = true;
      this.notify('cart_updated', this.cart);
      return { success: true, message: "🚚 Free shipping unlocked!", discountPercent: 0 };
    } else {
      return { success: false, message: "Invalid code. Try 'MAGIC10' or 'WONDER20'!" };
    }
  }

  setGiftWrap(enabled) {
    this.giftWrap = !!enabled;
    this.notify('cart_updated', this.cart);
  }

  getCartTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = (subtotal * this.discountPercent) / 100;
    const discountedSubtotal = subtotal - discount;
    const freeShippingThreshold = 60.00;
    const shipping = (subtotal >= freeShippingThreshold || this.freeShippingPromo || subtotal === 0) ? 0 : 4.99;
    const giftWrapCost = this.giftWrap ? 3.99 : 0;
    const total = discountedSubtotal + shipping + giftWrapCost;

    return {
      subtotal,
      discount,
      discountPercent: this.discountPercent,
      promoCode: this.promoCode,
      shipping,
      giftWrapCost,
      giftWrap: this.giftWrap,
      total,
      freeShippingThreshold,
      amountNeededForFreeShipping: Math.max(0, freeShippingThreshold - subtotal)
    };
  }

  // Wishlist Methods
  loadWishlist() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveWishlist() {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(this.wishlist));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }

  toggleWishlist(productId) {
    const index = this.wishlist.indexOf(productId);
    if (index > -1) {
      this.wishlist.splice(index, 1);
    } else {
      this.wishlist.push(productId);
    }
    this.saveWishlist();
    this.notify('wishlist_updated', this.wishlist);
    return index === -1; // returns true if added
  }

  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  }

  // Order Simulation & WhatsApp Order Formatter
  loadOrders() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveOrders() {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  }

  createOrder(customerDetails) {
    if (this.cart.length === 0) return null;

    const totals = this.getCartTotals();
    const orderNumber = 'TOYX-' + Math.floor(100000 + Math.random() * 900000);
    const order = {
      id: orderNumber,
      date: new Date().toISOString(),
      items: [...this.cart],
      totals,
      customer: customerDetails,
      status: 'Received (Demo Mode)'
    };

    this.orders.unshift(order);
    this.saveOrders();
    this.clearCart();
    this.notify('order_created', order);
    return order;
  }

  // Format WhatsApp Order Message
  generateWhatsAppOrderUrl(customerName = '', giftNote = '', whatsappNumber = '+15551238697') {
    const totals = this.getCartTotals();
    if (this.cart.length === 0) return '';

    let text = `🧸 *New Order Inquiry - TOYXIMA Toys*\n\n`;
    if (customerName) {
      text += `*Customer:* ${customerName}\n`;
    }
    text += `*Items:*\n`;
    this.cart.forEach((item, idx) => {
      text += `${idx + 1}. ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    text += `\n*Subtotal:* $${totals.subtotal.toFixed(2)}`;
    if (totals.discount > 0) {
      text += `\n*Discount (${totals.promoCode}):* -$${totals.discount.toFixed(2)}`;
    }
    text += `\n*Estimated Shipping:* ${totals.shipping === 0 ? 'FREE ✨' : '$' + totals.shipping.toFixed(2)}`;
    if (totals.giftWrap) {
      text += `\n*Gift Wrapping:* Included ($${totals.giftWrapCost.toFixed(2)})`;
    }
    text += `\n*Total:* *$${totals.total.toFixed(2)}*\n`;

    if (giftNote) {
      text += `\n*Gift Card Note:* "${giftNote}"\n`;
    }
    text += `\nHi TOYXIMA! I'd like to confirm availability and complete this order.`;

    const encoded = encodeURIComponent(text);
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encoded}`;
  }

  // Sound Toggle
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(this.soundEnabled));
    this.notify('sound_toggle', this.soundEnabled);
    return this.soundEnabled;
  }
}

export const store = new Store();
