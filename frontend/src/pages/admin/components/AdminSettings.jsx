import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminSettings = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [initials, setInitials] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      currentPassword: "",
      newPassword: ""
    }
  });

  const currentPassword = watch("currentPassword");
  const watchedValues = watch();
  
  // Fetch user details on component mount
  const fetchUserDetails = async () => {
    setIsLoading(true);
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
      
      if (response.data) {
        setValue("name", response.data.name);
        setValue("email", response.data.email);
        setInitials(response.data.name.substring(0, 2).toUpperCase());
        
        // Store original values for comparison
        reset({
          name: response.data.name,
          email: response.data.email,
          currentPassword: "",
          newPassword: ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to load user information");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Check if form values have changed
  useEffect(() => {
    if (isDirty || watchedValues.currentPassword || watchedValues.newPassword) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [watchedValues, isDirty]);

  // Handle form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    setSuccessMessage("");
    
    try {
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
        toast.success(response.data.message);
        setSuccessMessage(response.data.message || "Your settings have been updated successfully");
        
        // If name was changed, update initials
        if (data.name !== watchedValues.name) {
          setInitials(data.name.substring(0, 2).toUpperCase());
        }
        
        // Reset password fields
        setValue("currentPassword", "");
        setValue("newPassword", "");
        setHasChanges(false);
        
        // Refetch user details
        fetchUserDetails();
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setValue("currentPassword", "");
    setValue("newPassword", "");
    setHasChanges(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and change your credentials
          </p>
        </div>
        <Avatar className="h-12 w-12 shadow-md border-2 border-white">
          <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account's profile information and email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="name"
                    className="pl-10"
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 3,
                        message: "Name must be at least 3 characters long",
                      },
                    })}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    disabled
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Update Password */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Update Password</CardTitle>
              <CardDescription>
                Ensure your account is using a secure password. Leave blank if you don't want to change it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    className="pl-10"
                    {...register("currentPassword", {
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters long",
                      },
                    })}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
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
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    className="pl-10"
                    {...register("newPassword", {
                      required: currentPassword ? "New password is required when changing password" : false,
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters long",
                      },
                    })}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          {successMessage && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            {hasChanges && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;