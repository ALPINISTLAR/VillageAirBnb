// Banner Navigation
const BannerNavigation = document.querySelector('.banner-navigation');

if (BannerNavigation) {
  const offset = BannerNavigation.offsetTop;

  window.addEventListener('scroll', () => {
    if (window.scrollY >= offset) {
      BannerNavigation.classList.add('fixed');
    } else {
      BannerNavigation.classList.remove('fixed');
    }
  });
}

// Find Homestay Links
const links = document.querySelectorAll('.find-homestay');
const input = document.getElementById('location');

if (links.length > 0 && input) {
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      input.focus();
    });
  });
}

function toggleReview(button) {
  const reviewCard = button.closest('.testimonial-card');
  const reviewText = reviewCard.querySelector('.testimonial-card_comment');

  if (reviewText.classList.contains('expanded')) {
    reviewText.classList.remove('expanded');
    button.textContent = 'Read more';
  } else {
    reviewText.classList.add('expanded');
    button.textContent = 'Show less';
  }
}

let checkInDate = null;
let checkOutDate = null;

function highlightRange(dObj, dStr, fp, dayElem) {
  const date = dayElem.dateObj;

  if (checkInDate && checkOutDate) {
    const dateTime = date.getTime();
    const checkInTime = checkInDate.getTime();
    const checkOutTime = checkOutDate.getTime();

    if (dateTime > checkInTime && dateTime < checkOutTime) {
      dayElem.classList.add('in-range');
    }

    if (dateTime === checkInTime) dayElem.classList.add('start-date');
    if (dateTime === checkOutTime) dayElem.classList.add('end-date');
  }
}

const checkInInput = document.querySelector("#checkIn");
const checkOutInput = document.querySelector("#checkOut");

if (checkInInput && checkOutInput) {
  const checkInPicker = flatpickr(checkInInput, {
    dateFormat: "M d, Y",
    minDate: "today",
    onChange: function(selectedDates) {
      checkInDate = selectedDates[0];
      if (selectedDates.length > 0) {
        const nextDay = new Date(selectedDates[0]);
        nextDay.setDate(nextDay.getDate() + 1);
        checkOutPicker.set('minDate', nextDay);

        if (checkOutDate && checkOutDate <= checkInDate) {
          checkOutPicker.clear();
          checkOutDate = null;
        }
      }
      checkInPicker.redraw();
      checkOutPicker.redraw();
    },
    onDayCreate: highlightRange
  });

  const checkOutPicker = flatpickr(checkOutInput, {
    dateFormat: "M d, Y",
    minDate: "today",
    onChange: function(selectedDates) {
      checkOutDate = selectedDates[0];
      checkInPicker.redraw();
      checkOutPicker.redraw();
    },
    onDayCreate: highlightRange
  });
}


document.addEventListener("DOMContentLoaded", () => {
  // SIGN UP MODAL
  const signUpModal = document.getElementById("signup-form");
  const openSignUpBtn = document.getElementById("signup-open");
  const closeSignUpBtn = document.getElementById("signup-close");

  if (openSignUpBtn && signUpModal && closeSignUpBtn) {
    openSignUpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signUpModal.classList.add("active-modal");
    });

    closeSignUpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signUpModal.classList.remove("active-modal");
    });

    signUpModal.addEventListener("click", (e) => {
      if (e.target === signUpModal) {
        signUpModal.classList.remove("active-modal");
      }
    });
  }

  // ======================
  // SIGN IN MODAL
  // ======================
  const signInModal = document.getElementById("signin-form"); // bu sign-in form section ID
  const openSignInBtn = document.getElementById("signin-open"); // Sign In tugma (HTML’da kerak)
  const closeSignInBtn = document.getElementById("signin-close");

  if (openSignInBtn && signInModal && closeSignInBtn) {
    openSignInBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signInModal.classList.add("active-modal");
    });

    closeSignInBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signInModal.classList.remove("active-modal");
    });

    signInModal.addEventListener("click", (e) => {
      if (e.target === signInModal) {
        signInModal.classList.remove("active-modal");
      }
    });
  }
});
