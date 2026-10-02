/** Browser-only integration helper. Import from a Next.js client component.
 * No GTM/Pixel loader here: keep the existing GTM installation exactly once.
 * All prices must be major currency units, e.g. INR 499, not paise 49900.
 */

declare global {
  interface Window {
    dataLayer: any[];
    __ledoPurchases?: Set<string>;
  }
}

const events: Record<string, string | null> = { 
  view_item: 'ViewContent', 
  add_to_cart: 'AddToCart', 
  view_cart: null,
  begin_checkout: 'InitiateCheckout', 
  purchase: 'Purchase',
  remove_from_cart: 'RemoveFromCart' // Adding support for removal
};

const strings = ['affiliation','coupon','item_brand','item_category','item_category2','item_category3','item_category4','item_category5','item_list_id','item_list_name','item_variant','location_id'];

function amount(v: any, name: string): number {
  if (v === '' || v == null || typeof v === 'boolean') throw Error(name + ' is missing');
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw Error(name + ' must be a nonnegative number');
  return n;
}

function item(raw: any) {
  if (raw.item_id == null || String(raw.item_id).trim() === '') throw Error('item_id required for catalog matching');
  if (!raw.item_name) throw Error('item_name required by this implementation');
  
  const out: any = {
    item_id: String(raw.item_id), 
    item_name: String(raw.item_name), 
    price: amount(raw.price,'price'), 
    quantity: amount(raw.quantity ?? 1,'quantity')
  };
  
  if (!Number.isInteger(out.quantity) || out.quantity < 1) throw Error('quantity must be a positive integer');
  
  strings.forEach(k => { 
    if (raw[k] != null && raw[k] !== '') out[k] = String(raw[k]); 
  });
  
  ['discount','index'].forEach(k => { 
    if (raw[k] != null) out[k] = amount(raw[k],k); 
  });
  
  return out;
}

function push(data: any) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // GTM v2 merges objects; clear prior cart/order/meta fields before each event.
  window.dataLayer.push({ecommerce:null, meta:null});
  window.dataLayer.push(data);
}

export function trackEcommerce(event: string, input: any) {
  if (typeof window === 'undefined') return false;
  if (!(event in events)) throw Error(`Unsupported ecommerce event: ${event}`);
  if (!/^[A-Z]{3}$/.test(input.currency || '')) throw Error('Use actual ISO 4217 currency');
  if (!Array.isArray(input.items)) throw Error('items must be an array');
  if (!input.items.length && event !== 'view_cart') throw Error('items cannot be empty');
  if (input.items.length > 200) throw Error('GA4 supports up to 200 items; resolve large orders explicitly');
  
  const items = input.items.map(item);
  const value = Math.round(items.reduce((sum: number,i: any)=>sum+i.price*i.quantity,0)*100)/100;
  const ecommerce: any = {currency:input.currency,value,items};
  
  if (input.coupon != null) ecommerce.coupon = String(input.coupon);
  
  let eventId = input.event_id || (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
  
  if (event === 'purchase') {
    if (!input.transaction_id || !String(input.transaction_id).trim()) throw Error('purchase requires a stable transaction_id');
    ecommerce.transaction_id = String(input.transaction_id);
    ['tax','shipping'].forEach(k => { if (input[k] != null) ecommerce[k] = amount(input[k],k); });
    eventId = input.event_id || 'purchase:' + ecommerce.transaction_id;
    
    // Best-effort same-browser suppression, not a delivery acknowledgement.
    const key = 'ledo:purchase:' + ecommerce.transaction_id;
    if (window.__ledoPurchases?.has(key)) return false;
    try { if (window.localStorage.getItem(key)) return false; } catch (_) {}
    window.__ledoPurchases = window.__ledoPurchases || new Set();
    window.__ledoPurchases.add(key);
    try { window.localStorage.setItem(key,'queued'); } catch (_) {}
  }
  
  const params = {
    currency:input.currency,
    value,
    content_ids:items.map((i: any)=>i.item_id),
    content_type:'product',
    contents:items.map((i: any)=>({id:i.item_id,quantity:i.quantity,item_price:i.price})),
    content_name:items.map((i: any)=>i.item_name).join(', '),
    content_category:[...new Set(items.map((i: any)=>i.item_category).filter(Boolean))].join(', '),
    num_items:items.reduce((sum: number,i: any)=>sum+i.quantity,0)
  };
  
  push({
    event,
    ecommerce,
    meta: events[event] ? {event_name:events[event],event_id:eventId,parameters:params} : null,
    page_location: window.location.origin + window.location.pathname,
    page_title: document.title
  });
  
  return true;
}

/** Invoke once after each completed navigation and after the title is ready.
 * Supply the previous virtual URL as referrer on SPA navigation.
 * Remove any customer data from URLs/titles before supplying them.
 */
export function trackPageView({location, title, referrer}: any = {}) {
  if (typeof window === 'undefined') return;
  const clean = (v: string) => { if (!v) return ''; try { const u=new URL(v,window.location.origin); return u.origin+u.pathname; } catch { return ''; } };
  
  push({
    event:'virtual_page_view',
    page_location: clean(location || window.location.href),
    page_title: title ?? document.title,
    page_referrer: clean(referrer ?? document.referrer),
    meta:{
      event_name:'PageView',
      event_id: window.crypto?.randomUUID?.() || String(Date.now()),
      parameters:{}
    }
  });
}

// ============================================================================
// WRAPPERS FOR OUR EXISTING COMPONENT CALLS
// ============================================================================

export const trackViewItem = (product: any) => {
  try {
    trackEcommerce('view_item', {
      currency: "INR",
      items: [{
        item_id: product._id || product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category?.name || product.category || 'Tea',
        item_brand: "Ledo Valley",
        quantity: 1
      }]
    });
  } catch (err) { console.error("GTM trackViewItem Error", err); }
};

export const trackAddToCart = (product: any, quantity: number = 1) => {
  try {
    trackEcommerce('add_to_cart', {
      currency: "INR",
      items: [{
        item_id: product.id || product._id || product.productId,
        item_name: product.name,
        price: product.price,
        item_category: product.category?.name || product.category || 'Tea',
        item_brand: "Ledo Valley",
        quantity: quantity
      }]
    });
  } catch (err) { console.error("GTM trackAddToCart Error", err); }
};

export const trackRemoveFromCart = (product: any, quantity: number = 1) => {
  try {
    trackEcommerce('remove_from_cart', {
      currency: "INR",
      items: [{
        item_id: product.id || product._id || product.productId,
        item_name: product.name,
        price: product.price,
        item_category: product.category?.name || product.category || 'Tea',
        item_brand: "Ledo Valley",
        quantity: quantity
      }]
    });
  } catch (err) { console.error("GTM trackRemoveFromCart Error", err); }
};

export const trackBeginCheckout = (cartItems: any[], totalValue: number) => {
  if (!cartItems || cartItems.length === 0) return;
  try {
    trackEcommerce('begin_checkout', {
      currency: "INR",
      items: cartItems.map((item) => ({
        item_id: item.productId || item._id,
        item_name: item.name,
        price: item.price,
        item_brand: "Ledo Valley",
        quantity: item.quantity,
      }))
    });
  } catch (err) { console.error("GTM trackBeginCheckout Error", err); }
};

export const trackPurchase = (order: any) => {
  if (!order || !order.items || order.items.length === 0) return;
  try {
    trackEcommerce('purchase', {
      currency: "INR",
      transaction_id: order.orderNumber || order._id,
      tax: order.gstAmount || 0,
      shipping: order.shippingAmount || 0,
      items: order.items.map((item: any) => ({
        item_id: item.productId,
        item_name: item.productName,
        price: item.price,
        item_brand: "Ledo Valley",
        quantity: item.quantity,
      }))
    });
  } catch (err) { console.error("GTM trackPurchase Error", err); }
};
