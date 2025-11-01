import { Card, Heading, Text } from '@radix-ui/themes';

export function AboutPage() {
  return (
    <div className="grid gap-6">
      <Card className="border border-slate-800/70 bg-slate-900/60 p-6">
        <Heading as="h1" size="4" className="mb-4 text-slate-200">
          About GridPhoto
        </Heading>
        <div className="space-y-3 text-slate-300">
          <Text as="p" size="2">
            GridPhoto is a lightweight in-browser tool for composing photo grids. Images never leave your device—every
            conversion and export runs locally so you retain full control over your files.
          </Text>
          <Text as="p" size="2">
            Use the Builder to tweak layout, spacing, orientation, and export quality. Support for HEIC/HEIF files is
            baked in, and the preview updates instantly as you refine settings.
          </Text>
          <Text as="p" size="2">
            Future updates will focus on richer presets, bulk editing, and improved accessibility. Have feedback?
            Contributions and ideas are welcome.
          </Text>
        </div>
      </Card>
    </div>
  );
}
