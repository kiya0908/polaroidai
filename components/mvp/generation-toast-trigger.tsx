'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/ui/use-toast';
import { shouldShowGenerationToast, getGenerationCount } from '@/lib/guest-auth';
import { isMVPMode } from '@/lib/mvp-config';

/**
 * Generation Toast Trigger Component
 *
 * Monitors generation count and shows a toast notification
 * after the user creates their 5th photo.
 *
 * This component doesn't render anything visible,
 * it just handles the toast trigger logic.
 */
export function GenerationToastTrigger() {
  const t = useTranslations('MVP.generationToast');
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isMVPMode() || !mounted) return;

    // Check every 2 seconds if toast should be shown
    const checkToast = () => {
      if (shouldShowGenerationToast()) {
        const count = getGenerationCount();

        toast({
          title: t('title'),
          description: t('description', { count }),
          duration: 6000, // Show for 6 seconds
        });
      }
    };

    // Initial check
    checkToast();

    // Poll every 2 seconds
    const interval = setInterval(checkToast, 2000);

    // Listen for storage events (generation updates)
    window.addEventListener('storage', checkToast);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkToast);
    };
  }, [mounted, t, toast]);

  // This component doesn't render anything
  return null;
}
