// image preview
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
                name: file.name,
                file: file
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
            '<button type="button" class="image-remove" onclick="removeImage(\'' + image.id + '\')">×</button>';
        imagePreviewGrid.appendChild(div);
    });
}

window.removeImage = function(imageId) {
    uploadedImages = uploadedImages.filter(img => img.id !== imageId);
    renderImages();

    // File input update
    const dataTransfer = new DataTransfer();
    uploadedImages.forEach(img => {
        if (img.file) {
            dataTransfer.items.add(img.file);
        }
    });
    imageUpload.files = dataTransfer.files;
};

// Amenities
const amenityButtons = document.querySelectorAll('.listing-form_amenity-btn');
amenityButtons.forEach(button => {
    button.addEventListener('click', function() {
        this.classList.toggle('amenity-selected');
        const amenity = this.getAttribute('data-amenity');
        const checkbox = document.getElementById('amenity-' + amenity);
        checkbox.checked = !checkbox.checked;
    });
});

//  FORM SUBMIT HANDLER
document.getElementById('listingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    console.log('Form submitted!');
    console.log('uploadedImages count:', uploadedImages.length);

    const formData = new FormData(this);

    formData.delete('images');

    uploadedImages.forEach((image, index) => {
        if (image.file) {
            formData.append('images', image.file);
            console.log(`Image ${index + 1}:`, image.file.name);
        }
    });

    const submitBtn = document.getElementById('submitButton');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';

    fetch('/api/properties', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Response status:', response.status);

        if (response.ok) {
            return response.json().catch(() => {
                window.location.href = '/?success=true';
            });
        } else {
            return response.text().then(text => {
                throw new Error(text || 'Server error');
            });
        }
    })
    .then(data => {
        if (data) {
            console.log('Success:', data);
        }
        window.location.href = '/?success=true';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('something went wrong: ' + error.message);

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
});