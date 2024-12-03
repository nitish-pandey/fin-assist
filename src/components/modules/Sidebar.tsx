import { useEffect, useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { MdInventory } from "react-icons/md";

import { Link, useLocation } from "react-router-dom";
import { SidebarOptionType } from "../../layouts/OrgLayout";

interface SidebarProps {
    sidebarOptions: SidebarOptionType[];
}

const Sidebar = ({ sidebarOptions }: SidebarProps) => {
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    const toggleSubmenu = (name: string) => {
        setOpenSubmenu(openSubmenu === name ? null : name);
    };
    const loc = useLocation();

    useEffect(() => {
        const currentPath = loc.pathname;
        const currentOption = sidebarOptions.find(
            (option) => option.path === currentPath
        );
        if (currentOption) {
            setOpenSubmenu(currentOption.name);
        }
    }, [loc]);

    return (
        <div className="w-64 h-screen bg-gray-100 p-4 border-r-2 border-gray-400">
            <div className="flex items-center justify-center space-x-2 mb-8">
                <MdInventory className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-semibold text-gray-800">
                    Inventory
                </span>
            </div>
            <nav className="space-y-2">
                {sidebarOptions.map((option) => (
                    <div key={option.name}>
                        {!option.options ? (
                            <Link
                                to={option.path || "#"}
                                onClick={() => setOpenSubmenu(option.name)}
                                className={`flex gap-2 items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-3xl transition-colors duration-200
                                    ${
                                        openSubmenu === option.name
                                            ? "bg-gray-300"
                                            : ""
                                    } `}
                            >
                                {option.icon}
                                {option.name}
                            </Link>
                        ) : (
                            <div>
                                <button
                                    onClick={() => toggleSubmenu(option.name)}
                                    className={`flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-3xl transition-colors duration-200 ${
                                        openSubmenu === option.name
                                            ? "bg-gray-300"
                                            : ""
                                    }`}
                                >
                                    <div className="flex gap-2 items-center">
                                        {option.icon}
                                        {option.name}
                                    </div>
                                    {openSubmenu === option.name ? (
                                        <MdKeyboardArrowDown className="h-5 w-5" />
                                    ) : (
                                        <MdKeyboardArrowRight className="h-5 w-5" />
                                    )}
                                </button>
                                <div
                                    className={`ml-4 mt-2 space-y-2 transition-all duration-200 ease-in-out ${
                                        openSubmenu === option.name
                                            ? "max-h-40 opacity-100"
                                            : "max-h-0 opacity-0 overflow-hidden"
                                    }`}
                                >
                                    {option.options.map((subOption) => (
                                        <Link
                                            key={subOption.name}
                                            to={
                                                subOption.path
                                                    ? subOption.path
                                                    : "#"
                                            }
                                            className="flex gap-2 items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-3xl transition-colors duration-200"
                                        >
                                            {subOption.icon}
                                            {subOption.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
