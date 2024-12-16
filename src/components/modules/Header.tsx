import { useState, useRef, useEffect } from "react";
import { FaUser, FaSignOutAlt, FaBuilding } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/ConfigProvider";

const headerOptions = [
    {
        title: "Your Profile",
        icon: FaUser,
        path: "/settings/profile",
    },
    {
        title: "Sign out",
        icon: FaSignOutAlt,
        path: "/auth/logout",
    },
];

interface Headerprops {
    orgId: string;
}

export function Header({ orgId }: Headerprops) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { organization, permissions } = useAuth();
    const [currentOrg, setCurrentOrg] = useState<string>();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    useEffect(() => {
        if (
            organization &&
            orgId &&
            organization.find((org) => org.id === orgId)
        ) {
            setCurrentOrg(organization.find((org) => org.id === orgId)?.id);
        } else if (
            permissions &&
            orgId &&
            permissions.find((perm) => perm.organizationId === orgId)
        ) {
            const perm = permissions.find(
                (perm) => perm.organizationId === orgId
            );
            if (perm) {
                setCurrentOrg(perm.organizationId);
            }
        } else if (organization && organization.length === 0) {
            navigate("/settings/orgs");
        }
    }, [orgId, organization, permissions]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const switchOrganization = (orgId: string) => {
        setCurrentOrg(orgId);
        setIsDropdownOpen(false);
    };

    return (
        <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-black bg-white px-3 py-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
            >
                <FaBuilding className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium hidden sm:inline">
                    {organization?.find((org) => org.id === currentOrg)?.name ||
                        "Org-" + currentOrg?.slice(0, 5)}
                </span>
                <IoMdArrowDropdown
                    className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                            Switch Organization
                        </p>
                        {organization?.map((org) => (
                            <Link
                                to={`/org/${org.id}/dashboard`}
                                key={org.id}
                                onClick={() => switchOrganization(org.id)}
                                className={`flex items-center w-full px-4 py-2 text-sm ${
                                    currentOrg === org.id
                                        ? "text-blue-600 bg-blue-50 font-medium"
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <FaBuilding className="mr-3 h-4 w-4" />
                                {org.name}
                            </Link>
                        ))}
                        {permissions
                            // remove duplicate organizations
                            ?.filter(
                                (perm, index, self) =>
                                    index ===
                                    self.findIndex(
                                        (t) =>
                                            t.organizationId ===
                                            perm.organizationId
                                    )
                            )
                            .map((perm) => (
                                <Link
                                    to={`/org/${perm.organizationId}/dashboard`}
                                    key={perm.id}
                                    onClick={() =>
                                        switchOrganization(perm.organizationId)
                                    }
                                    className={`flex items-center w-full px-4 py-2 text-sm ${
                                        currentOrg === perm.organizationId
                                            ? "text-blue-600 bg-blue-50 font-medium"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <FaBuilding className="mr-3 h-4 w-4" />
                                    {perm.organizationId.slice(0, 15)}
                                </Link>
                            ))}
                    </div>
                    <div className="border-t border-gray-200"></div>
                    {headerOptions.map((option, index) => (
                        <Link
                            key={index}
                            to={option.path}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <option.icon className="mr-3 h-4 w-4" />
                            {option.title}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
