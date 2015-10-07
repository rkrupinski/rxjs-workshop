!function () {
  'use strict';

  let foo = document.querySelector('.foo');

  let mousedowns = Rx.Observable.fromEvent(foo,    'mousedown');
  let mouseups   = Rx.Observable.fromEvent(foo,    'mouseup'  );
  let mousemoves = Rx.Observable.fromEvent(window, 'mousemove');

  let drag = mousedowns.flatMap(md => {
    let { offsetX, offsetY } = md;

    return mousemoves.map(mm => ({
      left: mm.clientX - offsetX,
      top: mm.clientY - offsetY
    })).takeUntil(mouseups);
  });

  drag.subscribeOnNext(function ({ left, top }) {
    foo.style.left = left + 'px';
    foo.style.top = top + 'px';
  });
}();
