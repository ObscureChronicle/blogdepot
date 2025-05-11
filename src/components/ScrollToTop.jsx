import { useEffect, useState } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleBtn = () => {
      setVisible(window.scrollY > 300);
    };

    toggleBtn(); // 初始判断一次
    window.addEventListener('scroll', toggleBtn);

    return () => {
      window.removeEventListener('scroll', toggleBtn);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      aria-label="回到顶部"
      onClick={scrollToTop}
      className={`scroll-top ${visible ? 'visible' : ''}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M3.293 12.707a1 1 0 011.414 0L10 7.414l5.293 5.293a1 1 0 001.414-1.414l-6-6a1 1 0 00-1.414 0l-6 6a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}
