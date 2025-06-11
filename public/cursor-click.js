const symbols = ['☯'];

document.addEventListener('click', function (e) {
  const symbol = document.createElement('div');
  symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
  symbol.style.position = 'fixed';
  symbol.style.left = e.clientX + 'px';
  symbol.style.top = e.clientY + 'px';
  symbol.style.pointerEvents = 'none';
  symbol.style.fontSize = '24px';
  symbol.style.zIndex = 9999;
  symbol.style.userSelect = 'none';
  symbol.style.animation = 'floatUp 1s ease-out forwards';

  document.body.appendChild(symbol);

  symbol.addEventListener('animationend', () => {
    symbol.remove();
  });
});
