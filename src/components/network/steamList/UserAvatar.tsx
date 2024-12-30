/* UserAvatar.tsx */
"use client";
const UserAvatar: React.FC = () => {
  return (
    <div className="absolute top-4 right-4 flex items-center space-x-2 z-50">
      <div className="w-10 h-10 bg-red-800 rounded-full border border-gray-400"></div>
    </div>
  );
};

export default UserAvatar;
