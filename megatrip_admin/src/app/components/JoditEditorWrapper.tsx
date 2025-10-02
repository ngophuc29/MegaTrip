import React, { useEffect, useRef } from "react";
import JoditEditor from "jodit-react";

interface JoditEditorWrapperProps {
    value: string;
    onChange: (newValue: string) => void;
    placeholder?: string;
}

const JoditEditorWrapper: React.FC<JoditEditorWrapperProps> = ({
    value,
    onChange,
    placeholder,
}) => {
    const editor = useRef<any>(null);

    const config: any = {
        readonly: false,
        placeholder: placeholder || "Start typing...",
        height: 400,
        buttons: [
            "bold",
            "italic",
            "underline",
            "|",
            "ul",
            "ol",
            "|",
            "outdent",
            "indent",
            "|",
            "font",
            "fontsize",
            "brush",
            "paragraph",
            "|",
            // image button allows inserting by URL; uploader below enables local file upload (as base64)
            "image",
            "link",
            "|",
            "align",
            "undo",
            "redo",
            "|",
            "cut",
            "copy",
            "paste",
            "|",
            "hr",
            "symbol",
            "source",
        ],
        toolbarAdaptive: false,
        askBeforePasteHTML: false,
        defaultActionOnPaste: "insert_only_text",
        style: {
            fontFamily: "Inter, sans-serif",
        },

        // Enable simple client-side image upload (data URI) so users can pick files from their machine
        uploader: {
            insertImageAsBase64URI: true, // insert uploaded images as base64 data URIs
            imagesExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
        },

        // Allow dropping/pasting images directly into the editor
        allowDragAndDropFiles: true,
        // Accept pasted images and convert to base64
        convertToXhtml: false,
    };

    return (
        <JoditEditor
            ref={editor}
            value={value}
            config={config}
            // keep onBlur but also forward onChange so parent updates live
            onBlur={(newContent: string) => onChange(newContent)}
            onChange={(newContent: string) => onChange(newContent)}
        />
    );
};

export default JoditEditorWrapper;