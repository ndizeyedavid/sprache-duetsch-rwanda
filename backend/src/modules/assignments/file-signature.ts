import { open } from "node:fs/promises";
export const matchesFileSignature = async (filePath: string, mime: string): Promise<boolean> => {
  const file = await open(filePath, "r");
  try {
    const bytes = Buffer.alloc(16);
    await file.read(bytes, 0, 16, 0);
    const starts = (hex: string) => bytes.subarray(0, hex.length / 2).toString("hex") === hex;
    if (mime === "application/pdf") return bytes.subarray(0, 5).toString() === "%PDF-";
    if (mime === "image/png") return starts("89504e470d0a1a0a");
    if (mime === "image/jpeg") return starts("ffd8ff");
    if (mime === "image/webp")
      return (
        bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP"
      );
    if (mime === "audio/wav" || mime === "audio/x-wav")
      return (
        bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WAVE"
      );
    if (mime === "audio/webm") return starts("1a45dfa3");
    if (mime === "audio/ogg") return bytes.subarray(0, 4).toString() === "OggS";
    if (mime === "audio/mp4") return bytes.subarray(4, 8).toString() === "ftyp";
    if (mime === "audio/mpeg" || mime === "audio/mp3")
      return (
        bytes.subarray(0, 3).toString() === "ID3" || (bytes[0] === 255 && (bytes[1] & 224) === 224)
      );
    return false;
  } finally {
    await file.close();
  }
};
