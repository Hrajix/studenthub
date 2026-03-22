import { Outlet, NavLink, useNavigate } from "react-router";
import { Calendar, BookOpen, FolderOpen, GraduationCap, Bell, LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { supabase } from "../../lib/supabase";

export default function Layout() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Stavy pro uživatele a načítání
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Zkusíme, jestli už Supabase session našel sám
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        setLoading(false);
        return;
      }

      // 2. RUČNÍ EXTRAKCE (pokud Supabase selhal kvůli HashRouteru)
      const hash = window.location.hash;
      if (hash.includes("access_token=")) {
        // Rozbijeme URL a najdeme část s tokenem
        const tokenMatch = hash.match(/access_token=([^&]*)/);
        const refreshMatch = hash.match(/refresh_token=([^&]*)/);

        if (tokenMatch) {
          const { data } = await supabase.auth.setSession({
            access_token: tokenMatch[1],
            refresh_token: refreshMatch ? refreshMatch[1] : "",
          });
          if (data.session) {
            setUser(data.session.user);
            setLoading(false);
            return;
          }
        }
      }
      
      // Pokud nic nepomohlo do 2 sekund, jdi na login
      setTimeout(() => {
        setLoading(false);
        // Tady můžeš nechat navigate("/login"), pokud session fakt není
      }, 2000);
    };

    initAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Navigaci řeší onAuthStateChange výše
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // 3. Loading obrazovka (točící se kolečko)
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">Ověřování uživatele...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/panel", icon: Calendar, label: "Dashboard", exact: true },
    { to: "/panel/rozvrh", icon: Calendar, label: "Rozvrh" },
    { to: "/panel/zapisnik", icon: BookOpen, label: "Zápisník" },
    { to: "/panel/materialy", icon: FolderOpen, label: "Materiály" },
    { to: "/panel/testy", icon: GraduationCap, label: "Testy" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white">📚</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">StudentHub</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Study Organizer</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`} 
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 object-cover border border-gray-100 dark:border-gray-600"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                {user?.user_metadata?.full_name || "Student"}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Odhlásit se
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end px-6 gap-3">
          <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            {mounted && (theme === "dark" ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600" />)}
          </button>
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}