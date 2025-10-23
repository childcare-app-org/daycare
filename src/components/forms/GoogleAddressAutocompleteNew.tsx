import { useEffect, useRef, useState } from 'react';
import { Label } from '~/components/ui/label';
import { env } from '~/env';

import { useLoadScript } from '@react-google-maps/api';

export interface AddressData {
    address: string;
    latitude: number;
    longitude: number;
}

interface GoogleAddressAutocompleteProps {
    id?: string;
    label?: string;
    value: string;
    onChange: (data: AddressData) => void;
    required?: boolean;
    placeholder?: string;
    helperText?: string;
    country?: string;
}

const libraries: ('places')[] = ['places'];

export function GoogleAddressAutocompleteNew({
    id = 'address',
    label = 'Address',
    value,
    onChange,
    required = false,
    placeholder = 'Start typing an address...',
    helperText,
    country = 'JP',
}: GoogleAddressAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Use the official SDK to load Google Maps
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries,
        language: 'en-US',
    });


    // Search places using the new Places API
    const searchPlaces = async (query: string) => {
        if (!isLoaded || query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsSearching(true);

        try {
            // Use the new Places API
            const placesLibrary = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
            const request = {
                textQuery: query,
                fields: ['displayName', 'formattedAddress', 'location', 'id'],
                locationBias: country === 'JP' ? new google.maps.LatLng(35.6762, 139.6503) : undefined, // Tokyo coordinates
                maxResultCount: 5,
            };

            const { places } = await placesLibrary.Place.searchByText(request);

            setSuggestions(places);
            setShowSuggestions(places.length > 0);
        } catch (error) {
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle input changes with debouncing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setInputValue(query);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Debounce search
        searchTimeoutRef.current = setTimeout(() => {
            searchPlaces(query);
        }, 300);
    };

    // Handle suggestion selection
    const handleSelectSuggestion = async (place: any) => {
        try {
            const address = place.formattedAddress || place.displayName || '';
            const latitude = place.location?.lat() || 0;
            const longitude = place.location?.lng() || 0;

            setInputValue(address);
            setSuggestions([]);
            setShowSuggestions(false);

            onChange({
                address,
                latitude,
                longitude,
            });
        } catch (error) {
            // Handle error silently
        }
    };

    // Handle input focus/blur
    const handleInputFocus = () => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleInputBlur = () => {
        // Delay hiding suggestions to allow clicking on them
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    // Sync external value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Handle loading error
    if (loadError) {
        return (
            <div className="relative space-y-2">
                {label && <Label htmlFor={id}>{label} {required && '*'}</Label>}
                <div className="flex h-10 w-full rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm">
                    <p className="text-red-600">Error loading address search: {loadError.message}</p>
                </div>
                {helperText && <p className="text-sm text-red-500">{helperText}</p>}
            </div>
        );
    }


    return (
        <div className="relative space-y-2">
            {label && <Label htmlFor={id}>{label} {required && '*'}</Label>}

            {isLoaded ? (
                <div className="relative">

                    <input
                        ref={inputRef}
                        type="text"
                        id={id}
                        name={id}
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder={placeholder}
                        required={required}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    {/* Loading indicator */}
                    {isSearching && (
                        <div className="absolute right-3 top-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {suggestions.map((place, index) => (
                                <div
                                    key={place.id || index}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                    onClick={() => handleSelectSuggestion(place)}
                                >
                                    <div className="text-sm text-gray-900">
                                        {place.formattedAddress || place.displayName}
                                    </div>
                                    {place.displayName && place.formattedAddress && place.displayName !== place.formattedAddress && (
                                        <div className="text-xs text-gray-500">
                                            {place.displayName}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            ) : (
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <p className="text-gray-400">Loading Google Maps...</p>
                </div>
            )}

            {helperText && <p className="text-sm text-gray-500">{helperText}</p>}
        </div>
    );
}
