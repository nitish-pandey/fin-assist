import { useGlobalContext } from "../../providers/ConfigProvider";

const ProfilePage = () => {
    const { profile } = useGlobalContext();

    return (
        <div className="container mx-auto px-3 py-8">
            <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
            <div className="mt-4">
                <div className="flex items-center">
                    <div className="w-3/4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Name: {profile?.name}
                        </h2>
                        <p className="text-gray-600">{profile?.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
