 // Image Gallery
        let currentSlide = 0;
        const images = document.querySelectorAll('.gallery-images img');
        const dotsContainer = document.getElementById('galleryDots');

        // Create dots
        images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (index === 0) dot.classList.add('active');
            dot.onclick = () => goToSlide(index);
            dotsContainer.appendChild(dot);
        });

        function changeSlide(direction) {
            currentSlide += direction;
            if (currentSlide >= images.length) currentSlide = 0;
            if (currentSlide < 0) currentSlide = images.length - 1;
            updateGallery();
        }

        function goToSlide(index) {
            currentSlide = index;
            updateGallery();
        }

        function updateGallery() {
            const galleryImages = document.getElementById('galleryImages');
            galleryImages.style.transform = `translateX(-${currentSlide * 100}%)`;

            document.querySelectorAll('.dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        // Auto slide
        setInterval(() => changeSlide(1), 5000);

        // Booking Calculations
        const pricePerNight = 42;
        const checkInInput = document.getElementById('checkIn');
        const checkOutInput = document.getElementById('checkOut');

        // Set minimum dates
        const today = new Date().toISOString().split('T')[0];
        checkInInput.min = today;
        checkInInput.value = today;

        checkInInput.addEventListener('change', () => {
            checkOutInput.min = checkInInput.value;
            const nextDay = new Date(checkInInput.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkOutInput.value = nextDay.toISOString().split('T')[0];
            calculateTotal();
        });

        checkOutInput.addEventListener('change', calculateTotal);

        function calculateTotal() {
            const checkIn = new Date(checkInInput.value);
            const checkOut = new Date(checkOutInput.value);

            if (checkIn && checkOut && checkOut > checkIn) {
                const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                const subtotal = pricePerNight * nights;
                const serviceFee = Math.round(subtotal * 0.1);
                const total = subtotal + serviceFee;

                document.getElementById('nights').textContent = nights;
                document.getElementById('subtotal').textContent = '$' + subtotal;
                document.getElementById('serviceFee').textContent = '$' + serviceFee;
                document.getElementById('total').textContent = '$' + total;
            }
        }

        // Initialize calculation
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        checkOutInput.value = tomorrow.toISOString().split('T')[0];
        calculateTotal();

        // Form Submission
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();

             const formData = {
                checkIn: checkInInput.value,
                checkOut: checkOutInput.value,
                guests: document.getElementById('guests').value,
                nights: document.getElementById('nights').textContent,
                total: document.getElementById('total').textContent
            };

            // Show modal with booking details
            showBookingModal(formData);
        });

        // Modal Functions
        function showBookingModal(data) {
            const modal = document.getElementById('bookingModal');
            const modalDetails = document.getElementById('modalDetails');

            // Format dates
            const checkInDate = new Date(data.checkIn).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            const checkOutDate = new Date(data.checkOut).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            modalDetails.innerHTML = `
                <div class="modal-detail-row">
                    <span class="modal-detail-label">Check-in:</span>
                    <span class="modal-detail-value">${checkInDate}</span>
                </div>
                <div class="modal-detail-row">
                    <span class="modal-detail-label">Check-out:</span>
                    <span class="modal-detail-value">${checkOutDate}</span>
                </div>
                <div class="modal-detail-row">
                    <span class="modal-detail-label">Guests:</span>
                    <span class="modal-detail-value">${data.guests} ${data.guests == 1 ? 'Guest' : 'Guests'}</span>
                </div>
                <div class="modal-detail-row">
                    <span class="modal-detail-label">Nights:</span>
                    <span class="modal-detail-value">${data.nights} ${data.nights == 1 ? 'Night' : 'Nights'}</span>
                </div>
                <div class="modal-detail-row">
                    <span class="modal-detail-label">Total Amount:</span>
                    <span class="modal-detail-value">${data.total}</span>
                </div>
            `;

            modal.classList.add('active-modal');
        }

        function closeModal() {
            const modal = document.getElementById('bookingModal');
            modal.classList.remove('active-modal');
        }

        // Close modal when clicking outside
        document.getElementById('bookingModal').addEventListener('click', (e) => {
            if (e.target.id === 'bookingModal') {
                closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });