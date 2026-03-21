import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router";
import { Plus, Edit, Trash2 } from "lucide-react";

const ItemType = "CLASS";

const days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];
const times = [
  "08:00 - 09:30",
  "09:45 - 11:15",
  "11:30 - 13:00",
  "13:30 - 15:00",
  "15:15 - 16:45",
];

// Nyní ukládáme odstín (hue) a zkratku
interface SubjectData {
  hue: number;
  abbr: string;
}

const initialSubjects: { [key: string]: SubjectData } = {
  "Matematika": { hue: 217, abbr: "MAT" },
};

type ClassType = "Žádný" | "Přednáška" | "Cvičení" | "Seminář";

interface ClassBlock {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  hue: number; // Nahrazeno z color na hue
  day: number;
  timeSlot: number;
  type: ClassType;
}

interface DraggableClassProps {
  classData: ClassBlock;
  abbr: string;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DraggableClass({ classData, abbr, onClick, onEdit, onDelete }: DraggableClassProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: classData,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const isSolid = classData.type === "Přednáška" || classData.type === "Žádný";
  
  // Dynamické barvy přes HSL! Přednáška = sytá, Cvičení = světlá s rámečkem
  const bg = isSolid ? `hsl(${classData.hue}, 70%, 55%)` : `hsl(${classData.hue}, 70%, 95%)`;
  const textCol = isSolid ? "#ffffff" : `hsl(${classData.hue}, 70%, 20%)`;
  const border = isSolid ? "none" : `2px solid hsl(${classData.hue}, 70%, 55%)`;

  return (
    <div
      ref={drag}
      onClick={onClick}
      style={{ backgroundColor: bg, color: textCol, border }}
      className={`group relative rounded-lg p-3 cursor-move shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {/* Tlačítka zobrazená při hoveru - Plovoucí bublina ven z rohu */}
      <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-lg p-0.5 z-20">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"><Edit size={14} /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"><Trash2 size={14} /></button>
      </div>

      <div>
        <div className="font-bold text-sm mb-1 leading-tight">{classData.subject}</div>
        <div className="text-xs opacity-90 truncate">{classData.teacher}</div>
      </div>
      
      <div className="text-xs opacity-75 mt-2 flex justify-between items-end gap-2">
        <span className="truncate">{classData.room}</span>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono font-bold opacity-60">{abbr}</span>
          {classData.type !== 'Žádný' && (
            <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${isSolid ? 'bg-black/20 text-white' : 'bg-black/10 text-black dark:text-white dark:bg-white/20'}`}>
              {classData.type === 'Přednáška' ? 'PŘ' : classData.type === 'Cvičení' ? 'CV' : 'SM'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DraggableSubject({ subject, data, onEdit, onDelete }: { subject: string; data: SubjectData; onEdit: () => void; onDelete: () => void }) {
  const [{ isDragging }, drag] = useDrag({
    type: "SUBJECT",
    item: { subject, hue: data.hue },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <div
      ref={drag}
      className={`group relative flex items-center gap-2 cursor-grab active:cursor-grabbing p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700 ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="w-4 h-4 rounded shadow-sm shrink-0" style={{ backgroundColor: `hsl(${data.hue}, 70%, 55%)` }}></div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{subject}</span>
        <span className="text-[10px] text-gray-500 font-mono">{data.abbr}</span>
      </div>
      
      {/* Plovoucí bublina s akcemi - vyskočí ven z pravého horního rohu */}
      <div className="absolute -top-3 -right-2 hidden group-hover:flex items-center gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-md px-1 py-0.5 rounded-lg z-20">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded"><Edit size={14} /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

interface TimeSlotProps {
  day: number;
  timeSlot: number;
  classData?: ClassBlock;
  abbr: string;
  onDropClass: (item: ClassBlock, day: number, timeSlot: number) => void;
  onDropSubject: (subject: string, hue: number, day: number, timeSlot: number) => void;
  onEmptyClick: (day: number, timeSlot: number) => void;
  onClassClick: () => void;
  onEditClass: () => void;
  onDeleteClass: () => void;
}

function TimeSlot({ day, timeSlot, classData, abbr, onDropClass, onDropSubject, onEmptyClick, onClassClick, onEditClass, onDeleteClass }: TimeSlotProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ["CLASS", "SUBJECT"],
    drop: (item: any, monitor) => {
      if (monitor.getItemType() === "CLASS") onDropClass(item, day, timeSlot);
      if (monitor.getItemType() === "SUBJECT") onDropSubject(item.subject, item.hue, day, timeSlot);
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <div
      ref={drop}
      onClick={() => { if (!classData) onEmptyClick(day, timeSlot); }}
      className={`min-h-[90px] border border-gray-200 dark:border-gray-700 rounded-lg transition-colors relative group ${
        isOver ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600" : "bg-white dark:bg-gray-800 cursor-pointer"
      }`}
    >
      {classData ? (
        <DraggableClass classData={classData} abbr={abbr} onClick={onClassClick} onEdit={onEditClass} onDelete={onDeleteClass} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="w-6 h-6 text-gray-300 dark:text-gray-600" />
        </div>
      )}
    </div>
  );
}

function ScheduleContent() {
  const navigate = useNavigate();
  const [isOddWeek, setIsOddWeek] = useState(true);

  // --- STAVY PŘEDMĚTŮ ---
  const [subjects, setSubjects] = useState<{ [key: string]: SubjectData }>(initialSubjects);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [editingSubjectName, setEditingSubjectName] = useState<string | null>(null);
  
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectAbbr, setNewSubjectAbbr] = useState("");
  const [newSubjectHue, setNewSubjectHue] = useState(217);

  // --- STAVY ROZVRHU ---
  const [schedule, setSchedule] = useState<ClassBlock[]>([]);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [draftSlot, setDraftSlot] = useState({ day: 0, timeSlot: 0 });
  const [classForm, setClassForm] = useState<{subject: string; teacher: string; room: string; type: ClassType}>({ 
    subject: "", teacher: "", room: "", type: "Žádný" 
  });

  // --- HANDLERY PRO PŘEDMĚTY ---
  const handleSaveSubject = () => {
    if (!newSubjectName.trim()) return;
    
    if (editingSubjectName) {
      // Pokud se změnil název, aktualizujeme i hodiny v rozvrhu
      if (editingSubjectName !== newSubjectName) {
        setSchedule(prev => prev.map(c => c.subject === editingSubjectName ? { ...c, subject: newSubjectName, hue: newSubjectHue } : { ...c, hue: newSubjectHue }));
      } else {
        setSchedule(prev => prev.map(c => c.subject === editingSubjectName ? { ...c, hue: newSubjectHue } : c));
      }

      setSubjects(prev => {
        const next = { ...prev };
        delete next[editingSubjectName];
        next[newSubjectName] = { hue: newSubjectHue, abbr: newSubjectAbbr };
        return next;
      });
    } else {
      setSubjects(prev => ({ ...prev, [newSubjectName]: { hue: newSubjectHue, abbr: newSubjectAbbr } }));
    }
    setShowAddSubjectModal(false);
  };

  const handleEditSubject = (subjName: string) => {
    const data = subjects[subjName];
    setEditingSubjectName(subjName);
    setNewSubjectName(subjName);
    setNewSubjectAbbr(data.abbr);
    setNewSubjectHue(data.hue);
    setShowAddSubjectModal(true);
  };

  const handleDeleteSubject = (subjName: string) => {
    if(confirm(`Opravdu smazat předmět ${subjName}?`)) {
      setSubjects(prev => { const next = {...prev}; delete next[subjName]; return next; });
      setSchedule(prev => prev.filter(c => c.subject !== subjName));
    }
  };

  const openNewSubjectModal = () => {
    setEditingSubjectName(null);
    setNewSubjectName("");
    setNewSubjectAbbr("");
    setNewSubjectHue(Math.floor(Math.random() * 360));
    setShowAddSubjectModal(true);
  };

  // --- HANDLERY PRO HODINY ---
  const handleDropClass = (item: ClassBlock, day: number, timeSlot: number) => {
    setSchedule(prev => prev.map(cls => cls.id === item.id ? { ...cls, day, timeSlot } : cls));
  };

  const handleDropSubject = (subject: string, hue: number, day: number, timeSlot: number) => {
    openClassModal(day, timeSlot, subject);
  };

  const handleEmptyClick = (day: number, timeSlot: number) => {
    openClassModal(day, timeSlot, Object.keys(subjects)[0] || "");
  };

  const openClassModal = (day: number, timeSlot: number, defaultSubj: string, clsToEdit?: ClassBlock) => {
    setDraftSlot({ day, timeSlot });
    if (clsToEdit) {
      setEditingClassId(clsToEdit.id);
      setClassForm({ subject: clsToEdit.subject, teacher: clsToEdit.teacher, room: clsToEdit.room, type: clsToEdit.type });
    } else {
      setEditingClassId(null);
      setClassForm({ subject: defaultSubj, teacher: "", room: "", type: "Žádný" });
    }
    setShowAddClassModal(true);
  };

  const handleSaveClass = () => {
    if (!classForm.subject) return;
    const hue = subjects[classForm.subject]?.hue || 0;
    
    if (editingClassId) {
      setSchedule(prev => prev.map(c => c.id === editingClassId ? { ...c, ...classForm, hue } : c));
    } else {
      setSchedule(prev => [...prev, {
        id: Math.random().toString(),
        ...classForm,
        hue,
        day: draftSlot.day,
        timeSlot: draftSlot.timeSlot,
      }]);
    }
    setShowAddClassModal(false);
  };

  const handleDeleteClass = (id: string) => {
    setSchedule(prev => prev.filter(c => c.id !== id));
  };

  const getClassForSlot = (day: number, timeSlot: number) => schedule.find(cls => cls.day === day && cls.timeSlot === timeSlot);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Rozvrh hodin</h1>
          <p className="text-gray-600 dark:text-gray-400">Přetáhněte předměty pro úpravu rozvrhu</p>
        </div>
      </div>

      {/* Schedule Grid - Větší min-w pro horizontální scroll */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header Row */}
          <div className="grid grid-cols-6 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <div className="font-semibold text-gray-900 dark:text-white">Den</div>
            {times.map((time) => (
              <div key={time} className="font-semibold text-gray-900 dark:text-white text-center">{time}</div>
            ))}
          </div>

          {/* Grid Rows */}
          <div className="p-4">
            {days.map((dayName, dayIndex) => (
              <div key={dayName} className="grid grid-cols-6 gap-3 mb-3">
                <div className="flex items-center">
                  <div className="font-medium text-gray-900 dark:text-white">{dayName}</div>
                </div>
                {times.map((_, timeIndex) => {
                  const cls = getClassForSlot(dayIndex, timeIndex);
                  return (
                    <TimeSlot
                      key={`${dayIndex}-${timeIndex}`}
                      day={dayIndex}
                      timeSlot={timeIndex}
                      classData={cls}
                      abbr={cls ? (subjects[cls.subject]?.abbr || "") : ""}
                      onDropClass={handleDropClass}
                      onDropSubject={handleDropSubject}
                      onEmptyClick={handleEmptyClick}
                      onClassClick={() => cls && navigate(`/panel/rozvrh/${cls.id}`)}
                      onEditClass={() => cls && openClassModal(dayIndex, timeIndex, cls.subject, cls)}
                      onDeleteClass={() => cls && handleDeleteClass(cls.id)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Předměty</h3>
          <button onClick={openNewSubjectModal} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
            <Plus className="w-5 h-5" /> Přidat předmět
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(subjects).map(([subj, data]) => (
            <DraggableSubject key={subj} subject={subj} data={data} onEdit={() => handleEditSubject(subj)} onDelete={() => handleDeleteSubject(subj)} />
          ))}
        </div>
      </div>

      {/* MODAL: Přidat/Upravit Hodinu */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingClassId ? "Upravit hodinu" : "Přidat hodinu do rozvrhu"}
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Předmět</label>
                <select value={classForm.subject} onChange={(e) => setClassForm({...classForm, subject: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  {Object.keys(subjects).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Vyučující</label>
                  <input type="text" value={classForm.teacher} onChange={(e) => setClassForm({...classForm, teacher: e.target.value})} placeholder="Např. Novák" className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Místnost</label>
                  <input type="text" value={classForm.room} onChange={(e) => setClassForm({...classForm, room: e.target.value})} placeholder="Např. A201" className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Typ hodiny</label>
                <div className="flex flex-wrap gap-4">
                  {['Žádný', 'Přednáška', 'Cvičení', 'Seminář'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={classForm.type === type} onChange={() => setClassForm({...classForm, type: type as ClassType})} className="text-indigo-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddClassModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-white">Zrušit</button>
              <button onClick={handleSaveClass} className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Uložit</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Přidat/Upravit Předmět */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingSubjectName ? "Upravit předmět" : "Vytvořit nový předmět"}
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Název předmětu</label>
                <input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Např. Databázové systémy" className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Zkratka</label>
                <input type="text" value={newSubjectAbbr} onChange={(e) => setNewSubjectAbbr(e.target.value.toUpperCase())} maxLength={6} placeholder="Např. DNSD" className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              
              {/* Nativní HSL Hue Slider */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Vyber barvu (odstín)</label>
                <input
                  type="range"
                  min="0" max="360"
                  value={newSubjectHue}
                  onChange={(e) => setNewSubjectHue(parseInt(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)` }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddSubjectModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-white">Zrušit</button>
              <button onClick={handleSaveSubject} className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Uložit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Schedule() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ScheduleContent />
    </DndProvider>
  );
}
