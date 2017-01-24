(function($) {

  var todayDate = new Date();
  todayDate.setHours(0,0,0,0);

  // These are the defaults.
  var settings = {
    date: undefined,
    weekDayLength: 1,
    prevButton: 'Prev',
    nextButton: 'Next',
    monthYearSeparator: ' ',
    onClickDate: function(date){},
    onClickMonth: function(date){},
    onClickToday: function(date){},
    onClickMonthNext: function(date){},
    onClickMonthPrev: function(date){},
    onClickYearNext: function(date){},
    onClickYearPrev: function(date){},
    onClickYearView: function(date){},
    onYearSelect: function(date){},
    threeMonthsInARow: true,
    enableMonthChange: true,
    enableYearView: true,
    showTodayButton: true,
    highlightSelectedWeekday: true,
    highlightSelectedWeek: true,
    todayButtonContent: 'Today',
    showYearDropdown: false
  }
  var el, selectedDate, yearView = false;

  var monthMap = {
    1: 'january',
    2: 'february',
    3: 'march',
    4: 'april',
    5: 'may',
    6: 'june',
    7: 'july',
    8: 'august',
    9: 'sepetember',
    10: 'october',
    11: 'november',
    12: 'december'
  };

  var dayMap = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };

  function getFirstDayOfMonth(currentDate) {
    var thisDate = currentDate.getMonth() + 1 + ' 1 ' + currentDate.getFullYear();
    return new Date(thisDate);
  }

  function getLastDayOfMonth(currentDate) {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }

  function getLastMonthLastDay(currentDate) {
    var month = currentDate.getMonth();
    var year = currentDate.getFullYear();
    if (month === 0) {
      year -= 1;
      month = 12;
    }
    return new Date(year, month, 0);
  }

  function generateWeekData(currentDate, weekNo) {
    var firstDay = getFirstDayOfMonth(currentDate);
    var firstDayDate = firstDay.getDate();
    var lastDay = getLastDayOfMonth(currentDate);
    var lastDayDate = lastDay.getDate();
    var lastDayFromLastMonth = getLastMonthLastDay(currentDate).getDate();
    var days = [];

    var weekDay = firstDay.getDay();
    var daysFromLastMonth = (weekDay);
    var daysFromNextMonth = 1;

    if (weekNo === 1) {

      for (var dayFromLastMonth = (daysFromLastMonth-1); dayFromLastMonth >= 0; dayFromLastMonth--) {
        var dateObj = new Date((currentDate.getFullYear()), (currentDate.getMonth() - 1), (lastDayFromLastMonth - dayFromLastMonth));
        days.push(dateObj);
      }

      var daysLength = 7 - days.length;
      for (var monthDate = 0; monthDate < daysLength; monthDate++) {
        var dateObj = new Date((firstDay.getFullYear()), (firstDay.getMonth()), (firstDayDate + monthDate) );
        days.push(dateObj);
      }

    } else {

      var startWeekFrom = ((weekNo-1) * 7) - daysFromLastMonth;
      for (var i = 1; i <= 7; i++) {

        if ((startWeekFrom + i) <= lastDay) {
          var dateObj = new Date((currentDate.getFullYear()), (currentDate.getMonth()), (startWeekFrom + i) );
          days.push(dateObj);

        } else {

          var dateObj = new Date((currentDate.getFullYear()), (currentDate.getMonth() + 1), (daysFromNextMonth++) );
          days.push(dateObj);
        }
      }
    }
    return days;
  }

  function generateMonthData(currentDate) {
    var firstDay = getFirstDayOfMonth(currentDate);
    var lastMonthLast = getLastDayOfMonth(currentDate).getDate();
    var lastDayFromMonth = getLastDayOfMonth(currentDate).getDate();
    var weeks = parseInt(lastMonthLast / 7) + 1;

    var monthData = [];
    for (var weekNo = 1; weekNo <= weeks; weekNo++) {
      monthData.push(generateWeekData(currentDate, weekNo));
    }
    var lastBlock = monthData[monthData.length - 1];
    var lastDayInBlock = lastBlock[lastBlock.length - 1].getDate();

    if ((lastDayInBlock < lastDayFromMonth) && ((lastDayFromMonth - lastDayInBlock) < 7)) {
      monthData.push(generateWeekData(currentDate, weekNo));
    }
    return monthData;
  }

  function generateTodayButton() {
    return ''+
      '<div class="special-buttons">'+
        '<button class="today-button">'+ settings.todayButtonContent +'</button>'+
      '</div>';
  }

  function generateYearHeaderDOM(currentDate) {
    var str = ''+
        '<div class="buttons-container">'+
          ((settings.enableMonthChange && settings.enableYearView) ? '<button class="prev-button">'+ settings.prevButton +'</button>' : '')+
          '<span class="label-container year-label">';
    if (settings.showYearDropdown) {
      str +=  ''+
              '<select class="year-dropdown">';
      for (var i = 1970; i < 2117; i++) {
        if (i === currentDate.getFullYear()) {
          str += '<option selected="selected" value="'+ i +'">'+ i +'</option>';
        } else {
          str += '<option value="'+ i +'">'+ i +'</option>';
        }
      }
      str += '</select>';

    } else {
      str += currentDate.getFullYear();
    }
    str +='</span>'+
          ((settings.enableMonthChange && settings.enableYearView) ? '<button class="next-button">'+ settings.nextButton +'</button>' : '')+
        '</div>';
    return str;
  }

  function generateMonthDOM(currentDate) {
    var str = '';
    str += '<div class="months-wrapper">';

    for (var month in monthMap) {
      if (monthMap.hasOwnProperty(month)) {
        var threeMonthsInARow = '';
        threeMonthsInARow = settings.threeMonthsInARow ? ' one-third' : '';
        str += '<span class="month'+ threeMonthsInARow +'" data-month="'+ month +'" data-year="'+ currentDate.getFullYear() +'"><span>'+ monthMap[month] +'</span></span>';
      }
    }

    str += '</div>';
    return str;
  }

  function generateMonthHeaderDOM(currentDate) {
    return ''+
      '<div class="buttons-container">'+
        (settings.enableMonthChange ? '<button class="prev-button">'+ settings.prevButton +'</button>' : '')+
        '<span class="label-container month-container">'+
          '<span class="month-label">'+
            monthMap[(currentDate.getMonth() + 1)] +
          '</span>'+
          settings.monthYearSeparator+
          '<span class="year-label">'+
          currentDate.getFullYear() +
          '</span>'+
        '</span>'+
        (settings.enableMonthChange ? '<button class="next-button">'+ settings.nextButton +'</button>' : '')+
      '</div>';
  }

  function generateWeekHeaderDOM(currentDate) {
    var str = '';
    str += '<div class="weeks-wrapper header">';
      str += '<div class="week" data-week-no="'+ 0 +'">';

      for (var weekDay in dayMap) {
        if (dayMap.hasOwnProperty(weekDay)) {
          str += '<div class="day header" data-day="'+ weekDay +'">'+ dayMap[weekDay].substring(0, settings.weekDayLength) +'</div>';
        }
      }

      str += '</div>';
    str += '</div>';
    return str;
  }

  function generateWeekDOM(monthData, currentDate) {
    var str = '';
    str += '<div class="weeks-wrapper">';

    monthData.forEach(function(week, weekNo) {
      str += '<div class="week" data-week-no="'+ (weekNo+1) +'">';

        week.forEach(function(day, dayNo) {
          var disabled = false;
          if (day.getMonth() !== currentDate.getMonth()) disabled = true;
          disabled = disabled ? ' disabled' : '';

          var selected = false;
          if (selectedDate) {
            if (day == selectedDate.toString()) selected = true;
            selected = selected ? ' selected' : '';
          } else {
            selected = '';
          }

          var today = false;

          if (day == todayDate.toString()) today = true;
          today = today ? ' today' : '';

          str += '<div class="day'+ disabled + selected + today +'" data-date="'+ day +'"><span>'+ day.getDate() +'</span></div>';
        });

      str += '</div>';
    });
    str += '</div>';
    return str;
  }

  function generateDomString(monthData, currentDate) {
    var calendarDump = '';

    calendarDump += '<div class="calendar-box">';

      if (yearView) {
        calendarDump += '<div class="months-container">';

        calendarDump += generateYearHeaderDOM(currentDate);

        calendarDump += generateMonthDOM(currentDate);

        calendarDump += '</div>';
      } else {
        calendarDump += '<div class="weeks-container">';

        calendarDump += generateMonthHeaderDOM(currentDate);

        calendarDump += generateWeekHeaderDOM(currentDate);

        calendarDump += generateWeekDOM(monthData, currentDate);

        calendarDump += '</div>';
      }

      if (settings.showTodayButton) {
        calendarDump += generateTodayButton();
      }

    calendarDump += '</div>';

    return calendarDump;
  }

  function highlightDays() {
    var selectedElement = el.find('.selected');

    if (selectedElement.length > 0) {
      var date = new Date(selectedElement.data('date'));
      var weekDayNo = date.getDay();

      el.find('.week').each(function(i, elm) {
        $(elm).find('.day:eq('+(weekDayNo - 0)+')').addClass('highlight');
      });
    }
  }

  function highlightWeek() {
    el.find('.selected').parents('.week').addClass('highlight');
  }

  function renderToDom(currentDate) {

    var monthData = generateMonthData(currentDate);

    el.html(generateDomString(monthData, currentDate));

    if (settings.highlightSelectedWeekday) {
      highlightDays();
    }
    if (settings.highlightSelectedWeek) {
      highlightWeek();
    }
  }

  $.fn.calendar = function(options) {
    settings = $.extend(settings, options);

    el = $(this);

    var currentDate;

    if (settings.date) {
      if (typeof settings.date === 'string') {
        selectedDate = new Date(settings.date);
      }
      else {
        selectedDate = settings.date;
      }
      selectedDate.setHours(0,0,0,0);
      currentDate = selectedDate;
    } else {
      currentDate = todayDate;
    }


    renderToDom(currentDate);

    if (settings.enableMonthChange) {

      el.off('click', '.weeks-container .prev-button').on('click', '.weeks-container .prev-button', function(e) {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        settings.onClickMonthPrev(currentDate);
        renderToDom(currentDate);
      });

      el.off('click', '.weeks-container .next-button').on('click', '.weeks-container .next-button', function(e) {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        settings.onClickMonthNext(currentDate);
        renderToDom(currentDate);
      });

    }

    el.off('click', '.day').on('click', '.day', function(e) {
      var date = $(this).data('date');
      settings.onClickDate(date);
    });

    if (settings.enableMonthChange && settings.enableYearView) {
      el.off('click', '.month-container').on('click', '.month-container', function(e) {
        yearView = true;
        currentDate = new Date(currentDate.getFullYear(), 0, 1);
        settings.onClickYearView(currentDate);
        renderToDom(currentDate);
      });

      el.off('click', '.months-container .month').on('click', '.months-container .month', function(e) {
        var monthEl = $(this);
        var month = monthEl.data('month');
        var year = monthEl.data('year');
        var selectedMonth = new Date(year, (month-1), 1);
        settings.onClickMonth(selectedMonth);

        currentDate = selectedMonth;
        yearView = false;

        renderToDom(currentDate);
      });

      el.off('click', '.months-container .prev-button').on('click', '.months-container .prev-button', function(e) {
        currentDate = new Date(currentDate.getFullYear() - 1, 0, 1);
        settings.onClickYearPrev(currentDate);
        renderToDom(currentDate);
      });

      el.off('click', '.months-container .next-button').on('click', '.months-container .next-button', function(e) {
        currentDate = new Date(currentDate.getFullYear() + 1, 0, 1);
        settings.onClickMonthNext(currentDate);
        renderToDom(currentDate);
      });

      el.off('change', '.months-container .year-dropdown').on('change', '.months-container .year-dropdown', function(e) {
        var year =  $(this).val();
        currentDate = new Date(year, 0, 1);
        settings.onYearSelect(currentDate);
        renderToDom(currentDate);
      });
    }

    if (settings.showTodayButton) {
      el.off('click', '.today-button').on('click', '.today-button', function(e) {
        currentDate = todayDate;
        settings.onClickToday(todayDate);
        yearView = false;
        renderToDom(currentDate);
      })
    }

    return this;
  }
} (jQuery) );
