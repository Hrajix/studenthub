import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Plus, Calendar, Bell, FileText, Clock } from "lucide-react";
import { useState } from "react";

export default function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddTest, setShowAddTest] = useState(false);

  // Mock class data
  const classData = {
    id: classId,
    subject: "Matematika",
    teacher: "Mgr. Novák",
    room: "A201",
    color: "bg-blue-500",
    schedule: "Pondělí 08:00 - 09:30",
  };

  const notes = [
    {
      id: 1,
      content: "Nezapomenout na domácí úkol - strany 45-47",
      expiresIn: "2 dny",
      createdAt: "před 2 hodinami",
    },
    {
      id: 2,
      content: "Příští hodinu bude test na derivace",
      expiresIn: "5 dnů",
      createdAt: "včera",
    },
  ];

  const tests = [
    {
      id: 1,
      type: "Písemka",
      topic: "Integrály",
      date: "2026-03-22",
      hasNotification: true,
      materials: ["Učebnice str. 120-145", "Sbírka úloh"],
    },
    {
      id: 2,
      type: "Malá písemka",
      topic: "Derivace",
      date: "2026-03-20",
      hasNotification: true,
      materials: ["Zápisník - poznámky", "Domácí úkoly"],
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate("/panel/rozvrh")}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Zpět na rozvrh
      </button>

      {/* Class Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 ${classData.color} rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
            M
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {classData.subject}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {classData.schedule}
              </span>
              <span>Učitel: {classData.teacher}</span>
              <span>Místnost: {classData.room}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Poznámky
              </h2>
              <button
                onClick={() => setShowAddNote(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Přidat poznámku
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-gray-900 dark:text-white flex-1">{note.content}</p>
                  <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {note.expiresIn}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{note.createdAt}</p>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Zatím žádné poznámky
              </div>
            )}
          </div>
        </div>

        {/* Tests Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Testy a zkoušky
              </h2>
              <button
                onClick={() => setShowAddTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Přidat test
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {tests.map((test) => (
              <div
                key={test.id}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {test.type}
                      </h3>
                      {test.hasNotification && (
                        <Bell className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {test.topic}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {test.date}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Studijní materiály:
                  </p>
                  {test.materials.map((material, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <FileText className="w-3 h-3" />
                      {material}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {tests.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Zatím žádné testy
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Note Modal (simplified) */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Přidat poznámku
            </h3>
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              rows={4}
              placeholder="Napište poznámku..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddNote(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
              >
                Zrušit
              </button>
              <button
                onClick={() => setShowAddNote(false)}
                className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                Přidat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Test Modal (simplified) */}
      {showAddTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Přidat test
            </h3>
            <div className="space-y-4 mb-4">
              <input
                type="text"
                placeholder="Název testu"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Téma..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddTest(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
              >
                Zrušit
              </button>
              <button
                onClick={() => setShowAddTest(false)}
                className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                Přidat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
