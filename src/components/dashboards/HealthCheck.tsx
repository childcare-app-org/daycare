import { Droplets, Frown, Meh, Smile, Stethoscope, Utensils, Wind } from 'lucide-react';
import * as React from 'react';
import { Slider } from '~/components/ui/slider';
import { cn } from '~/lib/utils';

export interface HealthCheckProps {
    initialData?: Record<string, any>
    onUpdate: (data: Record<string, any>) => void
    readOnly?: boolean
}

type AilmentType = 'cough' | 'nasal' | 'wheezing' | 'mood' | 'appetite';

type AilmentOptionStyle = {
    labelClass: string;
    activeLabelClass: string;
    dotClass: string;
};

const OPTION_STYLES = {
    // Baseline gray (normal)
    normalGray: {
        labelClass: "text-gray-500 hover:text-gray-700",
        activeLabelClass: "text-gray-700 font-semibold scale-110",
        dotClass: "bg-gray-500",
    },
    // Yellow (mild)
    mildYellow: {
        labelClass: "text-amber-600/90 hover:text-amber-700",
        activeLabelClass: "text-amber-700 font-semibold scale-110",
        dotClass: "bg-amber-500",
    },
    // Red (severe / terrible)
    redSevere: {
        labelClass: "text-red-600/90 hover:text-red-700",
        activeLabelClass: "text-red-700 font-semibold scale-110",
        dotClass: "bg-red-600",
    },
    // Green (excellent)
    greenExcellent: {
        labelClass: "text-green-600/80 hover:text-green-700",
        activeLabelClass: "text-green-700 font-semibold scale-110",
        dotClass: "bg-green-600",
    },
} satisfies Record<string, AilmentOptionStyle>;

const AILMENTS: {
    id: AilmentType;
    label: string;
    icon: React.ElementType;
    options: {
        value: number;
        label: string;
        icon?: React.ElementType;
        labelClass: string;
        activeLabelClass: string;
        dotClass: string;
    }[]
}[] = [
        {
            id: 'cough',
            label: 'Cough',
            icon: Wind, // Using Wind as proxy for cough/air
            options: [
                { value: 0, label: 'Normal', icon: Meh, ...OPTION_STYLES.normalGray },
                { value: 1, label: 'Mild', icon: Frown, ...OPTION_STYLES.mildYellow },
                { value: 2, label: 'Severe', icon: Frown, ...OPTION_STYLES.redSevere },
            ]
        },
        {
            id: 'nasal',
            label: 'Nasal',
            icon: Droplets,
            options: [
                { value: 0, label: 'Normal', icon: Meh, ...OPTION_STYLES.normalGray },
                { value: 1, label: 'Mild', icon: Frown, ...OPTION_STYLES.mildYellow },
                { value: 2, label: 'Severe', icon: Frown, ...OPTION_STYLES.redSevere },
            ]
        },
        {
            id: 'wheezing',
            label: 'Wheeze',
            icon: Stethoscope,
            options: [
                { value: 0, label: 'Normal', icon: Meh, ...OPTION_STYLES.normalGray },
                { value: 1, label: 'Mild', icon: Frown, ...OPTION_STYLES.mildYellow },
                { value: 2, label: 'Severe', icon: Frown, ...OPTION_STYLES.redSevere },
            ]
        },
        {
            id: 'mood',
            label: 'Mood',
            icon: Smile,
            options: [
                { value: -1, label: 'Terrible', icon: Frown, ...OPTION_STYLES.redSevere },
                { value: 0, label: 'Normal', icon: Meh, ...OPTION_STYLES.normalGray },
                { value: 1, label: 'Excellent', icon: Smile, ...OPTION_STYLES.greenExcellent },
            ]
        },
        {
            id: 'appetite',
            label: 'Appetite',
            icon: Utensils,
            options: [
                { value: -1, label: 'Terrible', icon: Frown, ...OPTION_STYLES.redSevere },
                { value: 0, label: 'Normal', icon: Meh, ...OPTION_STYLES.normalGray },
                { value: 1, label: 'Excellent', icon: Smile, ...OPTION_STYLES.greenExcellent },
            ]
        },
    ];

function getAilmentPillClasses(id: AilmentType, value: number, isSelected: boolean) {
    if (isSelected) {
        return "bg-blue-600 text-white ring-2 ring-blue-200";
    }

    // Mood/Appetite use -1, 0, 1: Terrible, Normal, Excellent
    if (id === 'mood' || id === 'appetite') {
        if (value === -1) {
            return "bg-red-600/10 text-red-700 border border-red-500/60";
        }
        if (value === 1) {
            return "bg-green-600/10 text-green-700 border border-green-500/60";
        }
        // Normal
        return "bg-gray-100 text-gray-500";
    }

    // Cough/Nasal/Wheeze use 0,1,2: Normal, Mild, Severe
    if (value === 1) {
        // Mild
        return "bg-amber-100 text-amber-800 border border-amber-400/70";
    }
    if (value === 2) {
        // Severe
        return "bg-red-600/10 text-red-700 border border-red-500/60";
    }

    // Normal
    return "bg-gray-100 text-gray-500";
}

export function HealthCheck({ initialData = {}, onUpdate, readOnly = false }: HealthCheckProps) {
    const [data, setData] = React.useState<Record<string, number>>(initialData as Record<string, number>);
    const [expandedId, setExpandedId] = React.useState<string | null>(null);
    const cardRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setExpandedId(null);
            }
        }

        if (expandedId && !readOnly) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [expandedId, readOnly]);

    const handleValueChange = (id: string, value: number) => {
        if (readOnly) return;
        const newData = { ...data, [id]: value };
        setData(newData);
        onUpdate(newData);
    };

    const activeAilment = AILMENTS.find(a => a.id === expandedId);
    const activeValue = activeAilment ? (data[activeAilment.id] ?? 0) : 0;
    const sliderMin = activeAilment
        ? Math.min(...activeAilment.options.map((o) => o.value))
        : -1;
    const sliderMax = activeAilment
        ? Math.max(...activeAilment.options.map((o) => o.value))
        : 1;

    // In read-only mode, show all ailments with their values
    if (readOnly) {
        return (
            <div className="w-full space-y-4">
                <div className="bg-white rounded-xl border border-gray-300 p-6 shadow-lg w-full">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Status</h2>
                    <div className="space-y-6">
                        {AILMENTS.map((ailment) => {
                            const value = data[ailment.id] ?? 0;
                            const Icon = ailment.icon;
                            const currentOption = ailment.options.find(opt => opt.value === value);
                            const displayOption = currentOption ?? ailment.options[0]!;

                            return (
                                <div key={ailment.id} className="space-y-3">
                                    {/* Ailment Header */}
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-full transition-colors shadow-sm",
                                            getAilmentPillClasses(ailment.id, value, false)
                                        )}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {ailment.label}
                                        </span>
                                    </div>

                                    {/* All Options Display */}
                                    <div className="flex justify-between gap-2 px-2">
                                        {ailment.options.map((opt) => {
                                            const isActive = opt.value === value;
                                            return (
                                                <div
                                                    key={opt.value}
                                                    className={cn(
                                                        "flex flex-col items-center gap-1.5 w-full text-center p-2 rounded-md transition-all",
                                                        isActive
                                                            ? "bg-blue-50 border-2 border-blue-300"
                                                            : "bg-gray-50 border border-gray-200"
                                                    )}
                                                >
                                                    {opt.icon && (
                                                        <opt.icon className={cn(
                                                            "w-4 h-4",
                                                            isActive ? opt.activeLabelClass : opt.labelClass
                                                        )} />
                                                    )}
                                                    <span className={cn(
                                                        "text-xs font-medium",
                                                        isActive ? opt.activeLabelClass : opt.labelClass
                                                    )}>
                                                        {opt.label}
                                                    </span>
                                                    {isActive && (
                                                        <div
                                                            className={cn(
                                                                "w-2 h-2 rounded-full",
                                                                opt.dotClass
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Original editable mode
    return (
        <div className="w-full space-y-6 relative min-h-[120px]">
            <div ref={cardRef} className="bg-white rounded-xl border border-gray-300 p-6 shadow-lg w-full">
                {/* Icons Row Inside Card */}
                <div className="pb-3">
                    <div className="flex w-full px-2 justify-evenly gap-2">
                        {AILMENTS.map((ailment) => {
                            const value = data[ailment.id] ?? 0;
                            const Icon = ailment.icon;
                            const isSelected = expandedId === ailment.id;

                            return (
                                <div
                                    key={ailment.id}
                                    className={cn(
                                        "flex flex-1 flex-col items-center transition-all duration-200",
                                        "cursor-pointer",
                                        isSelected ? "scale-110 opacity-100" : "opacity-50 hover:opacity-80 scale-90"
                                    )}
                                    onClick={() => setExpandedId(ailment.id)}
                                >
                                    <div className={cn(
                                        "p-2 rounded-full mb-1 transition-colors shadow-sm",
                                        getAilmentPillClasses(ailment.id, value, isSelected)
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={cn(
                                        "text-xs font-semibold tracking-wide",
                                        isSelected ? "text-blue-700" : value !== 0 ? "text-gray-900" : "text-gray-500"
                                    )}>
                                        {ailment.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div
                    className={cn(
                        "px-2 overflow-hidden transition-[max-height,opacity] duration-400 ease-in-out",
                        expandedId && activeAilment
                            ? "max-h-40 opacity-100 mt-2"
                            : "max-h-0 opacity-0"
                    )}
                >
                    {activeAilment && (
                        <>
                            <Slider
                                value={[activeValue]}
                                min={sliderMin}
                                max={sliderMax}
                                step={1}
                                onValueChange={(vals) => handleValueChange(activeAilment.id, vals[0] || 0)}
                                className="py-4"
                            />
                            <div className="flex justify-between mt-1 px-1">
                                {activeAilment.options.map((opt) => (
                                    <div
                                        key={opt.value}
                                        className={cn(
                                            "flex flex-col items-center gap-1 cursor-pointer transition-all w-20 text-center",
                                            activeValue === opt.value ? opt.activeLabelClass : opt.labelClass
                                        )}
                                        onClick={() => handleValueChange(activeAilment.id, opt.value)}
                                    >
                                        <span className="text-xs">{opt.label}</span>
                                        {activeValue === opt.value && (
                                            <div
                                                className={cn(
                                                    "w-1 h-1 rounded-full mt-1",
                                                    opt.dotClass
                                                )}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
