import React, { useState } from "react";
import SimpleMDE from "react-simplemde-editor";
import { MDXProvider } from "@mdx-js/react";
import MDXRenderer from "@mdx-js/runtime";
import "easymde/dist/easymde.min.css";

const MDXComposer = () => {
  const [mdxContent, setMdxContent] = useState("");

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1, padding: "10px" }}>
        <SimpleMDE value={mdxContent} onChange={setMdxContent} />
      </div>
      <div style={{ flex: 1, padding: "10px", backgroundColor: "#f6f8fa" }}>
        <MDXProvider>
          <MDXRenderer>{mdxContent}</MDXRenderer>
        </MDXProvider>
      </div>
    </div>
  );
};

export default MDXComposer;
