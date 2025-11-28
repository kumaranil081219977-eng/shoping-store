import React, { useEffect, useState } from "react";

// Single-file React component for a simple shopping site
// Uses Tailwind CSS classes for styling (assumes Tailwind is available in the host project)
// Features:
// - Simple login (client-side, stored in localStorage)
// - Category catalog (Cloths, Grocery, Games)
// - Search across products
// - Add to cart, view cart
// - Save cart as JSON file (download) and copy cart to clipboard
// - Persist cart and user in localStorage

export default function ShopApp() {
  const sampleProducts = [
    { id: 1, category: "Cloths", name: "Blue T‑Shirt", price: 299, stock: 12 },
    { id: 2, category: "Cloths", name: "Formal Shirt", price: 799, stock: 5 },
    { id: 3, category: "Grocery", name: "Rice 5kg", price: 499, stock: 20 },
    { id: 4, category: "Grocery", name: "Olive Oil 1L", price: 899, stock: 8 },
    { id: 5, category: "Games", name: "Board Game — Strategy", price: 699, stock: 6 },
    { id: 6, category: "Games", name: "Action Figure", price: 349, stock: 10 },
  ];

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [products] = useState(sampleProducts);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("shop_cart");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // persist cart
  useEffect(() => {
    localStorage.setItem("shop_cart", JSON.stringify(cart));
  }, [cart]);

  // persist user
  useEffect(() => {
    const u = localStorage.getItem("shop_user");
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("shop_user", JSON.stringify(user));
    else localStorage.removeItem("shop_user");
  }, [user]);

  function login(e) {
    e.preventDefault();
    // naive client-side login for demo: accept any non-empty email
    if (!email || !password) {
      alert("Please enter email and password (demo)");
      return;
    }
    const u = { email };
    setUser(u);
    setEmail("");
    setPassword("");
  }

  function logout() {
    setUser(null);
  }

  function addToCart(product) {
    setCart((c) => {
      const idx = c.findIndex((it) => it.id === product.id);
      if (idx >= 0) {
        const copy = [...c];
        copy[idx].quantity++;
        return copy;
      }
      return [...c, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(pid) {
    setCart((c) => c.filter((it) => it.id !== pid));
  }

  function changeQty(pid, q) {
    if (q <= 0) return removeFromCart(pid);
    setCart((c) => c.map((it) => (it.id === pid ? { ...it, quantity: q } : it)));
  }

  function filteredProducts() {
    return products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });
  }

  function cartTotal() {
    return cart.reduce((s, it) => s + it.price * it.quantity, 0);
  }

  function downloadCart() {
    const data = JSON.stringify(cart, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cart.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyCart() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(cart, null, 2));
      alert("Cart copied to clipboard!");
    } catch (e) {
      alert("Could not copy. Please allow clipboard permission or try manually.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">SimpleShop</h1>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex gap-2">
            {["All", "Cloths", "Grocery", "Games"].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-sm border ${category === c ? "bg-indigo-600 text-white" : "bg-white"}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="px-3 py-2 border rounded w-56"
            />
          </div>

          {!user ? (
            <button
              onClick={() => {
                const form = document.getElementById("login-form");
                if (form) form.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Login
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm">{user.email}</span>
              <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <section className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts().map((p) => (
              <article key={p.id} className="bg-white p-4 rounded shadow">
                <div className="h-28 w-full mb-3 rounded bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-xs text-gray-600">Image</div>
                </div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.category}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold">₹{p.price}</div>
                    <div className="text-xs text-gray-400">Stock: {p.stock}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => addToCart(p)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => alert(`Product details:\n${p.name} — ₹${p.price} — stock ${p.stock}`)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {filteredProducts().length === 0 && (
              <div className="col-span-full text-center text-gray-500">No products match your search.</div>
            )}
          </div>
        </section>

        <aside className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Your Cart</h2>
          {cart.length === 0 ? (
            <div className="text-sm text-gray-500">Cart is empty.</div>
          ) : (
            <div className="space-y-3">
              {cart.map((it) => (
                <div key={it.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-gray-500">₹{it.price} × {it.quantity}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) => changeQty(it.id, Number(e.target.value))}
                      className="w-16 px-2 py-1 border rounded text-sm"
                    />
                    <button onClick={() => removeFromCart(it.id)} className="px-2 py-1 border rounded">Remove</button>
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Total</div>
                  <div className="font-bold">₹{cartTotal()}</div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => alert('Opening Razorpay (demo)...');
                    // TODO: Integrate real Razorpay checkout here...')} className="px-3 py-2 bg-green-600 text-white rounded text-sm">Pay Now (Razorpay)</button>
                  <button onClick={downloadCart} className="px-3 py-2 bg-gray-800 text-white rounded text-sm">Save</button>
                  <button onClick={copyCart} className="px-3 py-2 border rounded text-sm">Copy</button>
                  <button onClick={() => { setCart([]); }} className="px-3 py-2 border rounded text-sm">Clear</button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">Tip: Login to keep your cart linked to your browser (demo).</div>
        <div className="mt-4 p-3 border rounded bg-gray-50 text-sm">
            <h3 className="font-semibold mb-2">Order History</h3>
            <p>Order history feature coming soon. (Backend required)</p>
          </div>
        </aside>

        <section id="login-form" className="md:col-span-3 bg-white p-4 rounded shadow mt-4">
          {!user ? (
            <form onSubmit={login} className="max-w-md">
              <h2 className="font-semibold mb-3">Login (demo)</h2>
              <div className="mb-2">
                <label className="block text-sm">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="mb-2">
                <label className="block text-sm">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
                <button type="button" onClick={() => { setEmail('demo@demo.com'); setPassword('demo'); }} className="px-4 py-2 border rounded">Fill demo</button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="font-semibold">Welcome back,</h2>
              <div className="text-sm text-gray-700">{user.email}</div>
              <div className="mt-3">
                <button onClick={logout} className="px-3 py-2 border rounded">Logout</button>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-8 text-center text-sm text-gray-500">Built as a demo shopping site • Customize as needed</footer>
    </div>
  );
}
