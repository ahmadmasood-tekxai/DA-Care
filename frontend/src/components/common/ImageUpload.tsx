import { useRef, useState } from 'react';
import { ImagePlus, Loader2, UploadCloud, X } from 'lucide-react';
import clsx from 'clsx';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  additionalImages?: { url: string; id?: number }[];
  onUpload?: (file: File) => Promise<void>;
  onUploadMultiple?: (files: File[]) => Promise<void>;
  isUploading?: boolean;
  multiple?: boolean;
}

/** Click-to-upload product image picker with local preview shown immediately,
 * then swapped for the server URL once the upload completes. */
export function ImageUpload({ currentImageUrl, additionalImages = [], onUpload, onUploadMultiple, isUploading, multiple }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFiles(fileList: FileList | null | undefined) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    
    setPreviewUrls(files.map(f => URL.createObjectURL(f)));
    
    if (multiple && onUploadMultiple) {
      await onUploadMultiple(files);
    } else if (onUpload) {
      await onUpload(files[0]);
    }
  }

  const displayUrl = previewUrls.length > 0 ? previewUrls[0] : currentImageUrl;
  const allThumbnails = previewUrls.length > 0 ? previewUrls.slice(1) : additionalImages.map(i => i.url);

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
          handleFiles(e.dataTransfer.files);
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
            className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-navy/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-pink-deep z-10"
          >
            <UploadCloud className="h-3.5 w-3.5" /> {multiple ? 'Add More' : 'Change'}
          </button>
        )}
        
        {/* Gallery Thumbnails */}
        {multiple && allThumbnails.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 max-h-40 overflow-y-auto">
            {allThumbnails.map((thumb, idx) => (
              <div key={idx} className="h-10 w-10 overflow-hidden rounded-md border border-white/20 shadow-sm">
                <img src={thumb} alt="thumbnail" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

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
