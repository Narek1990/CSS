(function () {
  'use strict';

  var DEFAULT_CODE = '+98';
  var completedForms = new WeakSet();
  var pendingForms = new WeakSet();
  var cancelledForms = new WeakSet();

  function isIranOption(option) {
    if (!option) return false;
    var flag = option.querySelector('img[alt="Iran"]');
    if (flag) return true;
    var text = (option.textContent || '').replace(/\s+/g, ' ');
    return text.indexOf(DEFAULT_CODE) !== -1 && /\bIran\b/i.test(text);
  }

  function getRegistrationForms() {
    return Array.prototype.slice.call(
      document.querySelectorAll('[data-mj="auth-modal"] form, [role="alertdialog"] form')
    ).filter(function (form) {
      return form.querySelector('#phoneNumber, input[name="phoneCode"]');
    });
  }

  function getPhoneParts(form) {
    var hidden = form.querySelector('input[name="phoneCode"]');
    var combobox = form.querySelector('#phoneCode, input[role="combobox"][aria-controls*="react-select"]');
    var container = (combobox && combobox.closest('.sl-select__control')) ||
      (hidden && hidden.closest('[class*="-container"]')) ||
      (combobox && combobox.parentElement);
    return { hidden: hidden, combobox: combobox, container: container };
  }

  function selectedIran(parts) {
    if (parts.hidden && parts.hidden.value === DEFAULT_CODE) return true;
    if (parts.container && parts.container.querySelector('img[alt="Iran"]')) return true;
    return false;
  }

  function markIran(parts) {
    var target = parts.container || parts.combobox;
    if (target) target.setAttribute('data-raidenbet-phone-code', 'iran');
  }

  function findIranOption(parts) {
    var menuId = parts.combobox && parts.combobox.getAttribute('aria-controls');
    var menu = menuId && document.getElementById(menuId);
    var options = (menu || document).querySelectorAll(
      '[role="option"], .sl-select__option, [id^="react-select-"][id*="-option-"]'
    );
    for (var i = 0; i < options.length; i += 1) {
      if (isIranOption(options[i])) return options[i];
    }
    return null;
  }

  function chooseIran(form, parts) {
    if (cancelledForms.has(form)) return;
    if (selectedIran(parts)) {
      completedForms.add(form);
      pendingForms.delete(form);
      markIran(parts);
      return;
    }

    var option = findIranOption(parts);
    if (option) {
      option.click();
      window.setTimeout(function () {
        var refreshed = getPhoneParts(form);
        if (selectedIran(refreshed)) {
          completedForms.add(form);
          pendingForms.delete(form);
          markIran(refreshed);
        }
      }, 0);
      return;
    }

    var control = parts.container || parts.combobox;
    if (control && control.getAttribute('aria-expanded') !== 'true') {
      control.click();
    }

    [40, 140, 320, 640].forEach(function (delay) {
      window.setTimeout(function () {
        if (!completedForms.has(form) && !cancelledForms.has(form)) {
          chooseIran(form, getPhoneParts(form));
        }
      }, delay);
    });
  }

  function scan() {
    getRegistrationForms().forEach(function (form) {
      if (completedForms.has(form) || pendingForms.has(form) || cancelledForms.has(form)) return;
      var parts = getPhoneParts(form);
      if (!parts.hidden && !parts.combobox) return;
      pendingForms.add(form);
      chooseIran(form, parts);
    });
  }

  /* If the user chooses another country, never replace that manual choice. */
  document.addEventListener('click', function (event) {
    var option = event.target && event.target.closest && event.target.closest(
      '[role="option"], .sl-select__option, [id^="react-select-"][id*="-option-"]'
    );
    if (!option || isIranOption(option)) return;
    getRegistrationForms().forEach(function (form) {
      if (pendingForms.has(form)) {
        cancelledForms.add(form);
        pendingForms.delete(form);
      }
    });
  }, true);

  var observer = new MutationObserver(scan);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scan();
  window.setTimeout(scan, 250);
  window.setTimeout(scan, 1000);
})();
