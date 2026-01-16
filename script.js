// Configuration
const API_BASE_URL = "https://newsround-api.onrender.com";
let currentCategory = "general";
let currentPage = 1;
let currentQuery = "";
let isLoading = false;
let hasMore = true;

// DOM Elements
const elements = {
  newsContainer: document.getElementById("news-container"),
  loadMoreBtn: document.getElementById("load-more-btn"),
  loading: document.getElementById("loading"),
  noResults: document.getElementById("no-results"),
  searchInput: document.getElementById("search-input"),
  searchBtn: document.getElementById("search-btn"),
  themeToggle: document.getElementById("theme-toggle"),
  backToTop: document.getElementById("back-to-top"),
  categoryBtns: document.querySelectorAll(".category-btn"),
  viewBtns: document.querySelectorAll(".view-btn"),
};

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  await initApp();
});

// Initialize App
async function initApp() {
  // Load theme
  loadTheme();

  await loadNews();

  // Setup event listeners
  setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
  // Category buttons
  elements.categoryBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const category = btn.dataset.category;
      if (category !== currentCategory) {
        await setActiveCategory(btn, category);
      }
    });
  });

  // View toggle
  elements.viewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      elements.viewBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      elements.newsContainer.classList.toggle(
        "list-view",
        btn.dataset.view === "list"
      );
    });
  });

  // Search
  elements.searchBtn.addEventListener("click", handleSearch);
  elements.searchInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") await handleSearch();
  });

  // Load more
  elements.loadMoreBtn.addEventListener("click", loadMoreNews);

  // Theme toggle
  elements.themeToggle.addEventListener("click", toggleTheme);

  // Scroll events
  window.addEventListener("scroll", handleScroll);

  // Back to top
  elements.backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Footer category links
  document
    .querySelectorAll(".footer-links a[data-category]")
    .forEach((link) => {
      link.addEventListener("click", async (e) => {
        e.preventDefault();
        const category = link.dataset.category;
        await setActiveCategory(null, category);
        document.querySelector(".news-section").scrollIntoView({
          behavior: "smooth",
        });
      });
    });

  // Mobile menu functionality
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".nav-menu");

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      navMenu.style.display =
        navMenu.style.display === "flex" ? "none" : "flex";
      if (navMenu.style.display === "flex") {
        // Show menu
        navMenu.style.flexDirection = "column";
        navMenu.style.position = "absolute";
        navMenu.style.top = "70px";
        navMenu.style.left = "0";
        navMenu.style.right = "0";
        navMenu.style.background = "var(--light-color)";
        navMenu.style.padding = "20px";
        navMenu.style.boxShadow = "var(--shadow-lg)";
        navMenu.style.zIndex = "1000";
        navMenu.style.gap = "15px";

        // Update background for dark mode
        if (document.body.classList.contains("dark-mode")) {
          navMenu.style.background = "var(--gray-light)";
        }
      }
    });

    if (isMobile()) {
      // Close menu when clicking menu items
      navMenu.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          navMenu.style.display = "none";
        });
      });

      // Close menu when clicking elsewhere
      document.addEventListener("click", (e) => {
        if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
          navMenu.style.display = "none";
        }
      });
    }
  }

  // Reset menu display on window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && navMenu) {
      navMenu.style.display = "";
      navMenu.style.flexDirection = "";
      navMenu.style.position = "";
      navMenu.style.top = "";
      navMenu.style.left = "";
      navMenu.style.right = "";
      navMenu.style.background = "";
      navMenu.style.padding = "";
      navMenu.style.boxShadow = "";
      navMenu.style.zIndex = "";
      navMenu.style.gap = "";
    }
  });
}
function isMobile() {
  if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
    return true;
  } else {
    return false;
  }
}
// Set Active Category
async function setActiveCategory(activeBtn, category) {
  // Update UI
  if (activeBtn) {
    elements.categoryBtns.forEach((btn) => btn.classList.remove("active"));
    activeBtn.classList.add("active");
  } else {
    elements.categoryBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.category === category);
    });
  }

  // Reset and load news
  currentCategory = category;
  currentPage = 1;
  currentQuery = "";
  elements.searchInput.value = "";
  elements.newsContainer.innerHTML = "";
  // Hide no results message when resetting
  elements.noResults.style.display = "none";
  elements.loadMoreBtn.style.display = "block";
  hasMore = true;

  await loadNews();
}

// Handle Search
async function handleSearch() {
  const query = elements.searchInput.value.trim();
  if (query) {
    currentQuery = query;
    currentCategory = "general";
    currentPage = 1;
    elements.newsContainer.innerHTML = "";
    // Hide no results message when searching
    elements.noResults.style.display = "none";
    elements.loadMoreBtn.style.display = "block";
    await loadNews();

    // Update category button states
    elements.categoryBtns.forEach((btn) => btn.classList.remove("active"));
    elements.categoryBtns[0].classList.add("active");
  }
}

// Load News
async function loadNews() {
  if (isLoading) return;

  isLoading = true;
  // Hide no results message and load more button when starting to load
  elements.noResults.style.display = "none";
  elements.loadMoreBtn.style.display = "none";
  elements.loading.style.display = "block";

  try {
    let url;
    if (currentQuery) {
      url = `${API_BASE_URL}/search_news?content=${encodeURIComponent(
        currentQuery
      )}&page=${currentPage}`;
    } else {
      url = `${API_BASE_URL}/get_news_by_category?category=${currentCategory}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.articles && data.articles.length > 0) {
      // Has news data, render it
      renderNews(data.articles);
      hasMore = data.articles.length === 12;
      // Ensure no results message is hidden
      elements.noResults.style.display = "none";
    } else {
      // No news data
      if (currentPage === 1) {
        // First page has no data, show no results message
        showNoResults();
      }
      hasMore = false;
    }
  } catch (error) {
    console.error("Error loading news:", error);
    if (currentPage === 1) {
      showErrorMessage(
        "Failed to load news. Please check your connection and try again."
      );
    }
    hasMore = false;
  } finally {
    isLoading = false;
    elements.loading.style.display = "none";
    elements.loadMoreBtn.disabled = false;
    // Only show load more button if there's more news
    elements.loadMoreBtn.style.display = hasMore ? "block" : "none";
  }
}

// Render News Card
function renderNewsCard(article, isFeatured = false) {
  // Select image size based on device width
  const isMobile = window.innerWidth <= 768;
  const imageSize = isMobile ? "400" : "800";

  const imageUrl =
    article.urlToImage ||
    `https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=${imageSize}&q=80`;

  const publishedDate = new Date(article.publishedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
  const sourceName = article.source?.name || "Unknown Source";
  const category =
    currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);

  // Add special class for featured news
  const featuredClass = isFeatured ? "featured-main" : "";

  const newsId = Date.now() + Math.random().toString(36).substr(2, 9);

  return `
        <div class="news-card ${featuredClass}" onclick="viewNewsDetail('${encodeURIComponent(
    JSON.stringify(article)
  )}', '${newsId}')">
            <img 
                src="${imageUrl}" 
                alt="${article.title}" 
                class="news-image"
                loading="${isMobile ? "lazy" : "eager"}"
                ${isMobile ? 'decoding="async"' : ""}
            >
            <div class="news-content">
                <div class="news-meta">
                    <span class="news-category">${category}</span>
                    <span>${publishedDate}</span>
                </div>
                <h3 class="news-title">${article.title || "No Title"}</h3>
                <p class="news-description">${
                  article.description || "No description available"
                }</p>
                <div class="news-meta">
                    <span>${sourceName}</span>
                    <div class="read-more">
                        Read Full Story <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function viewNewsDetail(articleJson, newsId) {
  try {
    const article = JSON.parse(decodeURIComponent(articleJson));
    localStorage.setItem("currentNews", JSON.stringify(article));
    article.category = currentCategory;
    window.location.href = `detail.html?id=${newsId}`;
  } catch (error) {
    console.error("Error viewing news detail:", error);
    window.open(article.url, "_blank");
  }
}

// Render News
function renderNews(articles) {
  // Hide no results message before rendering
  elements.noResults.style.display = "none";

  if (currentPage === 1) {
    elements.newsContainer.innerHTML = "";
  }

  const newsHtml = articles.map((article) => renderNewsCard(article)).join("");
  elements.newsContainer.innerHTML += newsHtml;
}

// Load More News
async function loadMoreNews() {
  currentPage++;
  await loadNews();
}

// Show No Results
function showNoResults() {
  // Clear news container
  elements.newsContainer.innerHTML = "";
  // Hide loading animation and load more button
  elements.loading.style.display = "none";
  elements.loadMoreBtn.style.display = "none";
  // Show no results message
  elements.noResults.style.display = "block";
}

// Show Error Message
function showErrorMessage(message) {
  elements.newsContainer.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <h3>${message}</h3>
            </div>
        </div>
    `;
}

// Theme Functions
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
    elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    localStorage.setItem("theme", "light");
    elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

// Scroll Handling
function handleScroll() {
  // Show/hide back to top button
  if (window.scrollY > 300) {
    elements.backToTop.classList.add("visible");
  } else {
    elements.backToTop.classList.remove("visible");
  }

  // Infinite scroll
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;

  if (scrollPosition >= pageHeight - 500 && !isLoading && hasMore) {
    loadMoreNews();
  }
}

// Handle returning from 404 page
if (localStorage.getItem("selectedCategory")) {
  const category = localStorage.getItem("selectedCategory");
  setActiveCategory(null, category);
  localStorage.removeItem("selectedCategory");
}

if (localStorage.getItem("searchQuery")) {
  const query = localStorage.getItem("searchQuery");
  document.getElementById("search-input").value = query;
  handleSearch();
  localStorage.removeItem("searchQuery");
}
