document.addEventListener("DOMContentLoaded", function () {
  marked.setOptions({
    highlight: function (code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
    breaks: true,
    gfm: true,
  });

  const markdownContentElement = document.getElementById("markdown-content");
  const mainContentArea = document.getElementById("main-content-area");
  const tocList = document.getElementById("toc-list");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const taskToggle = document.getElementById("task-toggle");
  const taskbar = document.getElementById("taskbar");
  const taskbarMobileToggle = document.getElementById("taskbar-mobile-toggle");
  const fontIncreaseBtn = document.getElementById("font-increase");
  const fontDecreaseBtn = document.getElementById("font-decrease");
  const fontResetBtn = document.getElementById("font-reset");
  const btnToggleDarkMode = document.getElementById("btn-toggle-dark-mode");
  const btnPrint = document.getElementById("btn-print");
  const btnFullscreen = document.getElementById("btn-fullscreen");
  const exitFullscreenBtn = document.getElementById("exit-fullscreen-btn");
  const highlightThemeLink = document.getElementById("highlight-theme");

  fetch("theory.md")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.text();
    })
    .then((markdownText) => {
      renderMarkdown(markdownText);
    })
    .catch((error) => {
      console.error("Error loading markdown file:", error);
      markdownContentElement.innerHTML = `
          <div class="markdown-content">
              <h1>Error Loading Content</h1>
              <p>There was a problem loading the markdown file. Please make sure "theory.md" exists and is accessible.</p>
              <p>Error details: ${error.message}</p>
          </div>`;
      tocList.innerHTML = "<li>Content failed to load</li>";
    });

  function renderMarkdown(markdownText) {
    markdownContentElement.innerHTML = marked.parse(markdownText);
    const firstH1 = markdownContentElement.querySelector("h1");
    if (firstH1) {
      document.title = `${firstH1.textContent} | LPV - Distributed Systems Lab`;
    }
    generateTOC();
    applySyntaxHighlighting();
  }

  function applySyntaxHighlighting() {
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
  }

  function generateTOC() {
    tocList.innerHTML = "";
    const assignmentElements = Array.from(
      markdownContentElement.querySelectorAll("strong")
    ).filter(
      (el) =>
        el.textContent.includes("Assignment") && el.textContent.includes(":")
    );
    let elementsForTOC = [];
    if (assignmentElements.length > 0) {
      elementsForTOC = assignmentElements.map((element, index) => {
        const container =
          element.closest("p, h1, h2, h3, h4, h5, h6") || element.parentElement;
        if (!container.id) container.id = `assignment-toc-${index}`;
        return { element: container, text: element.textContent, level: 1 };
      });
    } else {
      const headings = markdownContentElement.querySelectorAll("h1, h2, h3");
      if (headings.length === 0) {
        tocList.innerHTML = "<li>No headings found</li>";
        return;
      }
      headings.forEach((heading, index) => {
        if (!heading.id) heading.id = `heading-toc-${index}`;
        elementsForTOC.push({
          element: heading,
          text: heading.textContent,
          level: parseInt(heading.tagName.charAt(1), 10),
        });
      });
    }
    if (elementsForTOC.length === 0) {
      tocList.innerHTML = "<li>No content for ToC</li>";
      return;
    }
    elementsForTOC.forEach((item) => {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${item.element.id}`;
      link.textContent = item.text;
      link.style.paddingLeft = `${(item.level - 1) * 15}px`;
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const targetElement = document.querySelector(this.getAttribute("href"));
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
        if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
          sidebar.classList.remove("active");
        }
      });
      listItem.appendChild(link);
      tocList.appendChild(listItem);
    });
  }

  let isDarkMode = localStorage.getItem("theme") === "dark";
  if (
    localStorage.getItem("theme") === null &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    isDarkMode = true;
  }

  function applyTheme() {
    const sunIcon = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
          </svg> Toggle Dark Mode`;
    const moonIcon = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg> Toggle Light Mode`;
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      btnToggleDarkMode.innerHTML = moonIcon;
      highlightThemeLink.href =
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css";
      document.documentElement.style.setProperty(
        "--accent-rgb",
        "142, 68, 173"
      );
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      btnToggleDarkMode.innerHTML = sunIcon;
      highlightThemeLink.href =
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-light.min.css";
      document.documentElement.style.setProperty(
        "--accent-rgb",
        "255, 138, 101"
      );
      localStorage.setItem("theme", "light");
    }
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    applyTheme();
  }
  btnToggleDarkMode.addEventListener("click", toggleTheme);
  applyTheme();

  function checkWindowSizeAndToggles() {
    if (window.innerWidth <= 768) {
      menuToggle.style.display = "flex";
      taskbarMobileToggle.style.display = "flex";
      if (taskToggle) taskToggle.style.display = "none";
    } else {
      menuToggle.style.display = "none";
      taskbarMobileToggle.style.display = "none";
      if (taskToggle) taskToggle.style.display = "flex";
      sidebar.classList.remove("active");
      taskbar.classList.remove("active");
    }
  }
  menuToggle.addEventListener("click", function () {
    sidebar.classList.toggle("active");
  });
  taskbarMobileToggle.addEventListener("click", function () {
    taskbar.classList.toggle("active");
  });

  taskToggle.addEventListener("click", function () {
    taskbar.classList.toggle("collapsed");
    const isCollapsed = taskbar.classList.contains("collapsed");
    taskToggle.innerHTML = isCollapsed
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    taskToggle.title = isCollapsed ? "Open taskbar" : "Collapse taskbar";
  });

  const defaultFontSize = 16;
  let currentFontSize =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--font-size")
    ) || defaultFontSize;
  function updateFontSize(size) {
    currentFontSize = Math.max(12, Math.min(24, size));
    document.documentElement.style.setProperty(
      "--font-size",
      `${currentFontSize}px`
    );
  }
  fontIncreaseBtn.addEventListener("click", () =>
    updateFontSize(currentFontSize + 2)
  );
  fontDecreaseBtn.addEventListener("click", () =>
    updateFontSize(currentFontSize - 2)
  );
  fontResetBtn.addEventListener("click", () => updateFontSize(defaultFontSize));

  searchInput.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();
    clearHighlightsFromContent();
    if (query.length < 2) {
      searchResults.style.display = "none";
      return;
    }
    const textNodes = getAllTextNodes(markdownContentElement);
    const matches = findMatchesInTextNodes(textNodes, query);
    if (matches.length > 0) {
      displaySearchResults(matches, query);
      searchResults.style.display = "block";
      highlightQueryInContent(query, textNodes);
    } else {
      searchResults.innerHTML =
        "<div class='search-result-item'>No results found</div>";
      searchResults.style.display = "block";
    }
  });

  function getAllTextNodes(node) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    let currentNode;
    while ((currentNode = walker.nextNode())) {
      if (
        currentNode.nodeValue.trim() !== "" &&
        currentNode.parentNode.nodeName !== "SCRIPT" &&
        currentNode.parentNode.nodeName !== "STYLE"
      ) {
        textNodes.push(currentNode);
      }
    }
    return textNodes;
  }

  function findMatchesInTextNodes(textNodes, query) {
    const matches = [];
    const uniqueParentTexts = new Set();
    textNodes.forEach((node) => {
      const text = node.nodeValue.toLowerCase();
      if (text.includes(query)) {
        const parentBlock = getClosestBlockElement(node.parentNode);
        if (
          parentBlock &&
          !uniqueParentTexts.has(parentBlock.textContent.trim())
        ) {
          uniqueParentTexts.add(parentBlock.textContent.trim());
          matches.push({
            element: parentBlock,
            text: parentBlock.textContent.trim(),
            originalNode: node,
          });
        }
      }
    });
    return matches.slice(0, 10);
  }

  function getClosestBlockElement(node) {
    let current = node;
    const blockElements = [
      "P",
      "DIV",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "LI",
      "BLOCKQUOTE",
      "TD",
    ];
    while (current && current !== document.body) {
      if (blockElements.includes(current.nodeName)) return current;
      current = current.parentNode;
    }
    return node.parentNode;
  }

  function displaySearchResults(matches, query) {
    searchResults.innerHTML = "";
    matches.forEach((match) => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      let snippet = match.text;
      const queryIndex = snippet.toLowerCase().indexOf(query);
      if (snippet.length > 100) {
        const start = Math.max(0, queryIndex - 40);
        const end = Math.min(snippet.length, queryIndex + query.length + 40);
        snippet =
          (start > 0 ? "..." : "") +
          snippet.substring(start, end) +
          (end < snippet.length ? "..." : "");
      }
      item.innerHTML = snippet.replace(
        new RegExp(query, "gi"),
        (m) => `<span class="highlight">${m}</span>`
      );
      item.addEventListener("click", function () {
        if (match.element) {
          match.element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        searchResults.style.display = "none";
        searchInput.value = "";
        clearHighlightsFromContent();
      });
      searchResults.appendChild(item);
    });
  }

  function clearHighlightsFromContent() {
    const highlights = markdownContentElement.querySelectorAll(
      "span.highlight-in-text"
    );
    highlights.forEach((span) => {
      const parent = span.parentNode;
      parent.replaceChild(document.createTextNode(span.textContent), span);
      parent.normalize();
    });
  }

  function highlightQueryInContent(query, textNodes) {
    clearHighlightsFromContent();
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    textNodes.forEach((node) => {
      if (node.nodeValue.toLowerCase().includes(query)) {
        const parent = node.parentNode;
        if (
          parent &&
          parent.nodeName !== "SCRIPT" &&
          parent.nodeName !== "STYLE"
        ) {
          const parts = node.nodeValue.split(regex);
          const fragment = document.createDocumentFragment();
          parts.forEach((part) => {
            if (part.toLowerCase() === query) {
              const span = document.createElement("span");
              span.className = "highlight highlight-in-text";
              span.textContent = part;
              fragment.appendChild(span);
            } else {
              fragment.appendChild(document.createTextNode(part));
            }
          });
          parent.replaceChild(fragment, node);
        }
      }
    });
  }

  btnPrint.addEventListener("click", () => window.print());

  function updateFullscreenButtonVisuals() {
    const isFs = !!(
      document.fullscreenElement &&
      document.fullscreenElement.id === "main-content-area"
    );
    const enterIconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
    const exitIconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y1="14"></line></svg>`;

    btnFullscreen.innerHTML = isFs
      ? `${exitIconSVG} Exit Fullscreen`
      : `${enterIconSVG} Enter Fullscreen`;
    btnFullscreen.title = isFs ? "Exit Fullscreen" : "Enter Fullscreen";
    exitFullscreenBtn.style.display = isFs ? "flex" : "none";
  }

  btnFullscreen.addEventListener("click", function () {
    if (!document.fullscreenElement) {
      if (mainContentArea) {
        mainContentArea
          .requestFullscreen()
          .catch((err) =>
            console.error(
              `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
            )
          );
      }
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  });
  exitFullscreenBtn.addEventListener("click", function () {
    if (document.exitFullscreen) document.exitFullscreen();
  });
  document.addEventListener("fullscreenchange", updateFullscreenButtonVisuals);
  updateFullscreenButtonVisuals();

  window.addEventListener("resize", checkWindowSizeAndToggles);
  checkWindowSizeAndToggles();

  window.addEventListener("scroll", function () {
    const tocLinks = tocList.querySelectorAll("a");
    let currentActiveId = null;
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    tocLinks.forEach((link) => {
      const sectionId = link.getAttribute("href").substring(1);
      const section = document.getElementById(sectionId);
      if (section) {
        if (section.offsetTop <= scrollPosition) {
          currentActiveId = sectionId;
        }
        link.parentElement.classList.remove("active");
      }
    });
    if (currentActiveId) {
      const activeLink = tocList.querySelector(`a[href="#${currentActiveId}"]`);
      if (activeLink) activeLink.parentElement.classList.add("active");
    } else if (tocLinks.length > 0) {
      const firstLink = tocLinks[0];
      const firstSection = document.getElementById(
        firstLink.getAttribute("href").substring(1)
      );
      if (
        firstSection &&
        firstSection.getBoundingClientRect().top >= 0 &&
        firstSection.getBoundingClientRect().top < window.innerHeight
      ) {
        firstLink.parentElement.classList.add("active");
      }
    }
  });

  if (
    window.innerWidth > 768 &&
    window.innerWidth <= 1200 &&
    !taskbar.classList.contains("collapsed")
  ) {
    const isCollapsed = taskbar.classList.contains("collapsed");
    taskToggle.innerHTML = isCollapsed
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    taskToggle.title = isCollapsed ? "Open taskbar" : "Collapse taskbar";
  }
});
