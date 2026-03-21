import { useNavigate } from "react-router";
import { Chrome, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem("studenthub_user");
    if (isLoggedIn) {
      navigate("/panel");
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    // Mock Google OAuth login
    const mockUser = {
      name: "Jan Novák",
      email: "jan.novak@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jan",
    };
    localStorage.setItem("studenthub_user", JSON.stringify(mockUser));
    navigate("/panel");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Back to Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Zpět na hlavní stránku</span>
      </button>
      
      <div className="relative w-full max-w-md px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <span className="text-white text-2xl">📚</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              StudentHub
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Organize your study life with ease
            </p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-md group"
          >
            <Chrome className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Continue with Google
            </span>
          </button>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          © 2026 StudentHub. Made for students, by students.
        </div>
      </div>
    </div>
  );
}