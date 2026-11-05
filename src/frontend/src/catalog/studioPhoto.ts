const categoryPhotos: Record<string, string> = {
  iphone: "/photos/cat-iphone.jpg",
  mac: "/photos/cat-mac.jpg",
  ipad: "/photos/cat-ipad.jpg",
  "apple-watch": "/photos/cat-watch.jpg",
  airpods: "/photos/cat-airpods.jpg",
  accessories: "/photos/cat-accessories.jpg",
};

const slugPhotos: Record<string, string> = {
  "iphone-16": "/photos/card-blue.jpg",
  "iphone-16-pro": "/photos/card-black.jpg",
  "iphone-16-pro-max": "/photos/card-gold.jpg",
  "iphone-16e": "/photos/card-gold.jpg",
  "iphone-15": "/photos/card-pink.jpg",
  "iphone-15-plus": "/photos/card-teal.jpg",
  "iphone-14": "/photos/card-blue.jpg",
  "iphone-13": "/photos/card-black.jpg",
  "iphone-se": "/photos/card-black.jpg",
  "macbook-air": "/photos/laptop-studio.jpg",
  "macbook-pro": "/photos/laptop-studio.jpg",
  "ipad-air": "/photos/tablet-studio.jpg",
  "ipad-pro": "/photos/tablet-studio.jpg",
  "watch-series-10": "/photos/watch-studio.jpg",
  "watch-ultra": "/photos/watch-studio.jpg",
  "airpods-4": "/photos/airpods-card.jpg",
  "airpods-max": "/photos/airpods-card.jpg",
  "usb-c-cable": "/photos/accessories-studio.jpg",
  "silicone-case": "/photos/accessories-studio.jpg",
};

export function categoryPhoto(slug: string) {
  return categoryPhotos[slug] ?? "";
}

export function studioPhoto(slug: string, categorySlug?: string) {
  return slugPhotos[slug] ?? (categorySlug ? categoryPhotos[categorySlug] ?? "" : "");
}
