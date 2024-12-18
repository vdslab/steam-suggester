import { NodeType } from "@/types/NetworkType"

const PriceDisplay = ({ node }: { node: NodeType }) => {
  return (
    <>
      <strong>価格:</strong> {node.price ? (
        Number(node.salePrice) !== Number(node.price) ? (
          <span className="flex items-center space-x-2">
            <s className="text-gray-400">{`${node.price}円`}</s>
            <span className="text-red-400 font-semibold">{`${node.salePrice}円`}</span>
          </span>
        ) : (
          <span className="text-white">{`${node.price}円`}</span>
        )
      ) : (
        <span className="text-green-500">無料</span>
      )}
    </>
  )
}

export default PriceDisplay