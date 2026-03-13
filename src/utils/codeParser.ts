export interface ParsedFile {
  file: string;
  data: string;
}

export function parseGeneratedCode(code: string, defaultExt: string): ParsedFile[] {
  const files: ParsedFile[] = [];
  // Match optional filename comment before the block, e.g., `// filename: app.js` or `**app.js**`
  // Then the markdown block
  const regex = /(?:(?:(?:\/\/\s*|#\s*|<!--\s*)(?:filename|file):\s*([\w.-]+).*?\n)|(?:\*\*([\w.-]+)\*\*.*?\n))?```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)```/g;
  let match;
  
  let fileCount = 0;
  while ((match = regex.exec(code)) !== null) {
    let filename = match[1] || match[2] || '';
    const content = match[3];
    
    // If not found before block, try to find a filename comment in the first few lines of the block
    if (!filename) {
      const lines = content.split('\n');
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();
        const nameMatch = line.match(/^(?:\/\/\s*|#\s*|<!--\s*)(?:filename|file):\s*([\w.-]+)/i);
        if (nameMatch) {
          filename = nameMatch[1];
          break;
        }
      }
    }
    
    if (!filename) {
      if (fileCount === 0) {
        filename = `index.${defaultExt}`;
      } else {
        filename = `file${fileCount}.${defaultExt}`;
      }
    }
    
    // Remove the filename comment from the content if it's inside the block and it's a JSON file
    let cleanContent = content;
    if (filename.endsWith('.json')) {
      cleanContent = content.replace(/^(?:\/\/\s*|#\s*|<!--\s*)(?:filename|file):\s*([\w.-]+).*?\n/im, '');
    }

    files.push({ file: filename, data: cleanContent });
    fileCount++;
  }
  
  // If no markdown blocks found, treat the whole string as one file
  if (files.length === 0) {
    files.push({ file: `index.${defaultExt}`, data: code });
  }
  
  return files;
}
