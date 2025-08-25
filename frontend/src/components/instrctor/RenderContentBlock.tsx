import { Trash2 } from "lucide-react";
import { Articel, ContentBlock } from "../../pages/CreateArticle";
import { ReactNode } from "react";

interface RenderContentBlockProps {
  block: ContentBlock;
  article: Articel;
  index: number;
  renderBlockIcon: (blocktype: string) => ReactNode;
  moveBlockUp: (index: number) => void;
  moveBlockDown: (index: number) => void;
  handleRemoveBlock: (blockId: number) => void;
  handleUpdateBlock: (blockId: number, content: string, value?: any) => void;
}

export const RenderContentBlock = ({
  block,
  index,
  article,
  renderBlockIcon,
  moveBlockUp,
  moveBlockDown,
  handleUpdateBlock,
  handleRemoveBlock,
}: RenderContentBlockProps) => {
  return (
    <div
      key={block.id}
      className="relative mb-4 border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {renderBlockIcon(block.block_type)}
          <span className="ml-2 font-medium text-gray-700">
            {block.block_type}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => moveBlockUp(index)}
            disabled={index === 0}
            className={`p-1 rounded hover:bg-gray-100 ${
              index === 0 ? "text-gray-300" : "text-gray-500"
            }`}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => moveBlockDown(index)}
            disabled={index === article.content_blocks.length - 1}
            className={`p-1 rounded hover:bg-gray-100 ${
              index === article.content_blocks.length - 1
                ? "text-gray-300"
                : "text-gray-500"
            }`}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => handleRemoveBlock(block.id)}
            className="p-1 rounded text-gray-500 hover:bg-gray-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {block.block_type === "TEXT" && (
        <textarea
          value={block.content || ""}
          onChange={(e) =>
            handleUpdateBlock(block.id, "content", e.target.value)
          }
          placeholder="Enter your text content here..."
          className="w-full p-2 border border-gray-300 rounded-md min-h-32"
        />
      )}

      {block.block_type === "HEADING" && (
        <input
          type="text"
          value={block.content || ""}
          onChange={(e) =>
            handleUpdateBlock(block.id, "content", e.target.value)
          }
          placeholder="Enter heading text..."
          className="w-full p-2 border border-gray-300 rounded-md font-bold text-lg"
        />
      )}

      {block.block_type === "CODE" && (
        <div className="space-y-2">
          <select
            value={block.code_language || "javascript"}
            onChange={(e) =>
              handleUpdateBlock(block.id, "code_language", e.target.value)
            }
            className="block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="swift">Swift</option>
            <option value="kotlin">Kotlin</option>
            <option value="typescript">TypeScript</option>
            <option value="sql">SQL</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
          <textarea
            value={block.code_content || ""}
            onChange={(e) =>
              handleUpdateBlock(block.id, "code_content", e.target.value)
            }
            placeholder="Enter your code here..."
            className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm min-h-40 bg-gray-50"
          />
        </div>
      )}

      {block.block_type === "IMAGE" && (
        <div className="space-y-2">
          <input
            type="text"
            value={block.image_url || ""}
            onChange={(e) =>
              handleUpdateBlock(block.id, "image_url", e.target.value)
            }
            placeholder="Enter image URL..."
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            value={block.image_caption || ""}
            onChange={(e) =>
              handleUpdateBlock(block.id, "image_caption", e.target.value)
            }
            placeholder="Enter image caption (optional)..."
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {block.image_url && (
            <div className="mt-2 border rounded-md p-2 bg-gray-50">
              <img
                src="/api/placeholder/400/320"
                alt="Image preview"
                className="max-w-full h-auto rounded"
              />
            </div>
          )}
        </div>
      )}

      {(block.block_type === "WARNING" ||
        block.block_type === "TIP" ||
        block.block_type === "QUOTE") && (
        <textarea
          value={block.content || ""}
          onChange={(e) =>
            handleUpdateBlock(block.id, "content", e.target.value)
          }
          placeholder={`Enter your ${block.block_type.toLowerCase()} content here...`}
          className="w-full p-2 border border-gray-300 rounded-md min-h-24 bg-gray-50"
        />
      )}

      {block.block_type === "DIVIDER" && (
        <div className="py-2">
          <hr className="border-t-2 border-gray-200" />
        </div>
      )}
    </div>
  );
};
