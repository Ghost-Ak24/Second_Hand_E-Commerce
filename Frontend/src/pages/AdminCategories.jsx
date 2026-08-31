import { useEffect, useState } from "react";
import { api } from "../lib/api";
export default function AdminCategories() {
  const [c, setC] = useState([]),
    [name, setName] = useState(""),
    [e, setE] = useState("");
  async function load() {
    setC(await api.getCategories());
  }
  useEffect(() => {
    load();
  }, []);
  async function add(x) {
    x.preventDefault();
    try {
      await api.createCategory({ name });
      setName("");
      load();
    } catch (x) {
      setE(x.message);
    }
  }
  return (
    <div className="container-page max-w-2xl py-10">
      <p className="text-sm font-bold text-indigo-600">Admin</p>
      <h1 className="text-3xl font-black">Categories</h1>
      <form onSubmit={add} className="mt-7 flex gap-2">
        <input
          required
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category"
        />
        <button className="rounded-xl bg-slate-900 px-5 font-bold text-white">
          Add
        </button>
      </form>
      {e && <p className="mt-3 text-rose-600">{e}</p>}
      <div className="mt-7 space-y-2">
        {c.map((x) => (
          <div
            key={x.id}
            className="flex justify-between rounded-xl border bg-white p-4"
          >
            <b>{x.name}</b>
            <span className="text-slate-400">#{x.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
