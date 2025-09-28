"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PolaroidImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  uploadedImageUrl?: string;
}

export function PolaroidImageUpload({ onImageUpload, uploadedImageUrl }: PolaroidImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(uploadedImageUrl || '');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB');
      return;
    }

    setIsUploading(true);

    try {
      // 创建预览URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // 上传到服务器
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/s3', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const result = await response.json();
      onImageUpload(result.url);
      toast.success('图片上传成功！');

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('图片上传失败，请重试');
      setPreviewUrl('');
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleRemove = () => {
    setPreviewUrl('');
    onImageUpload('');
    toast.success('图片已移除');
  };

  return (
    <div className="space-y-4">
      {!previewUrl ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-polaroid-orange bg-polaroid-orange/5' 
              : 'border-gray-300 hover:border-polaroid-orange hover:bg-polaroid-cream/50'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {isUploading ? (
              <Loader2 className="w-12 h-12 text-polaroid-orange animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400" />
            )}
            
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                {isUploading ? '上传中...' : 
                 isDragActive ? '放开以上传图片' : '拖拽图片到这里或点击上传'}
              </p>
              <p className="text-sm text-gray-500">
                支持 JPG、PNG、WebP 格式，最大 10MB
              </p>
            </div>

            {!isUploading && (
              <Button type="button" variant="outline" className="mt-4">
                <ImageIcon className="w-4 h-4 mr-2" />
                选择图片
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img
              src={previewUrl}
              alt="上传的图片预览"
              className="w-full h-64 object-cover"
            />
            
            {/* 移除按钮 */}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-2 text-sm text-gray-600 text-center">
            图片已上传，点击右上角 ✕ 可重新选择
          </div>
        </div>
      )}
    </div>
  );
}