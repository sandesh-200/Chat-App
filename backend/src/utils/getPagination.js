export function getPagination(query) {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 10;

  limit = Math.min(limit, 50);

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
