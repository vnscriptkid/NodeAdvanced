import { Editor, Element as SlateElement } from "slate";
import { CodeLineType } from "../consts/index.ts";

export const toChildren = (content: string) => [{ text: content }];

export const toCodeLines = (content: string): SlateElement[] =>
  content
    .split("\n")
    .map((line) => ({ type: CodeLineType, children: toChildren(line) }));

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const isBlockActive = (editor, format, blockType = "type") => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  );

  return !!match;
};
