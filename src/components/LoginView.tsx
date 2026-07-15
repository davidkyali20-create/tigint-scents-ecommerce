import React, { useState } from "react";
import { User, LogIn, UserPlus } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (user: { id: string; name: string; email: string; phone: string }) => void;
  onGoToShop: () => void;
}

export default function LoginView({ onLoginSuccess, onGoToShop }: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const endpoint = isRegistering ? "/api/register" : "/api/login";
    const payload = isRegistering 
      ? { name, email, phone, password }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        if (isRegistering) {
          setSuccessMessage(data.message || "Registration successful! You can now sign in.");
          setIsRegistering(false);
          // Set registration values empty for sign in security
          setEmail("");
          setPassword("");
        } else {
          onLoginSuccess(data.user);
        }
      } else {
        setErrorMessage(data.message || "An error occurred. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error connecting to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-[#ecd1cc] rounded-2xl overflow-hidden shadow-sm mt-4 text-left">
      {/* Header decoration */}
      <div className="bg-[#6e1329] p-6 text-center text-white space-y-1">
        <div className="w-12 h-12 bg-[#cca43b] text-black rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm font-bold">
          TS
        </div>
        <h3 className="text-lg font-black font-display uppercase tracking-wider">
          {isRegistering ? "Create Your Account" : "Welcome Back"}
        </h3>
        <p className="text-xs text-rose-100/90 leading-relaxed">
          {isRegistering 
            ? "Join Tigint Scents to track wholesale order delivery and customize scent portfolios." 
            : "Access your Jumia-style reseller portal and checkout instantly."}
        </p>
      </div>

      <div className="p-6 space-y-4">
        {errorMessage && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 text-green-800 text-xs p-3 rounded-lg border border-green-200 font-medium">
            🎉 {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Kyali"
                  className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Phone Number / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0794594222"
                  className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329] font-mono"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@tigintscents.com"
              className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#cca43b] text-zinc-950 font-black uppercase tracking-widest rounded-lg text-xs hover:bg-[#b8912e] transition duration-150 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
            ) : isRegistering ? (
              <>
                <UserPlus size={14} /> Register & Join
              </>
            ) : (
              <>
                <LogIn size={14} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="border-t border-[#f5e3e0] pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className="text-[#6e1329] hover:text-[#500c1c] text-xs font-bold transition cursor-pointer"
          >
            {isRegistering 
              ? "Already have an account? Sign In" 
              : "New reseller or customer? Create an Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
