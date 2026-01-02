'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface ImageUploadManagerProps {
    images: string[];
    onChange: (images: string[]) => void;
    category: string;
    productName: string;
    existingSlug?: string;
    maxImages?: number;
}

export default function ImageUploadManager({
    images,
    onChange,
    category,
    productName,
    existingSlug,
    maxImages = 10
}: ImageUploadManagerProps) {
    const [uploading, setUploading] = useState(false);
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        await uploadFiles(files);
    };

    const uploadFiles = async (files: File[]) => {
        if (files.length === 0) return;

        if (images.length + files.length > maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`);
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            files.forEach((file, i) => formData.append(`file${i}`, file));
            formData.append('category', category);
            formData.append('productName', productName);
            if (existingSlug) formData.append('existingSlug', existingSlug);

            const response = await fetch('/api/products/images', {
                method: 'POST',
                body: formData,
                // credentials: 'include' // Usually needed, let's keep it consistent if needed for session
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const data = await response.json();
            const newUrls = data.images.map((img: any) => img.url);

            // Append new URLs to existing images
            onChange([...images, ...newUrls]);
            toast.success(`${files.length} image(s) uploaded`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (index: number) => {
        const url = images[index];
        setDeletingIndex(index);

        try {
            const response = await fetch(
                `/api/products/images?url=${encodeURIComponent(url)}`,
                { method: 'DELETE' } // credentials: 'include' if needed
            );

            if (!response.ok) throw new Error('Delete failed');

            onChange(images.filter((_, i) => i !== index));
            toast.success('Image deleted');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete image');
        } finally {
            setDeletingIndex(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition relative">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    disabled={uploading || images.length >= maxImages}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    id="image-upload"
                />
                <div
                    className={`flex flex-col items-center gap-2 pointer-events-none ${uploading || images.length >= maxImages ? 'opacity-50' : ''
                        }`}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-600">
                                Click to upload or drag and drop
                            </span>
                            <span className="text-xs text-gray-500">
                                PNG, JPG, WebP, GIF (max {maxImages} images)
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((url, index) => (
                        <div
                            key={url}
                            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group border border-gray-200"
                        >
                            <Image
                                src={url}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDelete(index)}
                                disabled={deletingIndex === index}
                                className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                                type="button"
                                title="Delete image"
                            >
                                {deletingIndex === index ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </button>

                            {/* Image Index */}
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Count */}
            <p className="text-xs text-gray-500 text-right">
                {images.length} / {maxImages} images
            </p>
        </div>
    );
}
