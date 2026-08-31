const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * Common API request function
 */
async function request(path, options = {}) {
  const { body, ...rest } = options;

  const token = localStorage.getItem("token");

  // Check whether request body is FormData
  const isFormData = body instanceof FormData;

  const headers = {
    // Don't set Content-Type manually for FormData.
    // Browser will automatically set multipart/form-data
    // with the correct boundary.
    ...(body !== undefined && !isFormData
      ? { "Content-Type": "application/json" }
      : {}),

    // Add JWT if user is logged in
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,

    headers: {
      ...headers,
      ...(rest.headers || {}),
    },

    body:
      body !== undefined
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  // Handle errors
  if (!response.ok) {
    // JWT expired / invalid
    if (response.status === 401) {
      window.dispatchEvent(new Event("auth:expired"));
    }

    throw new Error(
      data?.message || `Request failed (${response.status})`
    );
  }

  return data;
}


/* ============================================================
   API
   ============================================================ */

export const api = {

  /* ============================================================
     AUTHENTICATION
     ============================================================ */

  register: (body) =>
    request("/auth/register", {
      method: "POST",
      body,
    }),

  login: (body) =>
    request("/auth/login", {
      method: "POST",
      body,
    }),


  /* ============================================================
     CATEGORIES
     ============================================================ */

  getCategories: () =>
    request("/categories"),

  createCategory: (body) =>
    request("/categories", {
      method: "POST",
      body,
    }),


  /* ============================================================
     PRODUCTS
     ============================================================ */

  getProducts: ({
    keyword = "",
    categoryId = "",
    page = 0,
    size = 12,
  } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    if (keyword) {
      params.set("keyword", keyword);
    }

    if (categoryId) {
      params.set("categoryId", String(categoryId));
    }

    return request(`/products?${params.toString()}`);
  },

  getProduct: (id) =>
    request(`/products/${id}`),

  createProduct: (body) =>
    request("/products", {
      method: "POST",
      body,
    }),

  updateProduct: (id, body) =>
    request(`/products/${id}`, {
      method: "PUT",
      body,
    }),

  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: "DELETE",
    }),


  /* ============================================================
     IMAGES
     ============================================================ */

  uploadImage: (formData) =>
    request("/images/upload", {
      method: "POST",
      body: formData,
    }),


  /* ============================================================
     ORDERS
     ============================================================ */

  /*
   * BUYER:
   * Clicks Buy Now
   *
   * Product:
   * AVAILABLE -> RESERVED
   *
   * Order:
   * PENDING
   */
  purchase: (productId) =>
    request(`/orders/purchase/${productId}`, {
      method: "POST",
    }),


  /*
   * BUYER:
   * Get orders where current user is the buyer.
   */
  myOrders: () =>
    request("/orders/my"),


  /*
   * SELLER:
   * Get purchase requests for products
   * owned by the current seller.
   */
  sellingOrders: () =>
    request("/orders/selling"),


  /*
   * SELLER:
   * Accept buyer's purchase request.
   *
   * Order:
   * PENDING -> ACCEPTED
   *
   * Product:
   * RESERVED -> SOLD
   */
  acceptOrder: (orderId) =>
    request(`/orders/${orderId}/accept`, {
      method: "PUT",
    }),


  /*
   * SELLER:
   * Reject buyer's purchase request.
   *
   * Order:
   * PENDING -> REJECTED
   *
   * Product:
   * RESERVED -> AVAILABLE
   */
  rejectOrder: (orderId) =>
    request(`/orders/${orderId}/reject`, {
      method: "PUT",
    }),


  /* ============================================================
     REVIEWS
     ============================================================ */

  getReviews: (productId) =>
    request(`/reviews/product/${productId}`),

  createReview: (body) =>
    request("/reviews", {
      method: "POST",
      body,
    }),


  /* ============================================================
     WISHLIST
     ============================================================ */

  getWishlist: () =>
    request("/wishlist"),

  addWishlist: (productId) =>
    request(`/wishlist/${productId}`, {
      method: "POST",
    }),

  removeWishlist: (productId) =>
    request(`/wishlist/${productId}`, {
      method: "DELETE",
    }),
};