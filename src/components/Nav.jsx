export default function Nav({ page, setPage, pages }) {
  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      padding: '0 16px',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 8px rgba(67,56,202,0.06)'
    }}>
      <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-primary)', letterSpacing: -0.5 }}>공아요</span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>공부를 아시나요?</span>
        </div>
        <nav style={{ display: 'flex', gap: 2 }}>
          {pages.map((p, i) => (
            <button key={i} onClick={() => setPage(i)} style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: i === page ? 500 : 400,
              background: i === page ? 'var(--color-primary-light)' : 'transparent',
              color: i === page ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: 'none',
              transition: 'all 0.15s'
            }}>{p}</button>
          ))}
        </nav>
      </div>
    </header>
  )
}
