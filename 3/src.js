!function () {
  'use strict';

  let foo = document.querySelector('.foo');
  let bar = document.querySelector('.bar');
  let baz = document.querySelector('.baz');

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

  drag.subscribeOnNext(cb.bind(foo));
  drag.delay(100).subscribeOnNext(cb.bind(bar));
  drag.delay(200).subscribeOnNext(cb.bind(baz));

  function cb({ left, top }) {
    this.style.left = left + 'px';
    this.style.top = top + 'px';
  }
}();
