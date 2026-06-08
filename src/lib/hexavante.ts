export function getHexavanteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_HEXAVANTE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getHexavanteCourseUrl(slug: string) {
  return getHexavanteUrl(`/courses/${slug}`);
}

export function getHexavanteCourseLearnUrl(slug: string) {
  return getHexavanteUrl(`/courses/${slug}/learn`);
}
