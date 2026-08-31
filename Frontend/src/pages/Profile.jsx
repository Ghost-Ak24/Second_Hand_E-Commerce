import { useAuth } from "../context/AuthContext";
export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="container-page py-10">
      <div className="max-w-2xl rounded-3xl border bg-white p-8">
        <p className="text-sm font-bold text-indigo-600">Account</p>
        <h1 className="mt-1 text-3xl font-black">Your profile</h1>
        <div className="mt-8 divide-y">
          {[
            ["Name", user.name],
            ["Email", user.email],
            ["Role", user.role],
          ].map(([a, b]) => (
            <div key={a} className="flex justify-between py-4">
              <span className="text-slate-500">{a}</span>
              <b>{b}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
