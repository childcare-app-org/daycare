type QuickAddGridProps = {
    onSelect: (eventType: string) => void;
};

const quickAddEvents: { label: string; category: 'Output' | 'Input' | 'State' | 'Other'; icon: string }[] = [
    { label: 'Pee', category: 'Output', icon: '💧' },
    { label: 'Poo', category: 'Output', icon: '💩' },
    { label: 'Puke', category: 'Output', icon: '🤢' },
    { label: 'Eat', category: 'Input', icon: '🍽️' },
    { label: 'Drink', category: 'Input', icon: '🥤' },
    { label: 'Medication', category: 'Input', icon: '💊' },
    { label: 'Slept', category: 'State', icon: '😴' },
    { label: 'Woke-up', category: 'State', icon: '🌅' },
    { label: 'Temperature', category: 'Other', icon: '🌡️' },
    { label: 'Note', category: 'Other', icon: '📝' },
];

const getBadgeClasses = (category: 'Output' | 'Input' | 'State' | 'Other') => {
    switch (category) {
        case 'Output':
            return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        case 'Input':
            return 'bg-sky-50 text-sky-700 border border-sky-100';
        case 'State':
            return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
        default:
            return 'bg-amber-50 text-amber-700 border-amber-100 border';
    }
};

export function VisitQuickAddGrid({ onSelect }: QuickAddGridProps) {
    return (
        <div className="mb-4">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {quickAddEvents.map((item) => (
                    <button
                        key={item.label}
                        type="button"
                        className="flex flex-col items-center rounded-2xl bg-gray-50 px-2 py-2 text-[11px] font-medium text-gray-800 hover:bg-gray-100 active:scale-[0.97] transition"
                        onClick={() => onSelect(item.label)}
                    >
                        <div
                            className={`mb-1 flex h-9 w-9 items-center justify-center rounded-2xl text-[15px] ${getBadgeClasses(item.category)}`}
                        >
                            {item.icon}
                        </div>
                        <span className="truncate">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}


