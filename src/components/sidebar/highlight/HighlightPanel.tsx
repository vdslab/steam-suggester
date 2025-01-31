"use client";

import Panel from "../../common/Panel";
import HighlightOutlinedIcon from "@mui/icons-material/HighlightOutlined";
import TagsSelect from "./TagsSelect";

type Props = {
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
};

const HighlightPanel = (props: Props) => {
  const { selectedTags, setSelectedTags } = props;

  return (
    <Panel
      title={
        <div className="flex items-center">
          <span>強調表示</span>
        </div>
      }
      icon={<HighlightOutlinedIcon className="mr-2 text-white" />}
    >
      {/* 説明文を直接表示 */}
      <p className="text-sm text-white mb-4">
        指定のタグを含むゲームを強調表示できます。
      </p>

      <TagsSelect selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
    </Panel>
  );
};

export default HighlightPanel;
