import {
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  Star,
  XCircle,
  ShoppingBag,
  Package,
} from "lucide-react";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";


export default function Orders() {

  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [sellingOrders, setSellingOrders] = useState([]);

  const [activeTab, setActiveTab] = useState("purchases");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [form, setForm] = useState({
    rating: 5,
    comment: "",
  });


  /*
   * ============================================================
   * LOAD BUYER + SELLER ORDERS
   * ============================================================
   */
  async function loadOrders() {

    try {

      setLoading(true);
      setError("");

      const [buyerOrders, sellerOrders] = await Promise.all([
        api.myOrders(),
        api.sellingOrders(),
      ]);

      setOrders(buyerOrders || []);
      setSellingOrders(sellerOrders || []);

    } catch (e) {

      setError(
        e.message || "Unable to load orders"
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    loadOrders();

  }, []);


  /*
   * ============================================================
   * SELLER ACCEPTS REQUEST
   * ============================================================
   *
   * PENDING
   *    ↓
   * ACCEPTED
   *
   * Product:
   * RESERVED -> SOLD
   */
  async function acceptOrder(orderId) {

    const confirmed =
      window.confirm(
        "Accept this buyer's purchase request?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setActionLoading(orderId);
      setError("");

      await api.acceptOrder(orderId);

      await loadOrders();

      alert(
        "Buyer accepted. The item is now sold."
      );

    } catch (e) {

      alert(
        e.message || "Unable to accept order"
      );

    } finally {

      setActionLoading(null);

    }
  }


  /*
   * ============================================================
   * SELLER REJECTS REQUEST
   * ============================================================
   *
   * PENDING
   *    ↓
   * REJECTED
   *
   * Product:
   * RESERVED -> AVAILABLE
   */
  async function rejectOrder(orderId) {

    const confirmed =
      window.confirm(
        "Reject this buyer's purchase request?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setActionLoading(orderId);
      setError("");

      await api.rejectOrder(orderId);

      await loadOrders();

      alert(
        "Buyer rejected. The item is live again."
      );

    } catch (e) {

      alert(
        e.message || "Unable to reject order"
      );

    } finally {

      setActionLoading(null);

    }
  }


  /*
   * ============================================================
   * REVIEW
   * ============================================================
   */
  async function submitReview(e) {

    e.preventDefault();

    if (!selectedOrder) {
      return;
    }

    try {

      await api.createReview({
        orderId: selectedOrder.id,
        rating: Number(form.rating),
        comment: form.comment,
      });

      setSelectedOrder(null);

      setForm({
        rating: 5,
        comment: "",
      });

      alert("Review submitted successfully.");

    } catch (e) {

      alert(
        e.message || "Unable to submit review"
      );

    }
  }


  /*
   * ============================================================
   * STATUS BADGE
   * ============================================================
   */
  function StatusBadge({ status }) {

    if (status === "PENDING") {

      return (
        <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">

          <Clock3 size={14} />

          Pending

        </span>
      );
    }


    if (status === "ACCEPTED") {

      return (
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">

          <CheckCircle2 size={14} />

          Accepted

        </span>
      );
    }


    if (status === "REJECTED") {

      return (
        <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">

          <XCircle size={14} />

          Rejected

        </span>
      );
    }


    return (
      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">

        {status}

      </span>
    );
  }


  /*
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (loading) {
    return <Loader />;
  }


  /*
   * ============================================================
   * PAGE
   * ============================================================
   */
  return (

    <div className="container-page py-10">


      {/* ======================================================
          HEADER
          ====================================================== */}

      <p className="text-sm font-bold text-indigo-600">

        Your activity

      </p>

      <h1 className="mt-1 text-3xl font-black">

        Orders

      </h1>

      <p className="mt-2 text-slate-500">

        Manage your purchases and selling requests.

      </p>


      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (

        <div className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-600">

          {error}

        </div>

      )}


      {/* ======================================================
          TABS
          ====================================================== */}

      <div className="mt-8 flex w-full max-w-xl rounded-2xl bg-slate-100 p-1">

        <button
          onClick={() => setActiveTab("purchases")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
            activeTab === "purchases"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >

          <ShoppingBag size={17} />

          My Purchases

        </button>


        <button
          onClick={() => setActiveTab("selling")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
            activeTab === "selling"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >

          <Package size={17} />

          Selling Requests

        </button>

      </div>


      {/* ======================================================
          BUYER ORDERS
          ====================================================== */}

      {activeTab === "purchases" && (

        <section className="mt-6">


          {orders.length === 0 ? (

            <div className="rounded-3xl border border-dashed bg-white py-20 text-center">

              <ShoppingBag
                className="mx-auto text-slate-300"
                size={40}
              />

              <b className="mt-4 block">

                No purchases yet

              </b>

              <p className="mt-1 text-sm text-slate-400">

                Items you request to buy will appear here.

              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {orders.map((order) => (

                <div
                  key={order.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >


                  {/* Order header */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                      <p className="text-xs font-bold text-slate-400">

                        ORDER #{order.id}

                      </p>

                      <h2 className="mt-1 text-lg font-bold">

                        {order.productTitle}

                      </h2>

                      <p className="mt-1 text-sm text-slate-500">

                        ₹
                        {Number(
                          order.amount
                        ).toLocaleString("en-IN")}

                      </p>

                    </div>


                    <StatusBadge
                      status={order.status}
                    />

                  </div>


                  {/* Seller information */}

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">

                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                      Seller

                    </p>


                    <p className="mt-2 font-bold">

                      {order.sellerName || "Seller"}

                    </p>


                    {/* Contact seller */}

                    {order.status === "ACCEPTED" && (

                      <div className="mt-3 flex flex-wrap gap-3">

                        {order.sellerEmail && (

                          <a
                            href={`mailto:${order.sellerEmail}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                          >

                            <Mail size={15} />

                            Contact Seller

                          </a>

                        )}

                      </div>
                    )}


                    {order.status === "PENDING" && (

                      <p className="mt-2 text-sm text-slate-500">

                        Waiting for the seller to accept
                        your purchase request.

                      </p>
                    )}


                    {order.status === "REJECTED" && (

                      <p className="mt-2 text-sm text-rose-500">

                        The seller rejected this request.
                        The item may be available again.

                      </p>
                    )}

                  </div>


                  {/* Review */}

                  {order.status === "ACCEPTED" && (

                    <div className="mt-4 flex justify-end">

                      <button
                        onClick={() =>
                          setSelectedOrder(order)
                        }
                        className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold hover:bg-slate-50"
                      >

                        <Star
                          size={15}
                        />

                        Review

                      </button>

                    </div>
                  )}

                </div>

              ))}

            </div>
          )}

        </section>
      )}


      {/* ======================================================
          SELLER REQUESTS
          ====================================================== */}

      {activeTab === "selling" && (

        <section className="mt-6">


          {sellingOrders.length === 0 ? (

            <div className="rounded-3xl border border-dashed bg-white py-20 text-center">

              <Package
                className="mx-auto text-slate-300"
                size={40}
              />

              <b className="mt-4 block">

                No selling requests

              </b>

              <p className="mt-1 text-sm text-slate-400">

                Purchase requests for your products
                will appear here.

              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {sellingOrders.map((order) => (

                <div
                  key={order.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >


                  {/* Product information */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                      <p className="text-xs font-bold text-slate-400">

                        REQUEST #{order.id}

                      </p>

                      <h2 className="mt-1 text-lg font-bold">

                        {order.productTitle}

                      </h2>

                      <p className="mt-1 text-sm text-slate-500">

                        ₹
                        {Number(
                          order.amount
                        ).toLocaleString("en-IN")}

                      </p>

                    </div>


                    <StatusBadge
                      status={order.status}
                    />

                  </div>


                  {/* Buyer information */}

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">

                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">

                      Buyer

                    </p>


                    <p className="mt-2 font-bold">

                      {order.buyerName || "Buyer"}

                    </p>


                    {order.buyerEmail && (

                      <a
                        href={`mailto:${order.buyerEmail}`}
                        className="mt-1 inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                      >

                        <Mail size={14} />

                        {order.buyerEmail}

                      </a>
                    )}

                  </div>


                  {/* ==================================================
                      SELLER ACTIONS
                      ================================================== */}

                  {order.status === "PENDING" && (

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                      <button
                        disabled={
                          actionLoading === order.id
                        }
                        onClick={() =>
                          acceptOrder(order.id)
                        }
                        className="flex-1 rounded-xl bg-emerald-600 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >

                        {actionLoading === order.id
                          ? "Processing..."
                          : "Accept Buyer"}

                      </button>


                      <button
                        disabled={
                          actionLoading === order.id
                        }
                        onClick={() =>
                          rejectOrder(order.id)
                        }
                        className="flex-1 rounded-xl border border-rose-200 py-3 font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        Reject Request

                      </button>

                    </div>
                  )}


                  {/* Accepted information */}

                  {order.status === "ACCEPTED" && (

                    <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">

                      <div className="flex items-center gap-2 font-bold">

                        <CheckCircle2 size={17} />

                        Buyer accepted

                      </div>

                      <p className="mt-1">

                        This item has been marked as sold.

                      </p>

                    </div>
                  )}


                  {/* Rejected information */}

                  {order.status === "REJECTED" && (

                    <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">

                      This request was rejected.
                      The product is available again.

                    </div>
                  )}

                </div>

              ))}

            </div>
          )}

        </section>
      )}


      {/* ======================================================
          REVIEW MODAL
          ====================================================== */}

      {selectedOrder && (

        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">

          <form
            onSubmit={submitReview}
            className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl"
          >

            <h2 className="text-xl font-black">

              Review {selectedOrder.productTitle}

            </h2>


            <p className="mt-1 text-sm text-slate-500">

              Share your experience with this purchase.

            </p>


            {/* Rating */}

            <label className="mt-5 block">

              <span className="label">

                Rating

              </span>

              <select
                className="field mt-2"
                value={form.rating}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rating: e.target.value,
                  })
                }
              >

                {[5, 4, 3, 2, 1].map((n) => (

                  <option
                    key={n}
                    value={n}
                  >

                    {n} Star{n !== 1 ? "s" : ""}

                  </option>

                ))}

              </select>

            </label>


            {/* Comment */}

            <textarea
              required
              rows="4"
              className="field mt-4"
              value={form.comment}
              onChange={(e) =>
                setForm({
                  ...form,
                  comment: e.target.value,
                })
              }
              placeholder="Your experience..."
            />


            {/* Buttons */}

            <div className="mt-4 flex gap-2">

              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);

                  setForm({
                    rating: 5,
                    comment: "",
                  });
                }}
                className="flex-1 rounded-xl border py-3 font-bold"
              >

                Cancel

              </button>


              <button
                type="submit"
                className="flex-1 rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-800"
              >

                Submit

              </button>

            </div>

          </form>

        </div>
      )}

    </div>
  );
}