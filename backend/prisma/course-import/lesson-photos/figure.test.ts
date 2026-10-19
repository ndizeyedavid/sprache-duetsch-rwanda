import { describe, expect, it } from "vitest";
import { localiseLegacyPhotos, photoFigure, withLeadPhoto } from "./figure.js";

const legacy = '<h2>Lernziele</h2>\n<figure><img src="https://images.unsplash.com/photo-123-abc?w=800&amp;q=60&amp;auto=format" alt="Vier Freunde &quot;lachen&quot;" width="800" loading="lazy"><figcaption>Foto: <a href="https://unsplash.com/@x">X</a> auf <a href="https://unsplash.com/">Unsplash</a></figcaption></figure>\n<p>Text</p>';

describe("lesson photos", () => {
  it("rewrites hotlinked, credited Unsplash figures to local caption-free ones", () => {
    const out = localiseLegacyPhotos(legacy);
    expect(out).toContain('src="/coursebook/photos/photo-123-abc.webp"');
    expect(out).toContain('alt="Vier Freunde &quot;lachen&quot;"');
    expect(out).not.toContain("unsplash");
    expect(out).not.toContain("figcaption");
    expect(localiseLegacyPhotos(out)).toBe(out);
  });

  it("also rewrites photos a staff edit turned into a bare img + credit paragraph", () => {
    const edited = '<h2>Lernziele</h2><img src="https://images.unsplash.com/photo-1559855604-f11cd5d385eb?w=800&amp;q=60&amp;auto=format" alt="Menschen kaufen Gemüse" width="800"><p>Foto: <a target="_blank" href="https://unsplash.com/@x?utm_source=d">Megan</a> auf <a target="_blank" href="https://unsplash.com/?utm_source=d">Unsplash</a></p><p><strong>Text</strong></p>';
    const out = localiseLegacyPhotos(edited);
    expect(out).toBe(`<h2>Lernziele</h2>${photoFigure("photo-1559855604-f11cd5d385eb", "Menschen kaufen Gemüse")}<p><strong>Text</strong></p>`);
    expect(localiseLegacyPhotos(out)).toBe(out);
  });

  it("adds a lead photo under Lernziele exactly once", () => {
    const body = "<h2>Lernziele</h2>\n<p>Ziele</p>";
    const once = withLeadPhoto(body, "a1-01", "Aussprache üben");
    expect(once).toBe(`<h2>Lernziele</h2>\n${photoFigure("a1-01", "Aussprache üben")}\n<p>Ziele</p>`);
    expect(withLeadPhoto(once, "a1-01", "Aussprache üben")).toBe(once);
  });

  it("puts the photo first when a lesson has no Lernziele heading", () => {
    expect(withLeadPhoto("<h2>Teil 1</h2>", "a1-49", "Test")).toMatch(/^<figure class="lesson-photo">/);
  });
});
