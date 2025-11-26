import { useTranslations } from 'next-intl';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

import { ChildItem } from './ChildItem';

import type { ActiveVisit, Child } from './ChildItem';

interface ChildrenListProps {
    children: Child[];
    activeVisits: ActiveVisit[];
    onAddChild: () => void;
    onEditChild: (child: Child) => void;
    onDeleteChild: (child: Child) => void;
    onRegisterVisit: (child: Child) => void;
}

export function ChildrenList({
    children,
    activeVisits,
    onAddChild,
    onEditChild,
    onDeleteChild,
    onRegisterVisit,
}: ChildrenListProps) {
    const t = useTranslations();

    // Helper function to check if a child has an active visit
    const getChildActiveVisit = (childId: string) => {
        return activeVisits.find(visit => visit.childId === childId);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{t('dashboard.parent.myChildren')}</CardTitle>
                        <CardDescription>
                            {t('dashboard.parent.myChildrenDescription')}
                        </CardDescription>
                    </div>
                    <Button onClick={onAddChild}>{t('dashboard.parent.addChild')}</Button>
                </div>
            </CardHeader>
            <CardContent>
                {children.length > 0 ? (
                    <div className="space-y-4">
                        {children.map((child) => (
                            <ChildItem
                                key={child.id}
                                child={child}
                                activeVisit={getChildActiveVisit(child.id || '')}
                                onEdit={onEditChild}
                                onDelete={onDeleteChild}
                                onRegisterVisit={onRegisterVisit}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">{t('dashboard.parent.noChildrenRegistered')}</p>
                        <Button onClick={onAddChild}>{t('dashboard.parent.addFirstChild')}</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

