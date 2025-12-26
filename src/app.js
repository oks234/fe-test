import {
  addDays,
  addHours,
  clamp,
  format,
  isAfter,
  isEqual,
  setHours,
  setMinutes,
  subDays,
} from 'date-fns';
import { Notyf } from 'notyf';
import DatePicker from 'tui-date-picker';

DatePicker.localeTexts['ko'] = {
  ...DatePicker.localeTexts['ko'],
  titleFormat: 'yyyy년 M월',
};

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
const UPDATE_TIME_TRIGGERS = {
  START_TOGGLE: 'start-toggle',
  START_HOURS: 'start-hours',
  START_MINUTES: 'start-minutes',
  END_TOGGLE: 'end-toggle',
  END_HOURS: 'end-hours',
  END_MINUTES: 'end-minutes',
};
const END_TIME_OVER_MSG = '시작 시간보다 종료시간은 빠를 수 없습니다.';
const DATE_RANGE_LIMITS = {
  START: new Date(0),
  END: new Date(2999, 12, 31),
};

// Create an instance of Notyf
const notyf = new Notyf({
  duration: 2000,
  position: {
    x: 'center',
    y: 'bottom',
  },
  types: [
    {
      type: 'info',
      background: '#323232',
      icon: false,
    },
  ],
});
const detailObjs = [];

const toast = (msg) => {
  notyf.open({
    type: 'info',
    message: msg,
  });
};

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
    toast(FILE_SIZE_OVER_MSG);
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

const updateDetailObjsDatePickers = () => {
  if (detailObjs.length === 1) return;

  detailObjs.forEach((detailObj, index) => {
    const indexDiffs = { prev: null, next: null };
    const selectedNearbyDetailObj = {
      prev: detailObjs.findLast((detailObj, _index) => {
        if (_index < index && detailObj.isDateSelected) {
          indexDiffs.prev = index - _index;

          return true;
        }
      }),
      next: detailObjs.find((detailObj, _index) => {
        if (_index > index && detailObj.isDateSelected) {
          indexDiffs.next = _index - index;

          return true;
        }
      }),
    };
    const days = {
      get prev() {
        if (!selectedNearbyDetailObj.prev) return DATE_RANGE_LIMITS.START;

        return addDays(
          selectedNearbyDetailObj.prev.selectedDate,
          indexDiffs.prev,
        );
      },
      get next() {
        if (!selectedNearbyDetailObj.next) return DATE_RANGE_LIMITS.END;

        return subDays(
          selectedNearbyDetailObj.next.selectedDate,
          indexDiffs.next,
        );
      },
    };
    const needToSetRange =
      selectedNearbyDetailObj.prev || selectedNearbyDetailObj.next;
    const needToSetDate = needToSetRange && !detailObj.isDateSelected;

    if (needToSetRange) {
      const ranges = [[days.prev, days.next]];
      detailObj.setDatePickerRanges(ranges);
    }

    if (needToSetDate) {
      const dateToSet = selectedNearbyDetailObj.prev ? days.prev : days.next;
      detailObj.setDatePickerDate(dateToSet);
    }
  });
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

    if (isFilesOverEmptyImgElLength) return toast(MORE_FILES_OVER_LENGTH_MSG);

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
  const headerCloseBtns = [...document.querySelectorAll('.header__close-btn')];

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
      toast(CATEGORY_ACTIVE_OVER_MGS);

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
    updateDetailObjsDatePickers();
  };

  if (!detailItemsConainer || !addDetailBtn) return;

  addDetailBtn.addEventListener('click', appendDetailItem);

  appendDetailItem();
}

function initDetailItem(detailItem) {
  if (!detailItem) return;

  const amPmToggles = [...detailItem.querySelectorAll('.js-am-pm-toggle ')];
  const inputs = [...detailItem.querySelectorAll('input')];
  const textarea = detailItem.querySelector('.js-textarea');

  const { updateDeleteBtn } = (function initDeleteBtn() {
    const deleteBtn = detailItem.querySelector('.js-delete-detail-item');

    if (!deleteBtn) return;

    deleteBtn.addEventListener('click', () => {
      const targetIndex = detailObjs.findIndex((detailObj) =>
        detailObj.validIsElement(detailItem),
      );
      detailObjs.splice(targetIndex, 1);
      detailItem.remove();
      detailObjs.forEach((detailObj, index) => {
        detailObj.updateDeleteBtn();
        detailObj.updateNumberElement(index + 1);
      });
    });

    return {
      updateDeleteBtn() {
        const useDeleteBtn = detailObjs.length > 1;

        useDeleteBtn ? showElem(deleteBtn) : hideElem(deleteBtn);
      },
    };
  })();

  const { datepicker, getIsDateSelected } = (function initdateSelectBox() {
    const dateSelectBox = detailItem.querySelector(
      '.js-details-select-date-box',
    );
    const datePickerInput = dateSelectBox.querySelector(
      '.js-date-picker-input',
    );
    const datePickerWrapper = detailItem.querySelector(
      '.js-date-picker-wrapper',
    );
    const datepicker = new DatePicker(datePickerWrapper, {
      date: new Date(),
      language: 'ko',
      input: {
        element: datePickerInput,
        format: 'yyyy년 M월 d일',
      },
      openers: [dateSelectBox],
      autoClose: false,
    });
    let isDateSelected = false;
    let latestDate;

    datepicker.on('open', () => {
      latestDate = datepicker.getDate();
    });

    datepicker.on('close', () => {
      datepicker.setDate(latestDate);
    });

    const changeDatePickerBtn = document.createElement('button');
    changeDatePickerBtn.className =
      'change-date-picker-btn btn btn--sm btn--primary';
    changeDatePickerBtn.textContent = '선택 완료';
    datePickerWrapper
      .querySelector('.tui-datepicker')
      .append(changeDatePickerBtn);
    changeDatePickerBtn.addEventListener('click', () => {
      isDateSelected = true;
      latestDate = datepicker.getDate();

      updateSelectBoxValue(dateSelectBox, datePickerInput.value);
      updateDetailObjsDatePickers();
      datepicker.close();
    });

    return {
      datepicker,
      getIsDateSelected() {
        return isDateSelected;
      },
    };
  })();

  (function initTimeSelects() {
    const lastValues = {
      start: {
        amPm: 'am',
        hours: '10',
        minutes: '00',
      },
      end: {
        amPm: 'am',
        hours: '11',
        minutes: '00',
      },
    };

    const findAmPmToggle = (startEnd) =>
      amPmToggles.find((toggle) => toggle.className.includes(startEnd));

    const findInput = (startEnd, hourMin) => {
      const name = `${startEnd}-${hourMin}`;

      return inputs.find((input) => input.name === name);
    };

    const findStartEndInputs = (startEnd) => {
      const amPmToggle = findAmPmToggle(startEnd);
      const hoursInput = findInput(startEnd, 'hour');
      const minutesInput = findInput(startEnd, 'min');

      return { amPmToggle, hoursInput, minutesInput };
    };

    const formatDateToHoursMinutes = (date) => format(date, 'H-mm').split('-');

    const getStartEndDate = (startEnd) => {
      const { amPmToggle, hoursInput, minutesInput } =
        findStartEndInputs(startEnd);
      const isPm = amPmToggle.dataset.value === 'pm';
      const hours = (isPm ? 12 : 0) + parseInt(hoursInput.value);
      const minutes = parseInt(minutesInput.value);
      const date = setMinutes(setHours(new Date(), hours), minutes);

      return date;
    };

    const setStartEndDate = (startEnd, date) => {
      console.log('setStartEndDate', { startEnd, date });
      const { amPmToggle, hoursInput, minutesInput } =
        findStartEndInputs(startEnd);
      const [hours, minutes] = formatDateToHoursMinutes(date);

      setAmPmToggle(amPmToggle, hours >= 12 ? 'pm' : 'am');
      hoursInput.value = `${hours % 12}`;
      minutesInput.value = `${minutes}`;
    };

    const setAmPmToggle = (toggle, amPm) => {
      toggle.dataset.value = amPm;
      toggle.innerText = AM_PM_LABELS[amPm];
    };

    const updateLastValues = () => {
      const startDate = getStartEndDate('start');
      const [startHours, startMinutes] = formatDateToHoursMinutes(startDate);
      const endDate = getStartEndDate('end');
      const [endHours, endMinutes] = formatDateToHoursMinutes(endDate);

      lastValues.start.amPm = startHours < 12 ? 'am' : 'pm';
      lastValues.start.hours = `${startHours % 12}`;
      lastValues.start.minutes = `${startMinutes}`;
      lastValues.end.amPm = endHours < 12 ? 'am' : 'pm';
      lastValues.end.hours = `${endHours % 12}`;
      lastValues.end.minutes = `${endMinutes}`;
    };

    const updateStartEnd = (trigger) => {
      const startDate = getStartEndDate('start');
      const endDate = getStartEndDate('end');
      const isStartOverEnd =
        isAfter(startDate, endDate) || isEqual(startDate, endDate);

      if (!isStartOverEnd) {
        updateLastValues();

        return;
      }

      const isStart = [
        UPDATE_TIME_TRIGGERS.START_TOGGLE,
        UPDATE_TIME_TRIGGERS.START_HOURS,
        UPDATE_TIME_TRIGGERS.START_MINUTES,
      ].includes(trigger);

      if (isStart) {
        const newEndDate = clamp(addHours(startDate, 1), {
          start: setMinutes(setHours(startDate, 0), 0),
          end: setMinutes(setHours(startDate, 23), 59),
        });

        setStartEndDate('end', newEndDate);
      }

      if (trigger === UPDATE_TIME_TRIGGERS.END_TOGGLE) {
        const endAmPmToggle = findAmPmToggle('end');

        setAmPmToggle(endAmPmToggle, lastValues.end.amPm);
        toast(END_TIME_OVER_MSG);

        return;
      }

      if (trigger === UPDATE_TIME_TRIGGERS.END_HOURS) {
        const endHourInput = findInput('end', 'hour');

        endHourInput.value = lastValues.end.hours;
        toast(END_TIME_OVER_MSG);

        return;
      }

      if (trigger === UPDATE_TIME_TRIGGERS.END_MINUTES) {
        const endMinInput = findInput('end', 'min');

        endMinInput.value = lastValues.end.minutes;
        toast(END_TIME_OVER_MSG);

        return;
      }

      updateLastValues();

      console.log({ startDate, endDate });
    };

    const handleAmPmToggle = (event) => {
      const { currentTarget: toggle } = event;
      const isStart = toggle.classList.contains('start');
      const isAm = toggle.dataset.value === 'am';
      const nextValue = isAm ? 'pm' : 'am';
      const updateTrigger = isStart
        ? UPDATE_TIME_TRIGGERS.START_TOGGLE
        : UPDATE_TIME_TRIGGERS.END_TOGGLE;

      setAmPmToggle(toggle, nextValue);
      updateStartEnd(updateTrigger);
    };

    const handleInput = (event) => {
      const { currentTarget: input } = event;

      if (input.value === '') return;

      input.value = filterValueNumberOnly(input.value);

      const { name } = input;
      const isStart = name.includes('start');
      const isHour = name.includes('hour');

      if (isHour && parseInt(input.value) > 11) {
        input.value = '11';
      }

      if (!isHour && parseInt(input.value) > 59) {
        input.value = '59';
      }

      const trigger = isStart
        ? isHour
          ? UPDATE_TIME_TRIGGERS.START_HOURS
          : UPDATE_TIME_TRIGGERS.START_MINUTES
        : isHour
          ? UPDATE_TIME_TRIGGERS.END_HOURS
          : UPDATE_TIME_TRIGGERS.END_MINUTES;

      updateStartEnd(trigger);
    };

    const handleBlur = (event) => {
      const { currentTarget: input } = event;

      if (input.value !== '') return;

      const { name } = input;
      const isStart = name.includes('start');
      const isHour = name.includes('hour');
      const lastValue = isStart
        ? isHour
          ? lastValues.start.hours
          : lastValues.start.minutes
        : isHour
          ? lastValues.end.hours
          : lastValues.end.minutes;

      input.value = lastValue;
    };

    for (const toggle of amPmToggles) {
      toggle.addEventListener('click', handleAmPmToggle);
    }

    for (const input of inputs) {
      input.addEventListener('input', handleInput);
      input.addEventListener('blur', handleBlur);
    }
  })();

  initTextarea(textarea);

  return {
    get selectedDate() {
      return datepicker.getDate();
    },
    get isDateSelected() {
      return getIsDateSelected();
    },

    updateDeleteBtn,
    updateNumberElement(index) {
      const numberElement = detailItem.querySelector('.js-detail-item__no');

      numberElement.innerText = index;
    },
    validIsElement(element) {
      return element.isEqualNode(detailItem);
    },
    setDatePickerRanges(ranges) {
      datepicker.setRanges(ranges);
    },
    setDatePickerDate(date) {
      datepicker.setDate(date);
    },
  };
}

function initTextarea(textarea) {
  const wrapper = textarea.closest('.textarea-wrapper');
  const count = wrapper.querySelector('.js-textarea__count');

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
    validate();
  });

  textarea.addEventListener('blur', () => {
    if (wrapper.dataset.state === 'success') {
      wrapper.dataset.state = '';
    }
  });

  textarea.addEventListener('input', () => {
    preventMoreThanTwoSpaces();
    validate();
    count.innerHTML = `${textarea.value.length}`;
  });
}
