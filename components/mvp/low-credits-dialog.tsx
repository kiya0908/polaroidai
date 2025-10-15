'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getGuestCredits } from '@/lib/guest-auth';
import { isMVPMode } from '@/lib/mvp-config';

const LOW_CREDITS_THRESHOLD = 20;
const DIALOG_SHOWN_KEY = 'polaroid_guest_low_credits_shown';

/**
 * Low Credits Dialog Component
 *
 * Displays a warning dialog when guest user's credits fall below threshold
 * Encourages users to contact support for more credits
 * Only shows once per session to avoid annoying users
 */
export function LowCreditsDialog() {
  const t = useTranslations('MVP.lowCreditsDialog');
  const [isOpen, setIsOpen] = useState(false);
  const [credits, setCredits] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isMVPMode() || !mounted) return;

    // Check if dialog has already been shown in this session
    const hasShown = sessionStorage.getItem(DIALOG_SHOWN_KEY);
    if (hasShown) return;

    // Check credits and show dialog if low
    const checkCredits = () => {
      const currentCredits = getGuestCredits();
      setCredits(currentCredits);

      if (currentCredits < LOW_CREDITS_THRESHOLD && currentCredits > 0) {
        setIsOpen(true);
        sessionStorage.setItem(DIALOG_SHOWN_KEY, 'true');
      }
    };

    // Initial check
    checkCredits();

    // Poll every 5 seconds to check for credit changes
    const interval = setInterval(checkCredits, 5000);

    // Listen for storage events (credit updates)
    window.addEventListener('storage', checkCredits);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkCredits);
    };
  }, [mounted]);

  if (!isMVPMode() || !mounted) {
    return null;
  }

  const handleContactUs = () => {
    window.location.href = `mailto:${t('contactEmail')}?subject=Request for More Credits&body=Hello, I would like to request more test credits for Polaroid AI.`;
    setIsOpen(false);
  };

  const handleContinue = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription className="pt-4">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <AlertDescription className="text-center">
              <span className="text-lg font-bold text-amber-900 dark:text-amber-100">
                {t('currentBalance', { credits })}
              </span>
            </AlertDescription>
          </Alert>

          <div className="rounded-lg border border-vintage-200 bg-vintage-50 dark:bg-vintage-950 dark:border-vintage-800 p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-vintage-600 dark:text-vintage-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-vintage-900 dark:text-vintage-100">
                  {t('contactPrompt')}
                </p>
                <p className="text-sm text-vintage-600 dark:text-vintage-400 mt-1 font-mono">
                  {t('contactEmail')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleContinue}
            className="flex-1"
          >
            {t('continueButton')}
          </Button>
          <Button
            onClick={handleContactUs}
            className="flex-1 bg-vintage-600 hover:bg-vintage-700"
          >
            <Mail className="h-4 w-4 mr-2" />
            {t('contactButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
