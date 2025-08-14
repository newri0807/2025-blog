"use client"

import { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';

interface Tag {
  id: number;
  name: string;
  count: number;
}

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAllTags();
  }, []);

  const fetchAllTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const tags = await response.json();
      setAllTags(tags);
    } catch (error) {
      console.error('태그 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allTags.filter(tag => 
        tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(tag.name)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, allTags, value]);

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleSuggestionClick = (tag: Tag) => {
    addTag(tag.name);
  };

return (
  <div className="relative">
    <div className="min-h-[2.5rem] p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      <div className="flex flex-wrap gap-2 items-center">
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-md"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder={value.length === 0 ? placeholder || "태그를 입력하세요..." : ""}
        />
      </div>
    </div>

    {/* 자동완성 드롭다운 */}
    {showSuggestions && suggestions.length > 0 && (
      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
        {suggestions.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => handleSuggestionClick(tag)}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between text-gray-900 dark:text-white transition-colors"
          >
            <span>#{tag.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {tag.count}개 게시글
            </span>
          </button>
        ))}
      </div>
    )}

    {/* 인기 태그 */}
    {!showSuggestions && inputValue === '' && allTags.length > 0 && (
      <div className="mt-2">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">인기 태그:</p>
        <div className="flex flex-wrap gap-2">
          {allTags.slice(0, 8).map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => addTag(tag.name)}
              disabled={value.includes(tag.name)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md border transition-colors ${
                value.includes(tag.name)
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Plus className="w-3 h-3" />
              #{tag.name}
              <span className="text-xs text-gray-500 dark:text-gray-400">({tag.count})</span>
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);
}