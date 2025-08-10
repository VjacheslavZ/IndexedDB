const opfsErrorsHandler = (error, mode = 'read', fileName = '') => {
  console.log('error', error);
  console.log('error.name', error.name);
  console.log('fileName', fileName);
  const errors = {
    QuotaExceededError: 'The user has reached their storage quota',
    NotAllowedError: `The permission for the handle is not granted in ${mode} mode.`,
    NotFoundError: `Current entry: '${fileName}' is not found.`,
    NoModificationAllowedError:
      'The browser is not able to acquire a lock on the file associated with the file handle.',
    AbortError: 'The user aborted a request.',
    TypeError: `The name: '${fileName}' is not a valid or contains characters not allowed on the file system.`,
    InvalidModificationError:
      'Recursive is set to false and the entry to be removed has children.',
    TypeMismatchError: 'The returned entry is a file and not a directory.',
  };

  const errorMessage =
    errors[error.name] ||
    `Unexpected ${error.name} error in file system storage`;

  throw new Error(errorMessage, { cause: error });
};

export default opfsErrorsHandler;
