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
              <span
                className="text-blue-400 cursor-pointer ml-1"
                onClick={() => setIsExpanded(true)}
              >
                他{tags.length - maxTagsToShow}件
              </span>
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
            <span
              className="text-blue-400 cursor-pointer ml-1"
              onClick={() => setIsExpanded(false)}
            >
              閉じる
            </span>
          </>
        )}
      </div>
    )}
  </div>
  )
}

export default DetailTags