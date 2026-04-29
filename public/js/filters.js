/**
 * Filters Module — Budget, distance, category, and search filtering
 * Updates listings and map markers in real-time as filters change.
 */

let currentFilters = {
  category: '',
  subcategory: '',
  budget_min: 0,
  budget_max: 50000,
  search: '',
  sort: '',
  veg_nonveg: ''
};

/**
 * Initialize filter UI and event listeners
 */
function initFilters() {
  // Category tabs
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilters.category = tab.dataset.category || '';
      currentFilters.subcategory = '';
      updateSubcategoryChips();
      applyFilters();
    });
  });

  // Budget range slider
  const budgetSlider = document.getElementById('budget-slider');
  const budgetValue = document.getElementById('budget-value');
  if (budgetSlider) {
    budgetSlider.addEventListener('input', debounce(() => {
      currentFilters.budget_max = Number(budgetSlider.value);
      budgetValue.textContent = formatPrice(budgetSlider.value);
      applyFilters();
    }, 200));
  }

  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      currentFilters.search = searchInput.value.trim();
      applyFilters();
    }, 300));
  }

  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentFilters.sort = sortSelect.value;
      applyFilters();
    });
  }

  // Veg/Non-veg filter
  document.querySelectorAll('.diet-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diet-filter').forEach(b => b.classList.remove('active'));
      if (currentFilters.veg_nonveg === btn.dataset.diet) {
        currentFilters.veg_nonveg = '';
      } else {
        btn.classList.add('active');
        currentFilters.veg_nonveg = btn.dataset.diet;
      }
      applyFilters();
    });
  });
}

/**
 * Update subcategory filter chips based on selected category
 */
function updateSubcategoryChips() {
  const container = document.getElementById('subcategory-chips');
  if (!container) return;

  const subcats = {
    accommodation: [['pg', 'PG'], ['hostel', 'Hostel'], ['shared_flat', 'Shared Flat']],
    food: [['mess', 'Mess'], ['tiffin', 'Tiffin']],
    services: [['laundry', 'Laundry'], ['medical', 'Medical'], ['stationery', 'Stationery'], ['internet', 'Internet']],
    explore: [['cafe', 'Café'], ['park', 'Park'], ['mall', 'Mall'], ['tourist', 'Tourist']]
  };

  const items = subcats[currentFilters.category] || [];
  container.innerHTML = items.map(([val, label]) =>
    `<button class="chip" data-sub="${val}">${label}</button>`
  ).join('');

  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      if (currentFilters.subcategory === chip.dataset.sub) {
        currentFilters.subcategory = '';
      } else {
        chip.classList.add('active');
        currentFilters.subcategory = chip.dataset.sub;
      }
      applyFilters();
    });
  });
}

/**
 * Build query string from current filters and fetch listings
 */
async function applyFilters() {
  const params = new URLSearchParams();

  if (currentFilters.category) params.set('category', currentFilters.category);
  if (currentFilters.subcategory) params.set('subcategory', currentFilters.subcategory);
  if (currentFilters.budget_min > 0) params.set('budget_min', currentFilters.budget_min);
  if (currentFilters.budget_max < 50000) params.set('budget_max', currentFilters.budget_max);
  if (currentFilters.search) params.set('search', currentFilters.search);
  if (currentFilters.sort) params.set('sort', currentFilters.sort);
  if (currentFilters.veg_nonveg) params.set('veg_nonveg', currentFilters.veg_nonveg);

  // Add user location for distance calculation
  if (userLocation) {
    params.set('lat', userLocation.lat);
    params.set('lng', userLocation.lng);
  }

  const data = await apiFetch(`/listings?${params.toString()}`);

  if (data.listings) {
    renderListings(data.listings);
    updateMarkers(data.listings);
    updateResultCount(data.count);
  }
}

/**
 * Update the results count display
 */
function updateResultCount(count) {
  const el = document.getElementById('result-count');
  if (el) el.textContent = `${count} place${count !== 1 ? 's' : ''} found`;
}

/**
 * Reset all filters to defaults
 */
function resetFilters() {
  currentFilters = { category: '', subcategory: '', budget_min: 0, budget_max: 50000, search: '', sort: '', veg_nonveg: '' };
  document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.category-tab[data-category=""]')?.classList.add('active');
  const budgetSlider = document.getElementById('budget-slider');
  if (budgetSlider) budgetSlider.value = 50000;
  const budgetValue = document.getElementById('budget-value');
  if (budgetValue) budgetValue.textContent = '₹50,000';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = '';
  document.querySelectorAll('.diet-filter').forEach(b => b.classList.remove('active'));
  const subContainer = document.getElementById('subcategory-chips');
  if (subContainer) subContainer.innerHTML = '';
  applyFilters();
}
