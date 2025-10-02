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
    const editor = useRef(null);

    const config = {
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
        style: {
            fontFamily: "Inter, sans-serif",
        },
    };

    return (
        <JoditEditor
            ref={editor}
            value={value}
            config={config}
            onBlur={(newContent: string) => onChange(newContent)}
            onChange={(newContent: string) => { }}
        />
    );
};

export default JoditEditorWrapper;