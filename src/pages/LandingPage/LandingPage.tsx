import { ArrowRightIcon, CheckIcon } from '@radix-ui/react-icons';
import { Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Flexible layouts',
    description:
      'Mix and match rows, columns, gutters, and separators to create photo grids that fit any layout or dimension.',
  },
  {
    title: 'High-resolution exports',
    description:
      'Render crisp images sized for social media, presentations, or large-format print—all right in your browser.',
  },
  {
    title: 'Private & secure',
    description:
      'Photos never leave your device. GridPhoto Studio runs entirely in the browser so your images stay private.',
  },
];

const steps = [
  'Upload multiple photos or drag-and-drop a folder of images.',
  'Choose your grid layout, tweak spacing, borders, and background colors.',
  'Preview the composition instantly and export a high-resolution PNG or JPEG.',
];

export function LandingPage() {
  return (
    <div className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-center">
        <div className="space-y-6">
          <Heading as="h1" size="8" className="text-slate-100">
            Design beautiful photo grids in your browser
          </Heading>
          <Text as="p" size="4" className="max-w-2xl text-slate-300">
            GridPhoto Studio helps photographers, designers, and marketers build
            custom photo grids without installing heavy desktop software.
            Arrange images into responsive layouts, fine-tune the composition,
            and export high-resolution files ready for print or social media.
          </Text>
          <Flex gap="3" align="center" wrap="wrap">
            <Button asChild size="3" color="violet">
              <Link to="/builder" className="gap-2">
                Open the builder
                <ArrowRightIcon />
              </Link>
            </Button>
            <Link
              to="/about"
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Learn more about GridPhoto
            </Link>
          </Flex>
        </div>
        <Card className="border border-violet-600/40 bg-slate-950/70 p-6 shadow-xl shadow-violet-500/20">
          <Heading as="h2" size="4" className="mb-4 text-violet-200">
            Why creators choose GridPhoto Studio
          </Heading>
          <div className="space-y-5">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-3">
                <div className="flex h-5 w-8 items-center justify-center rounded-full bg-violet-600/40 text-violet-100">
                  <CheckIcon />
                </div>
                <div>
                  <Heading as="h3" size="3" className="text-slate-100">
                    {feature.title}
                  </Heading>
                  <Text as="p" size="2" className="text-slate-300">
                    {feature.description}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => (
          <Card
            key={step}
            className="space-y-3 border border-slate-800/70 bg-slate-900/60 p-6"
          >
            <Text
              size="1"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-600/80 font-semibold text-slate-50"
            >
              {index + 1}
            </Text>
            <Heading as="h3" size="3" className="text-slate-100">
              Step {index + 1}
            </Heading>
            <Text as="p" size="2" className="text-slate-300">
              {step}
            </Text>
          </Card>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 md:p-12">
        <Heading as="h2" size="5" className="mb-4 text-slate-100">
          Perfect for social feeds, mood boards, storyboards, and contact sheets
        </Heading>
        <Text as="p" size="3" className="max-w-3xl text-slate-300">
          Create consistent branding by assembling product imagery, campaign
          shots, or event highlights into cohesive grid layouts. GridPhoto
          Studio keeps everything inside your browser, supports HEIC, JPG, PNG,
          and WEBP files, and exports polished assets sized for Instagram,
          LinkedIn, Pinterest, or large-format printing.
        </Text>
        <div className="mt-6">
          <Button asChild size="3" color="violet">
            <Link to="/builder" className="gap-2">
              Start building a grid now
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
