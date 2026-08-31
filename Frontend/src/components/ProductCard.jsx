import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
export default function ProductCard({ product, wished = false, onWishChange }) {
  const { user } = useAuth(),
    [busy, setBusy] = useState(false),
    img = product.imageUrls?.[0];
  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setBusy(true);
    try {
      if (wished) await api.removeWishlist(product.id);
      else await api.addWishlist(product.id);
      onWishChange?.(!wished);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Link
      to={`/products/${product.id}`}
      className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-400">
            No image
          </div>
        )}
        {user && (
          <button
            disabled={busy}
            onClick={toggle}
            className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 ${wished ? "text-rose-500" : "text-slate-500"}`}
          >
            <Heart size={17} fill={wished ? "currentColor" : "none"} />
          </button>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-slate-900/85 px-2.5 py-1 text-[11px] font-bold text-white">
          {product.productCondition?.replace("_", " ")}
        </span>
      </div>
      <div className="p-4">
        <div className="flex justify-between gap-3">
          <h3 className="truncate font-bold">{product.title}</h3>
          <b className="shrink-0 text-indigo-600">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </b>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
          {product.description}
        </p>
        <div className="mt-4 flex justify-between text-xs text-slate-400">
          <span>{product.categoryName}</span>
          <span>by {product.sellerName}</span>
        </div>
      </div>
    </Link>
  );
}
