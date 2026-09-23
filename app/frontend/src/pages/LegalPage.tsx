import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppShell, PageGate } from '@/components/sakan';
import { getLegalDocument } from '@/lib/legal';
import { useLang } from '@/lib/i18n';
import type { MeState } from '@/lib/sakan';

export default function LegalPage() {
  const location = useLocation();
  const { lang } = useLang();

  const slug = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'datenschutz';
  }, [location.pathname]);

  return (
    <PageGate>
      {(me: MeState) => (
        <AppShell me={me}>
          <LegalContent me={me} slug={slug} lang={lang} />
        </AppShell>
      )}
    </PageGate>
  );
}

function LegalContent({
  slug,
  lang,
}: {
  me: MeState;
  slug: string;
  lang: string;
}) {
  const document = getLegalDocument(slug, lang);

  if (!document) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Document not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{document.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
} 
