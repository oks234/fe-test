import DatePicker from 'tui-date-picker'; /* ES6 */

console.log({ DatePicker });

const FILE_SIZE_LIMIT = 15 * 10e6; // 15MB
const FILE_SIZE_OVER_MSG = '15MB 이하 이미지를 업로드해 주세요';
const MORE_FILES_OVER_LENGTH_MSG =
  '추가 이미지는 최대 4장까지 등록할 수 있어요';
const LAYOUT_NAME = {
  MAIN: 'main',
  CATEGORY: 'category',
};
const BTN_ACTIVE_CLASS = 'btn--active';
const CATEGORY_BTN_ACTIVE_LIMIT = 2;
const CATEGORY_ACTIVE_OVER_MGS = '최대 2개까지만 선택 가능해요';
const AM_PM_LABELS = {
  am: '오전',
  pm: '오후',
};
const END_TIME_OVER_MSG = '시작 시간보다 종료시간은 빠를 수 없습니다.';

const headerCloseBtns = [...document.querySelectorAll('.header__close-btn')];
const mainLayout = document.querySelector('.js-main-layout');
const categoryLayout = document.querySelector('.js-category-layout');

const detailObjs = [];

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

const filterValueNumberOnly = (value) => value.replace(/[^0-9]/g, '');

const getDetailItems = () => [...document.querySelectorAll('.js-detail-item')];
// const updateDetailItemIndex = (detailItem, index) => {
//   const numberEl = detailItem.querySelector('.js-detail-item__no');

//   if (!numberEl) return;

//   numberEl.innerText = index + 1;
// };
const updateDetailItems = () => {
  // const detailItems = detailItems;
  // const detailItemLength = detailObjs.length;
  // const useDeleteBtn = detailItemLength > 1;
  // detailItems.forEach((detailItem, index) => {
  //   const btn = detailItem.querySelector('.js-delete-detail-item');
  //   useDeleteBtn ? showElem(btn) : hideElem(btn);
  //   updateDetailItemIndex(detailItem, index);
  // });
};

document.addEventListener('DOMContentLoaded', function () {
  mainImage();
  moreImages();
  initCategorySection();
  initMeetingType();
  initDetails();
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

function initDetails() {
  const itemTemplate = document.getElementById('detail-item-template');
  const section = document.getElementById('details-section');

  if (!itemTemplate || !section) return;

  const detailItemsConainer = section.querySelector(
    '.js-detail-items-container',
  );
  const addDetailBtn = section.querySelector('.details__add-detail-btn');

  const appendDetailItem = () => {
    const clone = document.importNode(itemTemplate.content, true);

    detailItemsConainer.append(clone);

    const detailItems = getDetailItems();
    const appendedDetailItem = detailItems.at(-1);
    const detailObj = initDetailItem(appendedDetailItem);

    detailObjs.push(detailObj);
    detailObjs.forEach((detailObj, index) => {
      detailObj.updateDeleteBtn();
      detailObj.updateNumberElement(index + 1);
    });

    console.log('appendDetailItem', { detailObjs });
  };

  if (!detailItemsConainer || !addDetailBtn) return;

  addDetailBtn.addEventListener('click', appendDetailItem);

  appendDetailItem();
}

function initDetailItem(detailItem) {
  if (!detailItem) return;

  const deleteBtn = detailItem.querySelector('.js-delete-detail-item');
  const numberElement = detailItem.querySelector('.js-detail-item__no');
  const dateSelectBox = detailItem.querySelector('.js-details-select-date-box');
  const datePickerInput = dateSelectBox.querySelector('.js-date-picker-input');
  const datePickerWrapper = detailItem.querySelector('.js-date-picker-wrapper');
  const amPmToggles = [...detailItem.querySelectorAll('.js-am-pm-toggle ')];
  const inputs = [...detailItem.querySelectorAll('input')];
  const textarea = detailItem.querySelector('.js-textarea');

  const deleteThis = () => {
    const targetIndex = detailObjs.findIndex((detailObj) =>
      detailObj.validIsElement(detailItem),
    );
    detailObjs.splice(targetIndex, 1);
    detailItem.remove();
    detailObjs.forEach((detailObj, index) => {
      detailObj.updateDeleteBtn();
      detailObj.updateNumberElement(index + 1);
    });
  };

  const findAmPmToggle = (isStart) =>
    amPmToggles.find((toggle) =>
      isStart
        ? toggle.className.includes('start')
        : toggle.className.includes('end'),
    );

  const findInput = (isStart, isHour) => {
    const name = `${isStart ? 'start' : 'end'}-${isHour ? 'hour' : 'min'}`;

    return inputs.find((input) => input.name === name);
  };

  const handleAmPmToggle = (event) => {
    const { currentTarget: toggle } = event;
    const isAm = toggle.dataset.value === 'am';
    const nextValue = isAm ? 'pm' : 'am';

    toggle.dataset.value = nextValue;
    toggle.innerText = AM_PM_LABELS[nextValue];
  };

  const handleInputInput = (event) => {
    const { currentTarget: input } = event;

    input.value = filterValueNumberOnly(input.value);

    const { name } = input;
    const isStart = name.includes('start');
    const isHour = name.includes('hour');

    if (isHour && parseInt(input.value) > 12) {
      input.value = '12';
    }

    if (!isHour && parseInt(input.value) > 59) {
      input.value = '59';
    }

    const inputs = {
      start: {
        amPm: findAmPmToggle(true),
        hour: findInput(true, true),
        min: findInput(true, false),
      },
      end: {
        amPm: findAmPmToggle(false),
        hour: findInput(true, true),
        min: findInput(true, false),
      },
    };

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const startInputs = {
      amPm: findAmPmToggle(true),
      hour: findInput(true, true),
      min: findInput(true, false),
    };
    const endInputs = {
      amPm: findAmPmToggle(false),
      hour: findInput(true, true),
      min: findInput(true, false),
    };

    console.log({ isStart, isHour, inputs });
  };

  if (!deleteBtn || !dateSelectBox || !amPmToggles.length || !inputs.length)
    return;

  deleteBtn.addEventListener('click', deleteThis);

  DatePicker.localeTexts['ko'] = {
    ...DatePicker.localeTexts['ko'],
    titleFormat: 'yyyy년 MM월',
  };

  const datepicker = new DatePicker(datePickerWrapper, {
    date: new Date(),
    language: 'ko',
    input: {
      element: datePickerInput,
      format: 'yyyy년 MM월 dd일',
    },
    openers: [dateSelectBox],
    autoClose: false,
  });

  datepicker.on('change', () => {
    console.log(`Selected date: ${datepicker.getDate()}`);
    console.log(
      datePickerWrapper.querySelector('.tui-calendar-title-month').innerHTML,
    );
  });

  // datepicker.setRanges([[new Date(2025, 11, 10), new Date(2025, 12, 26)]]);

  const changeDatePickerBtn = document.createElement('button');
  changeDatePickerBtn.className =
    'change-date-picker-btn btn btn--sm btn--primary';
  changeDatePickerBtn.textContent = '선택 완료';
  datePickerWrapper
    .querySelector('.tui-datepicker')
    .append(changeDatePickerBtn);

  for (const toggle of amPmToggles) {
    toggle.addEventListener('click', handleAmPmToggle);
  }

  for (const input of inputs) {
    input.addEventListener('input', handleInputInput);
  }

  initTextarea(textarea);

  return {
    updateDeleteBtn() {
      const useDeleteBtn = detailObjs.length > 1;

      useDeleteBtn ? showElem(deleteBtn) : hideElem(deleteBtn);
    },
    updateNumberElement(index) {
      numberElement.innerText = index;
    },
    validIsElement(element) {
      return element.isEqualNode(detailItem);
    },
  };
}

function initTextarea(textarea) {
  const wrapper = textarea.closest('.textarea-wrapper');
  const count = wrapper.querySelector('.js-textarea__count');
  let isFocused = false;

  const setState = (state) => {
    wrapper.dataset.state = state;
  };

  const validate = () => {
    const minLength = parseInt(textarea.minLength);
    const lessLength = textarea.value.length < minLength;

    if (lessLength) {
      setState('error');
    } else {
      setState('success');
    }
  };

  const preventMoreThanTwoSpaces = () => {
    textarea.value = textarea.value.replace('  ', ' ');
  };

  textarea.addEventListener('focus', () => {
    isFocused = true;

    validate();
  });

  textarea.addEventListener('blur', () => {
    isFocused = false;

    if (wrapper.dataset.state === 'success') {
      wrapper.dataset.state = '';
    }
  });

  textarea.addEventListener('input', () => {
    console.log('input');
    preventMoreThanTwoSpaces();
    validate();
    count.innerHTML = `${textarea.value.length}`;
  });
}
