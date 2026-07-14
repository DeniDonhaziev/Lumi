interface HeroProps {
  onSearch: (query: string) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('hero-search') as HTMLInputElement;
    onSearch(input.value);
    document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container hero-content">
        <div className="hero-badge">Поступление 2026</div>
        <h1 className="hero-title">
          Найди свой университет
        </h1>
        <p className="hero-subtitle">
          Поиск по 20+ вузам России — специальности, проходные баллы,
          бюджетные места и общежитие
        </p>
        <form className="hero-search" onSubmit={handleSubmit}>
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            name="hero-search"
            placeholder="Название вуза, город или специальность..."
            autoComplete="off"
          />
          <button type="submit">Найти</button>
        </form>
        <div className="hero-stats">
          <div className="stat">
            <strong>20+</strong>
            <span>университетов</span>
          </div>
          <div className="stat">
            <strong>50+</strong>
            <span>специальностей</span>
          </div>
          <div className="stat">
            <strong>15</strong>
            <span>городов</span>
          </div>
        </div>
      </div>
    </section>
  );
}
