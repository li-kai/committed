// Format with prettier, if there exists a prettier plugin
async function formatWithPrettier(str: string): Promise<string> {
  try {
    // tslint:disable-next-line:no-implicit-dependencies
    const prettier = await import('prettier');
    return prettier.format(str, { parser: 'markdown' });
  } catch {
    return str;
  }
}

export { formatWithPrettier };
