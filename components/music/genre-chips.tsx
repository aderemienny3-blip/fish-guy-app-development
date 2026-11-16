import Link from 'next/link'

const genres = ['Afrobeats-hip-hop', 'Street rap', 'Drill', 'Trap', 'Boom bap']

export function GenreChips({ selected }: { selected?: string }) {
  return (
    <nav className="genre-chips" aria-label="Filter tracks by genre">
      <Link href="/sounds" className={`genre-chip ${!selected ? 'is-selected' : ''}`} aria-current={!selected ? 'page' : undefined}>All sounds</Link>
      {genres.map((genre) => (
        <Link
          href={`/sounds?genre=${encodeURIComponent(genre)}`}
          className={`genre-chip ${selected?.toLowerCase() === genre.toLowerCase() ? 'is-selected' : ''}`}
          aria-current={selected?.toLowerCase() === genre.toLowerCase() ? 'page' : undefined}
          key={genre}
        >
          {genre}
        </Link>
      ))}
    </nav>
  )
}
