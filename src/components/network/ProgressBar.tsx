type ProgressBarProps = {
  progress: number;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="text-center w-full max-w-[600px] px-4">
        <div className="text-white text-2xl font-semibold mb-4">Loading...</div>
        <div className="relative w-full h-8 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300 ease-in-out"
            style={{ width: `${Math.round(progress)}%` }}
          ></div>
        </div>

        <div className="text-white text-lg mt-2">{`${progress.toFixed(1)}%`}</div>
      </div>
    </div>
  );
};

export default ProgressBar;
