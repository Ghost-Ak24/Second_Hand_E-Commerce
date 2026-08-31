import {
  ArrowLeft,
  Heart,
  Pencil,
  ShieldCheck,
  Star,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";


export default function ProductDetails() {

  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [p, setP] = useState(null);
  const [rs, setRs] = useState([]);
  const [w, setW] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState(0);
  const [error, setError] = useState("");


  /*
   * ============================================================
   * LOAD PRODUCT
   * ============================================================
   */
  async function load() {

    try {

      setError("");

      const [product, reviews] = await Promise.all([
        api.getProduct(id),
        api.getReviews(id),
      ]);

      setP(product);
      setRs(reviews || []);

      /*
       * Check whether product is in wishlist.
       */
      if (user) {

        try {

          const wishlist = await api.getWishlist();

          setW(
            wishlist.includes(Number(id))
          );

        } catch {
          setW(false);
        }
      }

    } catch (e) {

      setError(e.message || "Unable to load product");

    }
  }


  useEffect(() => {

    load();

  }, [id, user]);


  /*
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (!p) {

    if (error) {

      return (
        <div className="container-page py-16 text-center">

          <p className="text-rose-500">
            {error}
          </p>

          <Link
            to="/products"
            className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
          >
            Back to products
          </Link>

        </div>
      );
    }

    return <Loader />;
  }


  /*
   * ============================================================
   * BASIC INFORMATION
   * ============================================================
   */

  const owner =
    user?.userId === p.sellerId;

  const status =
    p.status || "AVAILABLE";


  /*
   * ============================================================
   * BUY PRODUCT
   * ============================================================
   *
   * AVAILABLE
   *      ↓
   * Buy Now
   *      ↓
   * RESERVED
   *
   * Seller must accept the request before
   * the product becomes SOLD.
   */
  async function buy() {

    if (!user) {

      nav("/login");

      return;
    }


    if (status !== "AVAILABLE") {

      return;
    }


    const confirmed =
      window.confirm(
        `Send a purchase request for "${p.title}"?`
      );


    if (!confirmed) {

      return;
    }


    try {

      setBusy(true);

      setError("");

      await api.purchase(p.id);


      /*
       * Reload product so that the status changes
       * from AVAILABLE -> RESERVED.
       */
      await load();


      alert(
        "Purchase request sent to the seller."
      );

    } catch (e) {

      setError(
        e.message || "Unable to send purchase request"
      );

    } finally {

      setBusy(false);

    }
  }


  /*
   * ============================================================
   * WISHLIST
   * ============================================================
   */
  async function wish() {

    if (!user) {

      nav("/login");

      return;
    }


    try {

      if (w) {

        await api.removeWishlist(p.id);

        setW(false);

      } else {

        await api.addWishlist(p.id);

        setW(true);

      }

    } catch (e) {

      alert(e.message);

    }
  }


  /*
   * ============================================================
   * DELETE PRODUCT
   * ============================================================
   */
  async function del() {

    const confirmed =
      window.confirm(
        "Delete this listing?"
      );


    if (!confirmed) {

      return;
    }


    try {

      await api.deleteProduct(p.id);

      nav("/products");

    } catch (e) {

      alert(e.message);

    }
  }


  /*
   * ============================================================
   * STATUS UI
   * ============================================================
   */

  function getStatusBadge() {

    if (status === "AVAILABLE") {

      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">

          <CheckCircle size={14} />

          Available

        </span>
      );
    }


    if (status === "RESERVED") {

      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">

          <Clock size={14} />

          Reserved

        </span>
      );
    }


    if (status === "SOLD") {

      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">

          <CheckCircle size={14} />

          Sold

        </span>
      );
    }


    return null;
  }


  /*
   * ============================================================
   * BUY BUTTON TEXT
   * ============================================================
   */

  function getBuyButtonText() {

    if (busy) {

      return "Sending request...";

    }


    if (status === "RESERVED") {

      return "Item reserved";

    }


    if (status === "SOLD") {

      return "Item sold";

    }


    return "Buy this item";
  }


  return (

    <div className="container-page py-8">

      {/* ======================================================
          BACK
          ====================================================== */}

      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >

        <ArrowLeft size={16} />

        Back

      </Link>


      {/* ======================================================
          MAIN PRODUCT
          ====================================================== */}

      <div className="mt-7 grid gap-10 lg:grid-cols-[1.05fr_.95fr]">


        {/* ====================================================
            IMAGES
            ==================================================== */}

        <div>

          <div className="overflow-hidden rounded-3xl border bg-white">

            <div className="aspect-[4/3] bg-slate-100">

              {p.imageUrls?.length ? (

                <img
                  src={p.imageUrls[sel]}
                  alt={p.title}
                  className="h-full w-full object-cover"
                />

              ) : (

                <div className="grid h-full place-items-center text-slate-400">

                  No image

                </div>
              )}

            </div>

          </div>


          {/* Image thumbnails */}

          {p.imageUrls?.length > 1 && (

            <div className="mt-3 flex gap-3">

              {p.imageUrls.map((x, i) => (

                <button
                  key={x}
                  onClick={() => setSel(i)}
                  className={`h-20 w-24 overflow-hidden rounded-xl border-2 ${
                    sel === i
                      ? "border-indigo-600"
                      : "border-transparent"
                  }`}
                >

                  <img
                    src={x}
                    alt={`${p.title} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />

                </button>

              ))}

            </div>
          )}

        </div>


        {/* ====================================================
            PRODUCT INFORMATION
            ==================================================== */}

        <div>


          {/* Category + status + wishlist */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">

                {p.categoryName}

              </span>

              {getStatusBadge()}

            </div>


            {user && (

              <button
                onClick={wish}
                className={
                  w
                    ? "text-rose-500"
                    : "text-slate-400 hover:text-rose-500"
                }
              >

                <Heart
                  fill={w ? "currentColor" : "none"}
                />

              </button>
            )}

          </div>


          {/* Title */}

          <h1 className="mt-5 text-4xl font-black">

            {p.title}

          </h1>


          {/* Price */}

          <p className="mt-3 text-3xl font-black text-indigo-600">

            ₹{Number(p.price).toLocaleString("en-IN")}

          </p>


          {/* Description */}

          <p className="mt-6 whitespace-pre-line leading-7 text-slate-600">

            {p.description}

          </p>


          {/* ==================================================
              SELLER
              ================================================== */}

          <div className="mt-7 flex items-center gap-3 border-y py-5">

            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 font-bold">

              {p.sellerName?.[0]?.toUpperCase()}

            </div>


            <div>

              <p className="text-xs text-slate-400">

                Listed by

              </p>

              <b>

                {p.sellerName}

              </b>

            </div>


            <ShieldCheck className="ml-auto text-emerald-500" />

          </div>


          {/* ==================================================
              ERROR
              ================================================== */}

          {error && (

            <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">

              {error}

            </p>

          )}


          {/* ==================================================
              SELLER CONTROLS
              ================================================== */}

          {owner ? (

            <div className="mt-7 flex gap-3">

              <Link
                to={`/sell?edit=${p.id}`}
                className="flex-1 rounded-xl border py-3 text-center font-bold hover:bg-slate-50"
              >

                <Pencil
                  className="mr-2 inline"
                  size={16}
                />

                Edit

              </Link>


              <button
                onClick={del}
                className="rounded-xl border border-rose-200 px-4 text-rose-500 hover:bg-rose-50"
              >

                <Trash2 size={17} />

              </button>

            </div>

          ) : (

            /* ==================================================
               BUYER CONTROLS
               ================================================== */

            <div className="mt-7">


              <button
                disabled={
                  busy ||
                  status !== "AVAILABLE"
                }
                onClick={buy}
                className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >

                {getBuyButtonText()}

              </button>


              {/* Reserved information */}

              {status === "RESERVED" && (

                <div className="mt-4 rounded-2xl bg-amber-50 p-4">

                  <div className="flex gap-3">

                    <Clock
                      size={20}
                      className="mt-0.5 text-amber-600"
                    />

                    <div>

                      <p className="font-bold text-amber-800">

                        Item reserved

                      </p>

                      <p className="mt-1 text-sm text-amber-700">

                        Someone has requested to buy this
                        item. The seller needs to accept
                        or reject the request.

                      </p>

                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>


      {/* ======================================================
          REVIEWS
          ====================================================== */}

      <section className="mt-16 border-t pt-10">

        <div className="flex justify-between">

          <div>

            <p className="text-sm font-bold text-indigo-600">

              Buyer feedback

            </p>

            <h2 className="text-2xl font-black">

              Reviews

            </h2>

          </div>


          <span className="text-sm text-slate-500">

            {rs.length} reviews

          </span>

        </div>


        <div className="mt-6 grid gap-4 md:grid-cols-2">

          {rs.length === 0 ? (

            <p className="text-sm text-slate-400">

              No reviews yet.

            </p>

          ) : (

            rs.map((r) => (

              <div
                key={r.id}
                className="rounded-2xl border bg-white p-5"
              >

                <div className="flex justify-between">

                  <b>

                    {r.reviewerName}

                  </b>

                  <span className="text-xs text-slate-400">

                    {new Date(
                      r.createdAt
                    ).toLocaleDateString()}

                  </span>

                </div>


                <div className="mt-1 flex">

                  {[1, 2, 3, 4, 5].map((n) => (

                    <Star
                      key={n}
                      size={14}
                      className="text-amber-400"
                      fill={
                        n <= r.rating
                          ? "currentColor"
                          : "none"
                      }
                    />

                  ))}

                </div>


                <p className="mt-3 text-slate-600">

                  {r.comment}

                </p>

              </div>

            ))
          )}

        </div>

      </section>

    </div>
  );
}