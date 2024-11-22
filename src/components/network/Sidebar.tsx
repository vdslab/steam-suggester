/* src/components/network/Sidebar.tsx */

"use client";

import { HomeIcon, FilterIcon, UsersIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

type SidebarProps = {
  activeMenuItem: string;
  setActiveMenuItem: (item: string) => void;
};

const Sidebar = ({ activeMenuItem, setActiveMenuItem }: SidebarProps) => {
  const menuItems = [
    { name: "Network", icon: HomeIcon, key: "network" },
    { name: "Filter", icon: FilterIcon, key: "filter" },
    { name: "Streamers", icon: UsersIcon, key: "streamers" },
    { name: "Chat", icon: ChatBubbleLeftRightIcon, key: "chat" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 text-2xl font-bold">GameNet</div>
      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`flex items-center w-full p-4 hover:bg-stone-800 focus:outline-none ${
              activeMenuItem === item.key ? "bg-stone-800" : ""
            }`}
            onClick={() => setActiveMenuItem(item.key)}
          >
            <item.icon className="h-6 w-6 mr-2" />
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
