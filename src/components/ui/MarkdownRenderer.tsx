import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  children: string;
}

/**
 * Secure markdown renderer for agent responses.
 *
 * Security features:
 * - Images completely disabled (prevents data exfiltration via HTTP requests)
 * - HTML parsing disabled (prevents XSS attacks)
 * - Links completely disabled (prevents tracking and phishing)
 * - All resource-loading elements blocked
 *
 * Only safe formatting elements are allowed: text formatting, code blocks,
 * lists, headings, blockquotes, and horizontal rules.
 */
export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  // Define custom components for styling
  const components: Components = {
    // Text formatting
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic">{children}</em>
    ),
    del: ({ children }) => (
      <del className="line-through">{children}</del>
    ),

    // Code (inline and blocks)
    code: (props) => {
      const { node, inline, className, children, ...rest } = props as any;
      if (inline) {
        return (
          <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono" {...rest}>
            {children}
          </code>
        );
      }
      // Block code
      return (
        <code className="block bg-gray-900 text-gray-100 p-3 rounded-lg my-2 overflow-x-auto font-mono text-xs whitespace-pre" {...rest}>
          {children}
        </code>
      );
    },

    // Pre tag (wraps code blocks)
    pre: ({ children }) => (
      <div className="my-2">
        {children}
      </div>
    ),

    // Paragraphs
    p: ({ children }) => (
      <p className="mb-2 last:mb-0">{children}</p>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="ml-4">{children}</li>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 py-1 my-2 italic text-gray-700">
        {children}
      </blockquote>
    ),

    // Headings (rarely used in agent responses, but safe to support)
    h1: ({ children }) => (
      <h1 className="text-xl font-bold mb-2 mt-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-bold mb-2 mt-2">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-sm font-bold mb-1 mt-2">{children}</h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-sm font-semibold mb-1 mt-2">{children}</h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-xs font-semibold mb-1 mt-2">{children}</h6>
    ),

    // Horizontal rule
    hr: () => (
      <hr className="my-4 border-gray-300" />
    ),
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      // Only allow safe elements - explicitly exclude images, links, and HTML
      allowedElements={[
        'p', 'br', 'strong', 'em', 'del',        // Text formatting
        'code', 'pre',                            // Code
        'ul', 'ol', 'li',                         // Lists
        'blockquote',                             // Quotes
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',      // Headings
        'hr',                                     // Horizontal rule
      ]}
      // Remove disallowed elements and show their children instead
      unwrapDisallowed={true}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}
