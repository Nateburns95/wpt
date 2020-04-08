async function waitForNextPaint(t) {
  await new Promise(resolve => {
    requestAnimationFrame(resolve);
  })
  return new Promise(resolve => {
    t.step_timeout(resolve, 0);
  });
}

// Asserts that there is currently no FCP reported. Pass t to add some wait, in case CSS is loaded
// and FCP is incorrectly fired afterwards.
async function assertNoFirstContentfulPaint(t) {
  await waitForNextPaint(t);
  assert_equals(performance.getEntriesByName('first-contentful-paint').length, 0, 'First contentful paint marked too early. ');
}

// Function that is resolved once FCP is reported, using PerformanceObserver. It rejects after a long
// wait time so that failing tests don't timeout.
async function assertFirstContentfulPaint(t) {
  return new Promise((resolve, reject) => {
    new PerformanceObserver(entries => {
      if (entries.getEntriesByName('first-contentful-paint').length === 1)
        resolve();
    }).observe({type: 'paint', buffered: true});
  });
}

async function test_fcp(label) {
  const style = document.createElement('style');
  document.head.appendChild(style);
  await promise_test(async t => {
    assert_precondition(window.PerformancePaintTiming, "Paint Timing isn't supported.");
    const main = document.getElementById('main');
    await new Promise(r => window.addEventListener('load', r));
    await assertNoFirstContentfulPaint(t);
    main.className = 'preFCP';
    await assertNoFirstContentfulPaint(t);
    main.className = 'contentful';
    await assertFirstContentfulPaint(t);
  }, label);
}
