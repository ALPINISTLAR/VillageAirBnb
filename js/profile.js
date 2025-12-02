// USER DATA
const currentUser = {
  role: 'host',
  name: 'Daniel Smith',
  email: 'daniel.smith@email.com',
  avatar: 'https://i.pravatar.cc/120?img=12',
  stats: {
    guest: {
      bookings: 5
    },
    host: {
      listings: 3
    }
  }
};
// INITIALIZE PROFILE
function initializeProfile() {
  const role = currentUser.role;

  // Update user info
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userEmail').textContent = currentUser.email;
  // Update role badge
  const roleBadge = document.getElementById('userRoleBadge');
  roleBadge.textContent = role === 'guest' ? 'Guest' : 'Host';
  roleBadge.classList.remove('guest', 'host');
  roleBadge.classList.add(role);

  // Update statistics
  if (role === 'guest') {
    document.getElementById('statNumber').textContent = currentUser.stats.guest.bookings;
    document.getElementById('statLabel').textContent = 'Bookings';
  } else {
    document.getElementById('statNumber').textContent = currentUser.stats.host.listings;
    document.getElementById('statLabel').textContent = 'Listings';
  }

  // Render tabs based on role
  renderTabs(role);
}
// RENDER TABS BASED ON ROLE
function renderTabs(role) {
  const tabsContainer = document.getElementById('profileTabs');
  tabsContainer.innerHTML = ''; // Clear existing tabs

  if (role === 'guest') {
    // Guest tabs: My Bookings + Favorites
    tabsContainer.innerHTML = `
                    <button class="tab active" onclick="switchTab('bookings')">
                        <i class="fas fa-calendar-check"></i> My Bookings
                    </button>
                    <button class="tab" onclick="switchTab('favorites')">
                        <i class="fas fa-heart"></i> Favorites
                    </button>
                `;

    // Show bookings content by default
    showTabContent('bookings');
  } else {
    // Host tabs: My Listings + Favorites
    tabsContainer.innerHTML = `
                    <button class="tab active" onclick="switchTab('listings')">
                        <i class="fas fa-home"></i> My Listings
                    </button>
                    <button class="tab" onclick="switchTab('favorites')">
                        <i class="fas fa-heart"></i> Favorites
                    </button>
                `;

    // Show listings content by default
    showTabContent('listings');
  }
}
// SWITCH TAB
function switchTab(tabName) {
  // Remove active class from all tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Add active class to clicked tab
  event.target.classList.add('active');

  // Show corresponding content
  showTabContent(tabName);
}

// SHOW TAB CONTENT
function showTabContent(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  // Show selected tab content
  const selectedContent = document.getElementById(tabName + '-content');
  if (selectedContent) {
    selectedContent.classList.add('active');
  }
}
// ========================================
// INITIALIZE ON PAGE LOAD
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  initializeProfile();
});

// ========================================
// EDIT PROFILE MODAL
// ========================================
function openEditProfileModal() {
  const modal = document.getElementById('editProfileModal');

  // Pre-fill form with current user data
  document.getElementById('editName').value = currentUser.name;
  document.getElementById('editEmail').value = currentUser.email;
  document.getElementById('avatarPreview').src = currentUser.avatar;

  modal.classList.add('active-modal');
  // document.body.style.overflow = 'hidden';
}

function closeEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  modal.classList.remove('active-modal');
  document.body.style.overflow = '';
}

// Preview avatar before upload
function previewAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('avatarPreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Save profile changes
function saveProfile(event) {
  event.preventDefault();

  // Get form values
  const newName = document.getElementById('editName').value;
  const newEmail = document.getElementById('editEmail').value;
  const newAvatar = document.getElementById('avatarPreview').src;

  // Update currentUser object
  currentUser.name = newName;
  currentUser.email = newEmail;
  currentUser.avatar = newAvatar;

  // Update UI
  document.getElementById('userName').textContent = newName;
  document.getElementById('userEmail').textContent = newEmail;
  document.querySelector('.user-profile-avatar').src = newAvatar;

  // Close modal
  closeEditProfileModal();

  // Show success message
  alert('Profile updated successfully!');
  // ^
  // |
  // this is temporary, later I will replace it with 'success message'

}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
  const modal = document.getElementById('editProfileModal');
  if (e.target === modal) {
    closeEditProfileModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeEditProfileModal();
  }
});
