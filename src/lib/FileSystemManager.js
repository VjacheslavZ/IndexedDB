// TODO select file and upload to storage or to server
class FileSystemManager {
  async saveFilePicker(options = {}) {
    try {
      const fileHandle = await window.showSaveFilePicker(options);
      return fileHandle;
    } catch (error) {
      console.log('error', error.name);
    }
  }

  async openFilePicker(options = { multiple: true }) {
    try {
      const [fileHandle] = await window.showOpenFilePicker(options);
      const file = await fileHandle.getFile();
      return file;
    } catch (error) {
      console.log('handle openFilePicker', error.name);
      if (error.name === 'AbortError') {
        throw new Error('AbortError', {
          cause: 'User cancelled the operation',
        });
      }
    }
  }

  async showDirectoryPicker(options = {}) {
    const directoryHandle = await window.showDirectoryPicker(options);
    return directoryHandle;
  }

  async observeFile() {
    try {
      const callback = (records, observer) => {
        for (const record of records) {
          console.log('Change detected:', record);
          const reportContent = `Change observed to ${record?.changedHandle?.kind} ${record?.changedHandle?.name}. Type: ${record?.type}.`;
          console.log('reportContent', reportContent);
        }
        // observer.disconnect();
      };

      const observer = new window.FileSystemObserver(callback);
      const fileHandle = await window.showSaveFilePicker();
      observer.observe(fileHandle);
    } catch (error) {
      console.error('Error observing file:', error);
    }
  }
}

export default FileSystemManager;
