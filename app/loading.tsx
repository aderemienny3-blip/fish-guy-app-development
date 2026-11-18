export default function Loading() {
  return (
    <main className="page-width loading-page" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Loading Fish Guy content</span>
      <div className="loading-hero" aria-hidden="true"><span /><span /></div>
      <div className="loading-section" aria-hidden="true">
        <span className="loading-line loading-line-short" />
        <span className="loading-line loading-line-wide" />
        <div className="loading-cards"><span /><span /><span /></div>
      </div>
    </main>
  )
}
