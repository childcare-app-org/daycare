import { useEffect, useRef, useState } from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { env } from '~/env';

export interface AddressData {
    address: string;
    latitude: number;
    longitude: number;
}

interface AddressAutocompleteProps {
    id?: string;
    label?: string;
    value: string;
    onChange: (data: AddressData) => void;
    required?: boolean;
    placeholder?: string;
    helperText?: string;
}

interface MapboxFeature {
    place_name: string;
    center: [number, number]; // [longitude, latitude]
    geometry: {
        coordinates: [number, number];
    };
}

export function AddressAutocomplete({
    id = 'address',
    label = 'Address',
    value,
    onChange,
    required = false,
    placeholder = 'Start typing an address...',
    helperText,
}: AddressAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Sync external value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const fetchSuggestions = async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const mapboxToken = env.NEXT_PUBLIC_MAPBOX_KEY;
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&autocomplete=true&limit=5`,
            );
            const data = await response.json();
            if (data.features) {
                setSuggestions(data.features);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Debounce the API call
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            fetchSuggestions(newValue);
        }, 300);
    };

    const handleSuggestionClick = (feature: MapboxFeature) => {
        const address = feature.place_name;
        const [longitude, latitude] = feature.center;

        setInputValue(address);
        setShowSuggestions(false);
        setSuggestions([]);

        onChange({
            address,
            latitude,
            longitude,
        });
    };

    return (
        <div ref={wrapperRef} className="relative space-y-2">
            {label && <Label htmlFor={id}>{label} {required && '*'}</Label>}
            <Input
                id={id}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                required={required}
                autoComplete="off"
            />
            {helperText && <p className="text-sm text-gray-500">{helperText}</p>}
            {isLoading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2">
                    <p className="text-sm text-gray-500">Loading suggestions...</p>
                </div>
            )}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            <p className="text-sm">{suggestion.place_name}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

