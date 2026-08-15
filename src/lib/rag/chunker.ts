export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export function chunkText(
  text: string,
  options: ChunkOptions = {}
): string[] {
  const chunkSize = options.chunkSize || 600;
  const chunkOverlap = options.chunkOverlap || 120;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // Clean and normalize text
  const cleanText = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ');
  
  // Split into paragraphs first to avoid splitting sentences across chunks where possible
  const paragraphs = cleanText.split(/\n\s*\n/);
  
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmedPara = paragraph.trim();
    if (!trimmedPara) continue;

    if ((currentChunk + '\n\n' + trimmedPara).length <= chunkSize) {
      currentChunk = currentChunk ? `${currentChunk}\n\n${trimmedPara}` : trimmedPara;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }

      // If single paragraph is larger than chunkSize, break it by sentences or max chars
      if (trimmedPara.length > chunkSize) {
        const sentences = trimmedPara.match(/[^.!?]+[.!?]+(\s|$)/g) || [trimmedPara];
        let subChunk = '';
        for (const sentence of sentences) {
          if ((subChunk + sentence).length <= chunkSize) {
            subChunk += sentence;
          } else {
            if (subChunk) chunks.push(subChunk.trim());
            subChunk = sentence;
          }
        }
        if (subChunk) {
          currentChunk = subChunk.trim();
        } else {
          currentChunk = '';
        }
      } else {
        // Carry over overlap from the end of currentChunk if possible
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(chunkOverlap / 6)).join(' ');
        currentChunk = overlapWords ? `${overlapWords}\n\n${trimmedPara}` : trimmedPara;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(c => c.length > 20); // filter out tiny chunks
}
