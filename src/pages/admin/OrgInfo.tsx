import { OrganizationSchema } from "@/data/types";
import { getOrgInfo } from "@/utils/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cookies from "universal-cookie";
import {
    FaBuilding,
    FaEnvelope,
    FaGlobe,
    FaUser,
    FaIdCard,
    FaCalendarAlt,
    FaImage,
} from "react-icons/fa";

const OrgInfoPage = () => {
    const { orgId } = useParams<{ orgId: string }>() as { orgId: string };
    const cookie = new Cookies();

    const [orgData, setOrgData] = useState<OrganizationSchema>();

    useEffect(() => {
        getOrgInfo(orgId, cookie.get("token")).then((data) => {
            setOrgData(data);
        });
    }, []);

    if (!orgData) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                    <FaBuilding className="text-indigo-600" /> Organization Info
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <InfoItem
                        icon={<FaEnvelope className="text-gray-600" />}
                        label="Contact"
                        value={orgData.contact}
                    />
                    <InfoItem
                        icon={<FaGlobe className="text-gray-600" />}
                        label="Domain"
                        value={orgData.domain}
                    />
                    <InfoItem
                        icon={<FaIdCard className="text-gray-600" />}
                        label="PAN"
                        value={orgData.panNumber}
                    />
                    <InfoItem
                        icon={<FaIdCard className="text-gray-600" />}
                        label="VAT"
                        value={orgData.vatNumber}
                    />
                    <InfoItem
                        icon={<FaUser className="text-gray-600" />}
                        label="Owner ID"
                        value={orgData.ownerId}
                    />
                    <InfoItem
                        icon={<FaCalendarAlt className="text-gray-600" />}
                        label="Created At"
                        value={new Date(orgData.createdAt).toLocaleString()}
                    />
                    <InfoItem
                        icon={<FaCalendarAlt className="text-gray-600" />}
                        label="Updated At"
                        value={new Date(orgData.updatedAt).toLocaleString()}
                    />
                </div>
                {orgData.logo && (
                    <div className="flex justify-center mb-6">
                        <div className="w-32 h-32 relative">
                            <img
                                src={orgData.logo}
                                alt={`${orgData.name} logo`}
                                className="w-full h-full object-cover rounded-full border border-gray-200"
                            />
                            <FaImage className="absolute bottom-0 right-0 text-gray-600 text-xl bg-white rounded-full p-1" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | null;
}> = ({ icon, label, value }) => (
    <div className="flex items-center gap-2">
        {icon}
        <p className="text-gray-700">
            <strong>{label}:</strong> {value || "N/A"}
        </p>
    </div>
);

export default OrgInfoPage;
