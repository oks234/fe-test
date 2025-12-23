const FILE_SIZE_LIMIT = 15 * 10e6; // 15MB
const FILE_SIZE_OVER_MSG = '15MB 이하 이미지를 업로드해 주세요.';
const MORE_FILES_OVER_LENGTH_MSG =
  '추가 이미지는 최대 4장까지 등록할 수 있어요.';

console.log({ FILE_SIZE_LIMIT });

const toggleElemHidden = (element, force) => {
  if (!element) return;

  if (typeof force === 'boolean') {
    force
      ? element.setAttribute('hidden', '')
      : element.removeAttribute('hidden');
  } else {
    element.toggleAttribute(element);
  }
};
const showElem = (element) => toggleElemHidden(element, false);
const hideElem = (element) => toggleElemHidden(element, true);
const validIsElemHidden = (element) => element.hasAttribute('hidden');

const limitFileSize = (file) => {
  const isOver = file.size > FILE_SIZE_LIMIT;

  if (isOver) {
    alert(FILE_SIZE_OVER_MSG);
  }

  return isOver;
};
const loadedFileToImgEl = (file, imgEl, callback) => {
  const imageUrl = URL.createObjectURL(file);

  imgEl.src = imageUrl;
  imgEl.onload = () => {
    URL.revokeObjectURL(imageUrl);
    callback?.();
  };
};

document.addEventListener('DOMContentLoaded', function () {
  mainImage();
  moreImages();
});

function mainImage() {
  const section = document.getElementById('main-image');

  if (!section) return;

  const display = section.querySelector('.js-main-image-disp');
  const btns = section.querySelectorAll('.js-main-image-btn');
  const input = section.querySelector('.js-main-image-input');
  const imgEl = section.querySelector('.js-main-image');

  if (!display || !btns?.length || !input || !imgEl) return;

  for (const btn of [...btns, imgEl]) {
    btn.addEventListener('click', () => {
      input.click();
    });
  }

  input.addEventListener('change', () => {
    if (input.files.length === 0) return;

    const file = input.files[0];
    const isSizeOver = limitFileSize(file);

    if (isSizeOver) return;

    loadedFileToImgEl(file, imgEl, () => {
      showElem(imgEl);
      hideElem(display);
    });
  });
}

function moreImages() {
  const section = document.getElementById('more-images');

  if (!section) return;

  const boxes = [...section.querySelectorAll('.js-more-images-box')];
  const imgEls = boxes.map((box) => box.querySelector('img'));
  const boxInputs = boxes.map((box) => box.querySelector('input'));
  const input = section.querySelector('.js-more-images-input');

  const getEmptyBox = () =>
    boxes.find((el) => {
      const imgEl = el.querySelector('img');

      return !validIsElemHidden(el) && validIsElemHidden(imgEl);
    });
  const getVisibleBoxIndex = () =>
    boxes.findLastIndex((el) => !validIsElemHidden(el));
  const getNextBox = () => {
    const visibleBox = getVisibleBoxIndex();

    return boxes[visibleBox + 1];
  };
  const getEmptyImgEls = () =>
    imgEls.filter((imgEl) => validIsElemHidden(imgEl));

  if (!boxes?.length || !imgEls?.length || !boxInputs?.length || !input) return;

  console.log(getEmptyImgEls());

  for (const box of boxes) {
    box.addEventListener('click', (event) => {
      const imgEl = event.currentTarget.querySelector('img');
      const isImgVisible = !validIsElemHidden(imgEl);

      if (isImgVisible) return;

      input.click();
    });
  }

  for (const imgEl of imgEls) {
    imgEl.addEventListener('click', (event) => {
      const input = event.currentTarget
        .closest('.js-more-images-box')
        .querySelector('input');

      if (!input) return;

      input.click();
    });
  }

  input.addEventListener('change', () => {
    if (input.files.length === 0) return;

    const emptyImgElLength = getEmptyImgEls().length;
    const isFilesOverEmptyImgElLength = input.files.length > emptyImgElLength;

    if (isFilesOverEmptyImgElLength) return alert(MORE_FILES_OVER_LENGTH_MSG);

    for (const file of input.files) {
      const isSizeOver = limitFileSize(file);

      if (isSizeOver) continue;

      const box = getEmptyBox();

      if (!box) return;

      const imgEl = box.querySelector('img');

      loadedFileToImgEl(file, imgEl);
      showElem(imgEl);
      showElem(getNextBox());
    }
  });

  for (const input of boxInputs) {
    input.addEventListener('change', () => {
      if (input.files.length === 0) return;

      const file = input.files[0];
      const isSizeOver = limitFileSize(file);

      if (isSizeOver) return;

      console.log({ file, isSizeOver });

      const imgEl = input.closest('.js-more-images-box').querySelector('img');

      console.log();

      loadedFileToImgEl(file, imgEl);
    });
  }

  console.log({ section, boxes, input });
}
