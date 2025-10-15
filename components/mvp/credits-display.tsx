'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Coins, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getGuestCredits } from '@/lib/guest-auth';
import { isMVPMode } from '@/lib/mvp-config';

/**
 * MVP Credits Display Component
 *
 * Shows guest user's remaining test credits
 * Updates in real-time when credits are used
 */
export function MVPCreditsDisplay() {
  const t = useTranslations('MVP.credits');
  const [credits, setCredits] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isMVPMode()) {
      setCredits(getGuestCredits());
    }
  }, []);

  useEffect(() => {
    if (!isMVPMode() || !mounted) return;

    // Listen for credit updates
    const updateCredits = () => {
      setCredits(getGuestCredits());
    };

    // Poll every 2 seconds to check for updates
    const interval = setInterval(updateCredits, 2000);

    // Also listen for storage events (cross-tab sync)
    window.addEventListener('storage', updateCredits);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateCredits);
    };
  }, [mounted]);

  if (!isMVPMode() || !mounted) {
    return null;
  }

  const creditColor =
    credits > 50 ? 'bg-green-500' : credits > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-vintage-50 dark:bg-vintage-950 border border-vintage-300 dark:border-vintage-700">
            <Coins className="h-5 w-5 text-vintage-600 dark:text-vintage-400" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-vintage-900 dark:text-vintage-100">
                {credits}
              </span>
              <Badge variant="outline" className="text-xs">
                {t('testCredits')}
              </Badge>
            </div>
            <div className={`h-2 w-2 rounded-full ${creditColor} animate-pulse`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{t('mvpTestCredits')}</p>
            <p className="text-xs text-muted-foreground">
              {t('textGenerationCost')} | {t('imageConversionCost')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('rechargeNotice')}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
