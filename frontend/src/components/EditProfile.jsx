import React, { useState, useEffect } from "react";
import {
  Check,
  User,
  Mail,
  Lock,
  Camera,
  Save,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navbar from "./Navbar";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";

const EditProfile = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    profileImage: null,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm();

  const currentPassword = watch("currentPassword");
  const initials = userData.name ? userData.name.slice(0, 2).toUpperCase() : "";

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/api/v1/auth/fetchUserDetails",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { name, email } = response.data;
      setUserData({ name, email });
      setValue("name", name);
      setValue("email", email);

      // Reset form to mark the form as pristine
      reset({ name, email });
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load your profile information");
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/updateUserDetails",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUpdateSuccess(true);
        // Update local state to reflect changes
        setUserData((prev) => ({ ...prev, name: data.name }));

        // Clear password fields
        setValue("currentPassword", "");
        setValue("newPassword", "");

        // Reset form to mark as pristine again
        reset({ name: data.name, email: data.email });

        // Hide success message after 3 seconds
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600">
        <Navbar />
        {/* Hero Section */}
        <div className="container flex flex-col justify-center items-center mx-auto px-4 py-10 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Account Settings
          </h1>
          <p className="text-lg mb-6 max-w-2xl opacity-90">
            Manage your personal information and account preferences
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {updateSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <Check className="h-5 w-5 text-green-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your profile has been updated successfully.
              </AlertDescription>
            </Alert>
          )}

          <Card className="shadow-md border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    Profile Information
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Update your personal details and password
                  </CardDescription>
                </div>
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                    <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                    <AvatarFallback className="bg-blue-600 text-white text-xl uppercase font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Tabs defaultValue="general" className="w-full">
                <CardContent className="p-6 pt-2">
                  <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="text-sm font-medium flex items-center"
                        >
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          Full Name
                        </label>
                        <div className="relative">
                          <Input
                            id="name"
                            className="pl-10"
                            placeholder="Your full name"
                            {...register("name", {
                              required: "Name is required",
                              minLength: {
                                value: 3,
                                message:
                                  "Name must be at least 3 characters long",
                              },
                            })}
                          />
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          {!errors.name &&
                            watch("name") &&
                            watch("name") !== userData.name && (
                              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                            )}
                        </div>
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium flex items-center"
                        >
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          Email Address
                        </label>
                        <div className="relative">
                          <Input
                            id="email"
                            className="pl-10 bg-gray-50"
                            type="email"
                            disabled
                            placeholder="Your email address"
                            {...register("email")}
                          />
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="currentPassword"
                          className="text-sm font-medium flex items-center"
                        >
                          <KeyRound className="h-4 w-4 mr-2 text-gray-500" />
                          Current Password
                        </label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            className="pl-10"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter current password"
                            {...register("currentPassword", {
                              minLength: {
                                value: 6,
                                message:
                                  "Password must be at least 6 characters long",
                              },
                            })}
                          />
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? (
                              <FaEyeSlash className="h-4 w-4" />
                            ) : (
                              <IoEyeSharp className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.currentPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="newPassword"
                          className="text-sm font-medium flex items-center"
                        >
                          <Lock className="h-4 w-4 mr-2 text-gray-500" />
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            className="pl-10"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            {...register("newPassword", {
                              required: currentPassword
                                ? "New Password is required"
                                : false,
                              minLength: {
                                value: 6,
                                message:
                                  "Password must be at least 6 characters long",
                              },
                            })}
                          />
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                          >
                            {showNewPassword ? (
                              <FaEyeSlash className="h-4 w-4" />
                            ) : (
                              <IoEyeSharp className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      {currentPassword && !watch("newPassword") && (
                        <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <AlertDescription>
                            You must provide a new password when changing your
                            password.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>
                </CardContent>

                <CardFooter className="border-t px-6 py-4 bg-gray-50 flex justify-between">
                  <div className="text-sm text-gray-500">
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => reset()}
                      disabled={!isDirty || isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      type="submit"
                      disabled={!isDirty || isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></span>
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </span>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Tabs>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
