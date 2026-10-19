import { describe, expect, it } from "vitest";
import { planPhotoChanges } from "./plan.js";

const unsplash = '<h2>Lernziele</h2>\n<figure><img src="https://images.unsplash.com/photo-9?w=800&amp;q=60" alt="Markt" width="800"><figcaption>Foto: X auf Unsplash</figcaption></figure>';
const generated = '<h2>Lernziele</h2>\n<figure class="lesson-photo"><img src="/coursebook/photos/a1-05.webp" alt="KI" width="800" height="533" loading="lazy" decoding="async"></figure>\n<p>Hallo</p>';

describe("planPhotoChanges", () => {
  it("self-hosts credited photos and removes AI-generated ones, idempotently", () => {
    const lessons = [
      { id: "b1", title: "B1", level: "B1", body: unsplash },
      { id: "a1", title: "Greetings", level: "A1", body: generated },
      { id: "staff", title: "Mine", level: "A1", body: "<h2>Lernziele</h2><p>Eigener Text</p>" },
    ];
    const changes = planPhotoChanges(lessons);
    expect(changes.map((c) => [c.id, c.reason])).toEqual([["b1", "self-host photo, drop credit"], ["a1", "remove AI-generated photo"]]);
    expect(changes[0].after).toContain("/coursebook/photos/photo-9.webp");
    expect(changes[1].after).toBe("<h2>Lernziele</h2>\n<p>Hallo</p>");
    const again = planPhotoChanges(lessons.map((l) => ({ ...l, body: changes.find((c) => c.id === l.id)?.after ?? l.body })));
    expect(again).toEqual([]);
  });
});
