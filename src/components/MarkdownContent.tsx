import React from 'react';
import Markdown from 'react-markdown';
import './MarkdownContent.css';

interface MarkdownContentProps {
  content: string;
  isUser: boolean;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, isUser }) => {
  // Pour les messages utilisateur, on affiche le texte brut
  if (isUser) {
    return <span>{content}</span>;
  }

  // Pour les messages du bot, on affiche le markdown
  return (
    <div className="markdown-content">
      <Markdown
        components={{
          // Personnalisation des composants markdown
          h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
          p: ({ children }) => <p className="markdown-p">{children}</p>,
          ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
          ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
          li: ({ children }) => <li className="markdown-li">{children}</li>,
          strong: ({ children }) => <strong className="markdown-strong">{children}</strong>,
          em: ({ children }) => <em className="markdown-em">{children}</em>,
          code: ({ children }) => <code className="markdown-code">{children}</code>,
          pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
          a: ({ href, children }) => (
            <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};

export default MarkdownContent;
