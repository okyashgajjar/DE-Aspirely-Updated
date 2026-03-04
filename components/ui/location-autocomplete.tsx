import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { useDebounce } from "@/hooks/use-debounce"; // Will need to implement this

interface LocationAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onLocationSelect: (location: string) => void;
    defaultValue?: string;
}

export function LocationAutocomplete({
    onLocationSelect,
    defaultValue = "",
    className,
    ...props
}: LocationAutocompleteProps) {
    const [query, setQuery] = useState(defaultValue);
    const [results, setResults] = useState<{ display_name: string; place_id: number }[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const debouncedQuery = useDebounce(query, 300);

    // Sync query internal state with defaultValue when it changes (e.g. after profile fetch)
    useEffect(() => {
        if (defaultValue !== undefined) {
            setQuery(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        // We only fetch if they actually typed something new,
        // not if they just selected a result which updated the query
        if (!debouncedQuery || debouncedQuery.length < 3) {
            setResults([]);
            return;
        }

        let active = true;

        async function fetchLocations() {
            setIsLoading(true);
            try {
                // Using OpenStreetMap Nominatim (Free, no key needed)
                // Rate limit: absolute max 1 request per second
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&limit=5`);
                if (!res.ok) throw new Error();
                const data = await res.json();

                if (active) {
                    setResults(data);
                    // Only open if we didn't just select exactly this name
                    const justSelected = data.length === 1 && data[0].display_name === debouncedQuery;
                    setIsOpen(!justSelected && data.length > 0);
                }
            } catch (e) {
                console.error("Failed to fetch locations", e);
            } finally {
                if (active) setIsLoading(false);
            }
        }

        fetchLocations();

        return () => { active = false; };
    }, [debouncedQuery]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className={cn("relative w-full", className)}>
            <Input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    if (!isOpen && e.target.value.length >= 3) setIsOpen(true);
                }}
                onFocus={() => {
                    if (results.length > 0) setIsOpen(true);
                }}
                {...props}
            />
            {isLoading && (
                <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            )}

            {isOpen && results.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border border-slate-200 bg-white shadow-md py-1 text-sm">
                    {results.map((place) => (
                        <li
                            key={place.place_id}
                            className="cursor-pointer px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                            onClick={() => {
                                setQuery(place.display_name);
                                setIsOpen(false);
                                onLocationSelect(place.display_name);
                            }}
                        >
                            {place.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
