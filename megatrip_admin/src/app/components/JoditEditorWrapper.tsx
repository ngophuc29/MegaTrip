import React, { useEffect, useRef, useMemo, useCallback } from "react";
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

    const config = useMemo(() => ({
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
        style: { fontFamily: "Inter, sans-serif" },
        uploader: {
            insertImageAsBase64URI: true,
            imagesExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
        },
        allowDragAndDropFiles: true,
        convertToXhtml: false,
    }), [placeholder]);

    const handleChange = useCallback((newContent: string) => {
        onChange(newContent);
    }, [onChange]);

    return (
        <JoditEditor
            ref={editor}
            value={typeof value === "string" ? value : ""}
            config={config}
            onChange={handleChange}
        />
    );
};

export default JoditEditorWrapper;