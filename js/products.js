/**
 * SHAYONA ENTERPRISES - DIGITAL MATERIAL SHOWROOM
 * Core Interactive Logic & State Engine
 * (Embeddable Product Catalogue Engine)
 */

(function () {
  "use strict";

  // Application State
  const state = {
    activeCategoryId: "wall-panels",
    activeSubcategory: "ALL",
    searchQuery: "",
    modalProduct: null
  };

  // DOM Element Selectors
  const dom = {
    categoryRibbon: document.getElementById("category-ribbon"),
    introNum: document.getElementById("intro-cat-number"),
    introTitle: document.getElementById("intro-cat-title"),
    introDesc: document.getElementById("intro-cat-desc"),
    introCount: document.getElementById("intro-count-badge"),
    subcatWrapper: document.getElementById("subcat-wrapper"),
    toolbarCount: document.getElementById("toolbar-count"),
    toolbarSelect: document.getElementById("toolbar-select"),
    searchInput: document.getElementById("search-input"),
    searchClearBtn: document.getElementById("search-clear-btn"),
    productGrid: document.getElementById("product-grid"),
    modalOverlay: document.getElementById("product-modal"),
    modalCloseBtn: document.getElementById("modal-close-btn"),
    modalImg: document.getElementById("modal-img"),
    modalCategory: document.getElementById("modal-category"),
    modalTitle: document.getElementById("modal-title"),
    modalOverview: document.getElementById("modal-overview"),
    modalMaterial: document.getElementById("modal-material"),
    modalFinish: document.getElementById("modal-finish"),
    modalDimensions: document.getElementById("modal-dimensions"),
    modalApplications: document.getElementById("modal-applications"),
    modalWaBtn: document.getElementById("modal-wa-btn"),
    modalCallBtn: document.getElementById("modal-call-btn")
  };

  /**
   * Helper: Generate WhatsApp URL with encoded message
   */
  function getWhatsAppUrl(productName, subcategory) {
    const rawMessage = `Hello Shayona Enterprises,\nI am interested in ${productName}${subcategory ? ` (${subcategory})` : ""}.\nPlease share product details, availability and quotation.`;
    return `https://wa.me/${SHAYONA_CONTACT.whatsappNumber}?text=${encodeURIComponent(rawMessage)}`;
  }

  /**
   * Helper: Find category by ID or Hash
   */
  function getCategoryById(catId) {
    return categoriesData.find((c) => c.id === catId || c.hash === catId) || categoriesData[0];
  }

  /**
   * Initialize and render Category Ribbon Cards (8 main categories)
   */
  function renderCategoryRibbon() {
    if (!dom.categoryRibbon) return;

    // We render the 8 primary categories on the visual ribbon (plus any active ones)
    const ribbonCategories = categoriesData.slice(0, 8);

    dom.categoryRibbon.innerHTML = ribbonCategories
      .map((cat) => {
        const isActive = cat.id === state.activeCategoryId;
        return `
        <button 
          type="button" 
          class="category-card ${isActive ? "is-active" : ""}" 
          data-category-id="${cat.id}"
          role="tab"
          aria-selected="${isActive}"
          aria-label="${cat.number} ${cat.name}"
        >
          <div class="category-card-bg">
            <img 
              src="${cat.image}" 
              alt="${cat.name} interior material" 
              loading="eager"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';"
            />
          </div>
          <div class="category-card-overlay"></div>
          <div class="category-card-content">
            <span class="category-card-num">${cat.number}</span>
            <span class="category-card-name">${cat.name}</span>
          </div>
          <div class="category-card-active-line"></div>
        </button>
      `;
      })
      .join("");

    // Bind click events on category cards
    dom.categoryRibbon.querySelectorAll(".category-card").forEach((card) => {
      card.addEventListener("click", () => {
        const catId = card.getAttribute("data-category-id");
        setActiveCategory(catId, true);
      });
    });
  }

  /**
   * Set Active Category and update all dependent components
   */
  function setActiveCategory(catId, updateHistory = true) {
    const category = getCategoryById(catId);
    state.activeCategoryId = category.id;
    state.activeSubcategory = "ALL";
    state.searchQuery = "";
    if (dom.searchInput) dom.searchInput.value = "";
    if (dom.searchClearBtn) dom.searchClearBtn.classList.remove("is-visible");

    // Update URL hash without reload
    if (updateHistory && window.location.hash !== `#${category.id}`) {
      window.history.pushState({ categoryId: category.id }, "", `#${category.id}`);
    }

    // Update Category Ribbon active state
    if (dom.categoryRibbon) {
      dom.categoryRibbon.querySelectorAll(".category-card").forEach((card) => {
        const isCurrent = card.getAttribute("data-category-id") === category.id;
        card.classList.toggle("is-active", isCurrent);
        card.setAttribute("aria-selected", String(isCurrent));
      });
    }

    // Update Category Editorial Introduction
    if (dom.introNum) dom.introNum.textContent = `${category.number} / CATEGORY`;
    if (dom.introTitle) dom.introTitle.textContent = category.name;
    if (dom.introDesc) dom.introDesc.textContent = category.description;
    if (dom.introCount) dom.introCount.textContent = category.productCountText;

    // Render Subcategory filter chips
    renderSubcategories(category);

    // Render Products Grid
    renderProductsGrid();
  }

  /**
   * Render Subcategory Chips & Dropdown
   */
  function renderSubcategories(category) {
    if (!dom.subcatWrapper) return;

    const subcats = ["ALL", ...category.subcategories];

    // Chips UI
    dom.subcatWrapper.innerHTML = subcats
      .map((subcat) => {
        const isActive = subcat === state.activeSubcategory;
        return `
        <button 
          type="button" 
          class="subcat-chip ${isActive ? "is-active" : ""}" 
          data-subcategory="${subcat}"
        >
          ${subcat}
        </button>
      `;
      })
      .join("");

    // Bind chip clicks
    dom.subcatWrapper.querySelectorAll(".subcat-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const subcat = chip.getAttribute("data-subcategory");
        setActiveSubcategory(subcat);
      });
    });

    // Toolbar Dropdown UI
    if (dom.toolbarSelect) {
      dom.toolbarSelect.innerHTML = subcats
        .map((subcat) => {
          return `<option value="${subcat}" ${subcat === state.activeSubcategory ? "selected" : ""}>${subcat === "ALL" ? "All Subcategories" : subcat}</option>`;
        })
        .join("");
    }
  }

  /**
   * Set Active Subcategory
   */
  function setActiveSubcategory(subcat) {
    state.activeSubcategory = subcat;

    // Update chips active state
    if (dom.subcatWrapper) {
      dom.subcatWrapper.querySelectorAll(".subcat-chip").forEach((chip) => {
        chip.classList.toggle("is-active", chip.getAttribute("data-subcategory") === subcat);
      });
    }

    // Sync dropdown
    if (dom.toolbarSelect) {
      dom.toolbarSelect.value = subcat;
    }

    renderProductsGrid();
  }

  /**
   * Filter and Render Product Grid
   */
  function renderProductsGrid() {
    if (!dom.productGrid) return;

    const category = getCategoryById(state.activeCategoryId);
    const query = state.searchQuery.trim().toLowerCase();

    let matchedProducts = [];

    if (query) {
      // If user is searching, search in current category first, then globally if empty
      const inCatMatches = category.products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.subcategory.toLowerCase().includes(query) ||
          p.specs.toLowerCase().includes(query)
      );

      if (inCatMatches.length > 0) {
        matchedProducts = inCatMatches;
      } else {
        // Global search across all categories
        categoriesData.forEach((c) => {
          c.products.forEach((p) => {
            if (
              p.name.toLowerCase().includes(query) ||
              p.subcategory.toLowerCase().includes(query) ||
              p.specs.toLowerCase().includes(query) ||
              c.name.toLowerCase().includes(query)
            ) {
              matchedProducts.push(p);
            }
          });
        });
      }
    } else {
      // Normal filtering by active subcategory
      if (state.activeSubcategory === "ALL") {
        matchedProducts = category.products;
      } else {
        matchedProducts = category.products.filter((p) => p.subcategory === state.activeSubcategory);
      }
    }

    // Update Toolbar Count
    if (dom.toolbarCount) {
      dom.toolbarCount.textContent = `${matchedProducts.length}`;
    }

    // Handle Empty Results
    if (matchedProducts.length === 0) {
      dom.productGrid.innerHTML = `
        <div class="product-empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 class="empty-title">No Architectural Products Found</h3>
          <p class="empty-desc">We couldn't find any material matching "${state.searchQuery}". Try refining your search or explore other material categories.</p>
          <button type="button" class="btn btn-primary" id="btn-reset-filters">
            <span>View All ${category.name}</span>
          </button>
        </div>
      `;

      const resetBtn = document.getElementById("btn-reset-filters");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          setActiveCategory(category.id, true);
        });
      }
      return;
    }

    // Render Product Cards
    dom.productGrid.innerHTML = matchedProducts
      .map((product, index) => {
        const waUrl = getWhatsAppUrl(product.name, product.subcategory);
        const callUrl = `tel:${SHAYONA_CONTACT.phone}`;
        const delayClass = `reveal-delay-${(index % 4) + 1}`;

        return `
        <article class="product-card reveal-fade ${delayClass}" data-product-id="${product.id}">
          <div class="product-card-media" data-open-quickview="${product.id}">
            <img 
              src="${product.image}" 
              alt="${product.name} - Shayona Enterprises" 
              class="product-card-img" 
              loading="lazy"
              decoding="async"
              onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'product-fallback-img\\'><svg viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'0\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><polyline points=\\'21 15 16 10 5 21\\'/></svg><span>${product.name}</span></div>';"
            />
            <div class="product-card-quickview-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>Specs</span>
            </div>
          </div>
          <div class="product-card-body">
            <div class="product-card-subcat">${product.subcategory}</div>
            <h3 class="product-card-title" data-open-quickview="${product.id}">${product.name}</h3>
            <p class="product-card-specs">${product.specs}</p>
            <div class="product-card-actions">
              <a 
                href="${waUrl}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn-wa"
                aria-label="Enquire about ${product.name} on WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.275-.101-.475-.15-.675.15-.2.301-.775.978-.95 1.178-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.488-.893-.796-1.496-1.78-1.671-2.081-.175-.3-.019-.462.13-.612.136-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.584-.492-.505-.675-.514-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.898 1.225 3.1c.15.2 2.115 3.23 5.124 4.53.716.31 1.275.495 1.71.634.719.229 1.373.196 1.89.119.577-.087 1.78-.727 2.03-1.428.25-.701.25-1.302.175-1.428-.075-.125-.275-.2-.575-.35zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 22l4.98-1.307A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
              <a 
                href="${callUrl}" 
                class="btn-call"
                aria-label="Call Shayona Enterprises regarding ${product.name}"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>Call</span>
              </a>
            </div>
          </div>
        </article>
      `;
      })
      .join("");

    // Bind Quick View Triggers
    dom.productGrid.querySelectorAll("[data-open-quickview]").forEach((el) => {
      el.addEventListener("click", () => {
        const prodId = el.getAttribute("data-open-quickview");
        openQuickViewModal(prodId);
      });
    });

    // Trigger Scroll Observer on new cards
    observeScrollReveal();
  }

  /**
   * Find product by ID across all categories
   */
  function findProductById(prodId) {
    for (const cat of categoriesData) {
      const found = cat.products.find((p) => p.id === prodId);
      if (found) return { ...found, categoryName: cat.name };
    }
    return null;
  }

  /**
   * Open Architectural Quick View Specification Modal
   */
  function openQuickViewModal(prodId) {
    const product = findProductById(prodId);
    if (!product || !dom.modalOverlay) return;

    state.modalProduct = product;

    // Populate Modal Content
    if (dom.modalImg) {
      dom.modalImg.src = product.image;
      dom.modalImg.alt = `${product.name} architectural detail`;
      dom.modalImg.onerror = function () {
        this.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
      };
    }

    if (dom.modalCategory) dom.modalCategory.textContent = `${product.categoryName} • ${product.subcategory}`;
    if (dom.modalTitle) dom.modalTitle.textContent = product.name;
    if (dom.modalOverview) dom.modalOverview.textContent = product.specs;
    if (dom.modalMaterial) dom.modalMaterial.textContent = product.material || "High-Density Architectural Grade";
    if (dom.modalFinish) dom.modalFinish.textContent = product.finish || "Premium Matte / Satin";
    if (dom.modalDimensions) dom.modalDimensions.textContent = product.dimensions || "Standard Architectural Dimensions";
    if (dom.modalApplications) dom.modalApplications.textContent = product.applications || "Residential & Commercial Interiors";

    // Set Dynamic WhatsApp and Call Links
    if (dom.modalWaBtn) {
      dom.modalWaBtn.href = getWhatsAppUrl(product.name, product.subcategory);
    }
    if (dom.modalCallBtn) {
      dom.modalCallBtn.href = `tel:${SHAYONA_CONTACT.phone}`;
    }

    // Open Modal
    dom.modalOverlay.classList.add("is-active");
    dom.modalOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Focus close button for accessibility
    if (dom.modalCloseBtn) dom.modalCloseBtn.focus();
  }

  /**
   * Close Quick View Modal
   */
  function closeQuickViewModal() {
    if (!dom.modalOverlay) return;
    dom.modalOverlay.classList.remove("is-active");
    dom.modalOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    state.modalProduct = null;
  }

  /**
   * Native IntersectionObserver for Scroll Animations
   */
  function observeScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal-fade:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /**
   * Bind Global Event Listeners
   */
  function initEventListeners() {
    // URL hash popstate handler (Browser Back / Forward buttons)
    window.addEventListener("popstate", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && categoriesData.some((c) => c.id === hash || c.hash === hash)) {
        setActiveCategory(hash, false);
      }
    });

    // Live Search Input Handler
    if (dom.searchInput) {
      dom.searchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        if (dom.searchClearBtn) {
          dom.searchClearBtn.classList.toggle("is-visible", state.searchQuery.length > 0);
        }
        renderProductsGrid();
      });
    }

    // Clear Search Input Button
    if (dom.searchClearBtn) {
      dom.searchClearBtn.addEventListener("click", () => {
        state.searchQuery = "";
        if (dom.searchInput) dom.searchInput.value = "";
        dom.searchClearBtn.classList.remove("is-visible");
        renderProductsGrid();
      });
    }

    // Subcategory Dropdown Select
    if (dom.toolbarSelect) {
      dom.toolbarSelect.addEventListener("change", (e) => {
        setActiveSubcategory(e.target.value);
      });
    }

    // Modal Close Button
    if (dom.modalCloseBtn) {
      dom.modalCloseBtn.addEventListener("click", closeQuickViewModal);
    }

    // Modal Backdrop Click
    if (dom.modalOverlay) {
      dom.modalOverlay.addEventListener("click", (e) => {
        if (e.target === dom.modalOverlay) {
          closeQuickViewModal();
        }
      });
    }

    // Keyboard ESC key close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeQuickViewModal();
      }
    });
  }

  /**
   * Main Initialization Function
   */
  function init() {
    // Read initial hash from URL or default to 'wall-panels'
    const initialHash = window.location.hash.replace("#", "");
    const initialCategory = categoriesData.find((c) => c.id === initialHash || c.hash === initialHash);

    if (initialCategory) {
      state.activeCategoryId = initialCategory.id;
    } else {
      state.activeCategoryId = "wall-panels";
    }

    // Render components
    renderCategoryRibbon();
    setActiveCategory(state.activeCategoryId, false);
    initEventListeners();
    observeScrollReveal();
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
