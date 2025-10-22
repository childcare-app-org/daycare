import { Button } from '~/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';

interface ActionMenuProps {
    onEdit?: () => void;
    onDelete?: () => void;
    editLabel?: string;
    deleteLabel?: string;
}

export function ActionMenu({
    onEdit,
    onDelete,
    editLabel = 'Edit',
    deleteLabel = 'Delete',
}: ActionMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                        <circle cx="8" cy="3" r="1.5" />
                        <circle cx="8" cy="8" r="1.5" />
                        <circle cx="8" cy="13" r="1.5" />
                    </svg>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {onEdit && <DropdownMenuItem onClick={onEdit}>{editLabel}</DropdownMenuItem>}
                {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                        {deleteLabel}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

