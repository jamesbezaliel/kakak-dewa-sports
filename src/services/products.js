export async function getProducts() {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbwnWjTEgKgWzxRqbeDwgVCxT33ayUIzTYh4aEDNuzbqsz5oLTPEheQfeZrrnXhPT0Si/exec",
  );

  const data = await res.json();

  return data.map((item) => ({
    ...item,

    images: item.images ? item.images.split(",").map((img) => img.trim()) : [],

    variantLabels: item.variantLabels
      ? item.variantLabels.split(",").map((v) => v.trim())
      : [],

    isBestSeller: String(item.isBestSeller).toLowerCase() === "true",
  }));
}
