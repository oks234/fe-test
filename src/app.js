const FILE_SIZE_LIMIT = 15 * 10e6; // 15MB

console.log({ FILE_SIZE_LIMIT });

document.addEventListener('DOMContentLoaded', function () {
  mainImage();
});

function mainImage() {
  const section = document.getElementById('main-image');
  const display = section.querySelector('.js-main-image-disp');
  const btns = section.querySelectorAll('.js-main-image-btn');
  const input = section.getElementById('main-image-input');
  const imgEl = section.querySelector('.js-main-image');

  if (!display || !btns?.length || !input || !imgEl) return;

  for (const btn of [...btns, imgEl]) {
    btn.addEventListener('click', () => {
      input.click();
    });
  }

  input.addEventListener('change', () => {
    if (input.files.length === 0) {
      imgEl.setAttribute('hidden', '');
      display.removeAttribute('hidden');
      return;
    }

    const file = input.files[0];

    if (!file) return;

    // 임시 URL 생성 및 이미지 소스에 할당
    const imageUrl = URL.createObjectURL(file);

    imgEl.src = imageUrl;
    imgEl.removeAttribute('hidden');
    display.setAttribute('hidden', '');

    imgEl.onload = () => URL.revokeObjectURL(imageUrl);
  });
}
