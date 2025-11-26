import { useTranslations } from 'next-intl';
import { getTranslatedTag } from '~/utils/translations';

import { getEventTags } from './eventTypes';

import type { EventType } from './eventTypes';

type TagSelectorProps = {
    eventType: EventType | string;
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
    temperature: string;
    onTemperatureChange: (value: string) => void;
};

export function VisitTagSelector({
    eventType,
    selectedTags,
    onToggleTag,
    temperature,
    onTemperatureChange,
}: TagSelectorProps) {
    const t = useTranslations();
    const lower = eventType.toLowerCase();
    const suggestions = getEventTags(eventType);
    const showTemperatureInput = lower === 'temperature';

    if (suggestions.length === 0 && !showTemperatureInput) {
        return null;
    }

    return (
        <div className="space-y-3">
            {showTemperatureInput && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('visit.temperature')} ({t('visit.temperatureUnit')})
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            step="0.1"
                            inputMode="decimal"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={temperature}
                            onChange={(e) => onTemperatureChange(e.target.value)}
                            placeholder="37.0"
                        />
                    </div>
                </div>
            )}

            {suggestions.length > 0 && (
                <div>
                    <div className="mb-2 text-xs font-medium text-gray-600">
                        {t('visit.tags')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((tag) => {
                            const selected = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => onToggleTag(tag)}
                                    className={`rounded-full px-3 py-1 text-xs border transition ${selected
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {getTranslatedTag(t, tag)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}


