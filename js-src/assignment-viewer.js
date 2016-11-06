(function () {
  'use strict';

  var $viewer = document.getElementById('assignment-viewer');
  var $assignmentWrapper = document.querySelector('.assignment-wrapper');
  var $wrapper = document.querySelector('.assignment-content-wrapper');
  var $loader = document.getElementById('assignment-loader');
  var $title = document.querySelector('.assignment-name');
  var $icon = document.getElementById('assignment-icon');
  var $due = document.querySelector('.assignment-due');
  var $worth = document.querySelector('.assignment-worth');
  var $gradingType = document.querySelector('.assignment-grading-type');
  var $satisfies = document.querySelector('.assignment-satisfies');
  var $btn = document.querySelector('.assignment-btn');
  var $subHeader = document.querySelector('.assignment-sub-header');
  var $summaryDefault = document.querySelector('.assignment-summary-default');
  var $summary = document.querySelector('.assignment-summary');
  var $timeDefault = document.querySelector('.assignment-time-default');
  var $timeHeading = document.querySelector('.assignment-time-heading');
  var $time = document.querySelector('.assignment-time');
  var $deliverablesDefault = document.querySelector('.assignment-deliverables-default');
  var $deliverablesHeading = document.querySelector('.assignment-deliverables-heading');
  var $deliverables = document.querySelector('.assignment-deliverables');
  var $content = document.querySelector('.assignment-content');
  var $scrollDown = document.querySelector('.assignment-scroll-down');

  var labels = {
    code: document.querySelector('[property="assignment-code"]').getAttribute('content'),
    online: document.querySelector('[property="assignment-online"]').getAttribute('content'),
    show: document.querySelector('[property="assignment-show"]').getAttribute('content'),
    download: document.querySelector('[property="assignment-download"]').getAttribute('content'),
  }

  var getButtonLabel = function (type) {
    return labels[type];
  };

  var populateInitialDetails = function (details) {
    $title.innerHTML = details.title;
    $icon.setAttributeNS('http://www.w3.org/1999/xlink', 'href', details.icon);
    $due.innerHTML = details.due;
    $worth.innerHTML = details.worth;
    $gradingType.innerHTML = details.gradingType;
    $satisfies.innerHTML = details.satisfies;
  };

  var enableButton = function () {
    $btn.classList.add('btn-dark');
    $btn.classList.remove('btn-subtle');
    $btn.classList.remove('assignment-btn-disabled');
  };

  var disableButton = function () {
    $btn.classList.remove('btn-dark');
    $btn.classList.add('btn-subtle');
    $btn.classList.add('assignment-btn-disabled');
    $btn.removeAttribute('download');
  };

  var populateButton = function (type, href) {
    enableButton();

    $btn.innerHTML = getButtonLabel(type);
    $btn.removeAttribute('download');

    if (type === 'download') {
      $btn.href = href;
      $btn.setAttribute('download', true);
    } else {
      $btn.href = href + '/fork';
    }

    if (type == 'show') disableButton();
  };

  var getReadmeUrl = function (href) {
    return href.replace('github.com', 'api.github.com/repos') + '/readme';
  };

  var getYaml = function (text) {
    return text.trim().split('---').filter(Boolean)[0];
  };

  var removeYaml = function (text) {
    return text.trim().split('---').filter(Boolean).slice(1).join('---');
  };

  var formatMarkdown = function (href, markdown) {
    markdown = markdown.replace(/<h1[^>]*>[^<]+<\/h1>/, '').trim();
    markdown = markdown.replace('<img src="', '<img class="img-flex" src="' + href + '/raw/gh-pages/');

    return markdown;
  };

  var parseReadme = function (href, text) {
    var yamlRaw, markdownRaw, yaml, markdown;

    if (text.trim().match(/^---/)) { // Has YAML
      yamlRaw = getYaml(text);
      yaml = jsyaml.load(yamlRaw);
      markdownRaw = removeYaml(text);
    } else {
      yaml = {};
      markdownRaw = text;
    }

    markdown = marked(markdownRaw, { gfm: true, tables: true, breaks: true, smartLists: true });
    yaml.html = formatMarkdown(href, markdown);

    return yaml;
  };

  var hideLoaders = function () {
    $loader.setAttribute('hidden', true);
  };

  var showLoaders = function () {
    $loader.removeAttribute('hidden');
  };

  var showSummary = function (text) {
    $summary.innerHTML = text;
    $summary.removeAttribute('hidden');
    $summaryDefault.setAttribute('hidden', true);
  };

  var hideSummary = function () {
    $subHeader.setAttribute('hidden', true);
    $summary.setAttribute('hidden', true);
    $summaryDefault.setAttribute('hidden', true);
  };

  var defaultSummary = function () {
    $summary.innerHTML = '';
    $summary.setAttribute('hidden', true);
    $summaryDefault.removeAttribute('hidden', true);
    $subHeader.removeAttribute('hidden');
  };

  var showFooterExtras = function (time, deliverables) {
    $timeHeading.removeAttribute('hidden');
    $time.removeAttribute('hidden');
    $time.innerHTML = time;
    $timeDefault.setAttribute('hidden', true);
    $deliverablesHeading.removeAttribute('hidden');
    $deliverables.innerHTML = deliverables;
    $deliverables.removeAttribute('hidden');
    $deliverablesDefault.setAttribute('hidden', true);
  };

  var hideFooterExtras = function () {
    $timeDefault.setAttribute('hidden', true);
    $timeHeading.setAttribute('hidden', true);
    $time.setAttribute('hidden', true);
    $deliverablesDefault.setAttribute('hidden', true);
    $deliverablesHeading.setAttribute('hidden', true);
    $deliverables.setAttribute('hidden', true);
  };

  var defaultFooter = function () {
    $timeHeading.removeAttribute('hidden');
    $time.innerHTML = '';
    $time.setAttribute('hidden', true);
    $timeDefault.removeAttribute('hidden');
    $deliverablesHeading.removeAttribute('hidden');
    $deliverables.innerHTML = '';
    $deliverables.setAttribute('hidden', true);
    $deliverablesDefault.removeAttribute('hidden');
  }

  var showContent = function (text) {
    $content.innerHTML = text;
  };

  var defaultContent = function () {
    $content.innerHTML = '';
  }

  var populateViewer = function (readme) {
    if (readme.summary) {
      showSummary(readme.summary);
    } else {
      hideSummary();
    }

    if (readme.time && readme.deliverables) {
      showFooterExtras(readme.time, readme.deliverables);
    } else {
      hideFooterExtras();
    }

    if (readme.submit) $btn.href = readme.submit;

    if (readme.download) {
      populateButton('download', readme.download);
    }

    showContent(readme.html);
    hideLoaders();
  };

  var resetViewer = function () {
    showLoaders();
    defaultSummary();
    defaultFooter();
    defaultContent();
    populateInitialDetails({
      title: '',
      icon: '',
      worth: '',
      gradingType: '',
      due: '',
      satisfies: '',
    });
    populateButton('', '');
    enableButton();
    $scrollDown.removeAttribute('hidden');
  };

  var triggerViewerClose = function () {
    window.location.hash = '';
  };

  var closeViewer = function () {
    $viewer.classList.add('assignment-viewer-hidden');
    $viewer.setAttribute('hidden', 'true');
    $viewer.setAttribute('aria-hidden', 'true');
    resetViewer();
    document.querySelector('html').style.overflow = 'initial';
  };

  var openViewer = function () {
    $viewer.classList.remove('assignment-viewer-hidden');
    $viewer.removeAttribute('hidden', 'true');
    $viewer.setAttribute('aria-hidden', 'false');
    document.querySelector('html').style.overflow = 'hidden';
    $assignmentWrapper.focus();
  };

  var downloadContent = function (href) {
    fetch(getReadmeUrl(href), {
        headers: {
          'Accept': 'application/vnd.github.v3.raw'
        }
      }
    ).then(function(response) {
      response.text().then(function (text) {
        var readme = parseReadme(href, text);
        cacheContent(href, readme);
        populateViewer(readme);
      });
    }, function() {
      window.location(href);
    });
  };

  var cacheContent = function (href, readme) {
    sessionStorage.setItem(href, JSON.stringify(readme));
  };

  var displayCachedContent = function (href) {
    populateViewer(JSON.parse(sessionStorage.getItem(href)));
  };

  var getViewerContent = function (href) {
    if (sessionStorage.getItem(href)) {
      displayCachedContent(href);
    } else {
      downloadContent(href);
    }
  };

  var tiggerViewerOpen = function () {
    var elem, url, submissionType;

    if (window.location.hash == '' || window.location.hash == '#') {
      closeViewer();
      return;
    }

    elem = document.getElementById(window.location.hash.replace(/#/g, ''));

    if (!elem) return;

    url = elem.href;
    submissionType = elem.querySelector('meta[property="submission-type"]').getAttribute('content');

    populateInitialDetails({
      title: elem.querySelector('.card-title').innerHTML,
      icon: elem.querySelector('.card-icon').getAttributeNS('http://www.w3.org/1999/xlink', 'href'),
      due: elem.querySelector('meta[property="due"]').getAttribute('content'),
      worth: elem.querySelector('meta[property="worth"]').getAttribute('content'),
      gradingType: elem.querySelector('meta[property="grading-type"]').getAttribute('content'),
      satisfies: 'CLRs ' + elem.querySelector('meta[property="clr"]').getAttribute('content'),
    });
    populateButton(submissionType, url);
    openViewer();
    getViewerContent(url);
  };

  window.addEventListener('hashchange', function (e) {
    e.preventDefault();
    tiggerViewerOpen();
  });

  [].forEach.call(document.querySelectorAll('a[data-control="assignment-viewer"]'), function (elem) {
    elem.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.hash = this.id;
    });
  });

  document.getElementById('assignment-close-btn').addEventListener('click', function (e) {
    triggerViewerClose();
  });

  document.addEventListener('keydown', function (e) {
    if (e.keyCode == 27) triggerViewerClose();
  });

  $viewer.addEventListener('click', function (e) {
    if (e.target == $viewer) triggerViewerClose();
  });

  $wrapper.addEventListener('scroll', function (e) {
    if ($wrapper.scrollTop >= ($wrapper.scrollHeight - $wrapper.offsetHeight)) {
      $scrollDown.setAttribute('hidden', true);
    } else {
      $scrollDown.removeAttribute('hidden');
    }
  });

  tiggerViewerOpen();
}());
