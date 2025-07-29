// assets/main.js

// モバイルメニューの切り替え（該当ページにmenuがある場合）
const mobileMenu = document.getElementById('mobile-menu');
const nav = document.getElementById('nav');
if (mobileMenu && nav) {
  mobileMenu.addEventListener('click', () => {
    nav.classList.toggle('active');
    const headerIcons = document.querySelector('.header-icons');
    if (headerIcons) {
      headerIcons.classList.toggle('active');
    }
  });
}

// スクロール時のヘッダー背景色変化
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (header) {
    if (window.scrollY > 100) {
      header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    } else {
      header.style.backgroundColor = '#ffffff';
    }
  }
});

// 商品カテゴリーリンクのクリックイベント（nav要素内）
document.querySelectorAll('nav ul li a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const category = this.getAttribute('href').substring(1);
    alert(`${category} カテゴリーの商品一覧ページに移動します。`);
  });
});

// 検索アイコンのクリックイベント
const searchIcon = document.querySelector('.search-icon');
if (searchIcon) {
  searchIcon.addEventListener('click', function(e) {
    e.preventDefault();
    alert('検索機能を開きます。');
  });
}

// ログインアイコンのクリックイベント
const loginIcon = document.querySelector('.login-icon');
if (loginIcon) {
  loginIcon.addEventListener('click', function(e) {
    e.preventDefault();
    alert('ログイン/会員ページを開きます。');
  });
}

// ショッピングガイドの開閉処理
const guideTitles = document.querySelectorAll('.guide-title');
guideTitles.forEach(title => {
  title.addEventListener('click', () => {
    title.classList.toggle('active');
    const content = title.nextElementSibling;
    if (content) {
      content.style.display = (content.style.display === 'block') ? 'none' : 'block';
    }
  });
});
