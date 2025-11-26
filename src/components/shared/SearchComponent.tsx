import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';

import type { ReactNode } from 'react';

interface SearchResult {
    id: string;
    [key: string]: any; // Allow additional properties
}

interface SearchComponentProps<T extends SearchResult> {
    title: string;
    description?: string;
    placeholder: string;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    searchResults: T[];
    isLoading: boolean;
    emptyMessage?: string;
    renderResult: (result: T) => ReactNode;
    onSelect: (result: T) => void;
    onCancel: () => void;
    additionalActions?: ReactNode;
    debounceMs?: number; // Debounce delay in milliseconds (default: 300)
}

/**
 * Reusable search component that works with tRPC useQuery hooks.
 * 
 * Features:
 * - Built-in debouncing to prevent spamming the server
 * - Works seamlessly with tRPC useQuery hooks
 * - Customizable rendering and actions
 * 
 * Usage:
 * 1. Parent component manages the debounced search query state
 * 2. Parent component calls tRPC useQuery with the search query
 * 3. Pass the query state, results, and loading state to this component
 * 
 * Example:
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState('');
 * const { data: results = [], isLoading } = api.patient.searchChildren.useQuery(
 *   { query: searchQuery },
 *   { enabled: searchQuery.length >= 2 }
 * );
 * 
 * return (
 *   <SearchComponent
 *     title="Search Children"
 *     placeholder="Search by name..."
 *     searchQuery={searchQuery}
 *     onSearchQueryChange={setSearchQuery}
 *     searchResults={results}
 *     isLoading={isLoading}
 *     debounceMs={300} // Optional, defaults to 300ms
 *     renderResult={(child) => (
 *       <div>
 *         <p className="font-medium">{child.name}</p>
 *         <p className="text-sm text-gray-500">Birthdate: {child.birthdate?.toLocaleDateString()}</p>
 *       </div>
 *     )}
 *     onSelect={(child) => handleSelect(child)}
 *     onCancel={() => setShowModal(false)}
 *   />
 * );
 * ```
 */
export function SearchComponent<T extends SearchResult>({
    title,
    description,
    placeholder,
    searchQuery,
    onSearchQueryChange,
    searchResults,
    isLoading,
    emptyMessage = "No results found",
    renderResult,
    onSelect,
    onCancel,
    additionalActions,
    debounceMs = 300,
}: SearchComponentProps<T>) {
    // Local state for the input field (updates immediately)
    const [localQuery, setLocalQuery] = useState(searchQuery);

    // Debounce the search query updates to parent
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchQueryChange(localQuery);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localQuery, debounceMs, onSearchQueryChange]);

    // Sync local state when parent changes search query (e.g., when clearing)
    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    const showEmptyMessage = searchQuery.length >= 2 && !isLoading && searchResults.length === 0;

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                {description && (
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
            </div>

            <Input
                type="text"
                placeholder={placeholder}
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="w-full"
            />

            {isLoading && (
                <p className="text-sm text-gray-500">Searching...</p>
            )}

            <div className="max-h-60 overflow-y-auto space-y-2">
                {showEmptyMessage && (
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500">{emptyMessage}</p>
                    </div>
                )}

                {searchResults.map((result) => (
                    <Card
                        key={result.id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors py-2"
                        onClick={() => onSelect(result)}
                    >
                        <CardContent className="p-3">
                            {renderResult(result)}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex gap-2">
                <Button onClick={onCancel} variant="outline" className="flex-1">
                    Cancel
                </Button>
                {additionalActions}
            </div>
        </div>
    );
}
