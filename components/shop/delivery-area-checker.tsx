'use client'

import { useState } from 'react'
import type { DeliveryArea } from '@/lib/music-data'

function formatNaira(amountKobo: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountKobo / 100)
}

export function DeliveryAreaChecker({ areas }: { areas: DeliveryArea[] }) {
  const [selectedSlug, setSelectedSlug] = useState('')
  const selectedArea = areas.find((area) => area.slug === selectedSlug)

  return (
    <section className="delivery-area-section" aria-labelledby="delivery-area-title">
      <div className="delivery-area-copy">
        <p className="eyebrow">LIVE DELIVERY COVERAGE</p>
        <h2 id="delivery-area-title">Check your area.</h2>
        <p>Choose an active delivery area to see its fee and free-delivery threshold.</p>
      </div>
      <div className="delivery-area-controls">
        <label htmlFor="delivery-area-select">Delivery area</label>
        <select
          id="delivery-area-select"
          value={selectedSlug}
          onChange={(event) => setSelectedSlug(event.target.value)}
          disabled={areas.length === 0}
          aria-describedby="delivery-area-result"
        >
          <option value="">{areas.length ? 'Choose your area' : 'No delivery areas available'}</option>
          {areas.map((area) => <option value={area.slug} key={area.id}>{area.name}</option>)}
        </select>
        <div className="delivery-area-result" id="delivery-area-result" aria-live="polite">
          {areas.length === 0 ? (
            <p role="status">Live delivery coverage has not been configured yet.</p>
          ) : selectedArea ? (
            <dl>
              <div><dt>Delivery fee</dt><dd>{selectedArea.deliveryFeeKobo === 0 ? 'Free' : formatNaira(selectedArea.deliveryFeeKobo)}</dd></div>
              <div>
                <dt>Free delivery</dt>
                <dd>
                  {selectedArea.freeDeliveryThresholdKobo === null
                    ? 'No threshold set'
                    : selectedArea.freeDeliveryThresholdKobo === 0
                      ? 'On every order'
                      : `From ${formatNaira(selectedArea.freeDeliveryThresholdKobo)}`}
                </dd>
              </div>
            </dl>
          ) : (
            <p role="status">Select an area to see current delivery details.</p>
          )}
        </div>
      </div>
    </section>
  )
}
