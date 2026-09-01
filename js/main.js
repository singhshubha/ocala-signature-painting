
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
  var formError = document.getElementById("formError");

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

    var submitBtn = form.querySelector(".form-submit");
    var submitBtnDefaultText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    formError.classList.remove("is-visible");
    formSuccess.classList.remove("is-visible");

    var formData = new FormData(form);

    fetch("https://formsubmit.co/ajax/info@ocalasignaturepainting.com", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("FormSubmit request failed with status " + response.status);
        }
        return response.json();
      })
      .then(function () {
        formSuccess.classList.add("is-visible");
        form.reset();
      })
      .catch(function () {
        formError.classList.add("is-visible");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtnDefaultText;
      });
  });

  var galleryTrack = document.getElementById("galleryTrack");
  var galleryDots = document.getElementById("galleryDots");
  var galleryPrev = document.querySelector("[data-gallery-prev]");
  var galleryNext = document.querySelector("[data-gallery-next]");
  var galleryController = null;

  if (galleryTrack && galleryDots && galleryPrev && galleryNext) {
    var gallerySlides = Array.prototype.slice.call(galleryTrack.children);
    var galleryCount = gallerySlides.length;
    var galleryActiveIndex = 0;

    // Coverflow depth/offset recipe per distance-from-active, tiered like the
    // rest of the site's motion tokens: near cards stay legible, far cards
    // fall away in depth and fade rather than all moving by one fixed amount.
    var galleryTiers = [
      { xFrac: 0, z: 0, ry: 0, scale: 1, opacity: 1, zIndex: 50 },
      { xFrac: 0.3, z: -120, ry: 36, scale: 0.82, opacity: 0.85, zIndex: 40 },
      { xFrac: 0.5, z: -220, ry: 42, scale: 0.66, opacity: 0.5, zIndex: 30 },
      { xFrac: 0.64, z: -300, ry: 46, scale: 0.52, opacity: 0.22, zIndex: 20 }
    ];
    var galleryBeyond = { xFrac: 0.7, z: -340, ry: 46, scale: 0.46, opacity: 0, zIndex: 10 };

    gallerySlides.forEach(function (slide, index) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery-dot";
      dot.setAttribute("aria-label", "Go to photo " + (index + 1));
      dot.addEventListener("click", function () {
        setGalleryActive(index);
      });
      galleryDots.appendChild(dot);
    });
    var galleryDotEls = Array.prototype.slice.call(galleryDots.children);

    function galleryOffset(index) {
      var raw = index - galleryActiveIndex;
      if (raw > galleryCount / 2) {
        raw -= galleryCount;
      } else if (raw < -galleryCount / 2) {
        raw += galleryCount;
      }
      return raw;
    }

    function applyGalleryTransforms() {
      var trackWidth = galleryTrack.getBoundingClientRect().width || 1;
      gallerySlides.forEach(function (slide, i) {
        var offset = galleryOffset(i);
        var abs = Math.abs(offset);
        var sign = offset === 0 ? 0 : offset / abs;
        var tier = galleryTiers[abs] || galleryBeyond;
        var x = sign * tier.xFrac * trackWidth;
        var ry = -sign * tier.ry;
        slide.style.transform =
          "translate(-50%, -50%) translateX(" + x + "px) translateZ(" + tier.z + "px) rotateY(" + ry + "deg) scale(" + tier.scale + ")";
        slide.style.opacity = String(tier.opacity);
        slide.style.zIndex = String(tier.zIndex);
        slide.style.pointerEvents = tier.opacity === 0 ? "none" : "auto";
        slide.classList.toggle("is-active", abs === 0);
        var openBtn = slide.querySelector(".gallery-open");
        if (openBtn) {
          openBtn.tabIndex = abs === 0 ? 0 : -1;
        }
      });
      galleryDotEls.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === galleryActiveIndex);
      });
    }

    function setGalleryActive(index) {
      galleryActiveIndex = (index + galleryCount) % galleryCount;
      applyGalleryTransforms();
    }

    galleryPrev.addEventListener("click", function () {
      setGalleryActive(galleryActiveIndex - 1);
    });
    galleryNext.addEventListener("click", function () {
      setGalleryActive(galleryActiveIndex + 1);
    });

    // Drag/swipe (pointer events unify mouse, touch, and pen)
    var galleryPointerId = null;
    var galleryPointerStartX = 0;
    var galleryPointerDeltaX = 0;

    galleryTrack.addEventListener("pointerdown", function (event) {
      galleryPointerId = event.pointerId;
      galleryPointerStartX = event.clientX;
      galleryPointerDeltaX = 0;
    });
    galleryTrack.addEventListener("pointermove", function (event) {
      if (galleryPointerId === null || event.pointerId !== galleryPointerId) {
        return;
      }
      galleryPointerDeltaX = event.clientX - galleryPointerStartX;
    });
    function galleryPointerEnd(event) {
      if (galleryPointerId === null || event.pointerId !== galleryPointerId) {
        return;
      }
      if (Math.abs(galleryPointerDeltaX) > 40) {
        setGalleryActive(galleryActiveIndex + (galleryPointerDeltaX < 0 ? 1 : -1));
      }
      galleryPointerId = null;
      galleryPointerDeltaX = 0;
    }
    galleryTrack.addEventListener("pointerup", galleryPointerEnd);
    galleryTrack.addEventListener("pointercancel", galleryPointerEnd);

    window.addEventListener("resize", applyGalleryTransforms);

    applyGalleryTransforms();

    galleryController = {
      isActive: function (index) {
        return index === galleryActiveIndex;
      },
      setActive: setGalleryActive
    };
  }

  document.querySelectorAll(".compare-range").forEach(function (range) {
    var compare = range.closest(".compare");
    if (!compare) {
      return;
    }
    range.addEventListener("input", function () {
      compare.style.setProperty("--compare-pos", range.value + "%");
    });
  });

  var lightbox = document.getElementById("lightbox");
  var galleryOpenButtons = Array.prototype.slice.call(document.querySelectorAll(".gallery-open"));
  if (lightbox && galleryOpenButtons.length) {
    var lightboxImage = document.getElementById("lightboxImage");
    var lightboxCaption = document.getElementById("lightboxCaption");
    var lightboxCloseEls = Array.prototype.slice.call(lightbox.querySelectorAll("[data-lightbox-close]"));
    var lightboxPrevBtn = lightbox.querySelector("[data-lightbox-prev]");
    var lightboxNextBtn = lightbox.querySelector("[data-lightbox-next]");
    var lightboxFocusable = [lightboxPrevBtn, lightboxNextBtn].concat(
      Array.prototype.slice.call(lightbox.querySelectorAll(".lightbox-close"))
    );

    var lightboxSlides = galleryOpenButtons.map(function (button) {
      var img = button.querySelector("img");
      var figure = button.closest(".gallery-slide");
      var caption = figure ? figure.querySelector("figcaption") : null;
      return {
        src: img ? img.getAttribute("src") : "",
        alt: img ? img.getAttribute("alt") : "",
        caption: caption ? caption.textContent : ""
      };
    });

    var lightboxIndex = 0;
    var lightboxOpenerEl = null;

    function showLightboxSlide(index) {
      lightboxIndex = (index + lightboxSlides.length) % lightboxSlides.length;
      var slide = lightboxSlides[lightboxIndex];
      lightboxImage.src = slide.src;
      lightboxImage.alt = slide.alt;
      lightboxCaption.textContent = slide.caption;
    }

    function openLightbox(index, openerEl) {
      lightboxOpenerEl = openerEl || null;
      showLightboxSlide(index);
      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      lightbox.querySelector(".lightbox-close").focus();
      document.addEventListener("keydown", onLightboxKeydown);
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.classList.remove("lightbox-open");
      document.removeEventListener("keydown", onLightboxKeydown);
      lightboxImage.src = "";
      if (lightboxOpenerEl) {
        lightboxOpenerEl.focus();
      }
    }

    function onLightboxKeydown(event) {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        showLightboxSlide(lightboxIndex - 1);
      } else if (event.key === "ArrowRight") {
        showLightboxSlide(lightboxIndex + 1);
      } else if (event.key === "Tab") {
        var focusable = lightboxFocusable.filter(Boolean);
        var firstEl = focusable[0];
        var lastEl = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === firstEl) {
          event.preventDefault();
          lastEl.focus();
        } else if (!event.shiftKey && document.activeElement === lastEl) {
          event.preventDefault();
          firstEl.focus();
        }
      }
    }

    galleryOpenButtons.forEach(function (button, index) {
      button.addEventListener("click", function () {
        // In the coverflow, a click on a card that isn't centered brings it
        // forward instead of opening it straight away — matches the toggle
        // interaction; a second click (now centered) opens the lightbox.
        if (galleryController && !galleryController.isActive(index)) {
          galleryController.setActive(index);
          return;
        }
        openLightbox(index, button);
      });
    });

    lightboxCloseEls.forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
    lightboxPrevBtn.addEventListener("click", function () {
      showLightboxSlide(lightboxIndex - 1);
    });
    lightboxNextBtn.addEventListener("click", function () {
      showLightboxSlide(lightboxIndex + 1);
    });
  }

  var motionToggle = document.getElementById("motionToggle");
  if (motionToggle) {
    var MOTION_PAUSED_KEY = "osp-motion-paused";
    var prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function setMotionPaused(isPaused) {
      document.body.classList.toggle("motion-paused", isPaused);
      motionToggle.classList.toggle("is-paused", isPaused);
      motionToggle.setAttribute("aria-pressed", String(isPaused));
      motionToggle.setAttribute(
        "aria-label",
        isPaused ? "Resume background animations" : "Pause background animations"
      );
    }

    var storedPreference;
    try {
      storedPreference = window.localStorage.getItem(MOTION_PAUSED_KEY);
    } catch (e) {
      storedPreference = null;
    }

    setMotionPaused(storedPreference === "true" && !prefersReducedMotionQuery.matches);

    motionToggle.addEventListener("click", function () {
      var isPaused = !document.body.classList.contains("motion-paused");
      setMotionPaused(isPaused);
      try {
        window.localStorage.setItem(MOTION_PAUSED_KEY, String(isPaused));
      } catch (e) {
        /* localStorage unavailable; preference just won't persist */
      }
    });
  }
})();
