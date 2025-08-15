"use client";

import {CKEditor} from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {UploadAdapterPlugin} from "@/lib/ckeditor-upload-adapter";
import {useEffect, useState} from "react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editorRef?: React.MutableRefObject<any>;
}

export function RichTextEditor({value, onChange, placeholder, editorRef}: RichTextEditorProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="w-full h-64 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 animate-pulse flex items-center justify-center">
                <span className="text-gray-500">에디터 로딩중...</span>
            </div>
        );
    }

    return (
        <div className="ckeditor-wrapper">
            <CKEditor
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                editor={ClassicEditor as any}
                data={value}
                config={{
                    extraPlugins: [UploadAdapterPlugin],
                    toolbar: {
                        items: [
                            "heading",
                            "|",
                            "bold",
                            "italic",
                            "link",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "outdent",
                            "indent",
                            "|",
                            "imageUpload",
                            "blockQuote",
                            "insertTable",
                            "mediaEmbed",
                            "|",
                            "undo",
                            "redo",
                            "alignment",
                            "fontColor",
                            "fontBackgroundColor",
                            "|",
                            "code",
                            "codeBlock",
                        ],
                    },
                    language: "ko",
                    image: {
                        toolbar: [
                            "imageTextAlternative",
                            "toggleImageCaption",
                            "imageStyle:inline",
                            "imageStyle:block",
                            "imageStyle:side",
                            "linkImage",
                        ],
                    },
                    table: {
                        contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
                    },
                    placeholder: placeholder || "내용을 입력하세요...",
                }}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    onChange(data);
                }}
                onReady={(editor) => {
                    if (editorRef) editorRef.current = {editor};
                    // 에디터 준비 완료 후 높이 설정
                    const editableElement = editor.ui.getEditableElement();
                    if (editableElement) {
                        editableElement.style.minHeight = "400px";
                    }
                }}
            />
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasPendingUploads(editor: any): boolean {
    const fileRepo = editor.plugins.get("FileRepository");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.from(fileRepo.loaders).some((loader: any) => loader.status !== "uploaded");
}
