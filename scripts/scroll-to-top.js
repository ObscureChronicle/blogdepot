let isScrollBtnInitialized = false;

function setupScrollToTopButton() {
    const btn = document.getElementById('scroll-top-button');
    if (!btn || isScrollBtnInitialized) return;

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

    isScrollBtnInitialized = true; // 防止重复绑定
}

document.addEventListener('DOMContentLoaded', setupScrollToTopButton);
document.addEventListener('astro:after-swap', setupScrollToTopButton);
