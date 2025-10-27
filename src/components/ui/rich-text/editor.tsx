import React, { useEffect } from "react";
import {
  EditorContent,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import EditorToolbar from "./toolbar/editor-toolbar";

interface EditorProps {
  content:
    | string
    | undefined
    | null;
  className?: string;
  placeholder?: string;
  onChange: (
    value: string
  ) => void;
}

const Editor =
  ({
    content,
    placeholder,
    onChange,
    className,
  }: EditorProps) => {
    const editor =
      useEditor(
        {
          extensions:
            [
              StarterKit,
            ],
          content:
            content,
          immediatelyRender:
            false,
          onUpdate:
            ({
              editor,
            }) => {
              onChange(
                editor.getHTML()
              );
            },
        }
      );

    useEffect(() => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content || "");
      }
    }, [editor, content]);

    if (
      !editor
    )
      return (
        <>

        </>
      );

    return (
      <div
        className={`${className} prose max-w-none w-full min-h-24 border border-input bg-background `}
      >
        <EditorToolbar
          editor={
            editor
          }
        />
        <div className="editor">
          <EditorContent
            className="text-sm py-2"
            editor={
              editor
            }
            placeholder={
              placeholder
            }
          />
        </div>
      </div>
    );
  };

export default Editor;
