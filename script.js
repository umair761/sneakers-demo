// script.js
// SneakerForge front-end cart, wishlist, search, filters.
// Single source product list -> used by index & products pages.

(function(){
  const STORAGE_CART = 'sneakerforge_cart_v1'
  const STORAGE_WL = 'sneakerforge_wishlist_v1'

  // Product data (10 sneakers) - use Unsplash images for demo
  const PRODUCTS = [
    { id: 'p1', name:'Air Runner', brand:'Nike', price:120, img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80', desc:'Lightweight running sneaker with breathable mesh.'},
    { id: 'p2', name:'Street Jordan', brand:'Nike', price:150, img:'https://images.unsplash.com/photo-1528701800489-476f6b38b1f8?w=1200&q=80', desc:'High-top with iconic street style.'},
    { id: 'p3', name:'Ultra Boost', brand:'Adidas', price:140, img:'https://images.unsplash.com/photo-1600180758896-8d9b0f23e5d5?w=1200&q=80', desc:'Cushioned sneaker for daily comfort.'},
    { id: 'p4', name:'TrailBlaze', brand:'Puma', price:130, img:'https://images.unsplash.com/photo-1595950657440-0f7d0b09d4f9?w=1200&q=80', desc:'Rugged sole for outdoor trails.'},
    { id: 'p5', name:'Court Classic', brand:'Reebok', price:110, img:'https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?w=1200&q=80', desc:'Vintage court sneaker.'},
    { id: 'p6', name:'Neo Slip-On', brand:'Puma', price:95, img:'https://images.unsplash.com/photo-1542300050-2f6e2f31f1fa?w=1200&q=80', desc:'Easy slip-on with minimalist look.'},
    { id: 'p7', name:'Lunar Glide', brand:'Nike', price:125, img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80', desc:'Smooth ride with great bounce.'},
    { id: 'p8', name:'Boost Runner', brand:'Adidas', price:155, img:'https://images.unsplash.com/photo-1505740366235-c1fddef9a2d6?w=1200&q=80', desc:'Top-tier cushioning for long runs.'},
    { id: 'p9', name:'City Hiker', brand:'Reebok', price:135, img:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1200&q=80', desc:'Urban hiking sneaker with grip.'},
    { id: 'p10', name:'Flex Kicks', brand:'Puma', price:99, img:'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80', desc:'Flexible sole and breathable upper.'}
  ]

  // ----- storage helpers -----
  function getCart(){ try{ return JSON.parse(localStorage.getItem(STORAGE_CART) || '{}') } catch(e){ return {} } }
  function saveCart(cart){ localStorage.setItem(STORAGE_CART, JSON.stringify(cart)); updateCartCountUI() }
  function getWishlist(){ try{ return JSON.parse(localStorage.getItem(STORAGE_WL) || '[]') } catch(e){ return [] } }
  function saveWishlist(wl){ localStorage.setItem(STORAGE_WL, JSON.stringify(wl)); renderWishlistHearts() }

  function addToCart(product){
    const cart = getCart()
    if(cart[product.id]){ cart[product.id].qty += 1 } else { cart[product.id] = { ...product, qty:1 } }
    saveCart(cart)
    flash('Added to cart')
  }
  function removeFromCart(id){ const cart=getCart(); delete cart[id]; saveCart(cart); }
  function setQty(id, qty){ const cart=getCart(); if(cart[id]){ cart[id].qty = Math.max(0, +qty); if(cart[id].qty<=0) delete cart[id]; saveCart(cart) } }
  function clearCart(){ localStorage.removeItem(STORAGE_CART); updateCartCountUI() }
  function cartItemsArray(){ return Object.values(getCart()) }
  function cartTotal(){ return cartItemsArray().reduce((s,i)=> s + (i.price * i.qty), 0) }

  function toggleWishlist(id){
    const wl = getWishlist()
    const idx = wl.indexOf(id)
    if(idx === -1){ wl.push(id) } else { wl.splice(idx,1) }
    saveWishlist(wl)
  }

  function isInWishlist(id){ return getWishlist().indexOf(id) !== -1 }

  // ----- UI helpers -----
  function qs(sel){ return document.querySelector(sel) }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)) }
  function format(n){ return '$' + Number(n).toFixed(2) }
  function flash(msg, time=900){
    const el = document.createElement('div'); el.className='toast'; el.textContent=msg; document.body.appendChild(el)
    setTimeout(()=> el.classList.add('show'),10)
    setTimeout(()=> el.remove(), time+400)
  }

  // render product card
  function createCard(p){
    const art = document.createElement('article'); art.className = 'card'; art.dataset.id = p.id
    art.innerHTML = `
      <div class="heart ${ isInWishlist(p.id) ? 'active' : '' }" data-id="${p.id}" title="Add to wishlist">
        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 21s-6.716-4.766-9.2-7.227C-0.4 10.948 2.5 6 6 6c2.3 0 3.6 1.6 3.6 1.6S11.7 6 14 6c3.5 0 6.4 4.948 3.2 7.773C18.716 16.234 12 21 12 21z"></path></svg>
      </div>
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p class="desc">${p.desc}</p>
      <p class="price">${format(p.price)}</p>
      <div class="card-actions">
        <button class="btn add-to-cart" data-id="${p.id}">Add to Cart</button>
        <button class="btn alt small view" data-id="${p.id}">View</button>
      </div>
    `
    // heart click
    art.querySelector('.heart').addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id
      toggleWishlist(id)
      e.currentTarget.classList.toggle('active')
      flash(isInWishlist(id) ? 'Saved to wishlist' : 'Removed from wishlist')
    })
    // add to cart
    art.querySelector('.add-to-cart').addEventListener('click', ()=>{
      addToCart(p)
    })
    // view button -> scroll to product on products page if present
    art.querySelector('.view').addEventListener('click', ()=>{
      if(location.pathname.endsWith('products.html')) return
      location.href = 'products.html#' + p.id
    })
    return art
  }

  // render grid on products page
  function renderProductsGrid(list){
    const grid = qs('#products-grid')
    if(!grid) return
    grid.innerHTML = ''
    list.forEach(p => grid.appendChild(createCard(p)))
  }

  // render featured on home (top 4)
  function renderFeatured(){
    const node = qs('#home-featured')
    if(!node) return
    node.innerHTML = ''
    PRODUCTS.slice(0,4).forEach(p => node.appendChild(createCard(p)))
  }

  // search, filter, sort
  function initControls(){
    const search = qs('#search')
    const filter = qs('#filter-brand')
    const sort = qs('#sort-price')

    function apply(){
      let list = PRODUCTS.slice()
      const q = search ? search.value.trim().toLowerCase() : ''
      if(q){ list = list.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) }
      if(filter && filter.value !== 'all'){ list = list.filter(p => p.brand === filter.value) }
      if(sort){
        if(sort.value === 'low') list.sort((a,b)=> a.price - b.price)
        if(sort.value === 'high') list.sort((a,b)=> b.price - a.price)
      }
      renderProductsGrid(list)
    }

    if(search) search.addEventListener('input', apply)
    if(filter) filter.addEventListener('change', apply)
    if(sort) sort.addEventListener('change', apply)

    // initial apply
    apply()
  }

  // update cart count in header
  function updateCartCountUI(){
    const count = cartItemsArray().reduce((s,i)=> s + i.qty,0)
    qsa('#cart-count, #cart-count-2, #cart-count-3, #cart-count-4, #cart-count-5, #cart-count-6').forEach(el => el.textContent = count)
  }

  // render Cart page
  function renderCartPage(){
    const container = qs('#cart-container')
    const summary = qs('#cart-summary')
    const empty = qs('#empty-cart')
    if(!container) return
    const items = cartItemsArray()
    container.innerHTML = ''
    if(items.length === 0){
      empty.style.display = 'block'
      summary.style.display = 'none'
      return
    }
    empty.style.display = 'none'
    summary.style.display = 'block'

    items.forEach(it=>{
      const row = document.createElement('div'); row.className='cart-row'
      row.innerHTML = `
        <img src="${it.img}" alt="${it.name}">
        <div class="meta">
          <h4>${it.name}</h4>
          <p class="price">${format(it.price)}</p>
        </div>
        <div class="qty-controls">
          <button class="btn small dec" data-id="${it.id}">-</button>
          <input type="number" min="1" value="${it.qty}" data-id="${it.id}" />
          <button class="btn small inc" data-id="${it.id}">+</button>
          <button class="btn alt remove" data-id="${it.id}">Remove</button>
        </div>
      `
      container.appendChild(row)
    })

    qs('#cart-subtotal').textContent = format(cartTotal())
    const shipping = cartTotal() > 0 ? 5.00 : 0
    qs('#cart-shipping').textContent = format(shipping)
    qs('#cart-total').textContent = format(cartTotal()+shipping)

    qsa('.inc').forEach(b => b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id; const cart = getCart(); if(cart[id]){ cart[id].qty++; saveCart(cart); renderCartPage() }
    }))
    qsa('.dec').forEach(b => b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id; const cart = getCart(); if(cart[id]){ cart[id].qty--; if(cart[id].qty<=0) delete cart[id]; saveCart(cart); renderCartPage() }
    }))
    qsa('.remove').forEach(b => b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id; removeFromCart(id); renderCartPage()
    }))
    qsa('input[type="number"]').forEach(inp => inp.addEventListener('change', e=>{
      const id = e.target.dataset.id; const val = parseInt(e.target.value||1,10)
      setQty(id, isNaN(val)?1:val); renderCartPage()
    }))

    const clearBtn = qs('#clear-cart')
    if(clearBtn) clearBtn.onclick = ()=>{ if(confirm('Clear cart?')){ clearCart(); renderCartPage() } }
  }

  // checkout form
  function initCheckout(){
    const form = qs('#checkout-form')
    if(!form) return
    form.addEventListener('submit', e=>{
      e.preventDefault()
      // demo: clear cart and go to thank you
      clearCart()
      location.href = 'thankyou.html'
    })
  }

  // helper: getCart/saveCart re-used here
  function getCart(){ try{ return JSON.parse(localStorage.getItem(STORAGE_CART) || '{}') } catch(e){ return {} } }
  function saveCart(cart){ localStorage.setItem(STORAGE_CART, JSON.stringify(cart)); updateCartCountUI() }
  function addToCartById(id){ const p = PRODUCTS.find(x=>x.id===id); if(p) addToCart(p) }

  // render wishlist hearts across pages
  function renderWishlistHearts(){
    qsa('.heart').forEach(h=>{
      const id = h.dataset.id
      if(isInWishlist(id)) h.classList.add('active'); else h.classList.remove('active')
    })
  }

  // On DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    // Populate product lists on pages
    // Home featured
    renderFeatured()

    // If products page present -> render products and init controls
    if(document.querySelector('#products-grid')){
      renderProductsGrid(PRODUCTS)
      initControls()
    }

    // Add-to-cart buttons on dynamic content (home & others): delegate by re-rendering hearts & updating cart
    // We used direct listeners in createCard

    // Cart page
    renderCartPage()

    // Checkout
    initCheckout()

    // Initial UI updates
    updateCartCountUI()
    renderWishlistHearts()

    // If any add-to-cart buttons exist in static HTML, attach handlers (defensive)
    document.body.addEventListener('click', (e)=>{
      if(e.target.matches('.add-to-cart')){
        const id = e.target.dataset.id || e.target.closest('.card')?.dataset?.id
        if(id){ addToCartById(id) }
      }
      // wishlist hearts handled by createCard
    })
  })

  // Expose small debug
  window.SneakerForge = { PRODUCTS, getCart:()=>JSON.parse(localStorage.getItem(STORAGE_CART)||'{}'), getWishlist }
})();
