define([],
  function () {
    var platform = {
      supports: window.Modernizr,
      device: {
        type: 'unknown'
      },
      browser: navigator,
      phoneGap: window.PhoneGap
    }; //platform

    if (/Android.*Mobile|iPhone|iPod|Windows Phone|BlackBerry/i.test(navigator.userAgent)) {
      platform.device.type = 'Phone';
    }
    else if (/Android|iPad|Windows NT*Win64|Windows NT*ARM|Kindle|webOS|PlayBook/i.test(navigator.userAgent)) {
      platform.device.type = 'Tablet';
    }
    else if (/Windows|Macintosh|Linux|FreeBSD|IRIX|SunOS|BeOS/i.test(navigator.userAgent)) {
      platform.device.type = 'PC';
    }

    return platform;

  });
