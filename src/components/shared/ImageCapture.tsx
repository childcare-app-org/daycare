import { Camera, Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { useUploadThing } from '~/utils/uploadthing';

interface ImageCaptureProps {
    label?: string;
    value?: string | null; // Image URL
    onChange: (imageUrl: string | null) => void;
    disabled?: boolean;
    className?: string;
}

export function ImageCapture({
    label,
    value,
    onChange,
    disabled = false,
    className = '',
}: ImageCaptureProps) {
    const t = useTranslations();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const { startUpload, isUploading } = useUploadThing('imageUploader', {
        onClientUploadComplete: (res) => {
            if (res?.[0]?.url) {
                onChange(res[0].url);
            }
        },
        onUploadError: (error: Error) => {
            console.error('Upload error:', error);
            alert(t('forms.imageCapture.uploadError'));
        },
    });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            await startUpload([file]);
        }
    };

    const handleStartCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }, // Front-facing camera
            });
            setStream(mediaStream);
            setIsCapturing(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                // Ensure video plays
                videoRef.current.play().catch((err) => {
                    console.error('Error playing video:', err);
                });
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert(t('forms.imageCapture.cameraError'));
        }
    };

    // Effect to ensure video plays when stream changes
    useEffect(() => {
        if (stream && videoRef.current && videoRef.current.srcObject !== stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((err) => {
                console.error('Error playing video:', err);
            });
        }
    }, [stream]);

    const handleStopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setIsCapturing(false);
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const handleCapturePhoto = async () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        // Create a File object from the blob
                        const file = new File([blob], 'captured-photo.jpg', {
                            type: 'image/jpeg',
                        });
                        // Upload the captured photo
                        await startUpload([file]);
                        handleStopCamera();
                    }
                }, 'image/jpeg', 0.8);
            }
        }
    };

    const handleRemoveImage = () => {
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <Label>{label}</Label>}
            <div className="space-y-3">
                {value ? (
                    <div className="relative inline-block">
                        <img
                            src={value}
                            alt={t('forms.imageCapture.imagePreview')}
                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {!isCapturing ? (
                            <div className="flex gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="image-upload-input"
                                    disabled={disabled || isUploading}
                                />
                                <label htmlFor="image-upload-input">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={disabled || isUploading}
                                        className="flex items-center gap-2 cursor-pointer"
                                        asChild
                                    >
                                        <span>
                                            <Upload className="w-4 h-4" />
                                            {isUploading
                                                ? t('forms.imageCapture.uploading')
                                                : t('forms.imageCapture.uploadImage')}
                                        </span>
                                    </Button>
                                </label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleStartCamera}
                                    disabled={disabled || isUploading}
                                    className="flex items-center gap-2"
                                >
                                    <Camera className="w-4 h-4" />
                                    {t('forms.imageCapture.takePhoto')}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="relative w-full max-w-md mx-auto">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full rounded-lg border-2 border-gray-200"
                                        style={{ maxHeight: '400px' }}
                                    />
                                </div>
                                <div className="flex gap-2 justify-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCapturePhoto}
                                        disabled={disabled}
                                    >
                                        {t('forms.imageCapture.capture')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleStopCamera}
                                        disabled={disabled}
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

