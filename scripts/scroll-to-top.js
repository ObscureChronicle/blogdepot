function setupScrollToTopButton() {
    const btn = document.getElementById('scroll-top-button');
    if (!btn) return;

    const toggleBtn = () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    };

    toggleBtn();
    window.addEventListener('scroll', toggleBtn);
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 页面加载完毕后执行一次
document.addEventListener('DOMContentLoaded', setupScrollToTopButton);
// 页面跳转后再次绑定
document.addEventListener('astro:after-swap', setupScrollToTopButton);
