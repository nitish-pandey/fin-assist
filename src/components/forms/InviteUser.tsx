import { useState } from "react";
import {
    FiMail,
    FiSend,
    FiAlertCircle,
    FiCheckCircle,
    FiPlus,
} from "react-icons/fi";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import Cookies from "universal-cookie";
import { inviteUser } from "@/utils/api";
interface InviteUserProps {
    orgId: string;
}

const InviteUser = ({ orgId }: InviteUserProps) => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const cookie = new Cookies();

    const handleInvite = async () => {
        try {
            setError("");
            setSuccess(false);
            setLoading(true);
            await inviteUser(email, orgId, cookie.get("token"));
            setEmail("");
            setSuccess(true);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dark">
            <Dialog>
                <DialogTrigger asChild>
                    <button className="flex items-center space-x-2 p-2">
                        <FiPlus className="w-5 h-5" />
                        <span>Invite User</span>
                    </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 text-gray-100 border-gray-700">
                    <DialogHeader>
                        <h2 className="text-lg font-semibold">Invite User</h2>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email address"
                                className="w-full pl-10 pr-4 py-2 border border-gray-700 bg-gray-900 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleInvite}
                            disabled={loading || !email}
                            className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${
                                loading || !email
                                    ? "opacity-50 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {loading ? (
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            ) : (
                                <FiSend className="mr-2" />
                            )}
                            {loading ? "Sending..." : "Send Invite"}
                        </button>
                        {error && (
                            <div className="flex items-center text-red-500">
                                <FiAlertCircle className="mr-2" />
                                <p>{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center text-green-500">
                                <FiCheckCircle className="mr-2" />
                                <p>Invitation sent successfully!</p>
                            </div>
                        )}
                    </div>
                    {/* <DialogFooter>
                        <button
                            className="text-sm font-medium hover:opacity-75"
                            onClick={() => {
                                setError("");
                                setSuccess(false);
                                setEmail("");
                            }}
                        >
                            Close
                        </button>
                    </DialogFooter> */}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default InviteUser;
