export class FileSystemWeb {
  async saveFilePicker(options = {}) {
    const fileHandle = await window.showSaveFilePicker(options);
    return fileHandle;
  }

  async openFilePicker(options = {}) {
    const [fileHandle] = await window.showOpenFilePicker(options);
    const file = await fileHandle.getFile();
    return file;
  }

  async showDirectoryPicker(options = {}) {
    const directoryHandle = await window.showDirectoryPicker(options);
    return directoryHandle;
  }
}
