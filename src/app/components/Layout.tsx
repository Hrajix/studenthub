import { Outlet, NavLink, useNavigate } from "react-router";
import { Calendar, BookOpen, FolderOpen, GraduationCap, Bell, LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("studenthub_user");
    if (!userData) {
      navigate("/home");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("studenthub_user");
    navigate("/home");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!user) return null;

  const navItems = [
    { to: "/", icon: Calendar, label: "Dashboard", exact: true },
    { to: "/rozvrh", icon: Calendar, label: "Rozvrh" },
    { to: "/zapisnik", icon: BookOpen, label: "Zápisník" },
    { to: "/materialy", icon: FolderOpen, label: "Materiály" },
    { to: "/testy", icon: GraduationCap, label: "Testy" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo */}
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

        {/* Navigation */}
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
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Odhlásit se
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end px-6 gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}