import React from "react";
import { useAuth } from "../../providers/auth-provider";
import { FaUser, FaEnvelope } from "react-icons/fa";

const ProfilePage = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="text-center py-8">Loading profile...</div>;
    }

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl mx-auto rounded-lg shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 sm:p-10">
                    <h1 className="text-3xl font-bold">Profile</h1>
                </div>
                <div className="px-6 py-8 sm:p-10">
                    <div className="flex flex-col sm:flex-row sm:items-center mb-8">
                        <div className="mb-4 sm:mb-0 sm:mr-6">
                            <div className="w-24 h-24 rounded-full-300 flex items-center justify-center">
                                <FaUser size={48} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-1">{user.name}</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ProfileItem icon={<FaEnvelope />} label="Email" value={user.email} />
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
            <p className="text-sm ">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    </div>
);

export default ProfilePage;
