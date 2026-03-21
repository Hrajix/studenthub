import { useNavigate } from "react-router";
import { Calendar, BookOpen, FolderOpen, GraduationCap, Chrome, ArrowRight, Check, Sparkles, Users, Zap, Shield, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
// 1. Importujeme HashLink
import { HashLink } from 'react-router-hash-link';
import { useUser } from "@clerk/clerk-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Pokud je přihlášený a je na hlavní stránce, pošli ho do panelu
      navigate("/panel");
    }
  }, [isSignedIn, isLoaded, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: Calendar,
      title: "Rozvrh",
      description: "Jednoduše spravuj svůj týdenní rozvrh s možností přetahování hodin a organizace podle sudých a lichých týdnů.",
      color: "from-blue-500 to-cyan-500",
      lightBg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: BookOpen,
      title: "Zápisník",
      description: "Piš poznámky ve stylu Notion s bohatým textovým editorem nebo kresli náčrty a diagramy přímo v aplikaci.",
      color: "from-green-500 to-emerald-500",
      lightBg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: FolderOpen,
      title: "Materiály",
      description: "Všechny studijní materiály na jednom místě. PDF, obrázky, prezentace - vše perfektně organizované podle předmětů.",
      color: "from-orange-500 to-amber-500",
      lightBg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      icon: GraduationCap,
      title: "AI Testy",
      description: "Nech si vygenerovat personalizované testy z tvých materiálů pomocí AI a získej doporučení, co procvičit.",
      color: "from-purple-500 to-pink-500",
      lightBg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Úspora času",
      description: "Vše, co potřebuješ ke studiu, na jednom místě. Konec hledání poznámek a materiálů.",
    },
    {
      icon: Sparkles,
      title: "AI asistent",
      description: "Personalizované testy a doporučení ti pomohou efektivně se připravit na zkoušky.",
    },
    {
      icon: Shield,
      title: "Bezpečné úložiště",
      description: "Tvoje data jsou v bezpečí. Přístup kdykoli a odkudkoli.",
    },
    {
      icon: Users,
      title: "Pro všechny studenty",
      description: "Ať už jsi na střední, vysoké škole nebo se připravuješ na přijímačky.",
    },
  ];

  const testimonials = [
    {
      name: "Anna K.",
      role: "Gymnázium, 3. ročník",
      content: "StudentHub mi úplně změnil přístup ke studiu. Mám všechno na jednom místě a AI testy mi pomohly připravit se na maturity.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
    },
    {
      name: "Tomáš N.",
      role: "Univerzita Karlova",
      content: "Konečně aplikace, která skutečně rozumí potřebám studentů. Rozvrh s přetahováním je geniální!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tomas",
    },
    {
      name: "Petra Š.",
      role: "Technická univerzita",
      content: "Díky zápisníku a organizaci materiálů jsem zvýšila svou produktivitu o 50%. Doporučuji!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Petra",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Přihlas se přes Google",
      description: "Jednoduché přihlášení pomocí tvého Google účtu. Žádná složitá registrace.",
      icon: Chrome,
    },
    {
      number: "02",
      title: "Nahraj materiály a vytvoř rozvrh",
      description: "Přidej své předměty, nahraj studijní materiály a nastav si rozvrh hodin.",
      icon: Calendar,
    },
    {
      number: "03",
      title: "Nech si pomoct AI s učením",
      description: "Využij AI pro generování testů a získej personalizovaná doporučení pro lepší studium.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 scroll-smooth">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-xl">📚</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">StudentHub</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {/* Upravené na HashLink */}
              <HashLink smooth to="/#features" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Funkce
              </HashLink>
              <HashLink smooth to="/#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Jak to funguje
              </HashLink>
              
              <button
                onClick={() => navigate("/login")}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Přihlásit se
              </button>
              <button
                onClick={handleGetStarted}
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all hover:shadow-lg"
              >
                Začít zdarma
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-4 pb-4 space-y-3"
            >
              {/* Upravené na HashLink s onClick pro zavření menu */}
              <HashLink 
                smooth to="/#features" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Funkce
              </HashLink>
              <HashLink 
                smooth to="/#how-it-works" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Jak to funguje
              </HashLink>
              
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Přihlásit se
              </button>
              <button
                onClick={() => {
                  handleGetStarted();
                  setMobileMenuOpen(false);
                }}
                className="block w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
              >
                Začít zdarma
              </button>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Nová generace studijních nástrojů</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Organizuj své studium{" "}
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  chytřeji
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Rozvrh, poznámky, materiály a AI testy - vše na jednom místě. 
                StudentHub je tvůj osobní asistent pro efektivní učení.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleGetStarted}
                  className="group px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span className="font-medium">Začít zdarma</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Chrome className="w-5 h-5" />
                  <span className="font-medium">Pokračovat s Googlem</span>
                </button>
              </div>

              <div className="flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Zdarma navždy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Bez kreditní karty</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Product Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">📚</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">StudentHub</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Dashboard</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Rozvrh</span>
                        </div>
                        <div className="h-1.5 bg-blue-500 rounded-full w-3/4"></div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Poznámky</span>
                        </div>
                        <div className="h-1.5 bg-green-500 rounded-full w-2/3"></div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Dnešní rozvrh</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">3 hodiny</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                          <div>
                            <div className="text-xs font-medium text-gray-900 dark:text-white">08:00 - Matematika</div>
                            <div className="text-[10px] text-gray-500">Učebna 204</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                          <div>
                            <div className="text-xs font-medium text-gray-900 dark:text-white">09:45 - Český jazyk</div>
                            <div className="text-[10px] text-gray-500">Učebna 112</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 z-20"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">AI Testy</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 z-20"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Vše na jednom místě</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-gray-900 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Vše, co potřebuješ ke studiu
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Komplexní sada nástrojů navržená tak, aby ti usnadnila každodenní studentský život.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all h-full hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50 dark:bg-gray-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Jak to funguje
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Začni používat StudentHub během pár minut.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20"></div>
                )}
                
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all h-full text-center">
                  <div className="text-5xl font-black text-indigo-500/10 mb-2">{step.number}</div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 mx-auto shadow-md">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Co říkají studenti
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Přidej se k tisícům spokojených uživatelů.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-600 shadow-sm flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full bg-indigo-100"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic flex-grow">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 z-0"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Připraven ovládnout své studium?
            </h2>
            <p className="text-xl text-indigo-100 mb-10 leading-relaxed">
              Zaregistruj se zdarma a začni používat všechny nástroje StudentHubu ještě dnes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="group px-10 py-4 bg-white text-indigo-600 rounded-xl transition-all hover:shadow-2xl flex items-center justify-center gap-2 font-bold"
              >
                <span>Vytvořit účet zdarma</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-10 py-4 bg-indigo-700 hover:bg-indigo-800 text-white border-2 border-white/20 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
              >
                Přihlásit se
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📚</span>
                </div>
                <span className="text-xl font-bold text-white">StudentHub</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Moderní platforma pro studenty, kteří chtějí mít své studium pod kontrolou.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Produkt</h4>
              <ul className="space-y-4">
                {/* Footer odkazy také na HashLink */}
                <li><HashLink smooth to="/#features" className="text-gray-400 hover:text-white transition-colors text-sm">Funkce</HashLink></li>
                <li><HashLink smooth to="/#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">Jak to funguje</HashLink></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
            <p>© 2026 StudentHub. Všechna práva vyhrazena.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}