"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PolaroidStyle {
  id: string;
  name: string;
  description: string;
  preview: string;
  features: string[];
}

const POLAROID_STYLES: PolaroidStyle[] = [
  {
    id: 'classic_polaroid',
    name: '经典宝丽来',
    description: '最经典的宝丽来风格，白色边框，温暖色调',
    preview: '/images/style-preview-classic.jpg',
    features: ['白色边框', '温暖色调', '胶片颗粒', '轻微漏光']
  },
  {
    id: 'vintage_sepia',
    name: '复古棕褐',
    description: '怀旧的棕褐色调，更浓郁的复古感',
    preview: '/images/style-preview-sepia.jpg',
    features: ['棕褐色调', '高对比度', '做旧效果', '边缘暗角']
  },
  {
    id: 'dreamy_soft',
    name: '梦幻柔和',
    description: '柔和的光线效果，梦幻般的氛围',
    preview: '/images/style-preview-dreamy.jpg',
    features: ['柔和光线', '梦幻氛围', '淡化边缘', '温柔色彩']
  },
  {
    id: 'high_contrast',
    name: '高对比度',
    description: '强烈的对比效果，更加鲜明的视觉冲击',
    preview: '/images/style-preview-contrast.jpg',
    features: ['高对比度', '鲜明色彩', '深度阴影', '突出主体']
  }
];

interface PolaroidStyleSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function PolaroidStyleSelector({ value, onValueChange }: PolaroidStyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState(value);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    onValueChange(styleId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {POLAROID_STYLES.map((style) => (
        <div
          key={style.id}
          className={cn(
            "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md",
            selectedStyle === style.id
              ? "border-polaroid-orange bg-polaroid-orange/5 shadow-md"
              : "border-gray-200 hover:border-polaroid-orange/50"
          )}
          onClick={() => handleStyleSelect(style.id)}
        >
          {/* 选中状态指示器 */}
          {selectedStyle === style.id && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-polaroid-orange rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}

          {/* 风格预览图 */}
          <div className="aspect-square mb-3 rounded-md overflow-hidden bg-gray-100">
            <div className="w-full h-full bg-gradient-to-br from-polaroid-cream to-polaroid-orange/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-white rounded border-4 border-gray-200 shadow-sm"></div>
                <div className="text-xs text-gray-500">{style.name}</div>
              </div>
            </div>
          </div>

          {/* 风格信息 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">{style.name}</h3>
            <p className="text-sm text-gray-600">{style.description}</p>
            
            {/* 特性标签 */}
            <div className="flex flex-wrap gap-1">
              {style.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}