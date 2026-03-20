import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";

const ItemType = "CLASS";

const days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];
const times = [
  "08:00 - 09:30",
  "09:45 - 11:15",
  "11:30 - 13:00",
  "13:30 - 15:00",
  "15:15 - 16:45",
];

const subjectColors: { [key: string]: string } = {
  Matematika: "bg-blue-500",
  Čeština: "bg-green-500",
  Angličtina: "bg-purple-500",
  Fyzika: "bg-orange-500",
  Chemie: "bg-pink-500",
  Dějepis: "bg-yellow-500",
  Zeměpis: "bg-teal-500",
  Informatika: "bg-indigo-500",
};

interface ClassBlock {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  color: string;
  day: number;
  timeSlot: number;
}

interface DraggableClassProps {
  classData: ClassBlock;
  onClick: () => void;
}

function DraggableClass({ classData, onClick }: DraggableClassProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: classData,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`${classData.color} rounded-lg p-3 cursor-move shadow-sm hover:shadow-md transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="text-white">
        <div className="font-bold text-sm mb-1">{classData.subject}</div>
        <div className="text-xs opacity-90">{classData.teacher}</div>
        <div className="text-xs opacity-75 mt-1">{classData.room}</div>
      </div>
    </div>
  );
}

interface TimeSlotProps {
  day: number;
  timeSlot: number;
  classData?: ClassBlock;
  onDrop: (item: ClassBlock, day: number, timeSlot: number) => void;
  onClick: () => void;
}

function TimeSlot({ day, timeSlot, classData, onDrop, onClick }: TimeSlotProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: (item: ClassBlock) => onDrop(item, day, timeSlot),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`min-h-[80px] border border-gray-200 dark:border-gray-700 rounded-lg transition-colors ${
        isOver ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600" : "bg-white dark:bg-gray-800"
      }`}
    >
      {classData ? (
        <DraggableClass classData={classData} onClick={onClick} />
      ) : (
        <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Plus className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
}

function ScheduleContent() {
  const navigate = useNavigate();
  const [isOddWeek, setIsOddWeek] = useState(true);
  const [schedule, setSchedule] = useState<ClassBlock[]>([
    {
      id: "1",
      subject: "Matematika",
      teacher: "Mgr. Novák",
      room: "A201",
      color: "bg-blue-500",
      day: 0,
      timeSlot: 0,
    },
    {
      id: "2",
      subject: "Čeština",
      teacher: "Mgr. Svobodová",
      room: "B105",
      color: "bg-green-500",
      day: 0,
      timeSlot: 1,
    },
    {
      id: "3",
      subject: "Fyzika",
      teacher: "Dr. Dvořák",
      room: "C302",
      color: "bg-orange-500",
      day: 0,
      timeSlot: 2,
    },
    {
      id: "4",
      subject: "Angličtina",
      teacher: "Mgr. Smith",
      room: "D104",
      color: "bg-purple-500",
      day: 1,
      timeSlot: 0,
    },
    {
      id: "5",
      subject: "Informatika",
      teacher: "Ing. Procházka",
      room: "E201",
      color: "bg-indigo-500",
      day: 1,
      timeSlot: 1,
    },
    {
      id: "6",
      subject: "Chemie",
      teacher: "Dr. Malinová",
      room: "F302",
      color: "bg-pink-500",
      day: 2,
      timeSlot: 0,
    },
  ]);

  const handleDrop = (item: ClassBlock, day: number, timeSlot: number) => {
    setSchedule((prev) =>
      prev.map((cls) =>
        cls.id === item.id ? { ...cls, day, timeSlot } : cls
      )
    );
  };

  const handleClassClick = (classId: string) => {
    navigate(`/rozvrh/${classId}`);
  };

  const getClassForSlot = (day: number, timeSlot: number) => {
    return schedule.find((cls) => cls.day === day && cls.timeSlot === timeSlot);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Rozvrh hodin
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Přetáhněte předměty pro úpravu rozvrhu
          </p>
        </div>

        {/* Week Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Sudý týden
          </span>
          <button
            onClick={() => setIsOddWeek(!isOddWeek)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              isOddWeek ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                isOddWeek ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Lichý týden
          </span>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="grid grid-cols-6 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <div className="font-semibold text-gray-900 dark:text-white">Čas</div>
            {days.map((day) => (
              <div key={day} className="font-semibold text-gray-900 dark:text-white text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="p-4">
            {times.map((time, timeSlot) => (
              <div key={time} className="grid grid-cols-6 gap-3 mb-3">
                <div className="flex items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">{time}</div>
                </div>
                {days.map((_, day) => (
                  <TimeSlot
                    key={`${day}-${timeSlot}`}
                    day={day}
                    timeSlot={timeSlot}
                    classData={getClassForSlot(day, timeSlot)}
                    onDrop={handleDrop}
                    onClick={() => {
                      const cls = getClassForSlot(day, timeSlot);
                      if (cls) handleClassClick(cls.id);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Předměty</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(subjectColors).map(([subject, color]) => (
            <div key={subject} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${color} rounded`}></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{subject}</span>
            </div>
          ))}
        </div>
      </div>
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
