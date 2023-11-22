// worker.js（worker线程）
onmessage = function () {
  setTimeout(() => {
    self.postMessage('timeout')
  }, 1000)
}
