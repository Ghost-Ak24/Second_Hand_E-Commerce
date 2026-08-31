import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Laptop,
  ShoppingBag,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
export default function Home() {
  return (
    <>
      <section className="hero-grid border-b bg-white">
        <div className="container-page grid min-h-[590px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
              Student-first marketplace
            </span>
            <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight sm:text-6xl">
              Give good stuff a{" "}
              <span className="text-indigo-600">second life.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Buy affordable pre-owned essentials from people around you, or
              turn things you no longer need into cash.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white"
              >
                Explore marketplace <ArrowRight size={17} />
              </Link>
              <Link
                to="/sell"
                className="rounded-full border px-6 py-3.5 text-sm font-bold"
              >
                Sell something
              </Link>
            </div>
            <div className="mt-10 flex gap-7 text-sm text-slate-500">
              <span className="flex gap-2">
                <ShieldCheck size={17} className="text-emerald-500" />
                Secure accounts
              </span>
              <span className="flex gap-2">
                <BadgeCheck size={17} className="text-indigo-500" />
                Verified purchases
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Laptop & Tech", Laptop],
              ["Books", BookOpen],
              ["Campus gear", ShoppingBag],
              ["Student community", Users],
            ].map(([x, I]) => (
              <div
                key={x}
                className="rounded-3xl border bg-white p-6 shadow-xl shadow-slate-900/5"
              >
                <div className="mb-12 grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <I size={21} />
                </div>
                <b>{x}</b>
                <p className="mt-1 text-xs text-slate-400">Browse listings</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container-page py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [
              "01",
              "Browse locally",
              "Find useful items without noisy listings.",
            ],
            [
              "02",
              "Buy with confidence",
              "Reviews are tied to completed purchases.",
            ],
            [
              "03",
              "Sell in minutes",
              "Create a listing and get it live quickly.",
            ],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-3xl border bg-white p-7">
              <span className="text-xs font-black text-indigo-500">{n}</span>
              <h2 className="mt-10 text-xl font-bold">{t}</h2>
              <p className="mt-2 leading-6 text-slate-500">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
