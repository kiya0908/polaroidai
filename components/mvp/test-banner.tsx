'use client';

import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { isMVPMode } from '@/lib/mvp-config';
import { Link } from '@/lib/navigation';

/**
 * MVP Test Banner Component
 *
 * Displays a prominent banner informing users they're in test mode
 * with 100 free credits. Supports multiple languages.
 */
export function MVPTestBanner() {
  const t = useTranslations('MVP.testBanner');

  // Only show in MVP mode
  if (!isMVPMode()) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-vintage-500/10 via-vintage-600/10 to-vintage-500/10 border-b border-vintage-300/30">
      <div className="container mx-auto px-4 py-3">
        <Alert className="border-vintage-400 bg-vintage-50 dark:bg-vintage-950">
          <Info className="h-5 w-5 text-vintage-600 dark:text-vintage-400" />
          <AlertTitle className="text-lg font-bold text-vintage-900 dark:text-vintage-100">
            {t('title')}
          </AlertTitle>
          <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-vintage-700 dark:text-vintage-300">
              {t('description')}
            </span>
            <Link href="/app">
              <Button
                variant="default"
                className="bg-vintage-600 hover:bg-vintage-700 text-white"
              >
                {t('button')}
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
