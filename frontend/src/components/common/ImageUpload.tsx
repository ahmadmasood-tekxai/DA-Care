import { useRef, useState } from 'react';
import { ImagePlus, Loader2, UploadCloud, X } from 'lucide-react';
import clsx from 'clsx';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

/** Click-to-upload product image picker with local preview shown immediately,
 * then swapped for the server URL once the upload completes. */
export function ImageUpload({ currentImageUrl, onUpload, isUploading }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    await onUpload(file);
  }

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-navy">Product Image</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
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
          <div className="absolute inset-0 flex items-center justify-center bg-navy/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}

        {displayUrl && !isUploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-navy/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-pink-deep"
          >
            <UploadCloud className="h-3.5 w-3.5" /> Change
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
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
