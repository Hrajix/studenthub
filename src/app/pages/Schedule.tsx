import { useState, useRef, useCallback, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router";
import { Plus, Edit, Trash2, GripVertical, Settings2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

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

// Nyní ukládáme kompletní HSL barvu (odstín, sytost, světlost)
interface ColorData {
  h: number;
  s: number;
  l: number;
}

interface SubjectData {
  color: ColorData;
  abbr: string;
}

const initialSubjects: { [key: string]: SubjectData } = {
  "Matematika": { color: { h: 220, s: 85, l: 50 }, abbr: "MT" },
};

const PREDEFINED_HUES = [
  0, 25, 45, 80, 125, 160, 195, 215, 240, 275, 300, 330
];

const DEFAULT_COLOR: ColorData = { h: 215, s: 75, l: 55 }; // Pěkná modrá jako výchozí

type ClassType = "Žádný" | "Přednáška" | "Cvičení" | "Seminář";

interface ClassBlock {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  color: ColorData;
  day: number;
  timeSlot: number;
  type: ClassType;
  duration: number;
}

interface DraggableClassProps {
  classData: ClassBlock;
  abbr: string;
  isDense?: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DraggableClass({ classData, abbr, isDense, onClick, onEdit, onDelete }: DraggableClassProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: classData,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const isSolid = classData.type === "Přednáška" || classData.type === "Žádný";
  
  const isCompact = isDense && classData.duration === 1;
  const isLongText = classData.subject.length > 28;
  const shouldShrink = isCompact && isLongText;
  
  const { h, s, l } = classData.color;
  // Chytrý kontrast: pokud je barva moc světlá (žlutá, světle zelená), text bude tmavý
  const isLight = l > 60 || (h > 35 && h < 100 && l > 40);
  
  const bg = isSolid ? `hsl(${h}, ${s}%, ${l}%)` : `hsl(${h}, ${s}%, 95%)`;
  const textCol = isSolid ? (isLight ? "#111827" : "#ffffff") : `hsl(${h}, ${s}%, 20%)`;
  const border = isSolid ? "none" : `2px solid hsl(${h}, ${s}%, ${l}%)`;

  return (
    <div
      ref={drag}
      onClick={onClick}
      style={{ backgroundColor: bg, color: textCol, border }}
      className={`group relative rounded-lg ${shouldShrink ? 'p-1.5' : 'p-2'} cursor-move shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {/* Plovoucí bublina s akcemi */}
      <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-lg p-0.5 z-20">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"><Edit size={12} /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"><Trash2 size={12} /></button>
      </div>

      <div className="min-h-0">
        <div 
          className={`font-bold ${shouldShrink ? 'text-[10px] line-clamp-3' : 'text-[12px] line-clamp-2'} leading-tight mb-0.5`} 
          title={classData.subject}
        >
          {classData.subject}
        </div>
        <div className="text-[11px] truncate opacity-90">{classData.teacher}</div>
      </div>
      
      <div className="text-[10px] mt-1 flex justify-between items-end gap-1 opacity-80">
        <span className="truncate">{classData.room}</span>
        
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-mono font-bold">{abbr}</span>
          {classData.type !== 'Žádný' && (
            <span className={`px-1 py-0.5 text-[8px] rounded font-bold leading-none ${isSolid ? 'bg-black/20 text-white' : 'bg-black/10 text-black dark:text-white dark:bg-white/20'}`}>
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
    item: { subject, color: data.color },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <div
      ref={drag}
      className={`group relative flex items-center gap-2 cursor-grab active:cursor-grabbing p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700 ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="w-4 h-4 rounded shadow-sm shrink-0" style={{ backgroundColor: `hsl(${data.color.h}, ${data.color.s}%, ${data.color.l}%)` }}></div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{subject}</span>
        <span className="text-[10px] text-gray-500 font-mono">{data.abbr}</span>
      </div>
      
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
  colSpan?: number;
  isDense?: boolean;
  onDropClass: (item: ClassBlock, day: number, timeSlot: number) => void;
  onDropSubject: (subject: string, color: ColorData, day: number, timeSlot: number) => void;
  onEmptyClick: (day: number, timeSlot: number) => void;
  onClassClick: () => void;
  onEditClass: () => void;
  onDeleteClass: () => void;
}

function TimeSlot({ day, timeSlot, classData, abbr, colSpan = 1, isDense, onDropClass, onDropSubject, onEmptyClick, onClassClick, onEditClass, onDeleteClass }: TimeSlotProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ["CLASS", "SUBJECT"],
    drop: (item: any, monitor) => {
      if (monitor.getItemType() === "CLASS") onDropClass(item, day, timeSlot);
      if (monitor.getItemType() === "SUBJECT") onDropSubject(item.subject, item.color, day, timeSlot);
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <div
      ref={drop}
      onClick={() => { if (!classData) onEmptyClick(day, timeSlot); }}
      style={{ gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined }}
      className={`min-h-[72px] border border-gray-200 dark:border-gray-700 rounded-lg transition-colors relative group ${
        isOver ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600" : "bg-white dark:bg-gray-800 cursor-pointer"
      }`}
    >
      {classData ? (
        <DraggableClass classData={classData} abbr={abbr} isDense={isDense} onClick={onClassClick} onEdit={onEditClass} onDelete={onDeleteClass} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="w-5 h-5 text-gray-300 dark:text-gray-600" />
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
  const [newSubjectColor, setNewSubjectColor] = useState<ColorData>(DEFAULT_COLOR);

  // --- STAVY ROZVRHU ---
  const [schedule, setSchedule] = useState<ClassBlock[]>([]);
  
  const totalDuration = schedule.reduce((acc, c) => acc + c.duration, 0);
  const longClassesDuration = schedule.filter(c => c.duration > 1).reduce((acc, c) => acc + c.duration, 0);
  const isDense = totalDuration > 0 && longClassesDuration >= totalDuration / 2;
  const currentCellWidth = isDense ? DENSE_CELL_WIDTH : NORMAL_CELL_WIDTH;

  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [draftSlot, setDraftSlot] = useState({ day: 0, timeSlot: 0 });
  
  const [classForm, setClassForm] = useState<{subject: string; teacher: string; room: string; type: ClassType; duration: number}>({ 
    subject: "", teacher: "", room: "", type: "Žádný", duration: 1 
  });

  // --- POMOCNÁ FUNKCE PRO UKLÁDÁNÍ ---
  const syncWithSupabase = async (currentSchedule, currentSubjects, currentTimeSlots) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const scheduleInfo = {
        timeSlots: currentTimeSlots || timeSlots,
        subjects: currentSubjects || subjects,
        blocks: currentSchedule || schedule
      };


      const { data, error } = await supabase
        .from('schedule')
        .upsert({ 
          user: user.id, 
          schedule_info: scheduleInfo 
        }, { onConflict: 'user' })
        .select(); // Přidáme select, abychom viděli, co se vrátilo

      if (error) {

      } else {
        
      }
    } catch (err) {

    }
  };

  useEffect(() => {
    const loadScheduleFromSupabase = async () => {
      try {
        // 1. Získáme přihlášeného uživatele
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Stáhneme řádek pro tohoto uživatele
        const { data, error } = await supabase
          .from('schedule')
          .select('schedule_info')
          .eq('user', user.id)
          .maybeSingle(); // maybeSingle nehlásí chybu, když nic nenajde

        if (error) throw error;

        // 3. Pokud data existují, "napumpujeme" je do stavů
        if (data && data.schedule_info) {
          const info = data.schedule_info;
          
          if (info.timeSlots) setTimeSlots(info.timeSlots);
          if (info.subjects) setSubjects(info.subjects);
          if (info.blocks) setSchedule(info.blocks);
          
          console.log("Data úspěšně načtena z databáze.");
        }
      } catch (err) {
        console.error("Chyba při počátečním načítání:", err);
      }
    };

    loadScheduleFromSupabase();
  }, []);

  // --- HANDLERY PRO PŘEDMĚTY ---
  const handleSaveSubject = () => {
    if (!newSubjectName.trim()) return;
    
    const updatedSubjects = { ...subjects };
    if (editingSubjectName) delete updatedSubjects[editingSubjectName];
    updatedSubjects[newSubjectName] = { color: newSubjectColor, abbr: newSubjectAbbr };

    setSubjects(updatedSubjects);
    setShowAddSubjectModal(false);

    // ODESLÁNÍ DO DB (posíláme aktualizované předměty)
    syncWithSupabase(schedule, updatedSubjects, timeSlots);
  };

  const handleEditSubject = (subjName: string) => {
    const data = subjects[subjName];
    setEditingSubjectName(subjName);
    setNewSubjectName(subjName);
    setNewSubjectAbbr(data.abbr);
    setNewSubjectColor(data.color);
    setShowAddSubjectModal(true);
  };

  const handleDeleteSubject = (subjName: string) => {
    if(confirm(`Opravdu smazat předmět ${subjName}?`)) {
      const updatedSubjects = {...subjects};
      delete updatedSubjects[subjName];
      
      const updatedSchedule = schedule.filter(c => c.subject !== subjName);
      
      setSubjects(updatedSubjects);
      setSchedule(updatedSchedule);

      // Odeslat smazání do DB
      syncWithSupabase(updatedSchedule, updatedSubjects, timeSlots);
    }
  };

  const openNewSubjectModal = () => {
    setEditingSubjectName(null);
    setNewSubjectName("");
    setNewSubjectAbbr("");
    const randomHue = PREDEFINED_HUES[Math.floor(Math.random() * PREDEFINED_HUES.length)];
    setNewSubjectColor({ h: randomHue, s: 75, l: 55 }); // Výchozí sytá barva
    setShowAddSubjectModal(true);
  };

  // --- HANDLERY PRO HODINY ---
  const handleDropClass = (item: ClassBlock, day: number, timeSlot: number) => {
      const updated = schedule.map(cls => cls.id === item.id ? { ...cls, day, timeSlot } : cls);
      setSchedule(updated);
      syncWithSupabase(updated, subjects, timeSlots);
  };

  const handleDropSubject = (subject: string, color: ColorData, day: number, timeSlot: number) => {
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
    const color = subjects[classForm.subject]?.color || DEFAULT_COLOR;
    
    let updated;
    if (editingClassId) {
      updated = schedule.map(c => c.id === editingClassId ? { ...c, ...classForm, color } : c);
    } else {
      updated = [...schedule, {
        id: Math.random().toString(), // Tady doporučuji crypto.randomUUID(), pokud nepoužíváš starší prohlížeče
        ...classForm,
        color,
        day: draftSlot.day,
        timeSlot: draftSlot.timeSlot,
      }];
    }
    
    setSchedule(updated);
    setShowAddClassModal(false);
    
    // TADY JE TO KLÍČOVÉ:
    // Posíláme 'updated', protože 'schedule' v tuhle chvíli ještě není v Reactu aktualizované
    syncWithSupabase(updated, subjects, timeSlots);
  };

    const handleDeleteClass = (id: string) => {
      const updatedSchedule = schedule.filter(c => c.id !== id);
      setSchedule(updatedSchedule);
      
      // Odeslat smazání do DB
      syncWithSupabase(updatedSchedule, subjects, timeSlots);
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

      {/* Schedule Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
        <div className="w-max min-w-full">
          {/* Header Row */}
          <div className="gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700" style={{ display: 'grid', gridTemplateColumns: `40px repeat(${timeSlots.length}, ${currentCellWidth}px)` }}>
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
              <div key={dayName} className="gap-2 mb-3" style={{ display: 'grid', gridTemplateColumns: `40px repeat(${timeSlots.length}, ${currentCellWidth}px)` }}>
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
                        isDense={isDense}
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
              
              {/* Výběr barvy - Odstíny a jejich tmavé varianty */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-3">Vyber barvu (odstín a tmavost)</label>
                <div className="grid grid-cols-6 gap-x-3 gap-y-4">
                  {PREDEFINED_HUES.map((hue) => {
                    // Definujeme dvě varianty pro každý odstín
                    const variants = [
                      { h: hue, s: 75, l: 55 }, // Normální/Sytá
                      { h: hue, s: 75, l: 30 }, // Tmavá
                    ];

                    return (
                      <div key={hue} className="flex flex-col gap-4">
                        {variants.map((v, idx) => {
                          const isSelected = newSubjectColor.h === v.h && newSubjectColor.l === v.l;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => { e.preventDefault(); setNewSubjectColor(v); }}
                              className={`w-10 aspect-square rounded-lg shadow-sm transition-all outline-none ${
                                isSelected 
                                  ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-800 scale-110 z-10' 
                                  : 'hover:scale-105 hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                              }`}
                              style={{ backgroundColor: `hsl(${v.h}, ${v.s}%, ${v.l}%)` }}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
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
                    syncWithSupabase(schedule, subjects, newSlots);
                  }}
                  deleteSlot={(index) => {
                    const updated = timeSlots.filter((_, i) => i !== index);
                    setTimeSlots(updated);
                    syncWithSupabase(schedule, subjects, updated);
                  }}
                />
              ))}
            </div>
            <button onClick={() => setTimeSlots([...timeSlots, "00:00 - 00:00"])} className="w-full py-2 mb-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
              <Plus className="w-5 h-5 mx-auto" />
            </button>
              <button 
                onClick={() => {
                  setShowEditTimesModal(false);
                  syncWithSupabase(schedule, subjects, timeSlots); // Uloží časy
                }} 
                className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
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
