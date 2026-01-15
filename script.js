document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const categorySelect = document.getElementById('search-category');
  const editorialList = document.getElementById('editorial-list');
  const noResults = document.getElementById('no-results');
  const resultStatus = document.getElementById('result-status');
  const resultCount = document.getElementById('result-count');

  // Filter Logic
  function filterData(query, category) {
    if (!query) return []; // Don't show anything if empty? Or show all? User said "search term", implies active search. Let's show empty initially.

    const lowerQuery = query.toLowerCase();

    return editorialData.filter(item => {
      // Helper to check string containment safely
      const check = (val) => val && val.toLowerCase().includes(lowerQuery);

      if (category === 'all') {
        return check(item.title) ||
          check(item.author) ||
          Object.values(item.structure).some(val => check(val));
      } else if (category === 'author') {
        return check(item.author);
      } else if (category === 'title') {
        return check(item.title);
      } else if (category.startsWith('structure_')) {
        const key = category.replace('structure_', '');
        return item.structure && check(item.structure[key]);
      }
      return false;
    });
  }

  // Render Logic
  function renderResults(results) {
    editorialList.innerHTML = '';

    if (results.length === 0) {
      editorialList.style.display = 'none';
      resultStatus.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }

    noResults.style.display = 'none';
    editorialList.style.display = 'grid'; // Restore grid
    resultStatus.style.display = 'block';
    resultCount.textContent = results.length;

    // Add delay for staggering animation
    results.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'editorial-card';
      card.style.animationDelay = `${index * 0.1}s`;

      // Highlight the relevant part based on category if possible, 
      // but for now, just render the full card nicely.

      const structureHtml = Object.entries(item.structure).map(([key, value]) => {
        let labelClass = '';
        let labelText = '';

        switch (key) {
          case 'background': labelClass = 'bg-label'; labelText = '배경'; break;
          case 'evidence': labelClass = 'ev-label'; labelText = '근거'; break;
          case 'argument': labelClass = 'arg-label'; labelText = '주장'; break;
          case 'fact': labelClass = 'fact-label'; labelText = '사실'; break;
          default: labelClass = 'bg-label'; labelText = key;
        }

        // If searching by specific structure, highlight or only show that?
        // Plan: Show all parts but maybe visually emphasize match? 
        // For simplicity and context, show all parts.

        return `
                    <div class="structure-item">
                        <span class="structure-label ${labelClass}">${labelText}</span>
                        <p class="structure-text">${value}</p>
                    </div>
                `;
      }).join('');

      card.innerHTML = `
                <div class="card-header">
                    <h2 class="card-title">${item.title}</h2>
                    <div class="card-meta">
                        <span class="author">${item.author}</span>
                        <span class="date">${item.date}</span>
                    </div>
                </div>
                <div class="card-content">
                    ${structureHtml}
                </div>
            `;

      editorialList.appendChild(card);
    });

    // Scroll to results if needed
    setTimeout(() => {
      const headerHeight = document.querySelector('.hero-section').clientHeight;
      if (window.scrollY < headerHeight / 2) {
        editorialList.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Event Handlers
  function handleSearch() {
    const query = searchInput.value.trim();
    const category = categorySelect.value;

    if (!query) {
      alert('검색어를 입력해주세요.');
      return;
    }

    const results = filterData(query, category);
    renderResults(results);
  }

  searchBtn.addEventListener('click', handleSearch);

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  // Optional: Auto-search when category changes if query exists?
  // User might prefer explicit search. Let's keep it manual for now as per "select... enter search term" flow.
});
