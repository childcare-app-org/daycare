import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { DialogFooter } from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { api } from '~/utils/api';
import { formatDistance, getCurrentLocation, sortByDistance } from '~/utils/geolocation';

import type { Coordinates } from '~/utils/geolocation';

export interface RegisterVisitFormData {
    hospitalId: string;
    childId: string;
}

interface Hospital {
    id: string;
    name: string;
    pricing: string;
    latitude?: string | null;
    longitude?: string | null;
}

interface HospitalWithDistance extends Hospital {
    distance?: number;
}

interface RegisterVisitFormProps {
    childId: string;
    childName: string;
    hospitals: Hospital[];
    onSubmit: (data: RegisterVisitFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export function RegisterVisitForm({
    childId,
    childName,
    hospitals,
    onSubmit,
    onCancel,
    isLoading = false,
}: RegisterVisitFormProps) {
    const [selectedHospitalId, setSelectedHospitalId] = useState('');
    const [sortedHospitals, setSortedHospitals] = useState<HospitalWithDistance[]>(hospitals);
    const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

    // Get parent's home address as fallback
    const { data: parentData } = api.patient.getMyProfile.useQuery();

    useEffect(() => {
        const fetchLocationAndSort = async () => {
            setLocationStatus('loading');

            // Try to get current location first
            const currentLocation = await getCurrentLocation();

            let referenceLocation: Coordinates | null = null;

            if (currentLocation) {
                referenceLocation = currentLocation;
                setUserLocation(currentLocation);
                setLocationStatus('success');
            } else if (parentData?.latitude && parentData?.longitude) {
                // Fallback to parent's home address
                referenceLocation = {
                    latitude: parseFloat(parentData.latitude),
                    longitude: parseFloat(parentData.longitude),
                };
                setLocationStatus('success');
            } else {
                setLocationStatus('error');
                setSortedHospitals(hospitals);
                return;
            }

            // Sort hospitals by distance
            if (referenceLocation) {
                const sorted = sortByDistance(
                    hospitals,
                    referenceLocation,
                    (hospital) => {
                        if (hospital.latitude && hospital.longitude) {
                            return {
                                latitude: parseFloat(hospital.latitude),
                                longitude: parseFloat(hospital.longitude),
                            };
                        }
                        return null;
                    }
                );
                setSortedHospitals(sorted);
            }
        };

        fetchLocationAndSort();
    }, [hospitals, parentData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            hospitalId: selectedHospitalId,
            childId,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Child</Label>
                <div className="p-3 bg-gray-100 rounded-md border border-gray-200">
                    <p className="font-medium">{childName}</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="hospitalId">Select Hospital *</Label>
                {locationStatus === 'loading' && (
                    <p className="text-sm text-blue-600 mb-2">
                        📍 Getting your location to show nearest hospitals...
                    </p>
                )}
                {locationStatus === 'success' && userLocation && (
                    <p className="text-sm text-green-600 mb-2">
                        📍 Showing hospitals sorted by distance from your current location
                    </p>
                )}
                {locationStatus === 'success' && !userLocation && (
                    <p className="text-sm text-gray-600 mb-2">
                        📍 Showing hospitals sorted by distance from your home address
                    </p>
                )}
                <select
                    id="hospitalId"
                    value={selectedHospitalId}
                    onChange={(e) => setSelectedHospitalId(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="">Choose a hospital...</option>
                    {sortedHospitals.map((hospital) => (
                        <option key={hospital.id} value={hospital.id}>
                            {hospital.name} - ${hospital.pricing}/day
                            {hospital.distance !== undefined && ` (${formatDistance(hospital.distance)})`}
                        </option>
                    ))}
                </select>
                <p className="text-sm text-gray-500">
                    Hospitals are sorted by distance from you
                </p>
            </div>

            <DialogFooter>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register Visit'}
                </Button>
            </DialogFooter>
        </form>
    );
}

