/**
 * Reviews Module — Star rating input and review display
 */

let selectedRating = 0;

/**
 * Render the review section for a listing detail page
 */
function renderReviewSection(reviews, listingId) {
  const container = document.getElementById('reviews-section');
  if (!container) return;

  const user = getCurrentUser();

  container.innerHTML = `
    <h2 class="section-title">Reviews & Ratings</h2>
    
    ${user ? `
    <form id="review-form" class="review-form">
      <h3>Write a Review</h3>
      <div class="star-input" id="star-input">
        ${[1,2,3,4,5].map(i => `<span class="star-btn" data-rating="${i}">★</span>`).join('')}
        <span class="rating-text" id="rating-text">Select rating</span>
      </div>
      <textarea id="review-comment" placeholder="Share your experience..." rows="3"></textarea>
      <button type="submit" class="btn btn-primary">Submit Review</button>
    </form>` : `
    <div class="login-prompt">
      <p>🔒 <a href="/login.html">Login</a> to write a review</p>
    </div>`}

    <div class="reviews-list" id="reviews-list">
      ${reviews.length === 0 ? '<p class="no-reviews">No reviews yet. Be the first!</p>' : ''}
      ${reviews.map(r => `
        <div class="review-card">
          <div class="review-header">
            <div class="reviewer-avatar">${r.user_name.charAt(0).toUpperCase()}</div>
            <div class="reviewer-info">
              <strong>${r.user_name}</strong>
              <small>${new Date(r.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</small>
            </div>
            <div class="review-rating">${renderStars(r.rating)}</div>
          </div>
          ${r.comment ? `<p class="review-comment">${r.comment}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;

  // Star rating input interaction
  if (user) {
    const stars = container.querySelectorAll('.star-btn');
    const ratingText = document.getElementById('rating-text');
    const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    stars.forEach(star => {
      star.addEventListener('mouseenter', () => {
        const val = Number(star.dataset.rating);
        stars.forEach((s, i) => s.classList.toggle('hover', i < val));
      });

      star.addEventListener('mouseleave', () => {
        stars.forEach((s, i) => s.classList.toggle('hover', false));
        stars.forEach((s, i) => s.classList.toggle('selected', i < selectedRating));
      });

      star.addEventListener('click', () => {
        selectedRating = Number(star.dataset.rating);
        stars.forEach((s, i) => s.classList.toggle('selected', i < selectedRating));
        ratingText.textContent = texts[selectedRating];
      });
    });

    // Form submission
    document.getElementById('review-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (selectedRating === 0) {
        showToast('Please select a rating', 'warning');
        return;
      }

      const comment = document.getElementById('review-comment').value;
      const data = await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({ listing_id: listingId, rating: selectedRating, comment })
      });

      if (data.success) {
        showToast('Review submitted!', 'success');
        // Reload reviews
        const updated = await apiFetch(`/reviews/${listingId}`);
        if (updated.reviews) renderReviewSection(updated.reviews, listingId);
        selectedRating = 0;
      } else {
        showToast(data.error || 'Failed to submit review', 'error');
      }
    });
  }
}
