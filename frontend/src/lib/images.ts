export type ImageSize =
  | 'square_hd'
  | 'square'
  | 'portrait_4_3'
  | 'portrait_16_9'
  | 'landscape_4_3'
  | 'landscape_16_9';

const ENDPOINT = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image';

/** Builds a generated image URL for any photo used in the UI. */
export function img(prompt: string, imageSize: ImageSize = 'square'): string {
  return `${ENDPOINT}?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;
}

function portrait(subject: string): string {
  return img(
    `professional headshot photograph of ${subject}, smiling, soft natural light, plain light neutral background, sharp focus, realistic photo`,
    'square',
  );
}

export const photos = {
  clarisse: portrait('a confident Rwandan woman in her thirties, shoulder length hair, light blue blouse'),
  nadine: portrait('a young Rwandan woman with short curly hair, white shirt'),
  jeanPaul: portrait('a Rwandan man in his thirties with short hair and beard, dark shirt'),
  aline: portrait('a young Rwandan woman with braided hair, cream sweater'),
  eric: portrait('a Rwandan man in his twenties wearing glasses, grey hoodie'),
  yves: portrait('a smiling Rwandan man in his late twenties, windbreaker jacket'),
  sandrine: portrait('a Rwandan woman with long braids, mustard top'),
  patrick: portrait('a young Rwandan man with fade haircut, blue shirt'),
  diane: portrait('a Rwandan woman in her twenties with headwrap, green blouse'),
  fabrice: portrait('a Rwandan man with round glasses, white tee shirt'),
  solange: portrait('a Rwandan woman in her forties, short hair, dark blazer'),
  emmanuel: portrait('a Rwandan man with short beard, olive shirt'),
} as const;

export const hero = img(
  'a happy young African female student holding notebooks and a folder, smiling at camera, studio shot on flat mint green background, upper body, realistic photo',
  'portrait_4_3',
);

export const courseArt = {
  a1: img(
    'young African woman studying with a laptop and notebooks at a bright desk, large window light, shot from the side, realistic photo',
    'landscape_4_3',
  ),
  a2: img(
    'young woman smiling while taking online language class on a laptop in a bright living room, realistic photo',
    'landscape_4_3',
  ),
  b1: img(
    'barista and a customer talking inside a modern coffee shop, warm daylight, realistic photo',
    'landscape_4_3',
  ),
  b2: img(
    'two university students reviewing notes together on a campus table, natural light, realistic photo',
    'landscape_4_3',
  ),
  business: img(
    'young African professional working on a laptop in a modern co working office, plants in the background, realistic photo',
    'landscape_4_3',
  ),
  testdaf: img(
    'student writing an exam at a desk with a notebook and pen, focused, soft daylight, realistic photo',
    'landscape_4_3',
  ),
} as const;

export const liveClassArt = img(
  'female teacher gesturing with both hands while teaching an online class, home office with bookshelf behind her, video call framing, realistic photo',
  'landscape_16_9',
);

export const articleArt = {
  uxTips: img(
    'designer workspace with a desktop monitor showing a design tool, green plant beside it, overhead angle, realistic photo',
    'landscape_4_3',
  ),
  fonts: img(
    'open typography book with printed specimens on a desk, minimal styling, realistic photo',
    'landscape_4_3',
  ),
  react: img(
    'laptop with code editor open on a wooden desk beside a small plant, realistic photo',
    'landscape_4_3',
  ),
} as const;
