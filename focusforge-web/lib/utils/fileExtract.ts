export interface ExtractResult {
  title: string;
  content: string;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.pptx', '.txt', '.md'];

export function isAcceptedFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext);
}

export const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(',');

function stripExtension(name: string): string {
  return name.replace(/\.[^.]+$/, '');
}

async function extractTxt(file: File): Promise<ExtractResult> {
  const content = await file.text();
  return { title: stripExtension(file.name), content };
}

async function extractDocx(file: File): Promise<ExtractResult> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return { title: stripExtension(file.name), content: result.value.trim() };
}

async function extractPdf(file: File): Promise<ExtractResult> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page      = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Group text items by their Y position (rounded to 2pt tolerance) to reconstruct lines
    const lineMap = new Map<number, { x: number; text: string }[]>();

    for (const item of textContent.items) {
      if (!('str' in item) || !item.str) continue;
      const y = Math.round(item.transform[5] / 2) * 2; // 2pt bucket
      const x = item.transform[4];
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push({ x, text: item.str });
    }

    // Sort buckets top-to-bottom (PDF y=0 is at the bottom, so descending)
    const lines = [...lineMap.entries()]
      .sort(([ya], [yb]) => yb - ya)
      .map(([, items]) =>
        items
          .sort((a, b) => a.x - b.x)
          .map((i) => i.text)
          .join('')
          .trim(),
      )
      .filter(Boolean);

    if (lines.length) pages.push(lines.join('\n'));
  }

  return { title: stripExtension(file.name), content: pages.join('\n\n') };
}

async function extractPptx(file: File): Promise<ExtractResult> {
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // Slides are at ppt/slides/slide1.xml, slide2.xml, …
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const num = (s: string) => parseInt(s.match(/\d+/)?.[0] ?? '0', 10);
      return num(a) - num(b);
    });

  const slideTexts: string[] = [];

  for (const slideName of slideFiles) {
    const xml = await zip.files[slideName].async('text');
    // Extract all <a:t> text nodes
    const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) ?? [];
    const text = matches
      .map((m) => m.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)
      .join(' ');
    if (text) slideTexts.push(text);
  }

  return {
    title: stripExtension(file.name),
    content: slideTexts.join('\n\n'),
  };
}

export async function extractFileContent(file: File): Promise<ExtractResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'pdf')             return extractPdf(file);
  if (ext === 'docx' || ext === 'doc') return extractDocx(file);
  if (ext === 'pptx')            return extractPptx(file);
  if (ext === 'txt' || ext === 'md')   return extractTxt(file);

  throw new Error(`Unsupported file type: .${ext}`);
}
