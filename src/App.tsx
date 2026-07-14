import { useState, useMemo } from 'react';
import {
  universities,
  allCities,
  allRegions,
  allSpecialties,
} from './data/universities';
import { filterUniversities } from './utils/filter';
import type { Filters } from './types';
import Header from './components/Header';
import SearchPanel from './components/SearchPanel';
import UniversityCard from './components/UniversityCard';
import Hero from './components/Hero';

const defaultFilters: Filters = {
  query: '',
  region: '',
  city: '',
  type: '',
  specialty: '',
  minScore: 0,
  hasDormitory: false,
  sortBy: 'rating',
};

export default function App() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const results = useMemo(
    () => filterUniversities(universities, filters),
    [filters]
  );

  const cities = useMemo(() => {
    if (!filters.region) return allCities;
    return [
      ...new Set(
        universities
          .filter((u) => u.region === filters.region)
          .map((u) => u.city)
      ),
    ].sort((a, b) => a.localeCompare(b, 'ru'));
  }, [filters.region]);

  return (
    <>
      <Header />
      <main>
        <Hero onSearch={(query) => setFilters((f) => ({ ...f, query }))} />
        <section className="search-section" id="search">
          <div className="container">
            <SearchPanel
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(defaultFilters)}
              regions={allRegions}
              cities={cities}
              specialties={allSpecialties}
              totalCount={universities.length}
              resultCount={results.length}
            />
            <div className="results">
              {results.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>Ничего не найдено</h3>
                  <p>
                    Попробуйте изменить параметры поиска или{' '}
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setFilters(defaultFilters)}
                    >
                      сбросить фильтры
                    </button>
                  </p>
                </div>
              ) : (
                <div className="cards-grid">
                  {results.map((uni) => (
                    <UniversityCard key={uni.id} university={uni} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="tips-section" id="tips">
          <div className="container">
            <h2 className="section-title">Советы абитуриентам</h2>
            <div className="tips-grid">
              <article className="tip-card">
                <span className="tip-num">01</span>
                <h3>Подайте документы в несколько вузов</h3>
                <p>
                  По закону можно подать документы максимум в 5 вузов, в каждом — до 3
                  направлений. Используйте это для подстраховки.
                </p>
              </article>
              <article className="tip-card">
                <span className="tip-num">02</span>
                <h3>Следите за проходными баллами</h3>
                <p>
                  Проходной балл прошлого года — ориентир, а не гарантия. Смотрите
                  динамику и конкуренцию на ваше направление.
                </p>
              </article>
              <article className="tip-card">
                <span className="tip-num">03</span>
                <h3>Учитывайте целевое обучение</h3>
                <p>
                  Целевые места часто имеют более низкий проходной балл. Уточняйте
                  условия контракта с работодателем заранее.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="logo-icon">🎓</span>
            <span>UniFind</span>
          </div>
          <p className="footer-note">
            Демо-сайт для абитуриентов. Данные носят ознакомительный характер.
          </p>
        </div>
      </footer>
    </>
  );
}
