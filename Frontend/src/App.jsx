import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Auth from "./pages/Auth";
import Sell from "./pages/Sell";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import AdminCategories from "./pages/AdminCategories";

function NotFound() {
    return (
        <div className="container-page py-24 text-center">
            <b>404 — Page not found</b>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />

                <main className="page-shell">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:id" element={<ProductDetails />} />

                        <Route path="/login" element={<Auth />} />
                        <Route path="/register" element={<Auth mode="register" />} />

                        {/* Protected routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/sell" element={<Sell />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/profile" element={<Profile />} />

                            {/* Admin */}
                            <Route path="/admin/categories" element={<AdminCategories />} />
                        </Route>

                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>

                <Footer />
            </BrowserRouter>
        </AuthProvider>
    );
}
