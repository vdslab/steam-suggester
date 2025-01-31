'use client'

import { useState } from "react";

type Props = {
  tags: string[];
  addSelectedTags: (newTag: string) => void;
};

const DetailTags = (props:Props) => {

  const { tags, addSelectedTags } = props;

  const [isExpanded, setIsExpanded] = useState(false);

  const maxTagsToShow = 10;

  return (
    <div className="text-white">
    {tags.length > 0 && (
      <div className="flex flex-wrap items-center">
        {!isExpanded ? (
          <>
            {tags.slice(0, maxTagsToShow).map((tag, index) => (
              <span
                key={index}
                className="bg-green-500 text-xs p-0.5 mr-1 mb-1 rounded inline-block whitespace-nowrap cursor-pointer select-none"
                onClick={() => addSelectedTags(tag)}
              >
                {tag}
              </span>
            ))}
            {tags.length > maxTagsToShow && (
              <div className="group text-sky-600 transition duration-300 cursor-pointer" onClick={() => setIsExpanded(true)}>
                他{tags.length - maxTagsToShow}件
                <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-sky-600"></span>
              </div>
            )}
          </>
        ) : (
          // 全表示
          <>
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-green-500 text-xs p-0.5 mr-1 mb-1 rounded inline-block whitespace-nowrap cursor-pointer select-none"
                onClick={() => addSelectedTags(tag)}
              >
                {tag}
              </span>
            ))}
            <div className="group text-sky-600 transition duration-300 cursor-pointer" onClick={() => setIsExpanded(false)}>
              閉じる
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-sky-600"></span>
            </div>
          </>
        )}
      </div>
    )}
  </div>
  )
}

export default DetailTags