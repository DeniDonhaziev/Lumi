import type { University } from '../types';
import { getRatingLabel, getRatingClass } from '../utils/filter';

interface UniversityCardProps {
  university: University;
}

export default function UniversityCard({ university: u }: UniversityCardProps) {
  return (
    <article className="uni-card">
      <div className="uni-card-top">
        <div className="uni-badges">
          <span className={`rating-badge ${getRatingClass(u.rating)}`}>
            {getRatingLabel(u.rating)} · {u.rating}
          </span>
          <span className="type-badge">{u.type}</span>
        </div>
        <h3 className="uni-name">{u.shortName}</h3>
        <p className="uni-full-name">{u.name}</p>
      </div>

      <p className="uni-desc">{u.description}</p>

      <div className="uni-meta">
        <div className="meta-item">
          <span className="meta-label">📍 Город</span>
          <span>{u.city}, {u.region}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">📊 Проходной</span>
          <span className="meta-highlight">{u.minScore} баллов</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">🎫 Бюджет</span>
          <span>{u.budgetPlaces.toLocaleString('ru-RU')} мест</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">💳 Платно</span>
          <span>{u.paidPlaces.toLocaleString('ru-RU')} мест</span>
        </div>
      </div>

      <div className="uni-tags">
        {u.specialties.slice(0, 4).map((s) => (
          <span key={s} className="tag">{s}</span>
        ))}
        {u.specialties.length > 4 && (
          <span className="tag tag-more">+{u.specialties.length - 4}</span>
        )}
      </div>

      <div className="uni-features">
        {u.hasDormitory && <span className="feature">🏠 Общежитие</span>}
        {u.hasMilitary && <span className="feature">🎖️ Военная кафедра</span>}
      </div>

      <a
        href={u.website}
        target="_blank"
        rel="noopener noreferrer"
        className="uni-link"
      >
        Сайт вуза →
      </a>
    </article>
  );
}
