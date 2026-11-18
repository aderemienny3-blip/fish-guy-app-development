'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, X } from 'lucide-react'

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <>
      <button className="cart-trigger" type="button" aria-label="Open cart, 0 items" aria-haspopup="dialog" aria-expanded={isOpen} onClick={() => setIsOpen(true)}>
        <ShoppingBag aria-hidden="true" />
        <span className="cart-count" aria-hidden="true">0</span>
      </button>
      <dialog
        ref={dialogRef}
        className="cart-dialog"
        aria-labelledby="cart-title"
        onClose={() => setIsOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) setIsOpen(false) }}
      >
        <section className="cart-drawer">
          <header className="cart-drawer-header">
            <div><p className="eyebrow">FISH GUY</p><h2 id="cart-title">Your cart <span>(0)</span></h2></div>
            <button className="drawer-close" type="button" aria-label="Close cart" onClick={() => setIsOpen(false)}><X aria-hidden="true" /></button>
          </header>
          <div className="cart-empty" role="status">
            <ShoppingBag aria-hidden="true" />
            <h3>Your cart is empty</h3>
            <p>Products will be ready to add here when the food catalog is connected.</p>
            <Link href="/shop" className="button button-outline" onClick={() => setIsOpen(false)}>Browse the shop</Link>
          </div>
          <div className="cart-drawer-footer">
            <p>Checkout is unavailable until products and delivery options are connected.</p>
            <button className="button button-gold" type="button" disabled>Continue to checkout</button>
          </div>
        </section>
      </dialog>
    </>
  )
}
