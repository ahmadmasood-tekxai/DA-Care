import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, UploadCloud, X } from 'lucide-react';
import clsx from 'clsx';

interface AdditionalImage {
  id: number;
  url: string;
}

interface ImageUploadProps {
  currentImageUrl?: string | null;
  additionalImages?: AdditionalImage[];
  onUpload?: (file: File) => Promise<void>;
  onUploadMultiple?: (files: File[]) => Promise<void>;
  onDeleteImage?: (imageId: number) => Promise<void>;
  isUploading?: boolean;
  isDeletingImageId?: number | null;
  multiple?: boolean;
}

/** Click-to-upload product image picker with local preview shown immediately,
 * then swapped for the server URL once the upload completes.
 * Supports per-image delete buttons when onDeleteImage is provided. */
export function ImageUpload({
  currentImageUrl,
  additionalImages = [],
  onUpload,
  onUploadMultiple,
  onDeleteImage,
  isUploading,
  isDeletingImageId,
  multiple,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFiles(fileList: FileList | null | undefined) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    setPreviewUrls(files.map(f => URL.createObjectURL(f)));

    if (multiple && onUploadMultiple) {
      await onUploadMultiple(files);
      setPreviewUrls([]);
    } else if (onUpload) {
      await onUpload(files[0]);
      setPreviewUrls([]);
    }
  }

  const displayUrl = previewUrls.length > 0 ? previewUrls[0] : currentImageUrl;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-navy">Product Images</label>

      {/* Main upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        className={clsx(
          'relative flex h-44 w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed transition-colors',
          isDragging ? 'border-pink-deep bg-pink-pale' : 'border-slate-300 bg-cream-2 hover:border-pink-deep'
        )}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="Product preview" className="h-full w-full object-cover" />
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-navy-soft" />
            <p className="text-xs font-semibold text-navy-soft">Click or drag an image here</p>
            <p className="text-[10px] text-slate-400">JPG, PNG or WEBP — max 5MB</p>
          </>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy/60 backdrop-blur-sm">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
            <p className="text-xs font-semibold text-white">Uploading…</p>
          </div>
        )}

        {displayUrl && !isUploading && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-navy/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-pink-deep z-10"
          >
            <UploadCloud className="h-3.5 w-3.5" /> {multiple ? 'Add More Photos' : 'Change Photo'}
          </button>
        )}
      </div>

      {/* Gallery thumbnails with delete buttons */}
      {multiple && additionalImages.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-navy-soft">Gallery Photos ({additionalImages.length})</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {additionalImages.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                <img src={img.url} alt="Gallery" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />

                {/* Delete overlay */}
                {onDeleteImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-navy/0 opacity-0 transition-all duration-200 group-hover:bg-navy/50 group-hover:opacity-100">
                    {isDeletingImageId === img.id ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id); }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg hover:bg-rose-700 transition-colors"
                        title="Delete image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

export function ImageUploadClearButton({ onClear }: { onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700"
    >
      <X className="h-3 w-3" /> Remove image
    </button>
  );
}
