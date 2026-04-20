import { Calendar, Clock, BookOpen, AlertCircle, TrendingUp, CalendarCheck } from "lucide-react";
import { useEffect, useState, useMemo } from "react"; // Přidán useMemo
import { Link } from "react-router";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [schedule, setSchedule] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [activeWeekView, setActiveWeekView] = useState<'odd' | 'even'>('odd');

  useEffect(() => {
    const fetchTodayData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('schedule')
        .select('schedule_info')
        .eq('user', user.id)
        .maybeSingle();

      if (data?.schedule_info) {
        setSchedule(data.schedule_info.blocks || []);
        setTimeSlots(data.schedule_info.timeSlots || []);
        setActiveWeekView(data.schedule_info.activeWeekView || 'odd');
      }
    };

    fetchTodayData();
  }, []);

  // --- TADY JE TA CHYBĚJÍCÍ ČÁST ---
  const todaySchedule = useMemo(() => {
    const now = new Date();
    // Převod: Neděle(0) -> 6, Pondělí(1) -> 0...
    const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;

    const formatTime = (slotIndex: number, duration?: number) => {
      if (!Array.isArray(timeSlots) || timeSlots.length === 0) return "Neznámý čas";
      const startIdx = Math.max(0, Math.min(slotIndex || 0, timeSlots.length - 1));
      const startSlot = timeSlots[startIdx] || "";
      if (!duration || duration <= 1) return startSlot || "Neznámý čas";
      const endIdx = Math.min(startIdx + (duration - 1), timeSlots.length - 1);
      const endSlot = timeSlots[endIdx] || "";
      const startPart = (startSlot && startSlot.split("-")[0]) || startSlot;
      const endPart = (endSlot && endSlot.split("-")[1]) || endSlot;
      if (startPart && endPart) return `${startPart}-${endPart}`;
      return startSlot || "Neznámý čas";
    };

    return schedule
      .filter((item) => item.day === currentDayIndex && (!item.week || item.week === 'all' || item.week === activeWeekView))
      .sort((a, b) => a.timeSlot - b.timeSlot)
      .map((item) => ({
        ...item,
        // Propojíme index slotu s reálným časem z timeSlots (bere v úvahu `duration`)
        time: formatTime(item.timeSlot, (item as any).duration),
      }));
  }, [schedule, timeSlots, activeWeekView]);
  // --------------------------------

  const upcomingTests = [
    { id: 1, subject: "Matematika", date: "2026-03-22", type: "Písemka", topic: "Integrály", daysLeft: 4 },
    { id: 2, subject: "Angličtina", date: "2026-03-25", type: "Test", topic: "Grammar", daysLeft: 7 },
    { id: 3, subject: "Dějepis", date: "2026-03-28", type: "Ústní", topic: "Druhá světová válka", daysLeft: 10 },
  ];

  const quickNotes = [
    { id: 1, subject: "Matematika", note: "Nezapomenout na domácí úkol str. 45-47", time: "před 2 hodinami" },
    { id: 2, subject: "Fyzika", note: "Připravit prezentaci o kvantové mechanice", time: "včera" },
  ];

  const stats = [
    { label: "Hotové úkoly", value: "12/15", icon: BookOpen, color: "text-green-500" },
    { label: "Nadcházející testy", value: "3", icon: AlertCircle, color: "text-orange-500" },
    { label: "Studijní materiály", value: "47", icon: TrendingUp, color: "text-blue-500" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Vítej zpět! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 capitalize">
          Dnes je {new Date().toLocaleDateString("cs-CZ", { weekday: "long"})}, {new Date().toLocaleDateString("cs-CZ", {day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-700 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Dnešní rozvrh
              </h2>
              <Link
                to="/panel/rozvrh"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Zobrazit vše
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((item) => (
                <div
                  key={item.id}
                  className="flex items-stretch gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* Barevný proužek - opraveno pro HSL objekty */}
                  <div 
                    className="w-1.5 rounded-full" 
                    style={{ 
                      backgroundColor: item.color 
                        ? `hsl(${item.color.h}, ${item.color.s}%, ${item.color.l}%)` 
                        : '#6366f1' 
                    }}
                  ></div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.subject}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.room || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.time}
                      </span>
                      <span>{item.teacher}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <CalendarCheck className="w-12 h-12 mb-2 opacity-20" />
                <p>Dnes nemáš žádné hodiny. 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tests */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Nadcházející testy
              </h2>
              <Link
                to="/panel/testy"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Zobrazit vše
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {upcomingTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {test.subject}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {test.topic}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {test.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium">
                    {test.daysLeft} dní
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {test.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Rychlé poznámky
              </h2>
              <Link
                to="/panel/zapisnik"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Zobrazit vše
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {quickNotes.map((note) => (
              <div
                key={note.id}
                className="flex items-start gap-3 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30"
              >
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {note.subject}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      • {note.time}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{note.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}