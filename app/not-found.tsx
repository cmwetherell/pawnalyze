import type { Metadata } from 'next';

import { Page } from '@/components/layout/Page';
import { PageHead } from '@/components/layout/PageHead';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'Page not found | Pawnalyze' };

export default function NotFound() {
  return (
    <Page kind="landing" className="pb-section-landing">
      <PageHead
        size="mega"
        title="Page not found"
        lead="There is no page at this address."
        actions={
          <>
            <Button variant="primary" href="/">Go home</Button>
            <Button href="https://blog.pawnalyze.com/">Visit the blog</Button>
          </>
        }
      />
    </Page>
  );
}
