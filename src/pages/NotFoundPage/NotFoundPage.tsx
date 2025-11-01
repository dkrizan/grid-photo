import { Card, Heading, Text } from '@radix-ui/themes';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="grid gap-6">
      <Card className="border border-slate-800/70 bg-slate-900/60 p-6 text-center">
        <Heading as="h1" size="5" className="mb-3 text-slate-200">
          404
        </Heading>
        <Text as="p" size="2" className="mb-4 text-slate-300">
          We couldn&apos;t find the page you were looking for.
        </Text>
        <Link
          to="/"
          className="text-violet-400 transition hover:text-violet-300"
        >
          Go back to the builder
        </Link>
      </Card>
    </div>
  );
}
