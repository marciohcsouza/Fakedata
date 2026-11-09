importScripts('generator.js');
self.onmessage = ({ data }) => {
  try {
    const result = Fakedata.generate(data, (percent, message) => self.postMessage({ type: 'progress', percent, message }));
    const archive = Fakedata.zip(result.files);
    self.postMessage({ type: 'done', ...result, archive: archive.buffer }, [archive.buffer]);
  } catch (error) { self.postMessage({ type: 'error', message: error.message }); }
};
