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

  drag
      .delay(100)
      .bufferWithCount(10, 1)
      .flatMap(smooth)
      .subscribeOnNext(cb.bind(bar));

  drag
      .delay(200)
      .bufferWithCount(10, 1)
      .flatMap(smooth)
      .subscribeOnNext(cb.bind(baz));

  function cb({ left, top }) {
    this.style.left = left + 'px';
    this.style.top = top + 'px';
  }

  function smooth(buf) {
    let avgLeft = Rx.Observable.fromArray(buf).average(pos => pos.left);
    let avgTop = Rx.Observable.fromArray(buf).average(pos => pos.top);

    return Rx.Observable.zip(avgLeft, avgTop, (left, top) => ({ left, top }));
  }
}();
