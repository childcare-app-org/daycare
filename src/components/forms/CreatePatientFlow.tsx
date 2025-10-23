import { useState } from 'react';
import { ChildForm } from '~/components/forms/ChildForm';
import { GoogleAddressAutocompleteNew } from '~/components/forms/GoogleAddressAutocompleteNew';
import { SearchComponent } from '~/components/shared/SearchComponent';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/utils/api';

import type { AddressData } from '~/components/forms/GoogleAddressAutocompleteNew';
import type { ChildFormData } from '~/components/forms/ChildForm';

type CreatePatientStep = 'search-parent' | 'create-parent' | 'search-child' | 'create-child' | 'create-visit';

interface CreatePatientFlowProps {
    onCancel: () => void;
    onComplete: () => void;
}

interface ParentData {
    id: string;
    name: string;
    phoneNumber: string;
    homeAddress: string;
}

interface ChildData {
    id: string;
    name: string;
    age: number;
    parentId: string;
}

export function CreatePatientFlow({ onCancel, onComplete }: CreatePatientFlowProps) {
    const [currentStep, setCurrentStep] = useState<CreatePatientStep>('search-parent');
    const [selectedParent, setSelectedParent] = useState<ParentData | null>(null);
    const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
    const [error, setError] = useState('');
    const [parentSearchQuery, setParentSearchQuery] = useState('');

    // Parent form state
    const [parentFormData, setParentFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        homeAddress: '',
        latitude: undefined as number | undefined,
        longitude: undefined as number | undefined,
    });

    // Visit form state
    const [visitNotes, setVisitNotes] = useState('');

    // API queries
    const { data: nurseProfile } = api.nurse.getMyProfile.useQuery();

    const { data: parentSearchResults = [], isLoading: isSearchingParents } = api.patient.searchParents.useQuery(
        { query: parentSearchQuery },
        { enabled: parentSearchQuery.length >= 2 && currentStep === 'search-parent' }
    );

    const { data: parentChildren = [], isLoading: isLoadingChildren } = api.patient.getChildrenByParentId.useQuery(
        { parentId: selectedParent?.id || '' },
        { enabled: !!selectedParent?.id && currentStep === 'search-child' }
    );

    // API mutations
    const createParentMutation = api.patient.createParent.useMutation({
        onSuccess: (parent) => {
            setSelectedParent(parent);
            setCurrentStep('search-child');
            setError('');
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const createChildMutation = api.patient.createChild.useMutation({
        onSuccess: (child) => {
            setSelectedChild(child);
            setCurrentStep('create-visit');
            setError('');
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const createVisitMutation = api.visit.create.useMutation({
        onSuccess: () => {
            onComplete();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleParentSelect = (parent: ParentData) => {
        setSelectedParent(parent);
        setCurrentStep('search-child');
        setError('');
    };

    const handleParentCreate = () => {
        if (!parentFormData.name || !parentFormData.email || !parentFormData.phoneNumber || !parentFormData.homeAddress) {
            setError('Please fill in all required fields');
            return;
        }

        createParentMutation.mutate({
            name: parentFormData.name,
            email: parentFormData.email,
            phoneNumber: parentFormData.phoneNumber,
            homeAddress: parentFormData.homeAddress,
        });
    };

    const handleChildSelect = (child: ChildData) => {
        setSelectedChild(child);
        setCurrentStep('create-visit');
        setError('');
    };

    const handleChildCreate = (childData: ChildFormData) => {
        if (!selectedParent) return;

        createChildMutation.mutate({
            ...childData,
            parentId: selectedParent.id,
        });
    };

    const handleVisitCreate = () => {
        if (!selectedChild || !nurseProfile?.hospitalId) {
            setError('Unable to create visit: nurse hospital information not found');
            return;
        }

        createVisitMutation.mutate({
            childId: selectedChild.id,
            hospitalId: nurseProfile.hospitalId,
            dropOffTime: new Date(),
            notes: visitNotes,
        });
    };

    const handleBack = () => {
        switch (currentStep) {
            case 'create-parent':
                setCurrentStep('search-parent');
                break;
            case 'search-child':
                setCurrentStep('search-parent');
                break;
            case 'create-child':
                setCurrentStep('search-child');
                break;
            case 'create-visit':
                setCurrentStep('search-child');
                break;
            default:
                onCancel();
        }
        setError('');
    };

    const renderStep = () => {
        switch (currentStep) {
            case 'search-parent':
                return (
                    <SearchComponent
                        title="Search Parent"
                        description="Search for an existing parent or create a new one"
                        placeholder="Search by parent name or phone number..."
                        searchQuery={parentSearchQuery}
                        onSearchQueryChange={setParentSearchQuery}
                        searchResults={parentSearchResults}
                        isLoading={isSearchingParents}
                        emptyMessage="No parents found. You can create a new parent."
                        renderResult={(parent) => (
                            <>
                                <p className="font-medium">{parent.name}</p>
                                <p className="text-sm text-gray-500">{parent.phoneNumber}</p>
                            </>
                        )}
                        onSelect={(parent) => handleParentSelect(parent as ParentData)}
                        onCancel={onCancel}
                        additionalActions={
                            <Button onClick={() => setCurrentStep('create-parent')} variant="default" className="flex-1">
                                Create New Parent
                            </Button>
                        }
                    />
                );

            case 'create-parent':
                return (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold">Create New Parent</h3>
                            <p className="text-sm text-gray-600">Enter parent information</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="parent-name">Parent Name *</Label>
                                <Input
                                    id="parent-name"
                                    type="text"
                                    value={parentFormData.name}
                                    onChange={(e) => setParentFormData({ ...parentFormData, name: e.target.value })}
                                    placeholder="Enter parent name"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="parent-email">Email Address *</Label>
                                <Input
                                    id="parent-email"
                                    type="email"
                                    value={parentFormData.email}
                                    onChange={(e) => setParentFormData({ ...parentFormData, email: e.target.value })}
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="parent-phone">Phone Number *</Label>
                                <Input
                                    id="parent-phone"
                                    type="tel"
                                    value={parentFormData.phoneNumber}
                                    onChange={(e) => {
                                        const input = e.target.value;
                                        // Remove all non-digit characters
                                        const digits = input.replace(/\D/g, '');
                                        // Limit to 11 digits (max for mobile)
                                        const limited = digits.slice(0, 11);

                                        // Format based on length
                                        let formatted = limited;

                                        if (limited.length <= 10) {
                                            // 10 digits: landline format XX-XXXX-XXXX or XXX-XXX-XXXX
                                            // Use XX-XXXX-XXXX for simplicity (works for Tokyo/Osaka)
                                            if (limited.length > 6) {
                                                formatted = `${limited.slice(0, 2)}-${limited.slice(2, 6)}-${limited.slice(6)}`;
                                            } else if (limited.length > 2) {
                                                formatted = `${limited.slice(0, 2)}-${limited.slice(2)}`;
                                            }
                                        } else {
                                            // 11 digits: mobile format XXX-XXXX-XXXX
                                            if (limited.length > 7) {
                                                formatted = `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
                                            } else if (limited.length > 3) {
                                                formatted = `${limited.slice(0, 3)}-${limited.slice(3)}`;
                                            }
                                        }

                                        setParentFormData({ ...parentFormData, phoneNumber: formatted });
                                    }}
                                    placeholder="090-1234-5678"
                                    required
                                />
                            </div>
                            <div>
                                <GoogleAddressAutocompleteNew
                                    id="parent-address"
                                    label="Home Address"
                                    value={parentFormData.homeAddress}
                                    onChange={(data: AddressData) => {
                                        setParentFormData({
                                            ...parentFormData,
                                            homeAddress: data.address,
                                            latitude: data.latitude,
                                            longitude: data.longitude,
                                        });
                                    }}
                                    required
                                    placeholder="Start typing an address..."
                                    helperText="Select an address from the suggestions"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleBack} variant="outline" className="flex-1">
                                Back
                            </Button>
                            <Button
                                onClick={handleParentCreate}
                                disabled={createParentMutation.isPending}
                                className="flex-1"
                            >
                                {createParentMutation.isPending ? 'Creating...' : 'Create Parent'}
                            </Button>
                        </div>
                    </div>
                );

            case 'search-child':
                return (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold">Select Child</h3>
                            <p className="text-sm text-gray-600">Select a child of {selectedParent?.name} or create a new one</p>
                        </div>

                        {isLoadingChildren ? (
                            <p className="text-sm text-gray-500">Loading children...</p>
                        ) : parentChildren.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {parentChildren.map((child) => (
                                    <Card
                                        key={child.id}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => handleChildSelect(child as ChildData)}
                                    >
                                        <CardContent className="p-3">
                                            <p className="font-medium">{child.name}</p>
                                            <p className="text-sm text-gray-500">
                                                Age: {child.age} months
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500">No children found for this parent.</p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button onClick={handleBack} variant="outline" className="flex-1">
                                Back
                            </Button>
                            <Button onClick={() => setCurrentStep('create-child')} variant="default" className="flex-1">
                                Create New Child
                            </Button>
                        </div>
                    </div>
                );

            case 'create-child':
                return (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold">Create New Child</h3>
                            <p className="text-sm text-gray-600">Enter child information for {selectedParent?.name}</p>
                        </div>
                        <ChildForm
                            mode="create"
                            defaultValues={{
                                name: '',
                                age: 0,
                                allergies: '',
                                preexistingConditions: '',
                                familyDoctorName: '',
                                familyDoctorPhone: '',
                            }}
                            onSubmit={handleChildCreate}
                            onCancel={handleBack}
                            isLoading={createChildMutation.isPending}
                        />
                    </div>
                );

            case 'create-visit':
                return (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold">Register Visit</h3>
                            <p className="text-sm text-gray-600">Register a visit for {selectedChild?.name}</p>
                        </div>
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Child:</span>
                                        <span className="font-medium">{selectedChild?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Parent:</span>
                                        <span className="font-medium">{selectedParent?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Hospital:</span>
                                        <span className="font-medium">{nurseProfile?.hospitalName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Drop-off Time:</span>
                                        <span className="font-medium">{new Date().toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="visit-notes">Notes (Optional)</Label>
                                <textarea
                                    id="visit-notes"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Enter any notes for this visit (allergies, special instructions, etc.)"
                                    value={visitNotes}
                                    onChange={(e) => setVisitNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleBack} variant="outline" className="flex-1">
                                Back
                            </Button>
                            <Button
                                onClick={handleVisitCreate}
                                disabled={createVisitMutation.isPending}
                                className="flex-1"
                            >
                                {createVisitMutation.isPending ? 'Registering...' : 'Register Visit'}
                            </Button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-2">
                {['search-parent', 'search-child', 'create-visit'].map((step, index) => (
                    <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step ? 'bg-blue-600 text-white' :
                            ['search-parent', 'search-child', 'create-visit'].indexOf(currentStep) > index ? 'bg-green-600 text-white' :
                                'bg-gray-200 text-gray-600'
                            }`}>
                            {index + 1}
                        </div>
                        {index < 2 && (
                            <div className={`w-8 h-1 mx-1 ${['search-parent', 'search-child', 'create-visit'].indexOf(currentStep) > index ? 'bg-green-600' : 'bg-gray-200'
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {renderStep()}
        </div>
    );
}
