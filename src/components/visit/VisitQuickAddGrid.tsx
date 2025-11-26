import { EVENT_TYPES } from './eventTypes';

import type { EventType, EventCategory } from './eventTypes';


type QuickAddGridProps = {
    onSelect: (eventType: EventType) => void;
};

// Map categories to column metadata
const CATEGORY_METADATA: Record<
    EventCategory,
    { id: string; title: string; color: 'sky' | 'emerald' | 'indigo' | 'amber' }
> = {
    Intake: { id: 'intake', title: 'Intake', color: 'sky' },
    Output: { id: 'output', title: 'Output', color: 'emerald' },
    Activity: { id: 'activity', title: 'Activity', color: 'indigo' },
    Other: { id: 'general', title: 'General', color: 'amber' },
};

// Derive column config from EVENT_TYPES
const COLUMN_CONFIG = Object.entries(CATEGORY_METADATA).map(([category, metadata]) => ({
    ...metadata,
    category: category as EventCategory,
}));

const getColumnStyles = (color: typeof COLUMN_CONFIG[number]['color']) => {
    switch (color) {
        case 'sky':
            return {
                border: 'border-sky-200 dark:border-sky-800',
                bg: 'bg-sky-50/50 dark:bg-sky-950/20',
                headerBg: 'bg-sky-100/70 dark:bg-sky-950/30',
                headerText: 'text-sky-900 dark:text-sky-300',
                buttonBg: 'bg-sky-50 dark:bg-sky-950/20',
                buttonHover: 'hover:bg-sky-100 dark:hover:bg-sky-900/30',
                iconBg: 'bg-sky-50 dark:bg-sky-950/30',
                iconBorder: 'border-sky-200 dark:border-sky-800',
                iconText: 'text-sky-700 dark:text-sky-400',
            };
        case 'emerald':
            return {
                border: 'border-emerald-200 dark:border-emerald-800',
                bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
                headerBg: 'bg-emerald-100/70 dark:bg-emerald-950/30',
                headerText: 'text-emerald-900 dark:text-emerald-300',
                buttonBg: 'bg-emerald-50 dark:bg-emerald-950/20',
                buttonHover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
                iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
                iconBorder: 'border-emerald-200 dark:border-emerald-800',
                iconText: 'text-emerald-700 dark:text-emerald-400',
            };
        case 'indigo':
            return {
                border: 'border-indigo-200 dark:border-indigo-800',
                bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
                headerBg: 'bg-indigo-100/70 dark:bg-indigo-950/30',
                headerText: 'text-indigo-900 dark:text-indigo-300',
                buttonBg: 'bg-indigo-50 dark:bg-indigo-950/20',
                buttonHover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
                iconBg: 'bg-indigo-50 dark:bg-indigo-950/30',
                iconBorder: 'border-indigo-200 dark:border-indigo-800',
                iconText: 'text-indigo-700 dark:text-indigo-400',
            };
        default: // amber
            return {
                border: 'border-amber-200 dark:border-amber-800',
                bg: 'bg-amber-50/50 dark:bg-amber-950/20',
                headerBg: 'bg-amber-100/70 dark:bg-amber-950/30',
                headerText: 'text-amber-900 dark:text-amber-300',
                buttonBg: 'bg-amber-50 dark:bg-amber-950/20',
                buttonHover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
                iconBg: 'bg-amber-50 dark:bg-amber-950/30',
                iconBorder: 'border-amber-200 dark:border-amber-800',
                iconText: 'text-amber-700 dark:text-amber-400',
            };
    }
};

export function VisitQuickAddGrid({ onSelect }: QuickAddGridProps) {
    // Order columns: Intake, Output, Activity, General
    const columnOrder: EventCategory[] = ['Intake', 'Output', 'Activity', 'Other'];
    const orderedColumns = columnOrder.map((category) => COLUMN_CONFIG.find((col) => col.category === category)).filter(Boolean) as typeof COLUMN_CONFIG;

    return (
        <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Event</h2>
            <div className="flex lg:grid lg:grid-cols-4 gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-4 lg:mx-0 px-4 lg:px-0 scrollbar-hide">
                {orderedColumns.map((column) => {
                    const styles = getColumnStyles(column.color);
                    const columnEvents = EVENT_TYPES.filter((event) =>
                        event.category === column.category
                    );

                    return (
                        <div
                            key={column.id}
                            className={`flex-shrink-0 w-36 lg:flex-shrink lg:w-auto rounded-lg border-2 ${styles.border} ${styles.bg} overflow-hidden`}
                        >
                            {/* Column Header */}
                            <div
                                className={`px-3 py-2 border-b-2 ${styles.border} ${styles.headerBg} ${styles.headerText} text-xs font-semibold`}
                            >
                                {column.title}
                            </div>

                            {/* Column Buttons */}
                            <div className="p-2 space-y-2">
                                {columnEvents.map((item) => (
                                    <button
                                        key={item.label}
                                        type="button"
                                        className={`w-full flex items-center gap-2 rounded-lg ${styles.buttonBg} ${styles.buttonHover} px-3 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 active:scale-[0.98] transition`}
                                        onClick={() => onSelect(item.label as EventType)}
                                    >
                                        <div
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm border ${styles.iconBg} ${styles.iconBorder} ${styles.iconText}`}
                                        >
                                            {item.icon}
                                        </div>
                                        <span className="truncate text-left">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


