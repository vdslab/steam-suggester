"use client";

import { useState } from "react";

type Props = {
  tags: string[] | undefined;
};

const MAX_VISIBLE_TAGS = 3;

const Tags = ({ tags }:Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!tags || tags.length === 0) return <div>No tags</div>;

  const visibleTags = isExpanded ? tags : tags.slice(0, MAX_VISIBLE_TAGS);
  const hasMore = tags.length > MAX_VISIBLE_TAGS;

  return (
    <div className="text-white mt-2">
      <strong>タグ:</strong> {visibleTags.join(", ")}
      {hasMore && (
        <button
          className="ml-2 text-blue-400 hover:underline"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "一部のタグのみ表示" : "全てのタグを表示"}
        </button>
      )}
    </div>
  );
};

export default Tags;