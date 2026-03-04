import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "./Navbar";
import { useParams } from "react-router-dom";

const ResetPassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { id, token } = useParams()
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const newPassword = watch("newPassword");

    const onSubmit = async (data) => {
        try {
            // const token = localStorage.getItem("token");
            const response = await axios.post(
                `http://localhost:8000//api/v1/auth/resetPassword/${id}/${token}`,
                data
            );

            if (response.data.success) {
                toast.success(response.data.message, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong!", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };

    return (
        <div >
            <div className="bg-black">
                <Navbar />
            </div>
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-8">Reset Password</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="newPassword">
                            New Password
                        </label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                {...register("newPassword", {
                                    required: "New Password is required.",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters long",
                                    },
                                })}
                            />
                            <span
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                            </span>
                        </div>
                        {errors.newPassword && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.newPassword.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                {...register("confirmPassword", {
                                    required: "Confirm Password is required.",
                                    validate: (value) =>
                                        value === newPassword || "Passwords do not match.",
                                })}
                            />
                            <span
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                            </span>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-start gap-4 pt-4">
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                            Update
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
