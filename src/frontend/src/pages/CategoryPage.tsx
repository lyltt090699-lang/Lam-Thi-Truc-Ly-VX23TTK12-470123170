import { useParams } from "react-router";
import { getCategories } from "../api/catalog";
import { ApiError } from "../api/client";
import { useRemote } from "../catalog/useRemote";
import { ListingView } from "../components/catalog/ListingView";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

export function CategoryPage() {
  const { slug = "" } = useParams();
  const { state, retry } = useRemote(async () => {
    const categories = await getCategories();
    const category = categories.find((item) => item.slug === slug);
    if (!category) {
      throw new ApiError(404, "Không tìm thấy danh mục.");
    }

    return category;
  }, slug);

  if (state.status !== "ready") {
    return <CatalogStatus status={state.status} message={"message" in state ? state.message : undefined} onRetry={retry} />;
  }

  return <ListingView category={state.data} />;
}
