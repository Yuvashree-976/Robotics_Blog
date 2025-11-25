// script.js

document.addEventListener("DOMContentLoaded", function () {
  /* ===========================
     THEME TOGGLE + PERSISTENCE
     =========================== */
  const themeToggle = document.getElementById("theme-toggle");

  if (themeToggle) {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("theme-preference"); // "light" or "dark"

    if (savedTheme === "light") {
      themeToggle.checked = true;
    } else if (savedTheme === "dark") {
      themeToggle.checked = false;
    }

    // Save new preference when toggled
    themeToggle.addEventListener("change", function () {
      if (themeToggle.checked) {
        localStorage.setItem("theme-preference", "light");
      } else {
        localStorage.setItem("theme-preference", "dark");
      }
    });
  }

  /* ===========================
     SCROLL REVEAL ANIMATIONS
     =========================== */
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // use .is-visible to match CSS
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback: make everything visible
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  /* ===========================
     FLOATING ROBOT ASSISTANT
     =========================== */
  const assistant = document.querySelector(".assistant");
  if (assistant) {
    const toggleBtn = assistant.querySelector(".assistant-toggle");
    const closeBtn = assistant.querySelector(".assistant-close");
    const buttons = assistant.querySelectorAll("[data-assist]");
    const log = assistant.querySelector("#assistant-log");

    function addMessage(text, who = "bot") {
      if (!log) return;
      const msg = document.createElement("div");
      msg.className = `assistant-message ${who}`;
      msg.textContent = text;
      log.appendChild(msg);
      log.scrollTop = log.scrollHeight;
    }

    // Open/close by toggling class on the container
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        assistant.classList.toggle("assistant-open");
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        assistant.classList.remove("assistant-open");
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.assist;
        let reply = "";

        if (type === "register") {
          addMessage("How do I register?", "me");
          reply =
            "Go to the Register page, fill in your name, email, password, and interest area, then submit the form. Your progress is saved automatically while typing.";
        } else if (type === "about") {
          addMessage("What is RoboticsHub?", "me");
          reply =
            "RoboticsHub is your learning space for humanoids, AI robots, automation, and projects that connect software with hardware.";
        } else if (type === "news") {
          addMessage("How do I use the news page?", "me");
          reply =
            "Scroll through the main cards for curated highlights, and check the Live Robotics Updates section for simulated real-time feed.";
        }

        if (reply) addMessage(reply, "bot");
      });
    });
  }

  /* ===========================
     FORM VALIDATION + DRAFT SAVE
     (Registration page only)
     =========================== */
  const form = document.querySelector(".register-form");
  if (form) {
    const fullName = document.getElementById("fullname");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const interest = document.getElementById("interest");
    const reason = document.getElementById("reason");
    const draftStatus = document.getElementById("draft-status");
    const DRAFT_KEY = "rh-registration-draft";

    // Load draft from localStorage
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const data = JSON.parse(savedDraft);
        if (data.fullName && fullName) fullName.value = data.fullName;
        if (data.email && email) email.value = data.email;
        if (data.interest && interest) interest.value = data.interest;
        if (data.reason && reason) reason.value = data.reason;
        // For security, we usually avoid restoring passwords automatically
        if (draftStatus) {
          draftStatus.textContent =
            "Draft restored from previous session on this device.";
        }
      } catch (e) {
        console.warn("Could not parse stored draft:", e);
      }
    }

    function saveDraft() {
      const draft = {
        fullName: fullName ? fullName.value : "",
        email: email ? email.value : "",
        interest: interest ? interest.value : "",
        reason: reason ? reason.value : "",
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      if (draftStatus) {
        draftStatus.textContent =
          "Your progress is saved automatically on this device.";
      }
    }

    // Listen for changes to save draft
    [fullName, email, password, interest, reason].forEach((field) => {
      if (!field) return;
      field.addEventListener("input", saveDraft);
      field.addEventListener("change", saveDraft);
    });

    // Helper: clear errors
    function clearErrors() {
      const errors = form.querySelectorAll(".error-message");
      errors.forEach((el) => el.remove());

      const errorInputs = form.querySelectorAll(".input-error");
      errorInputs.forEach((el) => el.classList.remove("input-error"));
    }

    // Helper: show error
    function showError(input, message) {
      input.classList.add("input-error");

      let error = input.nextElementSibling;
      if (!error || !error.classList.contains("error-message")) {
        error = document.createElement("div");
        error.className = "error-message";
        input.insertAdjacentElement("afterend", error);
      }
      error.textContent = message;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      let isValid = true;
      let firstInvalid = null;

      // 1. Full name
      const nameValue = fullName.value.trim();
      if (nameValue.length < 3) {
        isValid = false;
        showError(fullName, "Name must be at least 3 characters.");
        firstInvalid = firstInvalid || fullName;
      } else if (!/^[A-Za-z\s]+$/.test(nameValue)) {
        isValid = false;
        showError(fullName, "Name should contain only letters and spaces.");
        firstInvalid = firstInvalid || fullName;
      }

      // 2. Email
      const emailValue = email.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailValue)) {
        isValid = false;
        showError(email, "Please enter a valid email address (example@domain.com).");
        firstInvalid = firstInvalid || email;
      }

      // 3. Password
      const passValue = password.value;
      if (passValue.length < 8) {
        isValid = false;
        showError(password, "Password must be at least 8 characters.");
        firstInvalid = firstInvalid || password;
      } else if (!/[A-Za-z]/.test(passValue) || !/[0-9]/.test(passValue)) {
        isValid = false;
        showError(
          password,
          "Password must contain both letters and numbers."
        );
        firstInvalid = firstInvalid || password;
      }

      // 4. Interest
      if (!interest.value) {
        isValid = false;
        showError(interest, "Please choose your focus area.");
        firstInvalid = firstInvalid || interest;
      }

      // 5. Reason (optional)
      const reasonValue = reason.value.trim();
      if (reasonValue && reasonValue.length < 10) {
        isValid = false;
        showError(
          reason,
          "Please write at least 10 characters or leave it empty."
        );
        firstInvalid = firstInvalid || reason;
      }

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // ✅ All good: clear draft & redirect
      localStorage.removeItem(DRAFT_KEY);
      form.reset();
      if (draftStatus) {
        draftStatus.textContent =
          "Registration successful! Redirecting to About page...";
      }
      window.location.href = "about.html";
    });
  }

  /* ===========================
     LIVE ROBOTICS NEWS (SIMULATED)
     =========================== */
  const liveNewsContainer = document.getElementById("live-news");
  if (liveNewsContainer) {
    const sampleNews = [
      {
        title: "Student team builds low-cost line-following robot",
        source: "Campus Robotics Club",
        time: "Just now",
      },
      {
        title: "Open-source library simplifies ROS-based navigation",
        source: "Dev Community",
        time: "5 min ago",
      },
      {
        title: "Mini quadcopter completes indoor mapping challenge",
        source: "Lab Demo",
        time: "18 min ago",
      },
    ];

    function renderLiveNews(items) {
      if (!items || items.length === 0) {
        liveNewsContainer.innerHTML =
          "<p class='live-news-status'>No updates available right now. Try again later.</p>";
        return;
      }

      const now = new Date();
      const timestamp = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const list = document.createElement("div");
      list.className = "live-news-list";

      items.forEach((item) => {
        const div = document.createElement("div");
        div.className = "live-news-item";

        const title = document.createElement("div");
        title.className = "live-news-title";
        title.textContent = item.title;

        const meta = document.createElement("div");
        meta.className = "live-news-meta";
        meta.textContent = `${item.source} • ${item.time}`;

        div.appendChild(title);
        div.appendChild(meta);
        list.appendChild(div);
      });

      liveNewsContainer.innerHTML = "";
      liveNewsContainer.appendChild(list);

      const status = document.createElement("p");
      status.className = "live-news-status";
      status.textContent = `Last updated at ${timestamp}`;
      liveNewsContainer.appendChild(status);
    }

    // Simulate async fetch delay
    liveNewsContainer.innerHTML =
      "<p class='live-news-status'>Loading live robotics updates…</p>";

    setTimeout(() => {
      renderLiveNews(sampleNews);
    }, 700);
  }
});
