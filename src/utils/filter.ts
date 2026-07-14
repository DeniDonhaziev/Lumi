import type { University, Filters } from '../types';

export function filterUniversities(
  list: University[],
  filters: Filters
): University[] {
  let result = list.filter((u) => {
    const q = filters.query.toLowerCase().trim();
    if (q) {
      const match =
        u.name.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.region.toLowerCase().includes(q) ||
        u.specialties.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filters.region && u.region !== filters.region) return false;
    if (filters.city && u.city !== filters.city) return false;
    if (filters.type && u.type !== filters.type) return false;
    if (filters.specialty && !u.specialties.includes(filters.specialty)) return false;
    if (filters.minScore > 0 && u.minScore > filters.minScore) return false;
    if (filters.hasDormitory && !u.hasDormitory) return false;

    return true;
  });

  result = [...result].sort((a, b) => {
    switch (filters.sortBy) {
      case 'minScore':
        return a.minScore - b.minScore;
      case 'name':
        return a.name.localeCompare(b.name, 'ru');
      case 'rating':
      default:
        return b.rating - a.rating;
    }
  });

  return result;
}

export function getRatingLabel(rating: number): string {
  if (rating >= 90) return 'Топ';
  if (rating >= 80) return 'Высокий';
  if (rating >= 70) return 'Хороший';
  return 'Средний';
}

export function getRatingClass(rating: number): string {
  if (rating >= 90) return 'rating-top';
  if (rating >= 80) return 'rating-high';
  if (rating >= 70) return 'rating-good';
  return 'rating-mid';
}
