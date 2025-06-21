import { useOrg } from "@/providers/org-provider";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaListUl } from "react-icons/fa";
import { ImCross } from "react-icons/im";

const PopUp = () => {
    const [isOpen, setIsOpen] = useState(false);
    const popUpRef = useRef<HTMLDivElement>(null);
    const { orgId } = useOrg();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                popUpRef.current &&
                !popUpRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const links = [
        { path: `/org/${orgId}/orders/buy`, name: "Buy Product" },
        { path: `/org/${orgId}/orders/sell`, name: "Sell Product" },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50" ref={popUpRef}>
            <div className="relative">
                <button
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all"
                >
                    {isOpen ? (
                        <ImCross className="w-6 h-6" />
                    ) : (
                        <FaListUl className="w-6 h-6" />
                    )}
                </button>

                {isOpen && (
                    <div className="absolute bottom-14 right-0 bg-blue-200 text-white shadow-lg border border-blue-300 rounded-lg py-2 w-48 transition-all">
                        <ul className="flex flex-col space-y-1">
                            {links.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-2 text-black text-lg hover:bg-blue-300 transition"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PopUp;
