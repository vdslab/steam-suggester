import { NodeType } from "@/types/NetworkType";
import ReviewCloud, { getColorByScore } from "../charts/ReviewCloud";
import HelpTooltip from "../common/HelpTooltip";
import RateReviewIcon from "@mui/icons-material/RateReview";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";

type Props = {
  parentW: number;
  parentH: number;
  node: NodeType;
};

const ReviewCloudPanel = ({ node, parentW, parentH }: Props) => {

  return (
    <div className="px-2 mt-2">
      <h3 className="text-white text-lg font-semibold mb-2 flex items-center">
        <RateReviewIcon className="mr-1" />
        レビュー分析
        <HelpTooltip title="ゲームレビュー文に多く含まれた単語ほど、大きく表示されます。単語の色はその単語が含まれているレビューの評判によって変化します。" />

        <div className="flex items-center space-x-2 ml-2">
          <ThumbDownAltOutlinedIcon />
          <div
            className="h-2 w-24 mx-4 rounded"
            style={{
              background: `linear-gradient(to right,  ${getColorByScore(
                -1
              )}, ${getColorByScore(0)}, ${getColorByScore(1)})`,
            }}
          />
          <ThumbUpAltOutlinedIcon />
        </div>
      </h3>


      {node.review && <ReviewCloud parentW={parentW} parentH={parentH} reviewData={node.review} />}
    </div>
  );
};

export default ReviewCloudPanel;
