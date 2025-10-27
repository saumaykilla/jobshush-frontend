import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
} from "lucide-react";

import { Toggle } from "@/components/ui/toggle";
import {
  ToggleGroup,
  Toolbar,
} from "@/components/ui/rich-text/toolbar";

interface EditorToolbarProps {
  editor: Editor;
}

const EditorToolbar =
  ({
    editor,
  }: EditorToolbarProps) => {
    return (
      <Toolbar
        className="m-0 flex items-center bg-primary text-black justify-between p-2"
        aria-label="Formatting options"
      >
        <ToggleGroup
          className="flex flex-row items-center"
          type="multiple"
        >
          <Toggle
            size="sm"
            className="mr-1 data-[state=on]:text-white"
            onPressedChange={() =>
              editor
                .chain()
                .focus()
                .toggleBold()
                .run()
            }
            disabled={
              !editor
                .can()
                .chain()
                .focus()
                .toggleBold()
                .run()
            }
            pressed={editor.isActive(
              "bold"
            )}
          >
            <Bold className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            className="mr-1 data-[state=on]:text-white"
            onPressedChange={() =>
              editor
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }
            disabled={
              !editor
                .can()
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }
            pressed={editor.isActive(
              "italic"
            )}
            value="italic"
          >
            <Italic className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            className="mr-1 data-[state=on]:text-white"
            onPressedChange={() =>
              editor
                .chain()
                .focus()
                .toggleBulletList()
                .run()
            }
            pressed={editor.isActive(
              "bulletList"
            )}
          >
            <List className="h-4 w-4" />
          </Toggle>

          <Toggle
            size="sm"
            className="mr-1 data-[state=on]:text-white"
            onPressedChange={() =>
              editor
                .chain()
                .focus()
                .toggleOrderedList()
                .run()
            }
            pressed={editor.isActive(
              "orderedList"
            )}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        </ToggleGroup>
      </Toolbar>
    );
  };

export default EditorToolbar;
