import React from "react";
import { useGlobalContext } from "../../providers/ConfigProvider";
import { FaUser, FaEnvelope, FaPhone, FaUserTag } from "react-icons/fa";

const ProfilePage = () => {
    const { profile } = useGlobalContext();

    if (!profile) {
        return <div className="text-center py-8">Loading profile...</div>;
    }

    return (
        <div className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 sm:p-10">
                    <h1 className="text-3xl font-bold text-white">Profile</h1>
                </div>
                <div className="px-6 py-8 sm:p-10">
                    <div className="flex flex-col sm:flex-row sm:items-center mb-8">
                        <div className="mb-4 sm:mb-0 sm:mr-6">
                            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                <FaUser size={48} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
                                {profile.name}
                            </h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ProfileItem
                            icon={<FaEnvelope />}
                            label="Email"
                            value={profile.email}
                        />
                        <ProfileItem
                            icon={<FaPhone />}
                            label="Contact"
                            value={profile.contact || "Not provided"}
                        />
                        <ProfileItem
                            icon={<FaUserTag />}
                            label="Type"
                            value={profile.type}
                        />
                        <ProfileItem
                            icon={<FaUserTag />}
                            label="Status"
                            value={profile.status}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileItem = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) => (
    <div className="flex items-center">
        <div className="text-blue-500 mr-3">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-gray-800 font-medium">{value}</p>
        </div>
    </div>
);

export default ProfilePage;
