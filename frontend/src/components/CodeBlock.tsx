import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface ContentBlock {
  block_id: number;
  article_id: number;
  order: number;
  block_type:
    | "HEADING"
    | "TEXT"
    | "CODE"
    | "TIP"
    | "WARNING"
    | "DIVIDER"
    | "QUOTE"
    | "IMAGE"
    | "VIDEO";
  content: string | null;
  code_language: string | null;
  code_content: string | null;
  image_url: string | null;
  image_caption: string | null;
  video_url: string | null;
  video_duration: string | null;
  quiz_id: number | null;
  created_at: string;
  updated_at: string;
}
export const CodeBlock: React.FC<{ block: ContentBlock }> = ({ block }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!block.code_content) return;

    navigator.clipboard.writeText(block.code_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageColor = (language: string | null): string => {
    const colorMap: Record<string, string> = {
      javascript: "#f7df1e",
      typescript: "#3178c6",
      python: "#3776ab",
      java: "#007396",
      csharp: "#239120",
      cpp: "#00599c",
      go: "#00add8",
      rust: "#dea584",
      swift: "#ffac45",
      php: "#777bb4",
      ruby: "#cc342d",
      html: "#e34c26",
      css: "#264de4",
      sql: "#e38c00",
      bash: "#4eaa25",
      default: "#858585",
    };

    return language && colorMap[language.toLowerCase()]
      ? colorMap[language.toLowerCase()]
      : colorMap.default;
  };

  return (
    <div className="my-6 rounded-md overflow-hidden border border-gray-200 shadow-sm">
      <div className="bg-gray-800 text-gray-200 px-3 py-2 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: getLanguageColor(block.code_language) }}
          />
          <span className="text-xs font-medium">{block.code_language}</span>
        </div>
        <button
          className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          title={copied ? "Copied!" : "Copy code"}
          onClick={copyToClipboard}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      <div className="flex">
        <div className="bg-gray-800 text-gray-500 px-2 py-3 text-right select-none font-mono text-xs">
          {block.code_content?.split("\n").map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <pre className="bg-gray-900 p-3 overflow-x-auto w-full">
          <code className="text-sm font-mono text-gray-200 whitespace-pre">
            {block.code_content}
          </code>
        </pre>
      </div>
    </div>
  );
};
