class UploadAdapter {
  private loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file
      .then((file: File) => new Promise((resolve, reject) => {
        this._initRequest();
        this._initListeners(resolve, reject);
        this._sendRequest(file);
      }));
  }

  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  private xhr?: XMLHttpRequest;

  _initRequest() {
    const xhr = this.xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);
    xhr.responseType = 'json';
  }

  _initListeners(resolve: any, reject: any) {
  const xhr = this.xhr!;
  const loader = this.loader;
  const genericErrorText = '이미지를 업로드할 수 없습니다.';

  xhr.addEventListener('error', () => reject(genericErrorText));
  xhr.addEventListener('abort', () => reject());

  xhr.addEventListener('load', () => {
    const response = xhr.response;

    if (!response || response.error) {
      return reject(
        response && response.error && response.error.message
          ? response.error.message
          : genericErrorText
      );
    }

      // ✅ 업로드 완료됨을 명시적으로 알려줌
      loader.uploaded = true;

      resolve({
        default: response.url,
      });
    });

    if (xhr.upload) {
      xhr.upload.addEventListener('progress', (evt) => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded; // 이건 진행상황, 완료 아님
        }
      });
    }
  }


  _sendRequest(file: File) {
    const data = new FormData();
    data.append('upload', file);
    this.xhr!.send(data);
  }
}

export function UploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new UploadAdapter(loader);
  };
}
