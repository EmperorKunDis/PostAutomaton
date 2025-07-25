import React, { useState, useRef, useEffect } from 'react';
import { 
  CommentEntityType,
  CommentMentionRequest,
  MentionUser 
} from '@internal-marketing-content-app/shared';
import { commentsService } from '../services/commentsService';
import { Send, X, AtSign } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  initialValue?: string;
  entityType: CommentEntityType;
  entityId: string;
  isEditing?: boolean;
}

interface MentionSuggestion extends MentionUser {
  highlighted?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  initialValue = "",
  entityType,
  entityId,
  isEditing = false
}) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(-1);
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  useEffect(() => {
    if (mentionQuery) {
      searchMentions(mentionQuery);
    } else {
      setMentionSuggestions([]);
    }
  }, [mentionQuery]);

  const searchMentions = async (query: string) => {
    try {
      const request: CommentMentionRequest = {
        query,
        entityType,
        entityId
      };
      
      const response = await commentsService.searchMentionUsers(request);
      setMentionSuggestions(response.users);
      setSelectedMentionIndex(-1);
    } catch (error) {
      console.error('Failed to search mentions:', error);
      setMentionSuggestions([]);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setContent(newContent);
    
    // Check for mentions
    const beforeCursor = newContent.slice(0, cursorPosition);
    const mentionMatch = beforeCursor.match(/@([^@\s]*)$/);
    
    if (mentionMatch) {
      setShowMentions(true);
      setMentionQuery(mentionMatch[1]);
      setMentionPosition({
        start: beforeCursor.lastIndexOf('@'),
        end: cursorPosition
      });
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < mentionSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : mentionSuggestions.length - 1
        );
      } else if (e.key === 'Enter' && selectedMentionIndex >= 0) {
        e.preventDefault();
        insertMention(mentionSuggestions[selectedMentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const insertMention = (user: MentionUser) => {
    const beforeMention = content.slice(0, mentionPosition.start);
    const afterMention = content.slice(mentionPosition.end);
    const mentionText = `@[${user.name}](${user.id}) `;
    
    const newContent = beforeMention + mentionText + afterMention;
    setContent(newContent);
    setShowMentions(false);
    setMentionQuery('');
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = beforeMention.length + mentionText.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          rows={3}
          disabled={isSubmitting}
        />
        
        {/* Character counter */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {content.length}/1000
        </div>
      </div>

      {/* Mention suggestions */}
      {showMentions && mentionSuggestions.length > 0 && (
        <div 
          ref={mentionsRef}
          className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto"
        >
          {mentionSuggestions.map((user, index) => (
            <button
              key={user.id}
              onClick={() => insertMention(user)}
              className={`
                w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 transition-colors
                ${index === selectedMentionIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''}
              `}
            >
              <AtSign className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email} • {user.role}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-gray-500">
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> to submit, 
          <kbd className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs">@</kbd> to mention
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isEditing ? 'Save' : 'Comment'}
          </button>
        </div>
      </div>

      {/* Click outside to close mentions */}
      {showMentions && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowMentions(false)}
        />
      )}
    </div>
  );
};