export const getCustomerToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customerToken");
};

export const getCustomer = () => {
  if (typeof window === "undefined") return null;
  const customer = localStorage.getItem("customer");
  return customer ? JSON.parse(customer) : null;
};

export const isCustomerLoggedIn = (): boolean => {
  return !!getCustomerToken();
};

export const logoutCustomer = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("customerToken");
  localStorage.removeItem("customer");
};
