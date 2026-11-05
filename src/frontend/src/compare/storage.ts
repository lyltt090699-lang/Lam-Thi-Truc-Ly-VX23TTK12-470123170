const compareKey = "apple-store-compare";
const compareLimit = 3;

export function readCompare() {
  const raw = localStorage.getItem(compareKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string").slice(0, compareLimit);
  } catch {
    return [];
  }
}

export function compareCount() {
  return readCompare().length;
}

export function toggleCompare(slug: string) {
  const current = readCompare();
  if (current.includes(slug)) {
    writeCompare(current.filter((item) => item !== slug));
    return "Đã bỏ khỏi so sánh.";
  }

  if (current.length >= compareLimit) {
    return "Chỉ so sánh tối đa 3 sản phẩm.";
  }

  writeCompare([...current, slug]);
  return "Đã thêm vào so sánh.";
}

export function removeCompare(slug: string) {
  writeCompare(readCompare().filter((item) => item !== slug));
}

export function clearCompare() {
  writeCompare([]);
}

function writeCompare(slugs: string[]) {
  localStorage.setItem(compareKey, JSON.stringify(slugs.slice(0, compareLimit)));
  window.dispatchEvent(new Event("compare-changed"));
}
