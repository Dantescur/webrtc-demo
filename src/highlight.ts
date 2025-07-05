import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import "highlight.js/styles/atom-one-dark.css";

hljs.registerLanguage("typescript", typescript);

export const highlightCode = (
  code: string,
  language: string = "typescript",
) => {
  return hljs.highlight(code, { language }).value;
};
