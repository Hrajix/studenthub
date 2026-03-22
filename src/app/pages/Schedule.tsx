import { useState, useRef, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router";
import { Plus, Edit, Trash2, GripVertical, Settings2 } from "lucide-react";

const ItemType = "CLASS";

// --- NASTAVENÍ ŠÍŘKY ROZVRHU ---
const NORMAL_CELL_WIDTH = 150; // Šířka buňky pro běžné hodiny (v pixelech)
const DENSE_CELL_WIDTH = 100;   // Šířka buňky, když převažují dvouhodinovky

const days = ["Po", "Út", "St", "Čt", "Pá"];
const normalTimes = [
  "8:00-8:45","8:55-9:40","10:00-10:45","10:55-11:40",
  "11:50-12:35","12:45-13:30","13:40-14:25","14:35-15:20","15:30-16:15"
];
const uniTimes = [
  "7:00-7:50","8:00-8:50","9:00-9:50","10:00-10:50","11:00-11:50",
  "12:00-12:50","13:00-13:50","14:00-14:50","15:00-15:50","16:00-16:50","17:00-17:50"
];

// Nyní ukládáme odstín (hue) a zkratku
interface SubjectData {
  hue: number;
  abbr: string;
}

const initialSubjects: { [key: string]: SubjectData } = {
  "Matematika": { hue: 217, abbr: "MT" },
};

type ClassType = "Žádný" | "Přednáška" | "Cvičení" | "Seminář";

interface ClassBlock {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  hue: number;
  day: number;
  timeSlot: number;
  type: ClassType;
  duration: number; // Nová vlastnost: délka hodiny (počet bloků)
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

interface DraggableTimeSlotProps {
  slot: string;
  index: number;
  moveSlot: (dragIndex: number, hoverIndex: number) => void;
  updateSlot: (index: number, value: string) => void;
  deleteSlot: (index: number) => void;
}

function DraggableTimeSlotItem({ slot, index, moveSlot, updateSlot, deleteSlot }: DraggableTimeSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: "TIME_SLOT_ITEM",
    hover(item: { index: number }) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveSlot(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag, preview] = useDrag({
    type: "TIME_SLOT_ITEM",
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  
  drag(drop(ref));
  
  return (
    <div ref={ref} className={`flex gap-2 items-center bg-white dark:bg-gray-800 p-1 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
      <div ref={preview} className="cursor-grab p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <GripVertical size={16} />
      </div>
      <input 
        value={slot} 
        onChange={(e) => updateSlot(index, e.target.value)} 
        className="flex-1 p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
      />
      <button onClick={() => deleteSlot(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
        <Trash2 size={16}/>
      </button>
    </div>
  );
}

interface TimeSlotProps {
  day: number;
  timeSlot: number;
  classData?: ClassBlock;
  abbr: string;
  colSpan?: number; // Nový parametr pro roztažení buňky v CSS Gridu
  onDropClass: (item: ClassBlock, day: number, timeSlot: number) => void;
  onDropSubject: (subject: string, hue: number, day: number, timeSlot: number) => void;
  onEmptyClick: (day: number, timeSlot: number) => void;
  onClassClick: () => void;
  onEditClass: () => void;
  onDeleteClass: () => void;
}

function TimeSlot({ day, timeSlot, classData, abbr, colSpan = 1, onDropClass, onDropSubject, onEmptyClick, onClassClick, onEditClass, onDeleteClass }: TimeSlotProps) {
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
      style={{ gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined }}
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

  // --- STAVY PRO DYNAMICKÉ ČASOVÉ SLOTY ---
  const [timeSlots, setTimeSlots] = useState<string[]>(uniTimes);
  const [showEditTimesModal, setShowEditTimesModal] = useState(false);

  // Funkce pro Drag & Drop v modálu s časy
  const moveTimeSlot = useCallback((dragIndex: number, hoverIndex: number) => {
    setTimeSlots((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(hoverIndex, 0, moved);
      return updated;
    });
  }, []);

  // --- STAVY PŘEDMĚTŮ ---
  const [subjects, setSubjects] = useState<{ [key: string]: SubjectData }>(initialSubjects);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [editingSubjectName, setEditingSubjectName] = useState<string | null>(null);
  
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectAbbr, setNewSubjectAbbr] = useState("");
  const [newSubjectHue, setNewSubjectHue] = useState(217);

  // --- STAVY ROZVRHU ---
  const [schedule, setSchedule] = useState<ClassBlock[]>([]);
  
  // Dynamická šířka: počítáme to přesně podle celkové délky (času), nejen počtu bloků
  const totalDuration = schedule.reduce((acc, c) => acc + c.duration, 0);
  const longClassesDuration = schedule.filter(c => c.duration > 1).reduce((acc, c) => acc + c.duration, 0);
  const isDense = totalDuration > 0 && longClassesDuration >= totalDuration / 2;
  const currentCellWidth = isDense ? DENSE_CELL_WIDTH : NORMAL_CELL_WIDTH;

  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [draftSlot, setDraftSlot] = useState({ day: 0, timeSlot: 0 });
  
  // Přidáno `duration` do výchozího stavu
  const [classForm, setClassForm] = useState<{subject: string; teacher: string; room: string; type: ClassType; duration: number}>({ 
    subject: "", teacher: "", room: "", type: "Žádný", duration: 1 
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
      setClassForm({ subject: clsToEdit.subject, teacher: clsToEdit.teacher, room: clsToEdit.room, type: clsToEdit.type, duration: clsToEdit.duration });
    } else {
      setEditingClassId(null);
      setClassForm({ subject: defaultSubj, teacher: "", room: "", type: "Žádný", duration: 1 });
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
        <button onClick={() => setShowEditTimesModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
          <Settings2 size={16} />
          Upravit časy
        </button>
      </div>

      {/* Schedule Grid - Větší min-w pro horizontální scroll */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
        <div className="w-max min-w-full">
          {/* Header Row */}
          <div className="gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700" style={{ display: 'grid', gridTemplateColumns: `40px repeat(${timeSlots.length}, ${currentCellWidth}px)` }}>
            <div className="font-semibold text-gray-900 dark:text-white flex items-center">
              Den
            </div>
            {timeSlots.map((time) => (
              <div key={time} className="font-semibold text-gray-900 dark:text-white text-center text-sm flex items-center justify-center">
                {time}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          <div className="p-4">
            {days.map((dayName, dayIndex) => (
              <div key={dayName} className="gap-3 mb-3" style={{ display: 'grid', gridTemplateColumns: `40px repeat(${timeSlots.length}, ${currentCellWidth}px)` }}>
                <div className="flex items-center">
                  <div className="font-medium text-gray-900 dark:text-white">{dayName}</div>
                </div>
                {(() => {
                  const rowSlots = [];
                  let skipUntil = 0;
                  
                  for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
                    // Pokud je toto políčko sežrané předchozí hodinou o délce > 1, přeskočíme ho
                    if (timeIndex < skipUntil) continue;
                    
                    const cls = getClassForSlot(dayIndex, timeIndex);
                    const colSpan = cls?.duration || 1;
                    skipUntil = timeIndex + colSpan;
                    
                    rowSlots.push(
                      <TimeSlot
                        key={`${dayIndex}-${timeIndex}`}
                        day={dayIndex}
                        timeSlot={timeIndex}
                        colSpan={colSpan}
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
                  }
                  return rowSlots;
                })()}
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
                <label className="block text-sm text-gray-600 mb-1">Délka (počet bloků)</label>
                <input 
                  type="number" 
                  min="1" 
                  max={timeSlots.length - draftSlot.timeSlot} 
                  value={classForm.duration} 
                  onChange={(e) => setClassForm({...classForm, duration: parseInt(e.target.value) || 1})} 
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                />
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

      {/* MODAL: Upravit časy */}
      {showEditTimesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upravit časové bloky</h3>

            <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <button 
                onClick={() => setTimeSlots(normalTimes)} 
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all border ${
                  timeSlots.length === normalTimes.length && timeSlots[0] === normalTimes[0]
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm border-gray-200 dark:border-gray-500" 
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                }`}
              >
                Běžné (45m)
              </button>
              <button 
                onClick={() => setTimeSlots(uniTimes)} 
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all border ${
                  timeSlots.length === uniTimes.length && timeSlots[0] === uniTimes[0]
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm border-gray-200 dark:border-gray-500" 
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                }`}
              >
                Vysoká (50m)
              </button>
            </div>

            <div className="space-y-1 mb-4 overflow-y-auto flex-1 min-h-[300px] pr-2">
              {timeSlots.map((slot, idx) => (
                <DraggableTimeSlotItem 
                  key={idx}
                  index={idx}
                  slot={slot}
                  moveSlot={moveTimeSlot}
                  updateSlot={(index, val) => {
                    const newSlots = [...timeSlots];
                    newSlots[index] = val;
                    setTimeSlots(newSlots);
                  }}
                  deleteSlot={(index) => setTimeSlots(timeSlots.filter((_, i) => i !== index))}
                />
              ))}
            </div>
            <button onClick={() => setTimeSlots([...timeSlots, "00:00 - 00:00"])} className="w-full py-2 mb-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
              <Plus className="w-5 h-5 mx-auto" />
            </button>
            <button onClick={() => setShowEditTimesModal(false)} className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
              Hotovo
            </button>
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
