import fs from 'node:fs';
import path from 'node:path';

export type MediaKind = 'image' | 'video';
export type MediaCategory = 'hero' | 'aircraft' | 'runway' | 'material' | 'atelier' | 'project' | 'misc';

export type MediaAsset = {
  src: string;
  filename: string;
  label: string;
  kind: MediaKind;
  category: MediaCategory;
  priority: boolean;
};

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const videoExtensions = new Set(['.mp4', '.webm', '.mov', '.m4v']);

function classify(name: string): MediaCategory {
  const value = name.toLowerCase();

  if (/(runway|landing|touchdown|apron|tarmac)/.test(value)) return 'runway';
  if (/(hero|cover|intro|opening|arrival)/.test(value)) return 'hero';
  if (/(seat|seats|cabin|interior|atelier|process|workshop|fabrication|paint|build|craft|mission|mi[-_ ]?opt)/.test(value)) return 'atelier';
  if (/(material|marble|portoro|nubuck|flannel|chrome|detail|texture)/.test(value)) return 'material';
  if (/(award|charter|project|production|automotive|fashion|film|shoot|campaign)/.test(value)) return 'project';
  if (/(oe[-_ ]?lsc|black[-_ ]?star|aircraft|plane|jet|g450|fuselage|engine|wing)/.test(value)) return 'aircraft';

  return 'misc';
}

function labelFromFilename(filename: string) {
  return path.basename(filename, path.extname(filename)).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function toPublicUrl(relativePath: string) {
  return `/${relativePath.split(path.sep).map(encodeURIComponent).join('/')}`;
}

function walk(directory: string, baseDirectory: string, assets: MediaAsset[]) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, baseDirectory, assets);
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    const kind: MediaKind | null = imageExtensions.has(extension)
      ? 'image'
      : videoExtensions.has(extension)
        ? 'video'
        : null;
    if (!kind) continue;

    const relativePath = path.relative(baseDirectory, fullPath);
    const category = classify(relativePath);
    const priority = category === 'hero' || category === 'aircraft' || category === 'runway';

    assets.push({
      src: toPublicUrl(relativePath),
      filename: entry.name,
      label: labelFromFilename(entry.name),
      kind,
      category,
      priority,
    });
  }
}

export function getPublicMedia(): MediaAsset[] {
  const publicDirectory = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDirectory)) return [];

  const assets: MediaAsset[] = [];
  walk(publicDirectory, publicDirectory, assets);

  return assets.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority ? -1 : 1;
    if (a.kind !== b.kind) return a.kind === 'video' ? -1 : 1;
    return a.filename.localeCompare(b.filename);
  });
}
