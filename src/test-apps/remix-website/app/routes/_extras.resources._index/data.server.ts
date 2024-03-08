import {
  getAllResources,
  type Category,
  type Resource,
} from "~/lib/resources.server";
import { categories } from "./ui";
import { redirect } from "@remix-run/node";
import { octokit } from "~/lib/github.server";

export async function getResourcesForRequest(request: Request) {
  let allResources = await getAllResources({ octokit });
  let { selectedCategory, selectedTags } = checkSearchParams(
    request,
    allResources,
  );

  // filter resources by category -- need to do it after we check the search params since we need all of the valid tags for that
  let resources =
    selectedCategory === "all"
      ? allResources
      : allResources.filter(({ category }) => category === selectedCategory);

  // show the featured resource if no tags are selected
  if (selectedTags.length === 0) {
    let featuredIdx = allResources.findIndex(({ featured }) => featured);
    featuredIdx = featuredIdx === -1 ? 0 : featuredIdx;

    let featuredResource = allResources[featuredIdx];
    allResources.splice(featuredIdx, 1);

    return {
      selectedCategory,
      selectedTags,
      featuredResource,
      resources,
    };
  }

  // get all resources that have all of the selected tags
  resources = resources.filter(({ tags }) => {
    return selectedTags.every((tag) => tags.includes(tag));
  });

  return {
    selectedCategory,
    selectedTags,
    resources,
    featuredResource: null,
  };
}

/**
 * Checks that the category and selected tags are all valid
 * Throws a redirect if the category is missing or invalid or if
 * any of the selected tags are invalid
 */
function checkSearchParams(request: Request, resources: Resource[]) {
  let hasInvalidTag = false;
  // get search params: category and tags
  let searchParams = new URL(request.url).searchParams;
  let selectedCategory = searchParams.get("category");
  let selectedTagsSet = new Set(searchParams.getAll("tag"));
  let tags = new Set(resources.flatMap(({ tags }) => tags));

  // handle a missing or incorrect category
  if (!selectedCategory || !categories.includes(selectedCategory)) {
    searchParams.set("category", "all");
    hasInvalidTag = true;
  }

  // filter by selected tags and return both the selected tags and the filtered resources
  let selectedTags = [...selectedTagsSet];

  // drop all tags that
  for (let tag of selectedTags) {
    if (tags.has(tag)) continue;
    searchParams.delete("tag", tag);
    hasInvalidTag = true;
  }

  if (hasInvalidTag) {
    throw redirect(`/resources?${searchParams}`);
  }

  return {
    // the check above assures that the selectedCategory is the right type
    selectedCategory: selectedCategory as Category,
    selectedTags,
  };
}
