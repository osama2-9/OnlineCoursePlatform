import { AlertTriangle, Lightbulb, Quote } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
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

export const ContentBlock: React.FC<{ block: ContentBlock }> = ({ block }) => {
  switch (block.block_type) {
    case "HEADING":
      return (
        <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">
          {block.content}
        </h2>
      );

    case "TEXT":
      return (
        <p className="mb-5 text-gray-700 leading-relaxed">{block.content}</p>
      );

    case "CODE":
      return <CodeBlock block={block} />;

    case "TIP":
      return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 rounded-md shadow-sm">
          <div className="flex items-start">
            <Lightbulb className="text-blue-500 mt-1 mr-3 flex-shrink-0 w-5 h-5" />
            <div>
              <h4 className="font-bold text-blue-700 mb-1">Tip</h4>
              <p className="text-blue-800">{block.content}</p>
            </div>
          </div>
        </div>
      );

    case "WARNING":
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 rounded-md shadow-sm">
          <div className="flex items-start">
            <AlertTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0 w-5 h-5" />
            <div>
              <h4 className="font-bold text-yellow-700 mb-1">Warning</h4>
              <div className="text-yellow-800 whitespace-pre-line">
                {block.content}
              </div>
            </div>
          </div>
        </div>
      );

    case "DIVIDER":
      return <hr className="my-8 border-gray-200" />;

    case "QUOTE":
      return (
        <blockquote className="border-l-4 border-indigo-300 pl-4 py-2 my-6 italic text-gray-600 bg-gray-50 rounded-r-md shadow-sm">
          <div className="flex items-start">
            <Quote className="text-indigo-400 mt-1 mr-2 flex-shrink-0 w-5 h-5" />
            <p>{block.content}</p>
          </div>
        </blockquote>
      );

    case "IMAGE":
      return (
        <figure className="my-8">
          <img
            src={block.image_url || ""}
            alt={block.image_caption || "Article image"}
            className="rounded-lg w-full object-cover shadow-md hover:shadow-lg transition-shadow"
          />
          {block.image_caption && (
            <figcaption className="text-sm text-gray-500 mt-2 text-center italic">
              {block.image_caption}
            </figcaption>
          )}
        </figure>
      );

    default:
      return <p className="text-gray-700">{block.content}</p>;
  }
};
