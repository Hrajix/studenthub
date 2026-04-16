import { useState, useRef, useCallback, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend, getEmptyImage } from "react-dnd-html5-backend"; // Nové: getEmptyImage
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, GripVertical, Settings2, Share2, Copy, Download, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";

const ItemType = "CLASS";

// --- NASTAVENÍ ŠÍŘKY ROZVRHU ---
const NORMAL_CELL_WIDTH = 150; // Šířka buňky pro běžné hodiny (v pixelech)
const DENSE_CELL_WIDTH = 100;   // Šířka buňky, když převažují dvouhodinovky

const days = ["Po", "Út", "St", "Čt", "Pá"];
const normalTimes = [
  "7:20-7:55","8:00-8:45","8:55-9:40","10:00-10:45","10:55-11:40",
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

type ClassType = "Běžný" | "Přednáška" | "Cvičení" | "Seminář";
type WeekType = "all" | "odd" | "even";

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
  week?: WeekType;
}

interface DraggableClassProps {
  classData: ClassBlock;
  abbr: string;
  isDense?: boolean;
  isDeleting?: boolean;
  isEditing?: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragEnd: () => void;
}

const seenClassIds = new Set<string>();

function DraggableClass({ classData, abbr, isDense, isDeleting, isEditing, onClick, onEdit, onDelete, onDragEnd }: DraggableClassProps) {
  const isNewRef = useRef(!seenClassIds.has(classData.id));
  useEffect(() => {
    seenClassIds.add(classData.id);
  }, [classData.id]);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: ItemType,
    item: { ...classData },
    canDrag: isEditing, // ZAMYKÁNÍ DRAGU: Lze přesouvat jen v Edit módu
    end: () => onDragEnd(),
    collect: (monitor) => ({ 
      isDragging: monitor.getItemType() === ItemType && monitor.getItem()?.id === classData.id 
    }),
  });

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

  const animationConfig = isDragging 
    ? { type: "spring", stiffness: 500, damping: 30 } 
    : { type: "spring", stiffness: 300, damping: 20 };

  const isSolid = classData.type === "Přednáška" || classData.type === "Běžný";
  const isCompact = isDense && classData.duration === 1;
  const isLongText = classData.subject.length > 13;
  const shouldShrink = isCompact && isLongText;
  
  const { h, s, l } = classData.color;
  const isLight = l > 60 || (h > 35 && h < 100 && l > 40);
  
  // ZMĚNA: Přesunuto do CSS proměnných. Žádná průhlednost. V Dark modu jen podstrčíme tmavší pozadí pro nesolidní hodiny.
  const styleVars = {
    '--bg-solid': `hsl(${h}, ${s}%, ${l}%)`,
    '--text-solid': isLight ? "#111827" : "#ffffff",
    '--bg-light': `hsl(${h}, ${s}%, 95%)`,
    '--bg-light-dark': `hsl(${h}, ${s}%, 15%)`, // Tmavá alternativa pro Cvičení v dark modu
    '--text-dark': `hsl(${h}, ${s}%, 20%)`,
    '--text-dark-dark': `hsl(${h}, ${s}%, 85%)`,
    '--border-col': `hsl(${h}, ${s}%, ${l}%)`
  } as React.CSSProperties;

  return (
    <div ref={drag} className={`w-full h-full select-none ${isEditing ? 'cursor-grab' : 'cursor-pointer'} ${isDragging ? "pointer-events-none" : "pointer-events-auto"}`}>
      <motion.div
        onClick={!isEditing ? onClick : undefined}
        style={styleVars}
        layoutId={classData.id}
        initial={isNewRef.current ? { opacity: 0, scale: 0.8 } : false}
        animate={{ opacity: isDeleting ? 0 : 1, scale: isDeleting ? 0.8 : 1 }}
        transition={animationConfig}
        className={`relative rounded-lg ${shouldShrink ? 'p-1.5' : 'p-2'} h-full flex flex-col justify-between ${
          isSolid 
            ? "bg-[var(--bg-solid)] text-[var(--text-solid)] border-none" 
            : "bg-[var(--bg-light)] dark:bg-[var(--bg-light-dark)] text-[var(--text-dark)] dark:text-white border-2 border-[var(--border-col)]"
        } ${
          isDragging 
            ? "is-dragging scale-[1.05] rotate-1 shadow-2xl ring-4 ring-indigo-400/50 z-[999]" 
            : "shadow-sm hover:shadow-md transition-shadow"
        }`}
      >
        {/* ZMĚNA: Plovoucí bublina s akcemi se zobrazuje trvale, ale POUZE V EDIT MÓDU (žádný hover) */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, x: -10, y: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -10, y: 10 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -top-2.5 -right-2.5 flex gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-full p-1 z-30 transition-shadow hover:ring-2 hover:ring-indigo-300"
            >
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-gray-600 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-full transition-colors"><Edit size={12} /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-600 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors"><Trash2 size={12} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="min-h-0">
          <div className={`font-bold ${shouldShrink ? 'text-[10px] line-clamp-3' : 'text-[12px] line-clamp-2'} leading-tight mb-0.5`} title={classData.subject}>
            {classData.subject}
          </div>
          <div className={`${shouldShrink ? 'text-[9px]' : 'text-[11px]'} truncate opacity-90`}>{classData.teacher}</div>
        </div>
        
        <div className={`${shouldShrink ? 'text-[8px]' : 'text-[10px]'} mt-1 flex justify-between items-end gap-1 opacity-80`}>
          <span className="truncate">{classData.room}</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-mono font-bold">{abbr}</span>
            {classData.type !== 'Běžný' && (
              <span className={`px-1 py-0.5 ${shouldShrink ? 'text-[8px]' : 'text-[9px]'} rounded font-bold leading-none ${isSolid ? 'bg-black/20 text-white' : 'bg-black/10 text-black dark:text-white dark:bg-white/20'}`}>
                {classData.type === 'Přednáška' ? 'PŘ' : classData.type === 'Cvičení' ? 'CV' : 'SM'}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DraggableSubject({ subject, data, isEditing, onEdit, onDelete }: { subject: string; data: SubjectData; isEditing: boolean; onEdit: () => void; onDelete: () => void }) {
  const [{ isDragging }, drag] = useDrag({
    type: "SUBJECT",
    item: { subject, color: data.color },
    canDrag: isEditing,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      ref={drag as any}
      className={`select-none relative flex items-center gap-2 ${isEditing ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} p-2.5 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="w-4 h-4 rounded shadow-sm shrink-0" style={{ backgroundColor: `hsl(${data.color.h}, ${data.color.s}%, ${data.color.l}%)` }}></div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{subject}</span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{data.abbr}</span>
      </div>
      
      <AnimatePresence initial={false}>
        {isEditing && (
          <motion.div 
            key="subject-edit-popup"
            initial={{ opacity: 0, scale: 0.5, x: -10, y: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: -10, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.02 }}
            className="absolute -top-3.5 -right-2 flex items-center gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-xl px-1.5 py-0.5 rounded-full z-30 transition-shadow hover:ring-indigo-300"
          >        
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full"><Edit size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full"><Trash2 size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const TIME_SLOT_TYPE = "TIME_SLOT";

function DraggableTimeSlotItem({ index, slot, moveSlot, updateSlot, deleteSlot }: any) {
  const ref = useRef<HTMLDivElement>(null);
  
  const [localVal, setLocalVal] = useState(slot);
  useEffect(() => { setLocalVal(slot); }, [slot]);

  const [{ handlerId }, drop] = useDrop({
    accept: TIME_SLOT_TYPE,
    collect(monitor) { return { handlerId: monitor.getHandlerId() }; },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveSlot(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: TIME_SLOT_TYPE,
    item: () => ({ index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  
  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

  drag(drop(ref));

  return (
    <motion.div 
      ref={ref} 
      data-handler-id={handlerId}
      layout="position" 
      initial={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.9 }}
      animate={{ opacity: 1, height: "auto", marginBottom: 8, scale: 1 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.9, overflow: "hidden" }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2 p-2 rounded-lg border transition-colors relative ${
        isDragging 
          ? 'bg-white dark:bg-gray-700 border-indigo-500 shadow-xl scale-[0.98] z-50 ring-2 ring-indigo-500/50' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm z-0 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <GripVertical className={`w-5 h-5 shrink-0 transition-colors ${isDragging ? 'text-indigo-500 cursor-grabbing' : 'text-gray-400 cursor-grab hover:text-gray-600'}`} />
      <input 
        type="text" 
        value={localVal} 
        onChange={(e) => setLocalVal(e.target.value)} 
        onBlur={() => { if (localVal !== slot) updateSlot(index, localVal); }}
        onKeyDown={(e) => { if (e.key === 'Enter') updateSlot(index, localVal); }}
        className={`flex-1 bg-transparent border-none focus:ring-0 p-1 text-sm font-medium outline-none ${isDragging ? 'text-indigo-700 dark:text-indigo-300 pointer-events-none' : 'text-gray-900 dark:text-white'}`} 
      />
      <button onClick={() => deleteSlot(index)} className={`p-1.5 rounded transition-colors ${isDragging ? 'text-gray-300 pointer-events-none' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
        <Trash2 size={16}/>
      </button>
    </motion.div>
  );
}

interface TimeSlotProps {
  day: number;
  timeSlot: number;
  classData?: ClassBlock;
  abbr: string;
  colSpan?: number;
  isDense?: boolean;
  isDeleting?: boolean;
  isEditing?: boolean;
  checkCollision: (classId: string | null, day: number, timeSlot: number, duration: number) => boolean;
  onHoverClass: (id: string, day: number, timeSlot: number) => void;
  onDragEndClass: () => void;
  onDropSubject: (subject: string, color: ColorData, day: number, timeSlot: number) => void;
  onEmptyClick: (day: number, timeSlot: number) => void;
  onClassClick: () => void;
  onEditClass: () => void;
  onDeleteClass: () => void;
}

function TimeSlot({ day, timeSlot, classData, abbr, colSpan = 1, isDense, isDeleting, isEditing, checkCollision, onHoverClass, onDragEndClass, onDropSubject, onEmptyClick, onClassClick, onEditClass, onDeleteClass }: TimeSlotProps) {
  const [{ isOver, canDrop, itemType }, drop] = useDrop({
    accept: ["CLASS", "SUBJECT"],
    dropEffect: "move",
    canDrop: (item: any, monitor) => {
      if (!isEditing) return false; // ZAMYKÁNÍ DROP-ZONE
      if (monitor.getItemType() === "SUBJECT") return checkCollision(null, day, timeSlot, 1);
      if (monitor.getItemType() === "CLASS") return checkCollision(item.id, day, timeSlot, item.duration);
      return false;
    },
    hover: (item: any, monitor) => {
      if (monitor.getItemType() === "CLASS") {
        if (item.day === day && item.timeSlot === timeSlot) return; 
        
        // 1. Zkusíme klasický přesun přesně na políčko, nad kterým právě teď zastavila myš
        if (checkCollision(item.id, day, timeSlot, item.duration)) {
           onHoverClass(item.id, day, timeSlot);
           item.day = day;
           item.timeSlot = timeSlot;
           return;
        }

        // 2. ZÁCHRANA PRO RYCHLÉ ŠVIHNUTÍ: 
        // Pokud myš přeskočila políčka příliš rychle a cíl je zablokovaný,
        // zkontrolujeme políčka mezi startem a cílem a posuneme hodinu "co nejdál to jde".
        if (item.day === day) {
          if (timeSlot > item.timeSlot) {
            // Švihnutí doprava
            for (let s = timeSlot - 1; s > item.timeSlot; s--) {
              if (checkCollision(item.id, day, s, item.duration)) {
                onHoverClass(item.id, day, s);
                item.day = day;
                item.timeSlot = s;
                return;
              }
            }
          } else if (timeSlot < item.timeSlot) {
            // Švihnutí doleva
            for (let s = timeSlot + 1; s < item.timeSlot; s++) {
              if (checkCollision(item.id, day, s, item.duration)) {
                onHoverClass(item.id, day, s);
                item.day = day;
                item.timeSlot = s;
                return;
              }
            }
          }
        }
      }
    },
    drop: (item: any, monitor) => {
      if (monitor.getItemType() === "SUBJECT") onDropSubject(item.subject, item.color, day, timeSlot);
    },
    collect: (monitor) => ({ 
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      itemType: monitor.getItemType()
    }),
  });

  const isSubjectHighlight = isOver && canDrop && itemType === "SUBJECT";

  return (
    <div
      ref={drop as any}
      onClick={() => { if (!classData && isEditing) onEmptyClick(day, timeSlot); }}
      className={`min-h-[72px] min-w-0 rounded-lg transition duration-200 relative group h-full ${
        isEditing && !classData ? 'cursor-pointer' : ''
      } ${
        isSubjectHighlight 
          ? "bg-indigo-50 dark:bg-indigo-900/30 border-2 border-dashed border-indigo-400 dark:border-indigo-500 scale-[0.96]" 
          : (classData 
              ? "border border-transparent bg-transparent" 
              : "bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700")
      } ${classData ? 'z-10' : 'z-0'} has-[.is-dragging]:z-[999]`}
    >
      {classData ? (
        <div className="relative z-20 h-full" style={{ width: `calc(${colSpan * 100}% + ${(colSpan - 1) * 8}px)` }}>
          <DraggableClass classData={classData} abbr={abbr} isDense={isDense} isDeleting={isDeleting} isEditing={isEditing} onClick={onClassClick} onEdit={onEditClass} onDelete={onDeleteClass} onDragEnd={onDragEndClass} />
        </div>
      ) : (
        // PLUSKA SE UKÁŽOU JEN V EDIT MÓDU
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.2 }}
              className={`absolute inset-0 flex items-center justify-center z-0 pointer-events-none ${isSubjectHighlight ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <Plus className={`w-5 h-5 transition-colors ${isSubjectHighlight ? 'text-indigo-500' : 'text-gray-300 dark:text-gray-600'}`} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

function ScheduleContent() {
  const navigate = useNavigate();
  const [activeWeekView, setActiveWeekView] = useState<'odd' | 'even'>('odd');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    seenClassIds.clear();
  }, []);

  // --- STAVY PRO DYNAMICKÉ ČASOVÉ SLOTY ---
  const [timeMode, setTimeMode] = useState<'normal' | 'uni'>('normal');
  const [customNormalTimes, setCustomNormalTimes] = useState<string[]>(normalTimes);
  const [customUniTimes, setCustomUniTimes] = useState<string[]>(uniTimes);
  const [timeSlots, setTimeSlots] = useState<string[]>(normalTimes);
  const [showEditTimesModal, setShowEditTimesModal] = useState(false);

  useEffect(() => {
    if (timeMode === 'normal') setCustomNormalTimes(timeSlots);
    else setCustomUniTimes(timeSlots);
  }, [timeSlots, timeMode]);

  // Funkce pro Drag & Drop v modálu s časy
  const moveTimeSlot = useCallback((dragIndex: number, hoverIndex: number) => {
    setTimeSlots((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(hoverIndex, 0, moved);
      return updated;
    });
  }, []);

  // --- DRAFT STAVY PRO MODÁL ČASŮ (Nečistopisy) ---
  const [draftTimeMode, setDraftTimeMode] = useState<'normal' | 'uni'>('normal');
  const [draftNormalTimes, setDraftNormalTimes] = useState<string[]>([]);
  const [draftUniTimes, setDraftUniTimes] = useState<string[]>([]);
  const [timesModalError, setTimesModalError] = useState<string | null>(null);

  const openTimesModal = () => {
    setDraftTimeMode(timeMode);
    setDraftNormalTimes(customNormalTimes);
    setDraftUniTimes(customUniTimes);
    setTimesModalError(null);
    setShowEditTimesModal(true);
  };

  const handleSaveTimes = () => {
    const finalSlots = draftTimeMode === 'normal' ? draftNormalTimes : draftUniTimes;
    
    // VALIDACE: Přetéká nějaká hodina mimo nové rozmezí hodin?
    const requiredSlots = Math.max(0, ...schedule.map(c => c.timeSlot + c.duration));
    if (requiredSlots > finalSlots.length) {
      setTimesModalError(`Nelze uložit. Máte v rozvrhu předměty, které vyžadují alespoň ${requiredSlots} bloků (tento režim jich má aktuálně jen ${finalSlots.length}). Nejprve tyto předměty odstraňte nebo přesuňte.`);
      return;
    }

    // ULOŽENÍ VŠEHO Z DRAFTU DO OSTRÉ VERZE
    setTimeMode(draftTimeMode);
    setCustomNormalTimes(draftNormalTimes);
    setCustomUniTimes(draftUniTimes);
    setTimeSlots(finalSlots);
    syncWithSupabase(schedule, subjects, finalSlots, draftTimeMode);
    setShowEditTimesModal(false);
  };

  const moveDraftTimeSlot = useCallback((dragIndex: number, hoverIndex: number, activeSlots: string[], setSlots: (s: string[]) => void) => {
    const updated = [...activeSlots];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, moved);
    setSlots(updated);
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
  const [deletingClassIds, setDeletingClassIds] = useState<string[]>([]); // TENTO ŘÁDEK CHYBĚL!
  const [deletePrompt, setDeletePrompt] = useState<{ isOpen: boolean; type: 'SUBJECT' | 'CLASS' | null; id: string | null; title: string }>({ isOpen: false, type: null, id: null, title: "" });
  // Pomocná reference pro jistotu, že funkce vždy vidí poslední data
  const scheduleRef = useRef(schedule);
  useEffect(() => { scheduleRef.current = schedule; }, [schedule]);

  // --- STAVY PRO IMPORT/EXPORT ROZVRHU ---
  const [showShareModal, setShowShareModal] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showConfirmImportModal, setShowConfirmImportModal] = useState(false); // NOVÝ STAV
  const [pendingImportData, setPendingImportData] = useState<any>(null); // DOČASNÁ PAMĚŤ

  const getExportCode = () => {
    return btoa(encodeURIComponent(JSON.stringify({ schedule, subjects, timeSlots, customNormalTimes, customUniTimes, timeMode })));
  };

  const handleImportAttempt = () => {
    if (!importCode.trim()) return;
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(importCode)));
      if (decoded && decoded.schedule && decoded.subjects) {
        // Místo obyčejného alertu si data uložíme a otevřeme custom confirm
        setPendingImportData(decoded);
        setShowConfirmImportModal(true);
      } else {
        alert("Neplatný kód rozvrhu.");
      }
    } catch (err) {
      alert("Neplatný kód rozvrhu. Zkontrolujte, zda jste jej zkopírovali celý.");
    }
  };

  const finalizeImport = () => {
    if (!pendingImportData) return;
    const { schedule: newSchedule, subjects: newSubjects, timeSlots: newSlots, customNormalTimes: cN, customUniTimes: cU, timeMode: tM } = pendingImportData;
    
    setSchedule(newSchedule);
    setSubjects(newSubjects);
    if (newSlots) setTimeSlots(newSlots);
    if (cN) setCustomNormalTimes(cN);
    if (cU) setCustomUniTimes(cU);
    if (tM) setTimeMode(tM);
    
    syncWithSupabase(newSchedule, newSubjects, newSlots);
    setShowShareModal(false);
    setShowConfirmImportModal(false);
    setPendingImportData(null);
    setImportCode("");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getExportCode());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  const totalDuration = schedule.reduce((acc, c) => acc + c.duration, 0);
  const longClassesDuration = schedule.filter(c => c.duration > 1).reduce((acc, c) => acc + c.duration, 0);
  const isDense = totalDuration > 0 && longClassesDuration >= totalDuration / 2;
  const currentCellWidth = isDense ? DENSE_CELL_WIDTH : NORMAL_CELL_WIDTH;

  const uniqueTeachers = Array.from(new Set(schedule.map(c => c.teacher).filter(t => t.trim() !== "")));
  const uniqueRooms = Array.from(new Set(schedule.map(c => c.room).filter(r => r.trim() !== "")));

  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [draftSlot, setDraftSlot] = useState({ day: 0, timeSlot: 0 });
  
  const [classForm, setClassForm] = useState<{subject: string; teacher: string; room: string; type: ClassType; duration: number; week: WeekType}>({ 
    subject: "", teacher: "", room: "", type: "Běžný", duration: 1, week: "all" 
  });
  const [durationError, setDurationError] = useState<string | null>(null); // NOVÁ PAMĚŤ NA CHYBU

  useEffect(() => {
    if (durationError) {
      const timer = setTimeout(() => setDurationError(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [durationError]);

  // Funkce, která bleskově spočítá, kolik políček je od vybraného času volných
  const getMaxAllowedDuration = () => {
    let max = 0;
    for (let i = draftSlot.timeSlot; i < timeSlots.length; i++) {
      const occupying = schedule.find(c => c.day === draftSlot.day && c.timeSlot <= i && c.timeSlot + c.duration > i);
      if (occupying && occupying.id !== editingClassId) {
        // Pokud třída patří jen do opačného týdne, ignorujeme ji (neblokuje místo).
        if (occupying.week && occupying.week !== 'all' && occupying.week !== activeWeekView) {
          // ignorujeme tuto třídu
        } else {
          break;
        }
      }
      max++;
    }
    return max;
  };
  // --- POMOCNÁ FUNKCE PRO UKLÁDÁNÍ ---
  const syncWithSupabase = async (
    currentSchedule?: ClassBlock[], 
    currentSubjects?: { [key: string]: SubjectData }, 
    currentTimeSlots?: string[],
    modeOverride?: 'normal' | 'uni' // Pomocný parametr pro rychlé přepnutí
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const finalSchedule = currentSchedule || schedule;
      const finalSubjects = currentSubjects || subjects;
      const finalTimeSlots = currentTimeSlots || timeSlots;
      const finalMode = modeOverride || timeMode;
      
      const finalNormal = finalMode === 'normal' ? finalTimeSlots : customNormalTimes;
      const finalUni = finalMode === 'uni' ? finalTimeSlots : customUniTimes;
      const finalActiveWeekView = activeWeekView;

      const scheduleInfo = {
        timeSlots: finalTimeSlots,
        timeMode: finalMode,
        customNormalTimes: finalNormal,
        customUniTimes: finalUni,
        subjects: finalSubjects,
        blocks: finalSchedule,
        activeWeekView: finalActiveWeekView
      };

      const { error } = await supabase
        .from('schedule')
        .upsert({ user: user.id, schedule_info: scheduleInfo }, { onConflict: 'user' });

      if (error) console.error("Chyba ukládání:", error);
    } catch (err) {
      console.error(err);
    }
  };

  // Když uživatel změní zobrazený týden (lichý/sudý), ihned to uložíme do Supabase
  useEffect(() => {
    // Voláme bez parametrů, funkce vezme aktuální stavy (`schedule`, `subjects`, `timeSlots`, `activeWeekView`)
    syncWithSupabase();
  }, [activeWeekView]);

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
          
          if (info.timeMode) setTimeMode(info.timeMode);
          if (info.customNormalTimes) setCustomNormalTimes(info.customNormalTimes);
          if (info.customUniTimes) setCustomUniTimes(info.customUniTimes);
          if (info.subjects) setSubjects(info.subjects);
          if (info.blocks) setSchedule(info.blocks);

          // Načteme, jaký týden byl naposledy aktivní (lichý/sudý)
          if (info.activeWeekView) setActiveWeekView(info.activeWeekView);

          // Správné naplnění aktuálního view
          if (info.timeMode && info.customNormalTimes && info.customUniTimes) {
            setTimeSlots(info.timeMode === 'normal' ? info.customNormalTimes : info.customUniTimes);
          } else if (info.timeSlots) {
            setTimeSlots(info.timeSlots);
            setCustomNormalTimes(info.timeSlots);
          }
          
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

    let updatedSchedule = schedule;
    if (editingSubjectName) {
      updatedSchedule = schedule.map(cls => {
        // Najdeme všechny hodiny, které patřily k původnímu názvu
        if (cls.subject === editingSubjectName) {
          return {
            ...cls,
            subject: newSubjectName,   // Změníme název na nový
            color: newSubjectColor     // Změníme i barvu, pokud ji uživatel upravil
          };
        }
        return cls;
      });
      setSchedule(updatedSchedule);
    }

    // ODESLÁNÍ DO DB (pošleme už i ten upravený rozvrh)
    syncWithSupabase(updatedSchedule, updatedSubjects, timeSlots);
  };

  const handleEditSubject = (subjName: string) => {
    const data = subjects[subjName];
    setEditingSubjectName(subjName);
    setNewSubjectName(subjName);
    setNewSubjectAbbr(data.abbr);
    setNewSubjectColor(data.color);
    setShowAddSubjectModal(true);
  };

  const executeDeleteSubject = (subjName: string) => {
    // 1. Najdeme ID všech hodin, které patří k tomuto předmětu
    const classesToDelete = schedule.filter(c => c.subject === subjName).map(c => c.id);
    
    // 2. Zapneme jim animaci mizení
    if (classesToDelete.length > 0) {
      setDeletingClassIds(prev => [...prev, ...classesToDelete]);
    }

    // 3. Počkáme 150ms na dokončení animace a pak teprve smažeme data
    setTimeout(() => {
      setSubjects(prevSubj => {
        const updatedSubjects = { ...prevSubj };
        delete updatedSubjects[subjName];
        
        setSchedule(prevSched => {
          const updatedSchedule = prevSched.filter(c => c.subject !== subjName);
          syncWithSupabase(updatedSchedule, updatedSubjects, timeSlots);
          return updatedSchedule;
        });
        
        return updatedSubjects;
      });

      // Uklidíme ID z mazacího pole
      if (classesToDelete.length > 0) {
        setDeletingClassIds(prev => prev.filter(id => !classesToDelete.includes(id)));
      }
    }, 150);
  };

  const handleDeleteSubject = (subjName: string) => {
    setDeletePrompt({
      isOpen: true,
      type: 'SUBJECT',
      id: subjName,
      title: `Opravdu chcete smazat předmět ${subjName}? Smažou se i všechny jeho hodiny v rozvrhu.`
    });
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
  
  // Zjistí, jestli má hodina místo a nepřekrývá jinou
  const checkCollision = useCallback((classId: string | null, targetDay: number, targetTimeSlot: number, duration: number) => {
    if (targetTimeSlot + duration > timeSlots.length) return false; // Neteče mimo tabulku?
    for (let i = 0; i < duration; i++) {
      const slot = targetTimeSlot + i;
      const occupying = schedule.find(c => c.day === targetDay && c.timeSlot <= slot && c.timeSlot + c.duration > slot);
      if (occupying && occupying.id !== classId) {
        // Pokud je záznam pouze pro lichý/sudý týden a neodpovídá právě aktivnímu view,
        // považujeme jej za "volný" (tj. neblokuje umístění nové hodiny).
        if (occupying.week && occupying.week !== 'all' && occupying.week !== activeWeekView) {
          continue; // ignorujeme tuto třídu, protože patří do jiného týdne
        }
        return false; // Není tam už někdo jiný pro tento týden
      }
    }
    return true;
  }, [schedule, timeSlots.length, activeWeekView]);

  const handleHoverClass = useCallback((id: string, day: number, timeSlot: number) => {
    setSchedule(prev => prev.map(c => c.id === id ? { ...c, day, timeSlot } : c));
  }, []);

  // Položení hodiny do nového slotu
  const handleDropClass = useCallback((item: ClassBlock, day: number, timeSlot: number) => {
    // Zkontrolujeme, jestli se tam hodina reálně vejde a nepřekrývá se
    if (!checkCollision(item.id, day, timeSlot, item.duration)) return;
    
    setSchedule(prev => {
      const updated = prev.map(cls => cls.id === item.id ? { ...cls, day, timeSlot } : cls);
      // Uložíme nový stav rovnou do databáze
      syncWithSupabase(updated, subjects, timeSlots);
      return updated;
    });
  }, [checkCollision, subjects, timeSlots]);

  const handleDropSubject = (subject: string, color: ColorData, day: number, timeSlot: number) => {
    openClassModal(day, timeSlot, subject);
  };

  const handleEmptyClick = (day: number, timeSlot: number) => {
    openClassModal(day, timeSlot, Object.keys(subjects)[0] || "");
  };

  const openClassModal = (day: number, timeSlot: number, defaultSubj: string, clsToEdit?: ClassBlock) => {
    setDurationError(null);
    setDraftSlot({ day, timeSlot });
    if (clsToEdit) {
      setEditingClassId(clsToEdit.id);
      setClassForm({ subject: clsToEdit.subject, teacher: clsToEdit.teacher, room: clsToEdit.room, type: clsToEdit.type, duration: clsToEdit.duration, week: clsToEdit.week || "all" });
    } else {
      setEditingClassId(null);
      setClassForm({ subject: defaultSubj, teacher: "", room: "", type: "Běžný", duration: 1, week: "all" });
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
    
    // Posíláme 'updated', protože 'schedule' v tuhle chvíli ještě není v Reactu aktualizované
    syncWithSupabase(updated, subjects, timeSlots);
  };

    const executeDeleteClass = (id: string) => {
    setDeletingClassIds(prev => [...prev, id]); 
    setTimeout(() => {
      setSchedule(prev => {
        const updated = prev.filter(c => c.id !== id);
        syncWithSupabase(updated, subjects, timeSlots); 
        return updated;
      });
      setDeletingClassIds(prev => prev.filter(dId => dId !== id));
    }, 150);
  };

  const handleDeleteClass = (id: string) => {
    const cls = schedule.find(c => c.id === id);
    if (!cls) return;
    setDeletePrompt({
      isOpen: true,
      type: 'CLASS',
      id: id,
      title: `Opravdu chcete smazat tuto hodinu (${cls.subject}) z rozvrhu?`
    });
  };

  const confirmDelete = () => {
    if (deletePrompt.type === 'SUBJECT' && deletePrompt.id) executeDeleteSubject(deletePrompt.id);
    if (deletePrompt.type === 'CLASS' && deletePrompt.id) executeDeleteClass(deletePrompt.id);
    setDeletePrompt({ ...deletePrompt, isOpen: false });
  };

  const getClassForSlot = (day: number, timeSlot: number) => schedule.find(cls => 
    cls.day === day && 
    cls.timeSlot === timeSlot &&
    (!cls.week || cls.week === 'all' || cls.week === activeWeekView) // Filtruje liché/sudé
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rozvrh hodin</h1>
            {/* PŘEPÍNAČ TÝDNŮ */}
            <div className="relative flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              {[
                { id: 'odd', label: 'Lichý' },
                { id: 'even', label: 'Sudý' }
              ].map((w) => {
                const isActive = activeWeekView === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setActiveWeekView(w.id as 'odd' | 'even')}
                    className={`relative flex-1 px-4 py-1 text-sm font-medium rounded-md transition-colors z-10 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    {isActive && (
                      <motion.div layoutId="weekSwitchPill" className="absolute inset-0 bg-white dark:bg-gray-600 rounded-md shadow-sm border border-gray-200 dark:border-gray-500" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                    )}
                    <span className="relative z-20">{w.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {isEditing ? "Upravte svůj rozvrh přetažením prvků" : "Kliknutím na hodinu zobrazíte detaily"}
          </p>
        </div>
        <div className="flex gap-3">
          {/* VYLEPŠENÍ: AnimatePresence pro tlačítka v hlavičce */}
          <AnimatePresence>
            {isEditing && (
              <>
                <motion.button 
                  key="btn-share"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  onClick={() => setShowShareModal(true)} 
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm font-medium shadow-sm"
                >
                  <Share2 size={16} />
                  Sdílet
                </motion.button>

                <motion.button 
                  key="btn-times"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.2 }}
                  onClick={openTimesModal}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm"
                >
                  <Settings2 size={16} />
                  Upravit časy
                </motion.button>
              </>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsEditing(!isEditing)}
            // Přidáme layout, aby se ostatní tlačítka plynule posunula, když se zjeví "Hotovo"
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95 ${
              isEditing 
                ? "bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow" 
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {isEditing ? "Hotovo" : "Upravit rozvrh"}
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto overflow-y-auto max-h-[70vh] relative">
        <div className="w-max min-w-full">
          
          {/* Header Row (Sticky top) */}
          <div className="sticky top-0 z-20 gap-1.5 p-3 bg-gray-50/95 dark:bg-gray-700/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm" style={{ display: 'grid', gridTemplateColumns: `40px repeat(${timeSlots.length}, ${currentCellWidth}px)` }}>
            <div className="sticky left-0 z-30 bg-gray-50 dark:bg-gray-700 font-semibold text-gray-900 dark:text-white flex items-center pr-2 text-sm">
              Den
            </div>
            {timeSlots.map((time) => (
              <div key={time} className="font-semibold text-gray-900 dark:text-white text-center text-xs flex items-center justify-center">
                {time}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          <div className="p-3">
            {days.map((dayName, dayIndex) => (
              // OPRAVA 1: Žádný motion.div layout na řádcích! Tím se opraví Z-Index a ořezávání stínů.
              <div key={dayName} className="gap-1.5 mb-2 relative" style={{ display: 'grid', gridTemplateColumns: `40px repeat(${timeSlots.length}, ${currentCellWidth}px)` }}>
                {/* Sticky left day column */}
                <div className="sticky left-0 z-10 bg-white dark:bg-gray-800 flex items-center pr-2">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{dayName}</div>
                </div>
                {(() => {
                  const rowSlots = [];
                  // OPRAVA 2: Smazáno "skipUntil". Vykreslíme i ty prázdné buňky, co jsou pod dlouhou hodinou, 
                  // aby fungovaly jako lapače myši pro posouvání po JEDNOM políčku.
                  for (let timeIndex = 0; timeIndex < timeSlots.length; timeIndex++) {
                    const cls = getClassForSlot(dayIndex, timeIndex);
                    const colSpan = cls?.duration || 1;
                    
                    rowSlots.push(
                      <TimeSlot
                        key={`${dayIndex}-${timeIndex}`}
                        day={dayIndex}
                        timeSlot={timeIndex}
                        colSpan={colSpan}
                        isDense={isDense}
                        isDeleting={cls ? deletingClassIds.includes(cls.id) : false}
                        isEditing={isEditing}
                        classData={cls}
                        abbr={cls ? (subjects[cls.subject]?.abbr || "") : ""}
                        checkCollision={checkCollision}
                        onHoverClass={handleHoverClass}
                        onDragEndClass={() => syncWithSupabase(scheduleRef.current, subjects, timeSlots)}
                        onDropSubject={handleDropSubject}
                        onEmptyClick={handleEmptyClick}
                        onClassClick={() => { if (!isEditing && cls) navigate(`/panel/rozvrh/${cls.id}`); }}
                        onEditClass={() => openClassModal(dayIndex, timeIndex, cls?.subject || "", cls)}
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
        <div className="flex items-center justify-between mb-4 h-10"> {/* Pevná výška h-10 pro stabilní layout při animaci */}
          <h3 className="font-semibold text-gray-900 dark:text-white">Předměty</h3>
          {/* VYLEPŠENÍ: AnimatePresence pro tlačítko v legendě */}
          <AnimatePresence>
            {isEditing && (
              <motion.button 
                // Animujeme zprava doleva, fade in/out
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
                onClick={openNewSubjectModal} 
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-5 h-5" /> Přidat předmět
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {Object.entries(subjects).map(([subj, data]) => (
              <DraggableSubject key={subj} subject={subj} data={data} isEditing={isEditing} onEdit={() => handleEditSubject(subj)} onDelete={() => handleDeleteSubject(subj)} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL: Přidat/Upravit Hodinu */}
      <AnimatePresence>
        {showAddClassModal && (
          <motion.div 
            key="modal-backdrop-class"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
            >
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
                    {/* Rychlý výběr nedávných vyučujících */}
                    {uniqueTeachers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {uniqueTeachers.filter(t => t !== classForm.teacher).slice(0, 4).map(t => (
                          <button key={t} type="button" onClick={() => setClassForm({ ...classForm, teacher: t })} className="px-2 py-1 text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Místnost</label>
                    <input type="text" value={classForm.room} onChange={(e) => setClassForm({...classForm, room: e.target.value})} placeholder="Např. A201" className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    {/* Rychlý výběr nedávných místností */}
                    {uniqueRooms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {uniqueRooms.filter(r => r !== classForm.room).slice(0, 4).map(r => (
                          <button key={r} type="button" onClick={() => setClassForm({ ...classForm, room: r })} className="px-2 py-1 text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* 1. Vlastní Number Input s tlačítky vpravo a 100% schovanými defaultními šipkami */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Délka (počet bloků)</label>
                  <div className={`flex items-center w-full border rounded-lg overflow-hidden transition-shadow bg-white dark:bg-gray-800 ${durationError ? 'border-red-400 focus-within:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500'}`}>
                    <input 
                      type="number" 
                      min="1" 
                      max={getMaxAllowedDuration()} 
                      value={classForm.duration} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        const maxAllowed = getMaxAllowedDuration();
                        if (val > maxAllowed) {
                           setClassForm({...classForm, duration: maxAllowed});
                           setDurationError(draftSlot.timeSlot + maxAllowed >= timeSlots.length ? "Hodina by přesáhla konec rozvrhu." : "Překrývá se s jiným předmětem.");
                        } else {
                           setClassForm({...classForm, duration: val});
                           setDurationError(null);
                        }
                      }}
                      className="flex-1 bg-transparent border-none p-2 pl-3 dark:text-white focus:ring-0 font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                      style={{ MozAppearance: 'textfield' }} 
                    />
                    <div className={`flex border-l ${durationError ? 'border-red-200 dark:border-red-900/50' : 'border-gray-200 dark:border-gray-600'}`}>
                      <button
                        type="button"
                        onClick={() => { setClassForm(prev => ({ ...prev, duration: Math.max(1, prev.duration - 1) })); setDurationError(null); }}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors active:bg-gray-200 dark:active:bg-gray-500 font-bold border-r border-gray-200 dark:border-gray-600"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const maxAllowed = getMaxAllowedDuration();
                          if (classForm.duration >= maxAllowed) {
                            setDurationError(draftSlot.timeSlot + maxAllowed >= timeSlots.length ? "Hodina by přesáhla konec rozvrhu." : "Nelze prodloužit, na místě je jiná hodina.");
                          } else {
                            setClassForm(prev => ({ ...prev, duration: prev.duration + 1 }));
                            setDurationError(null);
                          }
                        }}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors active:bg-gray-200 dark:active:bg-gray-500 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Animované zobrazení varování */}
                  <AnimatePresence>
                    {durationError && (
                      <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: "auto"}} exit={{opacity: 0, height: 0}} className="text-red-500 text-[11px] mt-1.5 font-medium">
                        {durationError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Animované custom Radio Buttony */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Typ hodiny</label>
                  <div className="flex flex-wrap gap-4">
                    {['Běžný', 'Přednáška', 'Cvičení', 'Seminář'].map((type) => {
                      const isChecked = classForm.type === type;
                      return (
                        <label key={type} className="flex items-center gap-2 cursor-pointer group">
                          {/* Skutečný input schováme, ale necháme ho tu kvůli logice */}
                          <input type="radio" className="hidden" checked={isChecked} onChange={() => setClassForm({...classForm, type: type as ClassType})} />
                          
                          {/* Náš falešný, krásně animovaný radio button */}
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ease-in-out ${isChecked ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-500 group-hover:border-indigo-400'}`}>
                            <div className={`w-2 h-2 rounded-full bg-indigo-500 transition-transform duration-150 ease-out ${isChecked ? 'scale-100' : 'scale-0'}`} />
                          </div>
                          
                          <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* LICHÝ / SUDÝ */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Opakování</label>
                  <div className="flex gap-2">
                    {[{id: 'all', label: 'Každý týden'}, {id: 'odd', label: 'Lichý'}, {id: 'even', label: 'Sudý'}].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setClassForm({...classForm, week: w.id as WeekType})}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                          classForm.week === w.id 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>


              {/* 3. Tlačítka s animací zmáčknutí (active:scale-95) a plynulým hoverem */}
              <div className="flex gap-3">
                <button onClick={() => setShowAddClassModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-200 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">Zrušit</button>
                <button onClick={handleSaveClass} className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-sm hover:shadow active:scale-95 transition-all duration-200">Uložit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: Přidat/Upravit Předmět */}
      <AnimatePresence>
        {showAddSubjectModal && (
          <motion.div 
            key="modal-backdrop-subj"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
            >
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
                <button onClick={() => setShowAddSubjectModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-200 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">Zrušit</button>
                <button onClick={handleSaveSubject} className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-sm hover:shadow active:scale-95 transition-all duration-200">Uložit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: Upravit časy */}
      <AnimatePresence>
        {showEditTimesModal && (
          <motion.div 
            key="modal-backdrop-times"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] flex flex-col"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upravit časové bloky</h3>

              {/* Animovaný přepínač typu časů DRAFTŮ */}
              <div className="relative flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                {[
                  { id: 'normal', label: 'Běžné', data: draftNormalTimes },
                  { id: 'uni', label: 'Vysokoškolské', data: draftUniTimes }
                ].map((type) => {
                  const isActive = draftTimeMode === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setDraftTimeMode(type.id as 'normal' | 'uni')}
                      className={`relative flex-1 py-1.5 text-sm font-medium rounded-md transition-colors z-10 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
                    >
                      {isActive && (
                        <motion.div layoutId="timeTypePill" className="absolute inset-0 bg-white dark:bg-gray-600 rounded-md shadow-sm border border-gray-200 dark:border-gray-500" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                      )}
                      <span className="relative z-20">{type.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Seznam samotných časů s animacemi */}
              <div className="relative mb-4 overflow-y-auto flex-1 min-h-[300px] pr-2 overflow-x-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    layout
                    key={draftTimeMode} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    <AnimatePresence initial={false}>
                      {(draftTimeMode === 'normal' ? draftNormalTimes : draftUniTimes).map((slot, idx) => {
                        const activeList = draftTimeMode === 'normal' ? draftNormalTimes : draftUniTimes;
                        const setList = draftTimeMode === 'normal' ? setDraftNormalTimes : setDraftUniTimes;
                        
                        return (
                          <DraggableTimeSlotItem 
                            key={slot} 
                            index={idx}
                            slot={slot}
                            moveSlot={(dragIndex: number, hoverIndex: number) => moveDraftTimeSlot(dragIndex, hoverIndex, activeList, setList)}
                            updateSlot={(index: number, val: string) => {
                              const updated = [...activeList];
                              updated[index] = val;
                              setList(updated);
                            }}
                            deleteSlot={(index: number) => {
                              const updated = activeList.filter((_, i) => i !== index);
                              setList(updated);
                            }}
                          />
                        )
                      })}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Tlačítko pro přidání nového času */}
              <button 
                onClick={() => {
                  const activeList = draftTimeMode === 'normal' ? draftNormalTimes : draftUniTimes;
                  const setList = draftTimeMode === 'normal' ? setDraftNormalTimes : setDraftUniTimes;
                  const base = "00:00-00:00";
                  const count = activeList.filter(s => s.startsWith(base)).length;
                  setList([...activeList, count > 0 ? `${base} (${count})` : base]);
                }} 
                className="w-full py-2 mb-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <Plus className="w-5 h-5 mx-auto" />
              </button>

              {/* Chybová hláška */}
              <AnimatePresence>
                {timesModalError && (
                  <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: "auto"}} exit={{opacity: 0, height: 0}} className="text-red-500 text-[12px] font-medium mb-4 text-center">
                    {timesModalError}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Spodní lišta s tlačítky Obnovit a Hotovo */}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    if (window.confirm("Opravdu chcete obnovit výchozí časy pro tento režim?")) {
                      if (draftTimeMode === 'normal') setDraftNormalTimes(normalTimes);
                      else setDraftUniTimes(uniTimes);
                    }
                  }} 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Obnovit výchozí
                </button>
                <button 
                  onClick={handleSaveTimes} 
                  className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200"
                >
                  Hotovo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* MODAL: Confirm Delete */}
      <AnimatePresence>
        {deletePrompt.isOpen && (
          <motion.div 
            key="modal-backdrop-delete"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 text-center shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Potvrzení smazání
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {deletePrompt.title}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeletePrompt({ ...deletePrompt, isOpen: false })} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-200 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
                  Zrušit
                </button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm hover:shadow active:scale-95 transition-all duration-200">
                  Smazat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* MODAL: Import/Export (Sdílení) */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            key="modal-backdrop-share"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Sdílet / Importovat rozvrh</h3>

              {/* Sekce EXPORT */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Share2 size={16} className="text-indigo-500" /> Váš kód rozvrhu
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Pošlete tento kód kamarádovi. Pozor, kód je dlouhý, doporučujeme použít tlačítko pro kopírování.
                </p>
                
                {/* VYLEPŠENÍ: Větší, statický display pro kód, do kterého nelze psát */}
                <div className="relative group">
                  <div className="w-full h-24 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg text-[11px] font-mono text-gray-500 dark:text-gray-400 break-all overflow-y-auto select-all cursor-default">
                    {getExportCode()}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="absolute top-1 right-1 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 shadow-sm active:scale-95 transition-all"
                  >
                    {copySuccess ? "Zkopírováno!" : <><Copy size={14} /> Kopírovat kód</>}
                  </button>
                </div>
              </div>

              {/* Sekce IMPORT */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Download size={16} className="text-indigo-500" /> Nahrát z kódu
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Vložte kód rozvrhu od kamaráda.
                </p>
                <textarea 
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Zde vložte zkopírovaný kód..."
                  className="w-full h-20 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg text-sm text-gray-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Spodní lišta s tlačítky - VYLEPŠENÍ: Přesunuto dolu, vlevo zrušit, vpravo nahrát */}
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowShareModal(false); setImportCode(""); }} 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 font-medium"
                >
                  Zrušit
                </button>
                <button 
                  onClick={handleImportAttempt}
                  disabled={!importCode.trim()}
                  className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
                >
                  Importovat rozvrh
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: Custom Confirm pro Import (stejný styl jako delete modal) */}
      <AnimatePresence>
        {showConfirmImportModal && (
          <motion.div 
            key="modal-backdrop-confirm-import"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1001] p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 rounded-full shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Opravdu přepsat rozvrh?</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Nahráním nového rozvrhu ztratíte veškerá svá stávající data. Tuto akci nelze vzít zpět. Chcete pokračovat?
              </p>
              <div className="flex gap-3">
                <button onClick={() => { setShowConfirmImportModal(false); setPendingImportData(null); }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium active:scale-95 transition-all">
                  Zrušit
                </button>
                <button onClick={finalizeImport} className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 shadow active:scale-95 transition-all">
                  Ano, přepsat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


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
