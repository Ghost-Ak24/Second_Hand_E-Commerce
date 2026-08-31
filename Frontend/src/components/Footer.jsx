import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white">
      <div className="container-page flex flex-col justify-between gap-3 py-8 text-sm text-slate-500 sm:flex-row">
        <span>© {new Date().getFullYear()} CampusMarket</span>
        <div className="flex gap-5">
          <Link to="/products">Marketplace</Link>
          <Link to="/sell">Sell</Link>
        </div>
      </div>
    </footer>
  );
}
