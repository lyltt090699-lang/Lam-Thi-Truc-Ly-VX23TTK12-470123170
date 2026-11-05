import { useParams } from "react-router";
import { getContentPage } from "../api/content";
import { useRemote } from "../catalog/useRemote";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

const storedSlugs: Record<string, string> = {
  terms: "dieu-khoan",
  privacy: "chinh-sach-bao-mat",
  returns: "chinh-sach-doi-tra",
  warranty: "chinh-sach-bao-hanh",
  help: "cau-hoi-thuong-gap",
  story: "gioi-thieu",
  "how-to-buy": "huong-dan-mua-hang",
  delivery: "chinh-sach-van-chuyen",
};

export function ContentPage() {
  const { slug = "" } = useParams();
  const stored = storedSlugs[slug] ?? slug;
  const { state, retry } = useRemote(() => getContentPage(stored), stored);

  if (state.status !== "ready") {
    return <CatalogStatus status={state.status} message={"message" in state ? state.message : undefined} onRetry={retry} />;
  }

  const paragraphs = state.data.body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">{state.data.title}</h1>
      <div className="mt-6 space-y-4 leading-7">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
