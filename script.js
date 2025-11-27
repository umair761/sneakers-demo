// script.js
// SneakerForge front-end: 15 products, cart (localStorage), wishlist, search, filters, product details.

(function(){
  const STORAGE_CART = 'sneakerforge_cart_v2'
  const STORAGE_WL = 'sneakerforge_wishlist_v2'

  // 15 demo products
  const PRODUCTS = [
    { id:'p1', name:'Air Runner', brand:'Nike', price:120, img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80', desc:'Lightweight running sneaker with breathable mesh.', sizes:[6,7,8,9,10,11]},
    { id:'p2', name:'Street Jordan', brand:'Nike', price:150, img:'https://images.unsplash.com/photo-1528701800489-476f6b38b1f8?w=1200&q=80', desc:'High-top with iconic street style.', sizes:[7,8,9,10,11]},
    { id:'p3', name:'Ultra Boost', brand:'Adidas', price:140, img:'https://images.unsplash.com/photo-1600180758896-8d9b0f23e5d5?w=1200&q=80', desc:'Cushioned sneaker for daily comfort.', sizes:[6,7,8,9,10]},
    { id:'p4', name:'TrailBlaze', brand:'Puma', price:130, img:'https://images.unsplash.com/photo-1595950657440-0f7d0b09d4f9?w=1200&q=80', desc:'Rugged sole for outdoor trails.', sizes:[7,8,9,10,11,12]},
    { id:'p5', name:'Court Classic', brand:'Reebok', price:110, img:'https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?w=1200&q=80', desc:'Vintage court sneaker.', sizes:[6,7,8,9,10]},
    { id:'p6', name:'Neo Slip-On', brand:'Puma', price:95, img:'https://images.unsplash.com/photo-1542300050-2f6e2f31f1fa?w=1200&q=80', desc:'Easy slip-on with minimalist look.', sizes:[6,7,8,9]},
    { id:'p7', name:'Lunar Glide', brand:'Nike', price:125, img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80', desc:'Smooth ride with great bounce.', sizes:[7,8,9,10]},
    { id:'p8', name:'Boost Runner', brand:'Adidas', price:155, img:'https://images.unsplash.com/photo-1505740366235-c1fddef9a2d6?w=1200&q=80', desc:'Top-tier cushioning for long runs.', sizes:[8,9,10,11]},
    { id:'p9', name:'City Hiker', brand:'Reebok', price:135, img:'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1200&q=80', desc:'Urban hiking sneaker with grip.', sizes:[7,8,9,10,11]},
    { id:'p10', name:'Flex Kicks', brand:'Puma', price:99, img:'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80', desc:'Flexible sole and breathable upper.', sizes:[6,7,8,9,10]},
    { id:'p11', name:'Vapor Flight', brand:'Nike', price:165, img:'https://images.unsplash.com/photo-1519741496414-7d9b5a3f8e04?w=1200&q=80', desc:'Performance sneaker built for speed.', sizes:[8,9,10,11,12]},
    { id:'p12', name:'Cloud Runner', brand:'Adidas', price:145, img:'https://images.unsplash.com/photo-1546484959-f8cbfcc8f4c4?w=1200&q=80', desc:'Lightweight cushioning with breathable knit.', sizes:[7,8,9,10]},
    { id:'p13', name:'Peak Trek', brand:'Reebok', price:138, img:'https://images.unsplash.com/photo-1528701800489-476f6b38b1f8?w=1200&q=80', desc:'Durable sneaker for outdoor treks.', sizes:[8,9,10,11]},
    { id:'p14', name:'Street Elite', brand:'Nike', price:158, img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80', desc:'Streetwear inspired silhouette.', sizes:[7,8,9,10,11]},
    { id:'p15', name:'Everyday Low', brand:'Puma', price:89, img:'https://images.unsplash.com/photo-1542300050-2f6e2f31f1fa?w=1200&q=80', desc:'Affordable everyday sneaker.', sizes:[6,7,8,9,10]}
  ]

  // ----- storage helpers -----
  function getCart(){ try{ return JSON.parse(localStorage.getItem(STORAGE_CART) || '{}') } catch(e){ return {} } }
  function saveCart(cart){ localStorage.setItem(STORAGE_CART, JSON.stringify(cart)); updateCartCountUI() }
  function getWishlist(){ try{ return JSON.parse(localStorage.getItem(STORAGE_WL) || '[]') } catch(e){ return [] } }
  function saveWishlist(wl){ localStorage.setItem(STORAGE_WL, JSON.stringify(wl)); renderWishlistHearts() }

  // ----- cart operations -----
  function addToCart(product, selectedSize){
    const cart = getCart()
    const key = product.id + (selectedSize ? ('_s'+selectedSize) : '')
    if(cart[key]){ cart[key].qty += 1 }
    else { cart[key] = { id: product.id, key, name: product.name, price: product.price, img: product.img, size: selectedSize || null, qty:1 } }
    saveCart(cart)
    flash('Added to cart')
  }
  function removeFromCart(key){ const cart=getCart(); delete cart[key]; saveCart(cart) }
  function setQty(key, qty){ const cart=getCart(); if(cart[key]){ cart[key].qty = Math.max(0, +qty); if(cart[key].qty<=0) delete cart[key]; saveCart(cart) } }
  function clearCart(){ localStorage.removeItem(STORAGE_CART); updateCartCountUI() }
  function cartItemsArray(){ return Object.values(getCart()) }
  function cartTotal(){ return cartItemsArray().reduce((s,i)=> s + (i.price * i.qty), 0) }

  // wishlist
  function toggleWishlist(id){
    const wl = getWishlist()
    const idx = wl.indexOf(id)
    if(idx === -1){ wl.push(id) } else { wl.splice(idx,1) }
    saveWishlist(wl)
    flash(isInWishlist(id) ? 'Saved to wishlist' : 'Removed from wishlist')
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

  // card builder (used on home & products)
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
    // wishlist heart click
    art.querySelector('.heart').addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id
      toggleWishlist(id)
      e.currentTarget.classList.toggle('active')
    })
    // add to cart
    art.querySelector('.add-to-cart').addEventListener('click', ()=>{
      addToCart(p)
    })
    // view -> product-details page
    art.querySelector('.view').addEventListener('click', ()=>{
      location.href = 'product-details.html?id='+p.id
    })
    return art
  }

  // render products grid
  function renderProductsGrid(list){
    const grid = qs('#products-grid')
    if(!grid) return
    grid.innerHTML = ''
    list.forEach(p => grid.appendChild(createCard(p)))
  }

  // render featured on home (first 4)
  function renderFeatured(){
    const node = qs('#home-featured')
    if(!node) return
    node.innerHTML = ''
    PRODUCTS.slice(0,4).forEach(p => node.appendChild(createCard(p)))
  }

  // controls: search/filter/sort
  function initControls(){
    const search = qs('#search')
    const filter = qs('#filter-brand')
    const sort = qs('#sort-price')

    function apply(){
      let list = PRODUCTS.slice()
      const q = search ? search.value.trim().toLowerCase() : ''
      if(q){ list = list.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)) }
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
    apply()
  }

  // update cart count UI across pages
  function updateCartCountUI(){
    const count = cartItemsArray().reduce((s,i)=> s + i.qty,0)
    qsa('#cart-count, #cart-count-2, #cart-count-3, #cart-count-4, #cart-count-5, #cart-count-6, #cart-count-pd').forEach(el=>{
      if(el) el.textContent = count
    })
  }

  // CART PAGE RENDER
  function renderCartPage(){
    const container = qs('#cart-container')
    const summary = qs('#cart-summary')
    const empty = qs('#empty-cart')
    if(!container) return
    const items = cartItemsArray()
    container.innerHTML = ''
    if(items.length === 0){
      if(empty) empty.style.display = 'block'
      if(summary) summary.style.display = 'none'
      return
    }
    if(empty) empty.style.display = 'none'
    if(summary) summary.style.display = 'block'

    items.forEach(it=>{
      const row = document.createElement('div'); row.className='cart-row'
      row.innerHTML = `
        <img src="${it.img}" alt="${it.name}">
        <div class="meta">
          <h4>${it.name}${it.size?(' — Size '+it.size):''}</h4>
          <p class="price">${format(it.price)}</p>
        </div>
        <div class="qty-controls">
          <button class="btn small dec" data-key="${it.key}">-</button>
          <input type="number" min="1" value="${it.qty}" data-key="${it.key}" />
          <button class="btn small inc" data-key="${it.key}">+</button>
          <button class="btn alt remove" data-key="${it.key}">Remove</button>
        </div>
      `
      container.appendChild(row)
    })

    if(qs('#cart-subtotal')) qs('#cart-subtotal').textContent = format(cartTotal())
    const shipping = cartTotal() > 0 ? 5.00 : 0
    if(qs('#cart-shipping')) qs('#cart-shipping').textContent = format(shipping)
    if(qs('#cart-total')) qs('#cart-total').textContent = format(cartTotal()+shipping)

    qsa('.inc').forEach(b => b.addEventListener('click', e=>{
      const key = e.currentTarget.dataset.key; const cart = getCart(); if(cart[key]){ cart[key].qty++; saveCart(cart); renderCartPage() }
    }))
    qsa('.dec').forEach(b => b.addEventListener('click', e=>{
      const key = e.currentTarget.dataset.key; const cart = getCart(); if(cart[key]){ cart[key].qty--; if(cart[key].qty<=0) delete cart[key]; saveCart(cart); renderCartPage() }
    }))
    qsa('.remove').forEach(b => b.addEventListener('click', e=>{
      const key = e.currentTarget.dataset.key; removeFromCart(key); renderCartPage()
    }))
    qsa('input[type="number"]').forEach(inp => inp.addEventListener('change', e=>{
      const key = e.target.dataset.key; const val = parseInt(e.target.value||1,10)
      setQty(key, isNaN(val)?1:val); renderCartPage()
    }))

    const clearBtn = qs('#clear-cart')
    if(clearBtn) clearBtn.onclick = ()=>{ if(confirm('Clear cart?')){ clearCart(); renderCartPage() } }
  }

  // PRODUCT DETAILS RENDER (product-details.html)
  function renderProductDetails(){
    const container = qs('#product-details')
    if(!container) return
    const params = new URLSearchParams(location.search)
    const id = params.get('id')
    if(!id){ container.innerHTML = '<p>Invalid product. <a href="products.html">Back to products</a></p>'; return }
    const p = PRODUCTS.find(x => x.id === id)
    if(!p){ container.innerHTML = '<p>Product not found. <a href="products.html">Back to products</a></p>'; return }

    container.innerHTML = `
      <div class="product-details">
        <div class="product-media">
          <img src="${p.img}" alt="${p.name}">
        </div>
        <div class="product-info">
          <h2>${p.name}</h2>
          <p class="price">${format(p.price)}</p>
          <p class="desc">${p.desc}</p>

          <div>
            <h4>Select size</h4>
            <div class="size-select" id="size-select"></div>
          </div>

          <div style="margin-top:12px;">
            <button id="pd-add-to-cart" class="btn">Add to Cart</button>
            <button id="pd-buy-now" class="btn alt">Buy Now</button>
            <button id="pd-wishlist" class="btn small" style="margin-left:10px;">${isInWishlist(p.id)?'♥ Saved':'♡ Save'}</button>
          </div>
        </div>
      </div>
    `

    const sizeContainer = qs('#size-select')
    p.sizes.forEach(s => {
      const b = document.createElement('button'); b.textContent = s; b.dataset.size = s
      b.addEventListener('click', ()=> {
        qsa('#size-select button').forEach(x=>x.classList.remove('active'))
        b.classList.add('active')
      })
      sizeContainer.appendChild(b)
    })

    qs('#pd-add-to-cart').addEventListener('click', ()=>{
      const sel = qs('#size-select button.active')
      const selectedSize = sel ? sel.dataset.size : null
      addToCart(p, selectedSize)
    })

    qs('#pd-buy-now').addEventListener('click', ()=>{
      const sel = qs('#size-select button.active')
      const selectedSize = sel ? sel.dataset.size : null
      addToCart(p, selectedSize)
      location.href = 'checkout.html'
    })

    qs('#pd-wishlist').addEventListener('click', ()=>{
      toggleWishlist(p.id)
      qs('#pd-wishlist').textContent = isInWishlist(p.id) ? '♥ Saved' : '♡ Save'
      renderWishlistHearts()
    })
  }

  // checkout
  function initCheckout(){
    const form = qs('#checkout-form')
    if(!form) return
    form.addEventListener('submit', e=>{
      e.preventDefault()
      // demo: clear cart then redirect
      clearCart()
      location.href = 'thankyou.html'
    })
  }

  // render wishlist hearts everywhere
  function renderWishlistHearts(){
    qsa('.heart').forEach(h=>{
      const id = h.dataset.id
      if(isInWishlist(id)) h.classList.add('active'); else h.classList.remove('active')
    })
  }

  // small helpers
  function getCart(){ try{ return JSON.parse(localStorage.getItem(STORAGE_CART) || '{}') } catch(e){ return {} } }
  function saveCart(cart){ localStorage.setItem(STORAGE_CART, JSON.stringify(cart)); updateCartCountUI() }
  function addToCartById(id){ const p = PRODUCTS.find(x=>x.id===id); if(p) addToCart(p) }

  // DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    // home
    renderFeatured()

    // products page
    if(document.querySelector('#products-grid')){
      renderProductsGrid(PRODUCTS)
      initControls()
    }

    // product details page
    renderProductDetails()

    // cart page
    renderCartPage()

    // checkout
    initCheckout()

    // UI updates
    updateCartCountUI()
    renderWishlistHearts()

    // global delegation for any add-to-cart button in DOM
    document.body.addEventListener('click', (e)=>{
      if(e.target.matches('.add-to-cart')){
        const id = e.target.dataset.id || e.target.closest('.card')?.dataset?.id
        if(id) addToCartById(id)
      }
    })
  })

  // expose for debug (optional)
  window.SneakerForge = { PRODUCTS, getCart:()=>getCart(), getWishlist }
})();
