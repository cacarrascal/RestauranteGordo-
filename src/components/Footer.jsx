export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src="/logo-footer.png" alt="Logo" className="footer-logo-img" />
        </div>
        <div className="footer-text">
          <span className="footer-name">Realizado por Carlos Carrascal</span>
          <span className="footer-copy">© {new Date().getFullYear()} Restaurante</span>
        </div>
      </div>
    </footer>
  );
}