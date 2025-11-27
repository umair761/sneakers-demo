// script.js
// Front-end cart using localStorage. Shared across pages.
// Products present in products.html are read via data attributes.

(function(){
  // Utilities
  function qs(sel){return document.querySelector(sel)}
  function qsa(sel){return Array.from(document.querySelectorAll(sel))}
  function formatPrice(n){return '$' + Number(n).toFixed(2)}

  // Cart structure: { id: {id, name, price, qty, img} }
  const STORAGE_KEY = 'sneakerhub_cart_v1'

  function getCart(){
    try{
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch(e){
      return {}
    }
  }
  function saveCart(cart){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    updateCartCountUI()
  }

  function addToCart(item){
    const cart = getCart()
    if(cart[item.id]){
      cart[item.id].qty += 1
    } else {
      cart[item.id] = item
      cart[item.id].qty = 1
    }
    saveCart(cart)
    flashMessage('Added to cart')
  }

  function removeFromCart(id){
    const cart = getCart()
    if(cart[id]){ delete cart[id]; saveCart(cart) }
  }

  function setQty(id, qty){
    const cart = getCart()
    if(cart[id]){
      cart[id].qty = Math.max(0, Math.floor(qty))
      if(cart[id].qty <= 0) delete cart[id]
      saveCart(cart)
    }
  }

  function clearCart(){
    localStorage.removeItem(STORAGE_KEY)
    updateCartCountUI()
  }

  function cartItemsArray(){
    const cart = getCart()
    return Object.values(cart)
  }

  function cartTotal(){
    return cartItemsArray().reduce((s,i)=> s + (i.price * i.qty), 0)
  }

  // Flash small message (temporary)
  function flashMessage(msg, time=1000){
    const el = document.createElement('div')
    el.textContent = msg
    el.style.position='fixed'
    el.style.right='20px'
    el.style.bottom='20px'
    el.style.background='#111'
    el.style.color='#fff'
    el.style.padding='10px 14px'
    el.style.borderRadius='8px'
    el.style.zIndex=9999
    document.body.appendChild(el)
    setTimeout(()=> el.remove(), time)
  }

  // Update header cart count elements
  function updateCartCountUI(){
    const count = cartItemsArray().reduce((s,i)=> s + i.qty,0)
    const els = qsa('#cart-count, #cart-count-2, #cart-count-3, #cart-count-4, #cart-count-5, #cart-count-6')
    els.forEach(e => e.textContent = count)
  }

  // Hook: Add-to-cart buttons on products page
  function initProductButtons(){
    qsa('.add-to-cart').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const card = btn.closest('.card')
        const id = card.dataset.id
        const name = card.dataset.name
        const price = Number(card.dataset.price)
        const imgEl = card.querySelector('img')
        const img = imgEl ? imgEl.src : ''
        addToCart({id,name,price,img})
      })
    })
  }

  // Build cart page rows
  function renderCartPage(){
    const cartContainer = qs('#cart-container')
    const summary = qs('#cart-summary')
    const emptyMsg = qs('#empty-cart')
    if(!cartContainer) return

    const items = cartItemsArray()
    cartContainer.innerHTML = ''
    if(items.length === 0){
      emptyMsg.style.display = 'block'
      summary.style.display = 'none'
      return
    }

    emptyMsg.style.display = 'none'
    summary.style.display = 'block'

    items.forEach(item=>{
      const row = document.createElement('div')
      row.className = 'cart-row'
      row.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div class="meta">
          <h4>${item.name}</h4>
          <p class="price">${formatPrice(item.price)}</p>
        </div>
        <div class="qty-controls">
          <button class="btn small dec" data-id="${item.id}">-</button>
          <input type="number" min="1" value="${item.qty}" data-id="${item.id}">
          <button class="btn small inc" data-id="${item.id}">+</button>
          <button class="btn alt remove" data-id="${item.id}">Remove</button>
        </div>
      `
      cartContainer.appendChild(row)
    })

    // subtotal / shipping / total
    qs('#cart-subtotal').textContent = formatPrice(cartTotal())
    const shipping = cartTotal() > 0 ? 5.00 : 0.00
    qs('#cart-shipping').textContent = formatPrice(shipping)
    qs('#cart-total').textContent = formatPrice(cartTotal() + shipping)

    // attach events for inc/dec/remove/inputs
    qsa('.inc').forEach(btn=>btn.addEventListener('click', ()=>{
      const id = btn.dataset.id
      const cart = getCart()
      if(cart[id]){ cart[id].qty += 1; saveCart(cart); renderCartPage() }
    }))
    qsa('.dec').forEach(btn=>btn.addEventListener('click', ()=>{
      const id = btn.dataset.id
      const cart = getCart()
      if(cart[id]){
        cart[id].qty = cart[id].qty - 1
        if(cart[id].qty <= 0) delete cart[id]
        saveCart(cart)
        renderCartPage()
      }
    }))
    qsa('input[type="number"]').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const id = inp.dataset.id
        const val = parseInt(inp.value || 1, 10)
        setQty(id, isNaN(val) ? 1 : val)
        renderCartPage()
      })
    })
    qsa('.remove').forEach(btn=>btn.addEventListener('click', ()=>{
      removeFromCart(btn.dataset.id)
      renderCartPage()
    }))

    // clear cart button
    const clearBtn = qs('#clear-cart')
    if(clearBtn){ clearBtn.onclick = ()=>{ if(confirm('Clear cart?')){ clearCart(); renderCartPage() } } }
  }

  // Checkout form handling
  function initCheckoutForm(){
    const form = qs('#checkout-form')
    if(!form) return
    form.addEventListener('submit', function(e){
      e.preventDefault()
      // For demo, we'll just clear cart and redirect to thankyou
      clearCart()
      window.location.href = 'thankyou.html'
    })
  }

  // Contact form uses native action to thankyou.html (no JS required),
  // but for convenience we could intercept -> not necessary.

  // Update cart summary on pages
  function initCartSummaryOnPages(){
    // If on products page, attach product button handlers
    initProductButtons()
    // If on cart page, render cart
    renderCartPage()
    // Checkout form init
    initCheckoutForm()
    // Always update cart count UI
    updateCartCountUI()
  }

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    initCartSummaryOnPages()
    // If product grid is dynamically generated in other flows, re-run initProductButtons
  })

  // expose for debug (optional)
  window.__SneakerHub = { getCart, addToCart, removeFromCart, setQty, clearCart }
})();
