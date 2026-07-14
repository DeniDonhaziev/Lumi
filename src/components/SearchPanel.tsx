import type { Filters } from '../types';

interface SearchPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
  regions: string[];
  cities: string[];
  specialties: string[];
  totalCount: number;
  resultCount: number;
}

export default function SearchPanel({
  filters,
  onChange,
  onReset,
  regions,
  cities,
  specialties,
  totalCount,
  resultCount,
}: SearchPanelProps) {
  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <aside className="search-panel">
      <div className="panel-header">
        <h2>Фильтры</h2>
        <span className="result-count">
          {resultCount} из {totalCount}
        </span>
      </div>

      <div className="filter-group">
        <label htmlFor="query">Поиск</label>
        <input
          id="query"
          type="search"
          value={filters.query}
          onChange={(e) => update('query', e.target.value)}
          placeholder="Название, город, специальность..."
        />
      </div>

      <div className="filter-group">
        <label htmlFor="region">Регион</label>
        <select
          id="region"
          value={filters.region}
          onChange={(e) =>
            onChange({ ...filters, region: e.target.value, city: '' })
          }
        >
          <option value="">Все регионы</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label htmlFor="city">Город</label>
          <select
            id="city"
            value={filters.city}
            onChange={(e) => update('city', e.target.value)}
          >
            <option value="">Все города</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="type">Тип</label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => update('type', e.target.value)}
          >
            <option value="">Все</option>
            <option value="государственный">Государственный</option>
            <option value="частный">Частный</option>
          </select>
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="specialty">Специальность</label>
        <select
          id="specialty"
          value={filters.specialty}
          onChange={(e) => update('specialty', e.target.value)}
        >
          <option value="">Все специальности</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="minScore">
          Макс. проходной балл: {filters.minScore || 'любой'}
        </label>
        <input
          id="minScore"
          type="range"
          min={0}
          max={300}
          step={5}
          value={filters.minScore}
          onChange={(e) => update('minScore', Number(e.target.value))}
        />
        <div className="range-labels">
          <span>0</span>
          <span>300</span>
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="sortBy">Сортировка</label>
        <select
          id="sortBy"
          value={filters.sortBy}
          onChange={(e) =>
            update('sortBy', e.target.value as Filters['sortBy'])
          }
        >
          <option value="rating">По рейтингу</option>
          <option value="minScore">По проходному баллу</option>
          <option value="name">По названию</option>
        </select>
      </div>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={filters.hasDormitory}
          onChange={(e) => update('hasDormitory', e.target.checked)}
        />
        <span>Только с общежитием</span>
      </label>

      <button type="button" className="reset-btn" onClick={onReset}>
        Сбросить фильтры
      </button>
    </aside>
  );
}
