import changelog, { defaultTemplate } from './changelog';

describe('changelog', () => {
  it("generates a commit's markdown", () => {
    expect(changelog(defaultTemplate)).resolves.toMatchInlineSnapshot(
      `"# Changelog"`
    );
  });
});
