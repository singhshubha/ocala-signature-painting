
(function () {
  "use strict";

  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navToggleIcon = document.getElementById("navToggleIcon");
  var mobileMenu = document.getElementById("mobileMenu");
  var yearEl = document.getElementById("year");

  var LIST_ICON = '<path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/>';
  var CLOSE_ICON = '<path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>';

  yearEl.textContent = new Date().getFullYear();

  var scrollSentinel = document.getElementById("scrollSentinel");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) {
        nav.classList.toggle("is-scrolled", !entries[0].isIntersecting);
      },
      { rootMargin: "-8px 0px 0px 0px", threshold: 0 }
    ).observe(scrollSentinel);
  }

  var navSectionIds = ["services", "process", "gallery", "reviews", "area"];

  function setActiveNavLink(activeId) {
    navSectionIds.forEach(function (id) {
      var links = document.querySelectorAll('a[href="#' + id + '"]');
      links.forEach(function (link) {
        link.classList.toggle("is-active", id === activeId);
      });
    });
  }

  if ("IntersectionObserver" in window) {
    var navSections = navSectionIds
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveNavLink(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    navSections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  function closeMenu() {
    mobileMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggleIcon.innerHTML = LIST_ICON;
  }

  navToggle.addEventListener("click", function () {
    var isOpen = mobileMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggleIcon.innerHTML = isOpen ? CLOSE_ICON : LIST_ICON;
  });

  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var form = document.getElementById("estimateForm");
  var formSuccess = document.getElementById("formSuccess");

  function setError(fieldName, hasError) {
    var field = form.querySelector('[data-field="' + fieldName + '"]');
    field.classList.toggle("has-error", hasError);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var email = form.email.value.trim();
    var project = form.project.value;
    var message = form.message.value.trim();

    var nameValid = name.length > 1;
    var phoneValid = phone.length > 6;
    var emailValid = isValidEmail(email);
    var projectValid = project.length > 0;

    setError("name", !nameValid);
    setError("phone", !phoneValid);
    setError("email", !emailValid);
    setError("project", !projectValid);

    if (!nameValid || !phoneValid || !emailValid || !projectValid) {
      return;
    }

    var subject = "Free estimate request: " + project + " painting";
    var bodyLines = [
      "Name: " + name,
      "Phone: " + phone,
      "Email: " + email,
      "Project type: " + project,
      "",
      "Details:",
      message || "(none provided)"
    ];
    var mailto =
      "mailto:info@ocalasignaturepainting.com" +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(bodyLines.join("\n"));

    window.location.href = mailto;
    formSuccess.classList.add("is-visible");
    form.reset();
  });
})();
