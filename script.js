const BASE_URL = "https://newsround-api.onrender.com";
let currentCategory = "general";
let currentPage = 1;
let currentQuery = "";
let isLoading = false;
let hasMore = true;

// DOM元素
const elements = {
  newsContainer: document.getElementById("news-container"),
  featuredNews: document.getElementById("featured-news"),
  loadMoreBtn: document.getElementById("load-more-btn"),
  loading: document.getElementById("loading"),
  noResults: document.getElementById("no-results"),
  searchInput: document.getElementById("search-input"),
  searchBtn: document.getElementById("search-btn"),
  themeToggle: document.getElementById("theme-toggle"),
  backToTop: document.getElementById("back-to-top"),
  categoryBtns: document.querySelectorAll(".category-btn"),
  navLinks: document.querySelectorAll(".nav-link"),
  viewBtns: document.querySelectorAll(".view-btn"),
};

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

// 初始化应用
function initApp() {
  // 加载主题
  loadTheme();

  // 加载初始新闻
  loadFeaturedNews();
  loadNews();

  // 事件监听器
  setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
  // 分类按钮
  elements.categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      if (category !== currentCategory) {
        setActiveCategory(btn, category);
      }
    });
  });

  // 导航链接
  elements.navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const category = link.dataset.category;
      setActiveCategory(null, category);

      // 滚动到新闻部分
      document.querySelector(".news-section").scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  // 视图切换
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

  // 搜索
  elements.searchBtn.addEventListener("click", handleSearch);
  elements.searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  // 加载更多
  elements.loadMoreBtn.addEventListener("click", loadMoreNews);

  // 主题切换
  elements.themeToggle.addEventListener("click", toggleTheme);

  // 滚动事件
  window.addEventListener("scroll", handleScroll);

  // 返回顶部
  elements.backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // 页脚分类链接
  document
    .querySelectorAll(".footer-links a[data-category]")
    .forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const category = link.dataset.category;
        setActiveCategory(null, category);
        document.querySelector(".news-section").scrollIntoView({
          behavior: "smooth",
        });
      });
    });
}

// 设置活动分类
function setActiveCategory(activeBtn, category) {
  // 更新UI
  if (activeBtn) {
    elements.categoryBtns.forEach((btn) => btn.classList.remove("active"));
    activeBtn.classList.add("active");
  } else {
    elements.categoryBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.category === category);
    });
  }

  // 更新导航链接
  elements.navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.category === category);
  });

  // 重置并加载新闻
  currentCategory = category === "all" ? "general" : category;
  currentPage = 1;
  currentQuery = "";
  elements.searchInput.value = "";
  elements.newsContainer.innerHTML = "";
  elements.noResults.style.display = "none";
  elements.loadMoreBtn.style.display = "block";
  hasMore = true;

  // 加载新闻
  loadFeaturedNews();
  loadNews();
}

// 处理搜索
async function handleSearch() {
  const query = elements.searchInput.value.trim();
  if (query) {
    currentQuery = query;
    currentCategory = "general";
    currentPage = 1;
    elements.newsContainer.innerHTML = "";
    elements.noResults.style.display = "none";
    await loadNews();

    // 更新分类按钮状态
    elements.categoryBtns.forEach((btn) => btn.classList.remove("active"));
    elements.categoryBtns[0].classList.add("active");
  }
}

// 加载特色新闻
async function loadFeaturedNews() {
  try {
    const url = `${BASE_URL}/get_news_by_category?category=${currentCategory}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.articles && data.articles.length > 0) {
      renderFeaturedNews(data.articles);
    }
  } catch (error) {
    console.error("Error loading featured news:", error);
    elements.featuredNews.innerHTML = `
            <div class="featured-main">
                <h3>新闻加载失败</h3>
                <p>请检查网络连接或稍后重试</p>
            </div>
        `;
  }
}

// 渲染特色新闻
function renderFeaturedNews(articles) {
  let html = "";

  if (articles.length > 0) {
    // 主特色新闻
    const mainArticle = articles[0];
    html += `
            <div class="featured-main" onclick="window.open('${
              mainArticle.url
            }', '_blank')">
                <div class="news-category">${currentCategory.toUpperCase()}</div>
                <h3>${mainArticle.title || "无标题"}</h3>
                <p>${mainArticle.description || "无描述"}</p>
                <div class="read-more">阅读全文 <i class="fas fa-arrow-right"></i></div>
            </div>
        `;

    // 次特色新闻
    for (let i = 1; i < Math.min(articles.length, 3); i++) {
      const article = articles[i];
      html += `
                <div class="featured-secondary" onclick="window.open('${
                  article.url
                }', '_blank')">
                    <div class="news-category">${currentCategory.toUpperCase()}</div>
                    <h4>${article.title || "无标题"}</h4>
                    <div class="read-more">阅读全文 <i class="fas fa-arrow-right"></i></div>
                </div>
            `;
    }
  }

  elements.featuredNews.innerHTML = html;
}

// 加载新闻
async function loadNews() {
  if (isLoading || !hasMore) return;

  isLoading = true;
  elements.loading.style.display = "block";
  elements.loadMoreBtn.disabled = true;

  try {
    let url;
    if (currentQuery) {
      url = `${BASE_URL}/everything?content=${encodeURIComponent(
        currentQuery
      )}`;
    } else {
      url = `${BASE_URL}/get_news_by_category?category=${currentCategory}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.articles && data.articles.length > 0) {
      renderNews(data.articles);
      hasMore = data.articles.length === 12;
    } else {
      if (currentPage === 1) {
        showNoResults();
      }
      hasMore = false;
    }
  } catch (error) {
    console.error("Error loading news:", error);
    if (currentPage === 1) {
      elements.newsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>加载失败</h3>
                    <p>请检查网络连接或稍后重试</p>
                </div>
            `;
    }
    hasMore = false;
  } finally {
    isLoading = false;
    elements.loading.style.display = "none";
    elements.loadMoreBtn.disabled = false;
    elements.loadMoreBtn.style.display = hasMore ? "block" : "none";
  }
}

// 渲染新闻
function renderNews(articles) {
  if (currentPage === 1) {
    elements.newsContainer.innerHTML = "";
  }

  const newsHtml = articles
    .map((article) => {
      const imageUrl =
        article.urlToImage ||
        "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
      const publishedDate = new Date(article.publishedAt).toLocaleDateString(
        "zh-CN"
      );
      const sourceName = article.source?.name || "未知来源";

      return `
            <div class="news-card" onclick="window.open('${
              article.url
            }', '_blank')">
                <img src="${imageUrl}" alt="${
        article.title
      }" class="news-image">
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-category">${currentCategory.toUpperCase()}</span>
                        <span>${publishedDate}</span>
                    </div>
                    <h3 class="news-title">${article.title || "无标题"}</h3>
                    <p class="news-description">${
                      article.description || "暂无描述"
                    }</p>
                    <div class="news-meta">
                        <span>${sourceName}</span>
                        <div class="read-more">
                            阅读全文 <i class="fas fa-arrow-right"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");

  elements.newsContainer.innerHTML += newsHtml;
}

// 加载更多新闻
function loadMoreNews() {
  currentPage++;
  loadNews();
}

// 显示无结果
function showNoResults() {
  elements.newsContainer.innerHTML = "";
  elements.noResults.style.display = "block";
  elements.loadMoreBtn.style.display = "none";
}

// 主题功能
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

// 滚动处理
function handleScroll() {
  // 显示/隐藏返回顶部按钮
  if (window.scrollY > 300) {
    elements.backToTop.classList.add("visible");
  } else {
    elements.backToTop.classList.remove("visible");
  }

  // 无限滚动
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;

  if (scrollPosition >= pageHeight - 500 && !isLoading && hasMore) {
    loadMoreNews();
  }
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// 错误处理
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
    `;

  elements.newsContainer.prepend(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}
