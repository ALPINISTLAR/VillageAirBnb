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

    // Check-in day
    if (dateTime === checkInTime) {
      dayElem.classList.add('start-date');
    }

    // Check-out day
    if (dateTime === checkOutTime) {
      dayElem.classList.add('end-date');
    }
  }
}
// Check-in picker
const checkInPicker = flatpickr("#checkIn", {
  dateFormat: "M d, Y",
  minDate: "today",
  onChange: function(selectedDates) {
    checkInDate = selectedDates[0];

    if (selectedDates.length > 0) {
      const nextDay = new Date(selectedDates[0]);
      nextDay.setDate(nextDay.getDate() + 1);
      checkOutPicker.set('minDate', nextDay);

      // Cleaning if check-out date is before check-in
      if (checkOutDate && checkOutDate <= checkInDate) {
        checkOutPicker.clear();
        checkOutDate = null;
      }
    }
    // update calendar
    checkInPicker.redraw();
    checkOutPicker.redraw();
  },
  onDayCreate: highlightRange
});

// Check-out picker
const checkOutPicker = flatpickr("#checkOut", {
  dateFormat: "M d, Y",
  minDate: "today",
  onChange: function(selectedDates) {
    checkOutDate = selectedDates[0];

    // update calendar
    checkInPicker.redraw();
    checkOutPicker.redraw();
  },
  onDayCreate: highlightRange
});
