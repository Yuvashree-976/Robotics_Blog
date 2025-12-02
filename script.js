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

    /* ---------- DRAFT RESTORE ---------- */
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const data = JSON.parse(savedDraft);
        if (data.fullName && fullName) fullName.value = data.fullName;
        if (data.email && email) email.value = data.email;
        if (data.interest && interest) interest.value = data.interest;
        if (data.reason && reason) reason.value = data.reason;
        // password is not restored for security

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

    [fullName, email, password, interest, reason].forEach((field) => {
      if (!field) return;
      field.addEventListener("input", saveDraft);
      field.addEventListener("change", saveDraft);
    });

    /* ---------- HELPER FUNCTIONS (tutorial-style) ---------- */

    function clearFieldState(input) {
      if (!input) return;
      input.classList.remove("input-error", "input-success");
      const msg = input.nextElementSibling;
      if (msg && msg.classList.contains("error-message")) {
        msg.remove();
      }
    }

    function showError(input, message) {
      clearFieldState(input);
      input.classList.add("input-error");

      let error = input.nextElementSibling;
      if (!error || !error.classList.contains("error-message")) {
        error = document.createElement("div");
        error.className = "error-message";
        input.insertAdjacentElement("afterend", error);
      }
      error.textContent = message;
    }

    function showSuccess(input) {
      clearFieldState(input);
      input.classList.add("input-success");
      // success has no extra message
    }

    function isRequired(value) {
      return value.trim() !== "";
    }

    function isBetween(len, min, max) {
      return len >= min && len <= max;
    }

    function isEmailValid(emailValue) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(emailValue);
    }

    // strong password like in the example page
    function isPasswordSecure(pass) {
      const re =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      return re.test(pass);
    }

    /* ---------- FIELD-LEVEL VALIDATORS ---------- */

    function validateFullName() {
      const value = fullName.value.trim();

      if (!isRequired(value)) {
        showError(fullName, "Name is required.");
        return false;
      }

      if (!isBetween(value.length, 3, 25)) {
        showError(fullName, "Name must be between 3 and 25 characters.");
        return false;
      }

      if (!/^[A-Za-z\s]+$/.test(value)) {
        showError(
          fullName,
          "Name should contain only letters and spaces."
        );
        return false;
      }

      showSuccess(fullName);
      return true;
    }

    function validateEmail() {
      const value = email.value.trim();

      if (!isRequired(value)) {
        showError(email, "Email is required.");
        return false;
      }

      if (!isEmailValid(value)) {
        showError(email, "Please enter a valid email (example@domain.com).");
        return false;
      }

      showSuccess(email);
      return true;
    }

    function validatePassword() {
      const value = password.value;

      if (!isRequired(value)) {
        showError(password, "Password is required.");
        return false;
      }

      if (!isPasswordSecure(value)) {
        showError(
          password,
          "Password must be at least 8 characters with 1 lowercase, 1 uppercase, 1 number, and 1 special character."
        );
        return false;
      }

      showSuccess(password);
      return true;
    }

    function validateInterest() {
      const value = interest.value;

      if (!isRequired(value)) {
        showError(interest, "Please choose your focus area.");
        return false;
      }

      showSuccess(interest);
      return true;
    }

    function validateReason() {
      const value = reason.value.trim();

      if (!value) {
        // optional field: empty is allowed
        clearFieldState(reason);
        return true;
      }

      if (value.length < 10) {
        showError(
          reason,
          "Please write at least 10 characters or leave it empty."
        );
        return false;
      }

      showSuccess(reason);
      return true;
    }

    /* ---------- LIVE VALIDATION (on input / change) ---------- */
/* ---------- LIVE VALIDATION (on input / change / blur) ---------- */

// Name
if (fullName) {
  fullName.addEventListener("input", validateFullName);
  fullName.addEventListener("blur", validateFullName);   // ← fires when you press Tab
}

// Email
if (email) {
  email.addEventListener("input", validateEmail);
  email.addEventListener("blur", validateEmail);         // ← on Tab / focus out
}

// Password
if (password) {
  password.addEventListener("input", validatePassword);
  password.addEventListener("blur", validatePassword);   // ← on Tab
}

// Interest (select)
if (interest) {
  interest.addEventListener("change", validateInterest); // changes option
  interest.addEventListener("blur", validateInterest);   // leaves the dropdown
}

// Reason (textarea)
if (reason) {
  reason.addEventListener("input", validateReason);
  reason.addEventListener("blur", validateReason);       // on Tab
}


    /* ---------- SUBMIT HANDLER ---------- */

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const isNameOk = validateFullName();
      const isEmailOk = validateEmail();
      const isPasswordOk = validatePassword();
      const isInterestOk = validateInterest();
      const isReasonOk = validateReason();

      if (!(isNameOk && isEmailOk && isPasswordOk && isInterestOk && isReasonOk)) {
        const firstError = form.querySelector(".input-error");
        if (firstError) firstError.focus();
        return;
      }

      // ✅ All good
      localStorage.removeItem(DRAFT_KEY);
      form.reset();

      [fullName, email, password, interest, reason].forEach((input) => {
        if (!input) return;
        clearFieldState(input);
      });

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