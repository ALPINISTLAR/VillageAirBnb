//  Pagination System
class Pagination {
  constructor(items, itemsPerPage = 9) {
    this.items = items;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.totalPages = Math.ceil(items.length / itemsPerPage);
  }

  // Get items on the current page
  getCurrentPageItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.items.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      return true;
    }
    return false;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      return true;
    }
    return false;
  }

  goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      return true;
    }
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const allCards = document.querySelectorAll('.property-card');
  const cardsArray = Array.from(allCards);

  const pagination = new Pagination(cardsArray, 8);
  const paginationContainer = document.getElementById('paginationControls');

  function displayCards() {
    cardsArray.forEach(card => {
      card.style.display = 'none';
    });

    const currentCards = pagination.getCurrentPageItems();
    currentCards.forEach(card => {
      card.style.display = 'block';
    });

    updatePaginationControls();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Create pagination controls
  function updatePaginationControls() {
    if (!paginationContainer) return;

    let html = '<div class="pagination">';

    // Previous button
    html += `
      <button class="pagination-btn prev" ${pagination.currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
      </button>
    `;

    // Page numbers
    html += '<div class="pagination-numbers">';

    // First page
    html += `
      <button class="pagination-number ${pagination.currentPage === 1 ? 'active' : ''}" data-page="1">
        1
      </button>
    `;

    if (pagination.currentPage > 3) {
      html += '<span class="pagination-dots">...</span>';
    }

    for (let i = Math.max(2, pagination.currentPage - 1); i <= Math.min(pagination.totalPages - 1, pagination.currentPage + 1); i++) {
      html += `
        <button class="pagination-number ${pagination.currentPage === i ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    if (pagination.currentPage < pagination.totalPages - 2) {
      html += '<span class="pagination-dots">...</span>';
    }

    // Last page
    if (pagination.totalPages > 1) {
      html += `
        <button class="pagination-number ${pagination.currentPage === pagination.totalPages ? 'active' : ''}" data-page="${pagination.totalPages}">
          ${pagination.totalPages}
        </button>
      `;
    }

    html += '</div>';

    // Next button
    html += `
      <button class="pagination-btn next" ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
      </button>
    `;

    html += '</div>';

    paginationContainer.innerHTML = html;

    addPaginationListeners();
  }

  function addPaginationListeners() {
    // Previous button
    const prevBtn = document.querySelector('.pagination-btn.prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (pagination.prevPage()) {
          displayCards();
        }
      });
    }

    // Next button
    const nextBtn = document.querySelector('.pagination-btn.next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (pagination.nextPage()) {
          displayCards();
        }
      });
    }

    // Page numbers
    const numberBtns = document.querySelectorAll('.pagination-number');
    numberBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const pageNum = parseInt(btn.dataset.page);
        if (pagination.goToPage(pageNum)) {
          displayCards();
        }
      });
    });
  }

  displayCards();
});