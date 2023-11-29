import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-php";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-java";
import React, { useCallback, useMemo } from "react";
import isHotkey from "is-hotkey";
import {
  Editable,
  withReact,
  useSlate,
  Slate,
  useSlateStatic,
  ReactEditor,
} from "slate-react";
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement,
  NodeEntry,
  Node,
} from "slate";
import { withHistory } from "slate-history";

import { Button, Icon, Toolbar } from "./components/index.tsx";
import { CodeBlockElement } from "../components/custom-types";
import { normalizeTokens } from "../utils/normalize-tokens.ts";
import { Range } from "slate";
import { css } from "@emotion/css";
import {
  CodeBlockType,
  CodeLineType,
  LIST_TYPES,
  ParagraphType,
  TEXT_ALIGN_TYPES,
  initialValue,
  prismThemeCss,
} from "./consts/index.ts";
import { isBlockActive, isMarkActive, toCodeLines } from "./utils/index.ts";
import { LanguageSelect } from "./components/LanguageSelect.tsx";

const CodeBlockButton = () => {
  const editor = useSlateStatic();
  const handleClick = () => {
    Transforms.wrapNodes(
      editor,
      { type: CodeBlockType, language: "html", children: [] },
      {
        match: (n) => SlateElement.isElement(n) && n.type === ParagraphType,
        split: true,
      }
    );
    Transforms.setNodes(
      editor,
      { type: CodeLineType },
      { match: (n) => SlateElement.isElement(n) && n.type === ParagraphType }
    );
  };

  return (
    <Button
      data-test-id="code-block-button"
      active
      onMouseDown={(event) => {
        event.preventDefault();
        handleClick();
      }}
    >
      <Icon>code</Icon>
    </Button>
  );
};

const useDecorate = (editor: Editor) => {
  return useCallback(
    ([node, path]) => {
      if (SlateElement.isElement(node) && node.type === CodeLineType) {
        const ranges = editor.nodeToDecorations?.get(node) || [];

        return ranges;
      }

      return [];
    },
    [editor.nodeToDecorations]
  );
};

const ToolbarWrapper = () => {
  return (
    <Toolbar>
      <CodeBlockButton />
      <MarkButton format="bold" icon="format_bold" />
      <MarkButton format="italic" icon="format_italic" />
      <MarkButton format="underline" icon="format_underlined" />
      <MarkButton format="code" icon="code" />
      <BlockButton format="heading-one" icon="looks_one" />
      <BlockButton format="heading-two" icon="looks_two" />
      <BlockButton format="block-quote" icon="format_quote" />
      <BlockButton format="numbered-list" icon="format_list_numbered" />
      <BlockButton format="bulleted-list" icon="format_list_bulleted" />
      <BlockButton format="left" icon="format_align_left" />
      <BlockButton format="center" icon="format_align_center" />
      <BlockButton format="right" icon="format_align_right" />
      <BlockButton format="justify" icon="format_align_justify" />
      <BlockButton format="js" icon="js" />
    </Toolbar>
  );
};

const renderLeaf = (props: any) => {
  let { attributes, children, leaf } = props;
  const { text, ...rest } = leaf as any;

  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = (
      <code
        style={{
          backgroundColor: "#eee",
          padding: 3,
        }}
      >
        {children}
      </code>
    );
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return (
    <span {...attributes} className={Object.keys(rest).join(" ")}>
      {children}
    </span>
  );
};

type RichTechComposerProps = {
  onChange: (value: Descendant[]) => void;
  content?: string;
};

export const RichTechComposer = (props: RichTechComposerProps) => {
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const decorate = useDecorate(editor);
  const onKeyDown = useOnKeydown(editor);

  const handleSlateChange = (value: Descendant[]) => {
    const isAstChange = editor.operations.some(
      (op) => "set_selection" !== op.type
    );
    if (isAstChange) {
      // Save the value to Local Storage.
      const content = JSON.stringify(value);
      localStorage.setItem("content", content);
    }
  };

  return (
    <Slate
      editor={editor}
      initialValue={props.content ? JSON.parse(props.content) : initialValue}
      onChange={handleSlateChange}
      onValueChange={props.onChange}
    >
      <ToolbarWrapper />
      <SetNodeToDecorations />
      <Editable
        decorate={decorate}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={onKeyDown}
        style={{ padding: "10px", border: "1px solid #ddd", outline: "none" }}
      />
      <style>{prismThemeCss}</style>
    </Slate>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const Element = ({ attributes, children, element }) => {
  const editor = useSlateStatic();

  if (element.type === CodeBlockType) {
    const setLanguage = (language: string) => {
      const path = ReactEditor.findPath(editor, element);
      Transforms.setNodes(editor, { language }, { at: path });
    };

    return (
      <div
        {...attributes}
        className={css(`
            font-family: monospace;
            font-size: 16px;
            line-height: 20px;
            margin-top: 0;
            background: rgba(0, 20, 60, .03);
            padding: 5px 13px;
          `)}
        style={{ position: "relative" }}
        spellCheck={false}
      >
        <LanguageSelect
          value={element.language}
          onChange={(e) => setLanguage(e.target.value)}
        />
        {children}
      </div>
    );
  }

  if (element.type === CodeLineType) {
    return (
      <div {...attributes} style={{ position: "relative" }}>
        {children}
      </div>
    );
  }

  const style = { textAlign: element.align };
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case "heading-one":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const mergeMaps = <K, V>(...maps: Map<K, V>[]) => {
  const map = new Map<K, V>();

  for (const m of maps) {
    for (const item of m) {
      map.set(...item);
    }
  }

  return map;
};
// precalculate editor.nodeToDecorations map to use it inside decorate function then
const SetNodeToDecorations = () => {
  const editor = useSlate();

  const blockEntries = Array.from(
    Editor.nodes(editor, {
      at: [],
      mode: "highest",
      match: (n) => SlateElement.isElement(n) && n.type === CodeBlockType,
    })
  );

  const nodeToDecorations = mergeMaps(
    ...(blockEntries.map(getChildNodeToDecorations as any) as any)
  );

  editor.nodeToDecorations = nodeToDecorations as any;

  return null;
};

const getChildNodeToDecorations = ([
  block,
  blockPath,
]: NodeEntry<CodeBlockElement>) => {
  const nodeToDecorations = new Map<SlateElement, Range[]>();

  const text = block.children.map((line) => Node.string(line)).join("\n");
  const language = block.language;
  const tokens = Prism.tokenize(text, Prism.languages[language]);
  const normalizedTokens = normalizeTokens(tokens); // make tokens flat and grouped by line
  const blockChildren = block.children as SlateElement[];

  for (let index = 0; index < normalizedTokens.length; index++) {
    const tokens = normalizedTokens[index];
    const element = blockChildren[index];

    if (!nodeToDecorations.has(element)) {
      nodeToDecorations.set(element, []);
    }

    let start = 0;
    for (const token of tokens) {
      const length = token.content.length;
      if (!length) {
        continue;
      }

      const end = start + length;

      const path = [...blockPath, index, 0];
      const range = {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        token: true,
        ...Object.fromEntries(token.types.map((type) => [type, true])),
      };

      nodeToDecorations.get(element)!.push(range);

      start = end;
    }
  }

  return nodeToDecorations;
};

const useOnKeydown = (editor: Editor) => {
  const onKeyDown: React.KeyboardEventHandler = useCallback(
    (e) => {
      if (isHotkey("tab", e)) {
        // handle tab key, insert spaces
        e.preventDefault();

        Editor.insertText(editor, "  ");
      }

      //   for (const hotkey in HOTKEYS) {
      //     if (isHotkey(hotkey, event as any)) {
      //       event.preventDefault();
      //       const mark = HOTKEYS[hotkey];
      //       toggleMark(editor, mark);
      //     }
      //   }
    },
    [editor]
  );

  return onKeyDown;
};
