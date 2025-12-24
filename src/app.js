const FILE_SIZE_LIMIT = 15 * 10e6; // 15MB
const FILE_SIZE_OVER_MSG = '15MB 이하 이미지를 업로드해 주세요.';
const MORE_FILES_OVER_LENGTH_MSG =
const LAYOUT_NAME = {
  MAIN: 'main',
  CATEGORY: 'category',
};
const BTN_ACTIVE_CLASS = 'btn--active';
const CATEGORY_BTN_ACTIVE_LIMIT = 2;
const CATEGORY_ACTIVE_OVER_MGS = '최대 2개까지만 선택 가능해요';

// DOM ELEMENTS
const headerCloseBtns = [...document.querySelectorAll('.header__close-btn')];

const mainLayout = document.querySelector('.js-main-layout');
const categoryLayout = document.querySelector('.js-category-layout');


console.log({ mainLayout });

const toggleLayout = () => {
  const isLayoutMain = document.body.dataset.layout === LAYOUT_NAME.MAIN;

  if (isLayoutMain) {
    document.body.dataset.layout = LAYOUT_NAME.CATEGORY;
  } else {
    document.body.dataset.layout = LAYOUT_NAME.MAIN;
  }
};

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

const validIsBtnActive = (btn) => btn.classList.contains(BTN_ACTIVE_CLASS);
const toggleBtnActive = (btn) => btn.classList.toggle(BTN_ACTIVE_CLASS);
const deactivateBtn = (btn) => btn.classList.remove(BTN_ACTIVE_CLASS);

const updateSelectBoxValue = (selectBox, value) => {
  if (!selectBox) return;

  const placeholder = selectBox.querySelector('.select-box__placeholder');
  const content = selectBox.querySelector('.select-box__content');

  if (!placeholder || !content) return;

  if (!value) {
    hideElem(content);
    showElem(placeholder);

    return;
  }

  content.textContent = value;
  hideElem(placeholder);
  showElem(content);
};


document.addEventListener('DOMContentLoaded', function () {
  mainImage();
  moreImages();
  initCategorySection();
  initMeetingType();
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

      const imgEl = input.closest('.js-more-images-box').querySelector('img');

      loadedFileToImgEl(file, imgEl);
    });
  }
}

function initCategorySection() {
  const categorySection = document.getElementById('category-section');
  const categorySelectSection = document.getElementById(
    'category-select-section',
  );

  if (!categorySection || !categorySelectSection) return;

  const selectBox = categorySection.querySelector('.select-box');
  const btns = [...categorySelectSection.querySelectorAll('.btn')];

  const getBtnValue = (btn) => btn.dataset.value;
  const getActiveBtns = () => btns.filter(validIsBtnActive);
  const updateSelectBox = () => {
    const activeBtns = getActiveBtns();

    if (activeBtns.length === 0) {
      updateSelectBoxValue(selectBox, '');

      return;
    }

    const activeValues = activeBtns.map(getBtnValue).join(', ');

    updateSelectBoxValue(selectBox, activeValues);
  };

  const handleBtnClick = (event) => {
    const btn = event.currentTarget;
    const isActive = validIsBtnActive(btn);

    if (isActive) {
      toggleBtnActive(btn);
      updateSelectBox();

      return;
    }

    const activeBtns = getActiveBtns();
    const isActiveBtnsOver = activeBtns.length === CATEGORY_BTN_ACTIVE_LIMIT;

    if (isActiveBtnsOver) {
      // TO-DO: Toast로 교체
      alert(CATEGORY_ACTIVE_OVER_MGS);

      return;
    }

    toggleBtnActive(btn);
    updateSelectBox();
  };

  if (!selectBox || !btns?.length) return;

  selectBox.addEventListener('click', () => {
    toggleLayout();

    for (const btn of headerCloseBtns) {
      btn.addEventListener('click', toggleLayout, { once: true });
    }
  });

  for (const btn of btns) {
    btn.addEventListener('click', handleBtnClick);
  }
}

function initMeetingType() {
  const section = document.getElementById('meeting-type-section');

  if (!section) return;

  const btns = [...section.querySelectorAll('.meeting-type__btn')];

  const deactivateBtns = () => btns.forEach(deactivateBtn);

  const handleBtnClick = (event) => {
    const { currentTarget: btn } = event;
    const isActive = validIsBtnActive(btn);

    if (isActive) return;

    deactivateBtns();
    toggleBtnActive(btn);
  };

  if (!btns.length) return;

  for (const btn of btns) {
    btn.addEventListener('click', handleBtnClick);
  }
}

}
}
