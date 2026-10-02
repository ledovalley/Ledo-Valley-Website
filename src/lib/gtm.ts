type GTMEvent = {
  event: string;
  ecommerce?: any;
  [key: string]: any;
};

// Declare window.dataLayer for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const pushToDataLayer = (data: GTMEvent) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    // Best practice: clear previous ecommerce object before pushing a new one
    if (data.ecommerce) {
      window.dataLayer.push({ ecommerce: null });
    }
    window.dataLayer.push(data);
  }
};

export const trackViewItem = (product: any) => {
  pushToDataLayer({
    event: "view_item",
    ecommerce: {
      currency: "INR",
      value: product.price,
      items: [
        {
          item_id: product._id || product.id,
          item_name: product.name,
          price: product.price,
          item_category: product.category?.name || product.category,
          quantity: 1
        }
      ]
    }
  });
};

export const trackAddToCart = (product: any, quantity: number = 1) => {
  pushToDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency: "INR",
      value: product.price * quantity,
      items: [
        {
          item_id: product._id || product.id,
          item_name: product.name,
          price: product.price,
          item_category: product.category?.name || product.category,
          quantity: quantity
        }
      ]
    }
  });
};

export const trackRemoveFromCart = (product: any, quantity: number = 1) => {
  pushToDataLayer({
    event: "remove_from_cart",
    ecommerce: {
      currency: "INR",
      value: product.price * quantity,
      items: [
        {
          item_id: product._id || product.id || product.productId,
          item_name: product.name,
          price: product.price,
          quantity: quantity
        }
      ]
    }
  });
};

export const trackBeginCheckout = (cartItems: any[], totalValue: number) => {
  pushToDataLayer({
    event: "begin_checkout",
    ecommerce: {
      currency: "INR",
      value: totalValue,
      items: cartItems.map((item) => ({
        item_id: item.productId || item._id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))
    }
  });
};

export const trackPurchase = (order: any) => {
  pushToDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: order.orderNumber || order._id,
      value: order.grandTotal,
      tax: order.gstAmount || 0,
      shipping: order.shippingAmount || 0,
      currency: "INR",
      items: (order.items || []).map((item: any) => ({
        item_id: item.productId,
        item_name: item.productName,
        price: item.price,
        quantity: item.quantity,
      }))
    }
  });
};
