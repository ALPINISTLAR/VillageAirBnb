// ((((((++++ LISTING PAGE +++++))))))
 // Form data
        const formData = {
            propertyName: '',
            region: '',
            city: '',
            address: '',
            pricePerNight: '',
            maxGuests: '',
            bedrooms: '',
            bathrooms: '',
            description: '',
            amenities: [],
            images: []
        };

        // Image upload handling
        const imageUpload = document.getElementById('image-upload');
        const imagePreviewGrid = document.getElementById('imagePreviewGrid');
        let uploadedImages = [];

        imageUpload.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const imageId = 'img_' + Date.now() + Math.random();
                    uploadedImages.push({
                        id: imageId,
                        src: event.target.result,
                        name: file.name
                    });
                    renderImages();
                };
                reader.readAsDataURL(file);
            });
        });

        function renderImages() {
            imagePreviewGrid.innerHTML = '';
            uploadedImages.forEach(image => {
                const div = document.createElement('div');
                div.className = 'image-preview';
                div.innerHTML = '<img src="' + image.src + '" alt="' + image.name + '">' +
                    '<button class="image-remove" onclick="removeImage(\'' + image.id + '\')">×</button>';
                imagePreviewGrid.appendChild(div);
            });
        }

        window.removeImage = function(imageId) {
            uploadedImages = uploadedImages.filter(function(img) {
                return img.id !== imageId;
            });
            renderImages();
        };

        // Amenities handling
        const amenityButtons = document.querySelectorAll('.listing-form_amenity-btn');
        amenityButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.classList.toggle('amenity-selected');
                const amenity = this.getAttribute('data-amenity');

                if (formData.amenities.includes(amenity)) {
                    formData.amenities = formData.amenities.filter(function(a) {
                        return a !== amenity;
                    });
                } else {
                    formData.amenities.push(amenity);
                }
            });
        });

        // Form submission
        const submitButton = document.getElementById('submitButton');
        const successMessage = document.getElementById('successMessage');

        submitButton.addEventListener('click', function() {
            // Collect form data
            formData.propertyName = document.getElementById('propertyName').value;
            formData.region = document.getElementById('region').value;
            formData.city = document.getElementById('city').value;
            formData.address = document.getElementById('address').value;
            formData.pricePerNight = document.getElementById('pricePerNight').value;
            formData.maxGuests = document.getElementById('maxGuests').value;
            formData.bedrooms = document.getElementById('bedrooms').value;
            formData.bathrooms = document.getElementById('bathrooms').value;
            formData.description = document.getElementById('description').value;
            formData.images = uploadedImages;

            // Show success message
            successMessage.classList.add('show-success-msg');
            console.log('Form submitted:', formData);

            // Hide success message after 3 seconds
            setTimeout(() => {
                successMessage.classList.remove('show-success-msg');
            }, 3000);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });