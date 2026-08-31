import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, UserRound, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
export default function Navbar() {
  const { user, logout } = useAuth(),
    [open, setOpen] = useState(false),
    nav = useNavigate();
  const cls = ({ isActive }) =>
    `text-sm font-medium ${isActive ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"}`;
  function out() {
    logout();
    nav("/");
    setOpen(false);
  }
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-[72px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-xs font-black text-white">
            CM
          </span>
          <b className="text-lg">
            Campus<span className="text-indigo-600">Market</span>
          </b>
        </Link>
        <nav className="hidden gap-7 md:flex">
          <NavLink to="/products" className={cls}>
            Browse
          </NavLink>
          {user && (
            <NavLink to="/sell" className={cls}>
              Sell an item
            </NavLink>
          )}
          {user && (
            <NavLink to="/orders" className={cls}>
              Orders
            </NavLink>
          )}
          {user && (
            <NavLink to="/wishlist" className={cls}>
              Wishlist
            </NavLink>
          )}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold"
              >
                <UserRound size={16} />
                {user.name}
              </Link>
              <button onClick={out}>
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white"
              >
                Get started
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-white p-4 md:hidden">
          <div className="container-page flex flex-col gap-4">
            <NavLink
              to="/products"
              onClick={() => setOpen(false)}
              className={cls}
            >
              Browse
            </NavLink>
            {user && (
              <>
                <NavLink
                  to="/sell"
                  onClick={() => setOpen(false)}
                  className={cls}
                >
                  Sell an item
                </NavLink>
                <NavLink
                  to="/orders"
                  onClick={() => setOpen(false)}
                  className={cls}
                >
                  Orders
                </NavLink>
                <NavLink
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className={cls}
                >
                  Wishlist
                </NavLink>
                <button onClick={out} className="text-left font-semibold">
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
