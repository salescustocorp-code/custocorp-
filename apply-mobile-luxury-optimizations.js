const fs = require('fs');

console.log('Applying mobile luxury optimizations...');

// ========================================================
// 1. UPDATE js/app.js
// ========================================================
let appJs = fs.readFileSync('c:/Users/abdul/Downloads/New web/js/app.js', 'utf8');

// Set default category to 'gift-sets' instead of 'all'
appJs = appJs.replace("this.activeCategory = 'all';", "this.activeCategory = 'gift-sets';");
appJs = appJs.replace("this.activeCategory = 'all';", "this.activeCategory = 'gift-sets';");

// Update renderFilterButtons to only render the 9 official categories
const newRenderFilterButtons = `  renderFilterButtons() {
    const container = document.getElementById('category-filter-buttons');
    if (!container || !CUSTOCORP_DATA) return;

    // Count products per category
    const counts = {};
    CUSTOCORP_DATA.products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    const displayCats = CUSTOCORP_DATA.categories.filter(c => c.id !== 'all');

    container.innerHTML = displayCats.map(cat => {
      const count = counts[cat.id] || 0;
      const isActive = cat.id === this.activeCategory;
      return \`
        <button 
          onclick="window.custoApp.filterByCategory('\${cat.id}')" 
          data-category="\${cat.id}" 
          class="cat-filter-btn px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all whitespace-nowrap text-xs flex items-center gap-1.5 flex-shrink-0 \${
            isActive 
              ? 'font-bold bg-amber-400 text-neutral-900 shadow-sm ring-1 ring-amber-500/50' 
              : 'font-semibold bg-white/80 text-neutral-700 hover:bg-white border border-neutral-200/80 shadow-2xs'
          }"
        >
          <span>\${cat.name}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full \${isActive ? 'bg-neutral-900 text-amber-400 font-extrabold' : 'bg-neutral-200/80 text-neutral-600 font-bold'}">
            \${count}
          </span>
        </button>
      \`;
    }).join('');
  }`;

appJs = appJs.replace(/renderFilterButtons\(\)\s*\{[\s\S]*?container\.innerHTML\s*=[\s\S]*?\}\.join\(''\);\s*\}/, newRenderFilterButtons);

// Update renderCategoryCollection to ensure 2-column mobile layout
const newRenderCategoryCollection = `  renderCategoryCollection() {
    const container = document.getElementById('collection-grid-container');
    if (!container || !CUSTOCORP_DATA) return;

    const displayCategories = CUSTOCORP_DATA.categories.filter(c => c.id !== 'all');

    container.innerHTML = displayCategories.map(cat => {
      return \`
        <div 
          onclick="window.custoApp.filterByCategory('\${cat.id}')"
          class="group relative h-44 sm:h-64 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 border border-white/70 hover:-translate-y-1"
        >
          <img 
            src="\${cat.image}" 
            alt="\${cat.name}" 
            loading="lazy"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-900/35 to-transparent"></div>
          
          <div class="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5">
            <span class="bg-amber-400/95 backdrop-blur-md text-neutral-900 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              \${cat.count}
            </span>
          </div>

          <div class="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
            <h3 class="font-display text-sm sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
              \${cat.name}
            </h3>
            <p class="text-[10px] sm:text-xs text-neutral-300 mt-0.5 line-clamp-1 hidden sm:block">
              \${cat.description}
            </p>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-[10px] sm:text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore &rarr;
              </span>
              \${cat.catalogueFile ? \`
                <a 
                  href="\${cat.catalogueFile}" 
                  download 
                  onclick="event.stopPropagation();" 
                  class="bg-white/20 hover:bg-amber-400 hover:text-neutral-900 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md transition-all flex items-center gap-1 border border-white/30"
                  title="Download PDF"
                >
                  <i data-lucide="download" class="w-3 h-3"></i>
                  <span>PDF</span>
                </a>
              \` : ''}
            </div>
          </div>
        </div>
      \`;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }`;

appJs = appJs.replace(/renderCategoryCollection\(\)\s*\{[\s\S]*?if\s*\(window\.lucide\)[\s\S]*?\}\s*\}/, newRenderCategoryCollection);

// Update renderProducts to filter by activeCategory (no 'all')
const newRenderProducts = `  renderProducts() {
    const container = document.getElementById('products-grid-container');
    const statusBanner = document.getElementById('shop-category-banner');
    if (!container || !CUSTOCORP_DATA) return;

    let filtered = CUSTOCORP_DATA.products.filter(p => p.category === this.activeCategory);

    // If searching, search across all products
    if (this.searchQuery) {
      filtered = CUSTOCORP_DATA.products.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.categoryName.toLowerCase().includes(this.searchQuery) ||
        p.description.toLowerCase().includes(this.searchQuery) ||
        p.code.toLowerCase().includes(this.searchQuery)
      );
    }

    // Dynamic Category Status Banner
    if (statusBanner) {
      const activeCat = CUSTOCORP_DATA.categories.find(c => c.id === this.activeCategory) || CUSTOCORP_DATA.categories[0];
      if (this.searchQuery) {
        statusBanner.innerHTML = \`
          <div class="flex items-center justify-between p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs">
            <span class="font-bold text-neutral-800">Search matches for "\${this.searchQuery}": \${filtered.length} products found</span>
            <button onclick="window.custoApp.resetFilters()" class="text-amber-800 font-bold underline">Clear</button>
          </div>
        \`;
      } else if (activeCat) {
        statusBanner.innerHTML = \`
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-neutral-900 text-white shadow-sm text-xs">
            <div class="flex items-center gap-2.5">
              <span class="bg-amber-400 text-neutral-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-xs">Collection</span>
              <div>
                <h4 class="font-display font-bold text-xs sm:text-sm text-white">\${activeCat.name} (\${filtered.length} Products Available)</h4>
                <p class="text-[10px] sm:text-[11px] text-neutral-400">\${activeCat.description || 'Official CUSTOCORP Catalogue'}</p>
              </div>
            </div>
            \${activeCat.catalogueFile ? \`
              <a 
                href="\${activeCat.catalogueFile}" 
                download 
                class="btn-gold text-[10px] sm:text-[11px] font-bold py-1.5 px-3 flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
              >
                <i data-lucide="download" class="w-3 h-3"></i>
                <span>Download PDF Catalogue</span>
              </a>
            \` : ''}
          </div>
        \`;
      }
    }

    if (filtered.length === 0) {
      container.innerHTML = \`
        <div class="col-span-full py-12 text-center">
          <h4 class="font-display text-base font-bold text-neutral-800">No Corporate Gifts Found</h4>
          <p class="text-xs text-neutral-500 mt-1 max-w-md mx-auto">Try selecting another collection or chat with our Corporate Sales Desk on WhatsApp.</p>
          <button onclick="window.custoApp.resetFilters()" class="btn-gold mt-4 text-xs py-2 px-4 font-bold">Back to Collections</button>
        </div>
      \`;
      return;
    }

    container.innerHTML = filtered.map(prod => {
      const cleanName = prod.name.replace(/'/g, "\\\\'");
      return \`
        <div class="glass-card mobile-product-card overflow-hidden flex flex-col justify-between h-full group border border-neutral-200/70 hover:border-amber-400/60 shadow-xs hover:shadow-lg transition-all duration-300 bg-white/95 rounded-2xl">
          <div class="relative h-40 sm:h-52 overflow-hidden bg-neutral-50/70 flex items-center justify-center p-2 card-img-container">
            <img 
              src="\${prod.image}" 
              alt="\${prod.name}" 
              loading="lazy"
              class="w-full h-full object-contain sm:object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            <div class="absolute top-2 left-2 flex flex-wrap gap-1">
              <span class="badge-moq text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">MOQ: \${prod.moq}</span>
              <span class="bg-white/95 backdrop-blur-md text-neutral-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs border border-neutral-200/50">
                \${prod.code}
              </span>
            </div>
            <div class="absolute bottom-2 right-2">
              <span class="bg-neutral-900/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                ★ \${prod.rating}
              </span>
            </div>
          </div>

          <div class="p-3 sm:p-4 flex-1 flex flex-col justify-between card-body">
            <div>
              <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-700 block truncate mb-0.5">\${prod.categoryName}</span>
              <h4 class="font-display font-bold text-neutral-900 text-xs sm:text-sm line-clamp-1 group-hover:text-amber-600 transition-colors" title="\${prod.name}">
                \${prod.name}
              </h4>
              <p class="text-[10px] sm:text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                \${prod.description}
              </p>

              <div class="mt-2 flex flex-wrap gap-1">
                \${prod.specs.slice(0, 2).map(spec => \`
                  <span class="text-[9px] font-semibold bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                    \${spec}
                  </span>
                \`).join('')}
              </div>
            </div>

            <div class="pt-2.5 mt-2.5 border-t border-neutral-100">
              <div class="flex items-center justify-between text-[10px] text-neutral-500 mb-2">
                <span class="font-semibold text-neutral-700">Quote on Request</span>
                <span class="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  MOQ: \${prod.moq}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-1.5">
                <button 
                  onclick="window.custoApp.openQuoteModal({ productName: '\${cleanName}', code: '\${prod.code}', moq: \${prod.moq} })"
                  class="btn-glass text-[11px] py-1.5 px-2 justify-center text-center font-bold"
                >
                  RFQ
                </button>
                <button 
                  onclick="window.custoApp.directWhatsAppProductInquiry('\${cleanName}', '\${prod.code}', \${prod.moq})"
                  class="btn-gold text-[11px] py-1.5 px-2 justify-center text-center font-bold flex items-center justify-center gap-1 shadow-xs"
                >
                  <i data-lucide="message-circle" class="w-3.5 h-3.5 text-neutral-900"></i>
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      \`;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }`;

appJs = appJs.replace(/renderProducts\(\)\s*\{[\s\S]*?if\s*\(window\.lucide\)[\s\S]*?\}\s*\}/, newRenderProducts);

// Update resetFilters to reset to 'gift-sets'
appJs = appJs.replace("this.activeCategory = 'all';", "this.activeCategory = 'gift-sets';");

fs.writeFileSync('c:/Users/abdul/Downloads/New web/js/app.js', appJs, 'utf8');
console.log('Successfully updated js/app.js!');


// ========================================================
// 2. UPDATE index.html
// ========================================================
let indexHtml = fs.readFileSync('c:/Users/abdul/Downloads/New web/index.html', 'utf8');

// Update header to be sleek edge-to-edge on mobile
const oldHeader = /<header class="fixed top-4 left-0 right-0 z-40 px-4 max-w-7xl mx-auto">[\s\S]*?<\/header>/;
const newHeader = `<header class="fixed top-0 sm:top-4 left-0 right-0 z-40 sm:px-4 max-w-7xl mx-auto">
    <nav class="glass-pill px-3 py-2 sm:px-4 sm:py-2 rounded-none sm:rounded-full flex items-center justify-between gap-2 sm:gap-3 shadow-md sm:shadow-xl border-b sm:border border-neutral-200/60 sm:border-white/60 bg-white/92 sm:bg-white/70 backdrop-blur-xl">
      
      <!-- Left: Menu Drawer Toggle + Exact Logo Image -->
      <div class="flex items-center gap-2 sm:gap-3">
        <button id="drawer-toggle-btn" class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all border border-neutral-200/60 shadow-2xs" title="Open Menu">
          <i data-lucide="menu" class="w-4 h-4"></i>
          <span class="hidden sm:inline">Menu</span>
        </button>

        <!-- Official CUSTOCORP Logo Image Placement -->
        <a href="#home" class="flex items-center gap-2 group">
          <div class="h-9 sm:h-10 px-2 py-0.5 rounded-xl bg-white border border-neutral-200/60 shadow-2xs flex items-center justify-center">
            <img 
              src="assets/logo.jpg" 
              alt="CUSTOCORP" 
              class="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </div>
          <div class="hidden xl:flex flex-col">
            <span class="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Corporate Gifting Partner</span>
          </div>
        </a>
      </div>

      <!-- Center: Navigation Links (Desktop) -->
      <div class="hidden lg:flex items-center gap-1 text-xs font-semibold text-neutral-700">
        <a href="#home" class="px-3.5 py-1.5 rounded-full hover:bg-white/80 transition-all">Home</a>
        <a href="#shop-section" class="px-3.5 py-1.5 rounded-full hover:bg-white/80 transition-all">Shop</a>
        <a href="#hamper-studio-section" class="px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-900 hover:bg-amber-400/30 font-bold transition-all flex items-center gap-1.5 shadow-xs">
          <span>Select Your Goodies</span>
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        </a>
        <a href="#how-it-works" class="px-3.5 py-1.5 rounded-full hover:bg-white/80 transition-all">How it works</a>
        <a href="#collections-section" class="px-3.5 py-1.5 rounded-full hover:bg-white/80 transition-all">Occasions</a>
        <a href="javascript:void(0)" onclick="window.custoApp.openCatalogModal()" class="px-3.5 py-1.5 rounded-full hover:bg-white/80 transition-all">Catalogue</a>
        <a href="#compliance-section" class="px-3.5 py-1.5 rounded-full hover:bg-white/80 transition-all">Contact</a>
      </div>

      <!-- Right: Search Pill & Primary CTA -->
      <div class="flex items-center gap-2">
        <div class="relative hidden sm:block">
          <i data-lucide="search" class="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
          <input 
            type="text" 
            placeholder="Search gifts..." 
            class="site-search-input pl-8 pr-3 py-1.5 text-xs rounded-full bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 border border-neutral-200/60 w-36 md:w-44 transition-all"
          />
        </div>

        <a 
          href="https://wa.me/918136830182?text=Hello%20CUSTOCORP%2C%20I%20would%20like%20to%20request%20a%20corporate%20gifting%20quotation."
          target="_blank"
          class="btn-gold text-xs font-bold py-1.5 px-3 sm:px-4 shadow-xs flex items-center gap-1.5"
        >
          <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
          <span>WhatsApp Quote</span>
        </a>
      </div>

    </nav>
  </header>`;

indexHtml = indexHtml.replace(oldHeader, newHeader);

// Adjust main top padding: pt-16 on mobile, pt-28 on desktop
indexHtml = indexHtml.replace('<main class="pt-24 md:pt-28">', '<main class="pt-16 sm:pt-24 md:pt-28">');

// Update Hero card padding and font sizes on mobile
indexHtml = indexHtml.replace(
  '<div class="glass-card p-6 md:p-12 border border-white/70 shadow-2xl relative overflow-hidden rounded-3xl">',
  '<div class="glass-card p-4 sm:p-8 md:p-12 border border-white/70 shadow-xl relative overflow-hidden rounded-2xl sm:rounded-3xl">'
);

indexHtml = indexHtml.replace(
  '<h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 leading-[1.12] tracking-tight">',
  '<h1 class="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 leading-tight tracking-tight">'
);

// Update Hero buttons to flex-col on mobile, flex-row on desktop
indexHtml = indexHtml.replace(
  '<div class="mt-8 flex flex-wrap items-center gap-3.5">',
  '<div class="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">'
);

// Update Collections grid to 2 columns on mobile
indexHtml = indexHtml.replace(
  '<div id="collection-grid-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">',
  '<div id="collection-grid-container" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">'
);

// Update Category Filter Buttons: ONLY the 9 official categories (NO "All Collections")
const officialCategoryFilterButtons = `
      <!-- Filter Buttons: 9 Official CUSTOCORP Catalogue Collections -->
      <div id="category-filter-buttons" class="flex items-center gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none text-xs -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
        <button onclick="window.custoApp.filterByCategory('gift-sets')" data-category="gift-sets" class="cat-filter-btn px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold bg-amber-400 text-neutral-900 shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0">
          <span>Executive Gift Sets</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-900 text-amber-400 font-extrabold">61</span>
        </button>
        <button onclick="window.custoApp.filterByCategory('flasks-drinkware')" data-category="flasks-drinkware" class="cat-filter-btn px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold bg-white/80 text-neutral-700 hover:bg-white border border-neutral-200/80 transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0">
          <span>Flasks & Drinkware</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-600 font-bold">25</span>
        </button>
        <button onclick="window.custoApp.filterByCategory('table-top')" data-category="table-top" class="cat-filter-btn px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold bg-white/80 text-neutral-700 hover:bg-white border border-neutral-200/80 transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0">
          <span>Office Table Top</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-600 font-bold">12</span>
        </button>
        <button onclick="window.custoApp.filterByCategory('custom-pens')" data-category="custom-pens" class="cat-filter-btn px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold bg-white/80 text-neutral-700 hover:bg-white border border-neutral-200/80 transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0">
          <span>Custom Pens</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-600 font-bold">15</span>
        </button>
        <button onclick="window.custoApp.filterByCategory('diaries-notebooks')" data-category="diaries-notebooks" class="cat-filter-btn px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold bg-white/80 text-neutral-700 hover:bg-white border border-neutral-200/80 transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0">
          <span>Diaries & Notebooks</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-600 font-bold">45</span>
        </button>
        <button onclick="window.custoApp.filterByCategory('organizers-portfolios')" data-category="organizers-portfolios" class="cat-filter-btn px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold bg-white/80 text-neutral-700 hover:bg-white border border-neutral-200/80 transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0">
          <span>Premium Organizers</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-600 font-bold">21</span>
        </button>
        <button onclick="window.custoApp.filterByCategory('mugs-collection')" data-category="mugs-collection" class="cat-filter-btn px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold bg-white/80 text-neutral-700 hover:bg-white border border-neutral-200/80 transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0">
          <span>Corporate Mugs</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-600 font-bold">31</span>
        </button>
        <button onclick="window.custoApp.filterByCategory('luxury-gifts')" data-category="luxury-gifts" class="cat-filter-btn px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold bg-white/80 text-neutral-700 hover:bg-white border border-neutral-200/80 transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0">
          <span>Luxury Gifts & VIP</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-600 font-bold">55</span>
        </button>
        <button onclick="window.custoApp.filterByCategory('promotional-merchandise')" data-category="promotional-merchandise" class="cat-filter-btn px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold bg-white/80 text-neutral-700 hover:bg-white border border-neutral-200/80 transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0">
          <span>Promotional Merchandise</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-600 font-bold">12</span>
        </button>
      </div>`;

indexHtml = indexHtml.replace(/<div id="category-filter-buttons"[\s\S]*?<\/div>\s*<!-- Dynamic Category Status Banner -->/, `${officialCategoryFilterButtons}\n\n      <!-- Dynamic Category Status Banner -->`);

// Update Status Banner on Shop
const initialStatusBanner = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-neutral-900 text-white shadow-sm text-xs">
          <div class="flex items-center gap-2.5">
            <span class="bg-amber-400 text-neutral-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-xs">Collection</span>
            <div>
              <h4 class="font-display font-bold text-xs sm:text-sm text-white">Executive Gift Sets (61 Products Available)</h4>
              <p class="text-[10px] sm:text-[11px] text-neutral-400">DM 200, 300 & 400 Series: 2-in-1, 3-in-1 & 4-in-1 Onboarding Combos</p>
            </div>
          </div>
          <a 
            href="assets/catalogues/CUSTOCORP-Executive-Gift-Sets-Catalogue.pdf" 
            download 
            class="btn-gold text-[10px] sm:text-[11px] font-bold py-1.5 px-3 flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <i data-lucide="download" class="w-3 h-3"></i>
            <span>Download PDF Catalogue</span>
          </a>
        </div>`;

indexHtml = indexHtml.replace(/<div id="shop-category-banner" class="mb-6">[\s\S]*?<\/div>\s*<\/div>\s*<!-- Products Grid/, `<div id="shop-category-banner" class="mb-5">${initialStatusBanner}\n      </div>\n\n      <!-- Products Grid`);

fs.writeFileSync('c:/Users/abdul/Downloads/New web/index.html', indexHtml, 'utf8');
console.log('Successfully updated index.html!');
