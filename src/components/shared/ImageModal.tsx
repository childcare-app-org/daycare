import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '~/components/ui/dialog';

interface ImageModalProps {
    imageUrl: string;
    alt?: string;
    trigger?: React.ReactNode;
    className?: string;
}

export function ImageModal({ imageUrl, alt = '', trigger, className = '' }: ImageModalProps) {
    const [open, setOpen] = useState(false);

    const defaultTrigger = (
        <img
            src={imageUrl}
            alt={alt}
            className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
            onClick={() => setOpen(true)}
        />
    );

    return (
        <>
            {trigger ? (
                <div onClick={() => setOpen(true)} className="cursor-pointer">
                    {trigger}
                </div>
            ) : (
                defaultTrigger
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-0 shadow-none [&>button]:hidden">
                    <div className="relative bg-black/90 rounded-lg p-4">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70 rounded-full"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogClose>
                        <img
                            src={imageUrl}
                            alt={alt}
                            className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
