import { useState } from "react";
import { Plus, Search, BookOpen, Palette, Type, Bold, Italic, List as ListIcon, Image as ImageIcon } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  category: string;
  updatedAt: string;
  color: string;
}

export default function Notes() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("Vše");
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const subjects = [
    "Vše",
    "Matematika",
    "Čeština",
    "Angličtina",
    "Fyzika",
    "Chemie",
    "Ostatní",
  ];

  const notes: Note[] = [
    {
      id: "1",
      title: "Integrály - základy",
      content: "Neurčitý integrál je inverzní operace k derivaci...",
      subject: "Matematika",
      category: "Teorie",
      updatedAt: "před 2 hodinami",
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    },
    {
      id: "2",
      title: "Newtonovy pohybové zákony",
      content: "1. Zákon setrvačnosti: Těleso setrvává v klidu nebo v rovnoměrném přímočarém pohybu...",
      subject: "Fyzika",
      category: "Přednáška",
      updatedAt: "včera",
      color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    },
    {
      id: "3",
      title: "Anglická gramatika - podmínkové věty",
      content: "Zero conditional: If + present simple, present simple...",
      subject: "Angličtina",
      category: "Poznámky",
      updatedAt: "před 3 dny",
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    },
    {
      id: "4",
      title: "Chemické rovnice",
      content: "Vyčíslování chemických rovnic pomocí oxidačních čísel...",
      subject: "Chemie",
      category: "Vzorce",
      updatedAt: "před 5 dny",
      color: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
    },
    {
      id: "5",
      title: "Literární směry 19. století",
      content: "Romantismus, realismus, naturalismus...",
      subject: "Čeština",
      category: "Literatura",
      updatedAt: "před týdnem",
      color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    },
  ];

  const filteredNotes =
    selectedSubject === "Vše"
      ? notes
      : notes.filter((n) => n.subject === selectedSubject);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar - Notes List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Zápisník
            </h2>
            <button className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat poznámky..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Subject Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex gap-2">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-all ${
                  selectedSubject === subject
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedNote?.id === note.id
                  ? "ring-2 ring-indigo-500 " + note.color
                  : note.color + " hover:shadow-md"
              }`}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {note.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {note.content}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{note.subject}</span>
                <span>{note.updatedAt}</span>
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Žádné poznámky</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {selectedNote ? (
          <>
            {/* Editor Toolbar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setIsDrawingMode(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    !isDrawingMode
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Type className="w-4 h-4" />
                  Text
                </button>
                <button
                  onClick={() => setIsDrawingMode(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isDrawingMode
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  Kreslení
                </button>
              </div>

              {!isDrawingMode && (
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Bold className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Italic className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ListIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ImageIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              )}
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                {!isDrawingMode ? (
                  <>
                    <input
                      type="text"
                      value={selectedNote.title}
                      className="w-full text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none mb-4"
                      placeholder="Název poznámky..."
                    />
                    <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                        {selectedNote.subject}
                      </span>
                      <span>{selectedNote.category}</span>
                      <span>• {selectedNote.updatedAt}</span>
                    </div>
                    <textarea
                      value={selectedNote.content}
                      className="w-full min-h-[400px] text-gray-900 dark:text-white bg-transparent border-none outline-none resize-none leading-relaxed"
                      placeholder="Začněte psát..."
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Režim kreslení
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Nakreslete své poznámky pomocí náčrtů a diagramů
                    </p>
                    <div className="mt-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-96 flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Kreslící plátno
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Vyberte poznámku
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Vyberte poznámku ze seznamu nebo vytvořte novou
              </p>
              <button className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors mx-auto">
                <Plus className="w-5 h-5" />
                Nová poznámka
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
