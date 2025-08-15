// CKEditor 관련 타입 정의 추가
interface CKEditorLoader {
    file: Promise<File>;
    uploadTotal?: number;
    uploaded?: number | boolean;
}

interface CKEditorFileRepository {
    createUploadAdapter: (loader: CKEditorLoader) => UploadAdapter;
}

interface CKEditorPlugins {
    get(name: "FileRepository"): CKEditorFileRepository;
}

interface CKEditor {
    plugins: CKEditorPlugins;
}

interface UploadResponse {
    url: string;
    error?: {
        message: string;
    };
}

class UploadAdapter {
    private loader: CKEditorLoader;

    constructor(loader: CKEditorLoader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file.then(
            (file: File) =>
                new Promise<{default: string}>((resolve, reject) => {
                    this._initRequest();
                    this._initListeners(resolve, reject);
                    this._sendRequest(file);
                })
        );
    }

    abort() {
        if (this.xhr) {
            this.xhr.abort();
        }
    }

    private xhr?: XMLHttpRequest;

    _initRequest() {
        const xhr = (this.xhr = new XMLHttpRequest());
        xhr.open("POST", "/api/upload", true);
        xhr.responseType = "json";
    }

    _initListeners(resolve: (value: {default: string}) => void, reject: (reason?: string) => void) {
        const xhr = this.xhr!;
        const loader = this.loader;
        const genericErrorText = "이미지를 업로드할 수 없습니다.";

        xhr.addEventListener("error", () => reject(genericErrorText));
        xhr.addEventListener("abort", () => reject());

        xhr.addEventListener("load", () => {
            const response = xhr.response as UploadResponse;

            if (!response || response.error) {
                return reject(response && response.error && response.error.message ? response.error.message : genericErrorText);
            }

            loader.uploaded = true;

            resolve({
                default: response.url,
            });
        });

        if (xhr.upload) {
            xhr.upload.addEventListener("progress", (evt) => {
                if (evt.lengthComputable) {
                    loader.uploadTotal = evt.total;
                    loader.uploaded = evt.loaded;
                }
            });
        }
    }

    _sendRequest(file: File) {
        const data = new FormData();
        data.append("upload", file);
        this.xhr!.send(data);
    }
}

export function UploadAdapterPlugin(editor: CKEditor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader: CKEditorLoader) => {
        return new UploadAdapter(loader);
    };
}
