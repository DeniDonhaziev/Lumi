export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="#" className="logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">
            Uni<span className="logo-accent">Find</span>
          </span>
        </a>
        <nav className="nav">
          <a href="#search">Поиск</a>
          <a href="#tips">Советы</a>
        </nav>
      </div>
    </header>
  );
}
