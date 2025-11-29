import React from 'react';
import { TimetableEntry, DayOfWeek, SessionType } from '../../services/timetableService';
import { Clock, MapPin, User, BookOpen, Edit, Trash2 } from 'lucide-react';

interface ScheduleGridProps {
  entries: TimetableEntry[];
  onEdit?: (entry: TimetableEntry) => void;
  onDelete?: (entry: TimetableEntry) => void;
  onSlotClick?: (day: DayOfWeek, time: string) => void;
  readOnly?: boolean;
}

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  lecture: 'bg-blue-100 border-blue-300 text-blue-900',
  td: 'bg-green-100 border-green-300 text-green-900',
  tp: 'bg-purple-100 border-purple-300 text-purple-900',
  exam: 'bg-red-100 border-red-300 text-red-900',
  makeup: 'bg-yellow-100 border-yellow-300 text-yellow-900',
};

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  lecture: 'Lecture',
  td: 'TD',
  tp: 'TP',
  exam: 'Exam',
  makeup: 'Makeup',
};

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  entries,
  onEdit,
  onDelete,
  onSlotClick,
  readOnly = false,
}) => {
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getEntryPosition = (entry: TimetableEntry) => {
    const startMinutes = timeToMinutes(entry.startTime);
    const endMinutes = timeToMinutes(entry.endTime);
    const firstSlotMinutes = timeToMinutes(TIME_SLOTS[0]);
    
    const topOffset = ((startMinutes - firstSlotMinutes) / 30) * 60; // 60px per 30min slot
    const height = ((endMinutes - startMinutes) / 30) * 60;
    
    return { top: topOffset, height };
  };

  const getEntriesForDay = (day: DayOfWeek): TimetableEntry[] => {
    return entries.filter((e) => e.dayOfWeek === day);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header */}
          <div className="flex border-b">
            <div className="w-20 flex-shrink-0 bg-gray-50 border-r">
              <div className="h-12 flex items-center justify-center text-sm font-semibold text-gray-700">
                Time
              </div>
            </div>
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex-1 min-w-[180px] bg-gray-50 border-r last:border-r-0"
              >
                <div className="h-12 flex items-center justify-center text-sm font-semibold text-gray-700">
                  {DAY_LABELS[day]}
                </div>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex">
            {/* Time column */}
            <div className="w-20 flex-shrink-0 border-r bg-gray-50">
              {TIME_SLOTS.map((time, index) => (
                <div
                  key={time}
                  className={`h-[60px] flex items-center justify-center text-xs text-gray-600 border-b ${
                    index % 2 === 0 ? 'border-gray-300' : 'border-gray-200'
                  }`}
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Days columns */}
            {DAYS.map((day) => {
              const dayEntries = getEntriesForDay(day);
              
              return (
                <div
                  key={day}
                  className="flex-1 min-w-[180px] border-r last:border-r-0 relative"
                >
                  {/* Time slot grid lines */}
                  {TIME_SLOTS.map((time, index) => (
                    <div
                      key={time}
                      className={`h-[60px] border-b ${
                        index % 2 === 0 ? 'border-gray-300' : 'border-gray-200'
                      } ${!readOnly && 'hover:bg-blue-50 cursor-pointer transition-colors'}`}
                      onClick={() => !readOnly && onSlotClick?.(day, time)}
                    />
                  ))}

                  {/* Timetable entries */}
                  {dayEntries.map((entry) => {
                    const { top, height } = getEntryPosition(entry);
                    
                    return (
                      <div
                        key={entry.id}
                        className={`absolute left-1 right-1 border-l-4 rounded p-2 overflow-hidden ${
                          SESSION_TYPE_COLORS[entry.sessionType]
                        } ${entry.isCancelled ? 'opacity-50' : ''}`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        <div className="text-xs font-semibold truncate">
                          {entry.subject.code}
                        </div>
                        <div className="text-xs truncate mt-0.5">
                          {entry.subject.name}
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs mt-1 opacity-80">
                          <Clock className="w-3 h-3" />
                          <span>{entry.startTime} - {entry.endTime}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs mt-0.5 opacity-80 truncate">
                          <User className="w-3 h-3" />
                          <span>{entry.teacher.firstName} {entry.teacher.lastName}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs mt-0.5 opacity-80">
                          <MapPin className="w-3 h-3" />
                          <span>{entry.room.code}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs mt-0.5">
                          <BookOpen className="w-3 h-3" />
                          <span className="font-medium">{SESSION_TYPE_LABELS[entry.sessionType]}</span>
                        </div>

                        {!readOnly && (onEdit || onDelete) && (
                          <div className="flex gap-1 mt-1">
                            {onEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(entry);
                                }}
                                className="p-1 bg-white rounded hover:bg-gray-100 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(entry);
                                }}
                                className="p-1 bg-white rounded hover:bg-red-100 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            )}
                          </div>
                        )}

                        {entry.isCancelled && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <span className="text-white text-xs font-bold px-2 py-1 bg-red-600 rounded">
                              CANCELLED
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(SESSION_TYPE_COLORS).map(([type, colorClass]) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-4 h-4 border rounded ${colorClass}`} />
              <span className="text-gray-700">{SESSION_TYPE_LABELS[type as SessionType]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
