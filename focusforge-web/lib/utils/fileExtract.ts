export interface ExtractResult {
  title: string;
  content: string;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt', '.md'];

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
  // Use CDN worker to avoid Next.js bundling issues with the worker file
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .trim();
    if (pageText) pages.push(pageText);
  }

  return { title: stripExtension(file.name), content: pages.join('\n\n') };
}

export async function extractFileContent(file: File): Promise<ExtractResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') return extractPdf(file);
  if (ext === 'docx' || ext === 'doc') return extractDocx(file);
  if (ext === 'txt' || ext === 'md') return extractTxt(file);

  throw new Error(`Unsupported file type: .${ext}`);
}
