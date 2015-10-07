!function () {
  'use strict';

  let foo = document.querySelector('.foo');
  let bar = document.querySelector('.bar');
  let baz = document.querySelector('.baz');

  let mousedowns = Rx.Observable.fromEvent(foo,    'mousedown');
  let mouseups   = Rx.Observable.fromEvent(foo,    'mouseup'  );
  let mousemoves = Rx.Observable.fromEvent(window, 'mousemove');

  let video = document.querySelector('#v');
  let tracker = new tracking.ColorTracker(['yellow']);
  let { innerWidth: windowWidth, innerHeight: windowHeight } = window;
  let { width: canvasWidth, height: canvasHeight } = video;

  let moves = Rx.Observable.create(observer => {
    tracker.on('track', (e) => {
      if (!e.data.length) {
        return;
      }

      let avgX = Rx.Observable.fromArray(e.data)
          .average(coords => coords.x + coords.width / 2);

      let avgY = Rx.Observable.fromArray(e.data)
          .average(coords => coords.y + coords.height / 2);

      Rx.Observable.zip(avgX, avgY, (x, y) => ({ left: x, top: y }))
          .subscribeOnNext(pos => observer.onNext(pos));
    });
  })

      /*
      .bufferWithCount(2, 1)
      .filter(buf => {
        const treshold = 5;

        return Math.abs(buf[1].left - buf[0].left) > treshold ||
            Math.abs(buf[1].top - buf[0].top) > treshold;
      })
      .map(buf => buf[1])
      */

      .map(pos => ({
        left: windowWidth - pos.left / canvasWidth * windowWidth,
        top: pos.top / canvasHeight * windowHeight
      }));


  let drag = mousedowns.flatMap(md => {
    let { offsetX, offsetY } = md;

    return mousemoves.map(mm => ({
      left: mm.clientX - offsetX,
      top: mm.clientY - offsetY
    })).takeUntil(mouseups);
  });

  let actions = Rx.Observable.merge(drag, moves);

  tracking.track('#v', tracker, { camera: true });

  actions.subscribeOnNext(cb.bind(foo));

  actions
      .delay(100)
      .bufferWithCount(10, 1)
      .flatMap(smooth)
      .subscribeOnNext(cb.bind(bar));

  actions
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
