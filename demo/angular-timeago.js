/**
 * Angular directive/filter/service for formatting date so that it displays how long ago the given time was compared to now.
 * @version v0.1.7 - 2015-01-15
 * @link https://github.com/yaru22/angular-timeago
 * @author Brian Park <yaru22@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
/* global angular */
'use strict';
angular.module('yaru22.angular-timeago', []).directive('timeAgo', [
  'timeAgo',
  'nowTime',
  function (timeAgo, nowTime) {
    return {
      restrict: 'EA',
      link: function (scope, elem, attrs) {
        var fromTime;
        // Track the fromTime attribute
        attrs.$observe('fromTime', function (value) {
          fromTime = timeAgo.parse(value);
        });
        // Track changes to time difference
        scope.$watch(function () {
          return nowTime() - fromTime;
        }, function (value) {
          angular.element(elem).text(timeAgo.inWords(value));
        });
      }
    };
  }
]).factory('nowTime', [
  '$window',
  '$rootScope',
  function ($window, $rootScope) {
    var nowTime = Date.now();
    var updateTime = function () {
      $window.setTimeout(function () {
        $rootScope.$apply(function () {
          nowTime = Date.now();
          updateTime();
        });
      }, 1000);
    };
    updateTime();
    return function () {
      return nowTime;
    };
  }
]).factory('timeAgo', function () {
  var service = {};
  service.settings = {
    refreshMillis: 60000,
    allowFuture: false,
    strings: {
      'en_US': {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: 'ago',
        suffixFromNow: 'from now',
        seconds: 'less than a minute',
        minute: 'about a minute',
        minutes: '%d minutes',
        hour: 'about an hour',
        hours: 'about %d hours',
        day: 'a day',
        days: '%d days',
        month: 'about a month',
        months: '%d months',
        year: 'about a year',
        years: '%d years',
        numbers: []
      },
      'de_DE': {
        prefixAgo: 'vor',
        prefixFromNow: null,
        suffixAgo: null,
        suffixFromNow: 'from now',
        seconds: 'weniger als einer Minute',
        minute: 'ca. einer Minute',
        minutes: '%d Minuten',
        hour: 'ca. einer Stunde',
        hours: 'ca. %d Stunden',
        day: 'einem Tag',
        days: '%d Tagen',
        month: 'ca. einem Monat',
        months: '%d Monaten',
        year: 'ca. einem Jahr',
        years: '%d Jahren',
        numbers: []
      },
      'he_IL': {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: '\u05dc\u05e4\u05e0\u05d9',
        suffixFromNow: '\u05de\u05e2\u05db\u05e9\u05d9\u05d5',
        seconds: '\u05e4\u05d7\u05d5\u05ea \u05de\u05d3\u05e7\u05d4',
        minute: '\u05db\u05d3\u05e7\u05d4',
        minutes: '%d \u05d3\u05e7\u05d5\u05ea',
        hour: '\u05db\u05e9\u05e2\u05d4',
        hours: '\u05db %d \u05e9\u05e2\u05d5\u05ea',
        day: '\u05d9\u05d5\u05dd',
        days: '%d \u05d9\u05de\u05d9\u05dd',
        month: '\u05db\u05d7\u05d5\u05d3\u05e9',
        months: '%d \u05d7\u05d5\u05d3\u05e9\u05d9\u05dd',
        year: '\u05db\u05e9\u05e0\u05d4',
        years: '%d \u05e9\u05e0\u05d9\u05dd',
        numbers: []
      },
      'pt_BR': {
        prefixAgo: null,
        prefixFromNow: 'daqui a',
        suffixAgo: 'atr\xe1s',
        suffixFromNow: null,
        seconds: 'menos de um minuto',
        minute: 'cerca de um minuto',
        minutes: '%d minutos',
        hour: 'cerca de uma hora',
        hours: 'cerca de %d horas',
        day: 'um dia',
        days: '%d dias',
        month: 'cerca de um m\xeas',
        months: '%d meses',
        year: 'cerca de um ano',
        years: '%d anos',
        numbers: []
      }
    }
  };
  service.inWords = function (distanceMillis) {
    var lang = document.documentElement.lang;
    var $l = service.settings.strings[lang];
    if (typeof $l === 'undefined') {
      $l = service.settings.strings['en_US'];
    }
    var prefix = $l.prefixAgo;
    var suffix = $l.suffixAgo;
    if (service.settings.allowFuture) {
      if (distanceMillis < 0) {
        prefix = $l.prefixFromNow;
        suffix = $l.suffixFromNow;
      }
    }
    var seconds = Math.abs(distanceMillis) / 1000;
    var minutes = seconds / 60;
    var hours = minutes / 60;
    var days = hours / 24;
    var years = days / 365;
    function substitute(stringOrFunction, number) {
      var string = angular.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
      var value = $l.numbers && $l.numbers[number] || number;
      return string.replace(/%d/i, value);
    }
    var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) || seconds < 90 && substitute($l.minute, 1) || minutes < 45 && substitute($l.minutes, Math.round(minutes)) || minutes < 90 && substitute($l.hour, 1) || hours < 24 && substitute($l.hours, Math.round(hours)) || hours < 42 && substitute($l.day, 1) || days < 30 && substitute($l.days, Math.round(days)) || days < 45 && substitute($l.month, 1) || days < 365 && substitute($l.months, Math.round(days / 30)) || years < 1.5 && substitute($l.year, 1) || substitute($l.years, Math.round(years));
    var separator = $l.wordSeparator === undefined ? ' ' : $l.wordSeparator;
    if (lang === 'he_IL') {
      return [
        prefix,
        suffix,
        words
      ].join(separator).trim();
    } else {
      return [
        prefix,
        words,
        suffix
      ].join(separator).trim();
    }
  };
  service.parse = function (iso8601) {
    if (angular.isNumber(iso8601)) {
      return parseInt(iso8601, 10);
    }
    var s = (iso8601 || '').trim();
    s = s.replace(/\.\d+/, '');
    // remove milliseconds
    s = s.replace(/-/, '/').replace(/-/, '/');
    s = s.replace(/T/, ' ').replace(/Z/, ' UTC');
    s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2');
    // -04:00 -> -0400
    return new Date(s);
  };
  return service;
}).filter('timeAgo', [
  'nowTime',
  'timeAgo',
  function (nowTime, timeAgo) {
    return function (value) {
      var fromTime = timeAgo.parse(value);
      var diff = nowTime() - fromTime;
      return timeAgo.inWords(diff);
    };
  }
]);