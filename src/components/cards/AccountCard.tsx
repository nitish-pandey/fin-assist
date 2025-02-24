"use client";

import type React from "react";
import { useState } from "react";
import { FaUniversity, FaCreditCard, FaMoneyBillWave, FaEye, FaEyeSlash } from "react-icons/fa";

interface AccountCardProps {
    accountName: string;
    accountNumber: string;
    bankName: string;
    balance: number;
    onClick?: () => void;
    isSelected?: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({
    accountName,
    accountNumber,
    bankName,
    balance,
    onClick,
    isSelected,
}) => {
    const [showBalance, setShowBalance] = useState(false);

    const toggleBalance = () => setShowBalance(!showBalance);

    const maskedAccountNumber = accountNumber.replace(/\d(?=\d{4})/g, "*");

    return (
        <div
            className={`bg-white border-2 rounded-xl p-6 w-full max-w-sm cursor-pointer transition-all duration-300 ${
                isSelected ? "border-blue-500" : ""
            }`}
            onClick={onClick}
        >
            <div className="flex flex-col space-y-4">
                <div className="flex gap-3 items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <FaUniversity className="text-blue-600 text-2xl" />
                        <h3 className="text-xl font-semibold text-gray-800">{accountName}</h3>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {bankName}
                    </span>
                </div>

                <div className="flex items-center space-x-2 text-gray-600">
                    <FaCreditCard className="text-gray-400" />
                    <p className="text-sm">{maskedAccountNumber}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <FaMoneyBillWave className="text-green-500 text-xl" />
                        <p className="text-sm text-gray-600">Current Balance</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {showBalance ? (
                            <p className="text-2xl font-bold text-green-600">
                                $
                                {balance.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                        ) : (
                            <p className="text-2xl font-bold text-gray-600">{"*".repeat(8)}</p>
                        )}
                        <button
                            onClick={toggleBalance}
                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
                            aria-label={showBalance ? "Hide balance" : "Show balance"}
                        >
                            {showBalance ? (
                                <FaEyeSlash className="text-xl" />
                            ) : (
                                <FaEye className="text-xl" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountCard;
