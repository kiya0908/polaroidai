"use client";

import { useState } from "react";
import { Download, Share2, Eye, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface PolaroidPreviewProps {
  result: {
    id: string;
    output_image_url: string;
    thumbnail_url: string;
    processing_time: number;
    credit_cost: number;
    task_status: string;
  };
  onDownload: () => void;
  onShare: () => void;
}

export function PolaroidPreview({ result, onDownload, onShare }: PolaroidPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatProcessingTime = (time: number) => {
    return `${(time / 1000).toFixed(1)}秒`;
  };

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          处理时间: {formatProcessingTime(result.processing_time)}
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          消耗积分: {result.credit_cost}
        </Badge>
        <Badge 
          variant={result.task_status === 'completed' ? 'default' : 'secondary'}
          className="flex items-center gap-1"
        >
          状态: {result.task_status === 'completed' ? '已完成' : '处理中'}
        </Badge>
      </div>

      {/* 宝丽来预览 */}
      <div className="flex justify-center">
        <div className="polaroid-frame relative max-w-md film-grain">
          <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
            <DialogTrigger asChild>
              <div className="cursor-pointer group">
                <img
                  src={result.thumbnail_url || result.output_image_url}
                  alt="生成的宝丽来照片"
                  className="w-full aspect-square object-cover rounded-sm transition-transform group-hover:scale-105"
                />
                
                {/* 悬停时显示放大图标 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl">
              <div className="polaroid-frame mx-auto">
                <img
                  src={result.output_image_url}
                  alt="生成的宝丽来照片 - 高清预览"
                  className="w-full aspect-square object-cover rounded-sm"
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* 宝丽来底部标签区域 */}
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <div className="text-xs text-gray-500 font-mono">
              Polaroid AI • {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={onDownload}
          className="bg-polaroid-orange hover:bg-polaroid-orange/90 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          下载原图
        </Button>
        
        <Button
          onClick={onShare}
          variant="outline"
          className="border-polaroid-orange text-polaroid-orange hover:bg-polaroid-orange hover:text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          分享
        </Button>
      </div>

      {/* 提示信息 */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        <p>点击图片可以查看高清预览</p>
        <p>生成的宝丽来照片会自动保存到你的历史记录中</p>
      </div>
    </div>
  );
}