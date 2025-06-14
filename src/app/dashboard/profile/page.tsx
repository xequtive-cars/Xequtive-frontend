"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Shield,
  Mail,
  Phone,
  Loader2,
  Check,
  Camera,
  BellRing,
  Lock,
  LogOut,
  Calendar,
  BookOpen,
  UserCheck,
} from "lucide-react";
import { Loading3D } from "@/components/ui/loading-3d";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import SimplePhoneInput from "@/components/ui/simple-phone-input";
import { authService } from "@/lib/auth";

export default function ProfilePage() {
  const { user, isLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    notifications: {
      email: true,
      sms: true,
    },
  });

  // Set mounted state to handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user data when available and trigger refresh on profile_updated events
  useEffect(() => {
    if (user) {
      console.log("📱 Profile Load - Retrieved user phone number:", user.phoneNumber);
      setFormData((prevData) => ({
        ...prevData,
        fullName: user.displayName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      }));
    }
  }, [user]);

  // Listen for profile updates and refresh auth context
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Trigger auth context to refresh user data from server
      window.dispatchEvent(new Event("auth_success"));
    };

    window.addEventListener("profile_updated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profile_updated", handleProfileUpdate);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePhoneChange = (value: string) => {
    setFormData({
      ...formData,
      phoneNumber: value,
    });
  };

  const handleSwitchChange = (key: string, checked: boolean) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [key]: checked,
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      console.log("📱 Profile Update - Sending phone number:", formData.phoneNumber);
      
      // Call the auth service to update the user profile
      const response = await authService.updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        notifications: formData.notifications
      });

      if (!response.success) {
        // Check if it's a 404 error (endpoint doesn't exist)
        if (response.error?.message?.includes("404") || response.error?.message?.includes("not found")) {
          toast.error("Profile update feature is not yet available. The backend endpoint needs to be implemented.");
        } else {
          toast.error(response.error?.message || "Failed to update profile. Please try again.");
        }
        return;
      }

    toast.success("Profile updated successfully");
    setIsEditing(false);
      
      // Trigger a refresh of user data in the auth context with force
      window.dispatchEvent(new Event("profile_updated"));
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Check if it's a network error or 404
      if (error instanceof Error) {
        if (error.message.includes("404") || error.message.includes("not found")) {
          toast.error("Profile update feature is not yet available. The backend endpoint needs to be implemented.");
        } else {
          toast.error("Failed to update profile. Please try again.");
        }
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
    setIsSaving(false);
    }
  };

  // Animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const statItems = [
    {
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
      label: "Member Since",
      value: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      }),
    },
    {
      icon: <BookOpen className="w-5 h-5 text-green-500" />,
      label: "Bookings",
      value: "0",
    },
    {
      icon: <UserCheck className="w-5 h-5 text-amber-500" />,
      label: "Status",
      value: "Active",
    },
  ];

  // Loading state
  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] space-y-4">
        <Loading3D size="lg" message="Loading your profile..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-6xl p-2 md:p-3 md:py-6"
    >
      <div className="flex flex-col space-y-3 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
        {/* Left sidebar with profile card */}
        <div className="md:col-span-1">
          <Card className="border border-border/40 shadow-md overflow-hidden bg-gradient-to-b from-background to-background/95">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="p-3 md:p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group mb-3 md:mb-6">
                    <Avatar className="w-16 h-16 md:w-28 md:h-28 border-2 md:border-4 border-background shadow-lg">
                      {user?.photoURL ? (
                        <AvatarImage
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                        />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-base md:text-2xl font-semibold">
                          {user?.displayName?.charAt(0) ||
                            user?.email?.charAt(0) ||
                            "X"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="h-4 w-4 md:h-6 md:w-6 text-white" />
                    </motion.div>
                  </div>

                  <h2 className="text-base md:text-xl font-bold mb-1 md:mb-2 flex items-center justify-center gap-2">
                    {user?.displayName || "User"}
                    {user?.role === "admin" && (
                      <Badge variant="outline" className="ml-1 font-normal text-xs">
                        Admin
                      </Badge>
                    )}
                  </h2>

                  <div className="mb-2 md:mb-2 space-y-0.5 md:space-y-1 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Mail className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="truncate max-w-[200px]">{user?.email}</span>
                    </div>
                    {user?.phoneNumber && (
                      <div className="flex items-center justify-center gap-1">
                        <Phone className="h-3 w-3 md:h-4 md:w-4" />
                        <span>{user.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-3 md:mb-6">
                    <Badge variant="secondary" className="text-xs md:text-sm">
                      {user?.authProvider === "google"
                        ? "Google Account"
                        : "Email Account"}
                    </Badge>
                  </div>

                  {/* Stats as rows instead of grid */}
                  <div className="w-full space-y-1.5 md:space-y-3 mb-3 md:mb-6">
                    {statItems.map((item, i) => (
                      <div
                        key={i}
                        className="bg-muted/50 rounded-lg p-2 md:p-3 flex items-center gap-2 md:gap-3"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 md:w-5 md:h-5 text-current">
                          {item.icon}
                          </div>
                        </div>
                        <div className="flex-1 text-left">
                        <p className="text-xs text-muted-foreground">
                          {item.label}
                        </p>
                          <p className="font-medium text-xs md:text-base">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sign out button */}
                  <Button
                    variant="outline"
                    className="w-full border-dashed text-xs md:text-sm h-8 md:h-auto"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          </Card>
        </div>

        {/* Main content with tabs */}
        <div className="md:col-span-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <TabsList className="grid grid-cols-2 gap-1 md:gap-2 mb-3 md:mb-6 h-8 md:h-auto">
                <TabsTrigger
                  value="personal"
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-1.5 md:p-3"
                >
                  <User className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Personal Information</span>
                  <span className="sm:hidden">Personal</span>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-1.5 md:p-3"
                >
                  <Shield className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Security & Privacy</span>
                  <span className="sm:hidden">Security</span>
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <div className="space-y-3 md:space-y-6">
              <AnimatePresence mode="wait">
                {/* Personal Information Tab */}
                {activeTab === "personal" && (
                  <motion.div
                    key="personal"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={tabContentVariants}
                  >
                    <TabsContent
                      value="personal"
                      className="space-y-3 md:space-y-6 mt-0"
                    >
                      <Card className="border border-border/40 shadow-sm overflow-hidden">
                        <CardHeader className="pb-2 md:pb-4 p-3 md:p-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-base md:text-xl">Personal Information</CardTitle>
                              <CardDescription className="text-xs md:text-sm">
                                Update your personal details
                              </CardDescription>
                            </div>
                            <Button
                              variant={isEditing ? "outline" : "default"}
                              onClick={() => setIsEditing(!isEditing)}
                              disabled={isSaving}
                              size="sm"
                              className="text-xs md:text-sm h-7 md:h-auto px-2 md:px-4"
                            >
                              {isEditing ? "Cancel" : "Edit Profile"}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className={`space-y-2 md:space-y-4 pb-3 md:pb-6 p-3 md:p-6 transition-all duration-300 ${!isEditing ? 'opacity-60' : 'opacity-100'}`}>
                          {!isEditing && (
                            <div className="mb-2 md:mb-4 p-2 md:p-3 bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg">
                              <p className="text-xs md:text-sm text-muted-foreground text-center">
                                Click "Edit Profile" to modify your information
                              </p>
                            </div>
                          )}
                          {/* Mobile: Stack fields vertically, Desktop: Show in one row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                            <div className="space-y-1 md:space-y-2">
                              <Label
                                htmlFor="fullName"
                                className="text-xs md:text-sm font-medium"
                              >
                                Full Name
                              </Label>
                              <Input
                                id="fullName"
                                name="fullName"
                                placeholder="Your full name"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                disabled={!isEditing || isSaving}
                                className="transition-all duration-300 h-8 md:h-10 text-xs md:text-sm"
                              />
                            </div>
                            
                            <div className="space-y-1 md:space-y-2">
                              <Label
                                htmlFor="email"
                                className="text-xs md:text-sm font-medium"
                              >
                                Email Address
                              </Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Your email address"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={true} // Email cannot be edited
                                className="transition-all duration-300 h-8 md:h-10 text-xs md:text-sm"
                              />
                              <p className="text-xs text-muted-foreground md:hidden">
                                Email cannot be changed directly. Contact
                                support for assistance.
                              </p>
                            </div>
                            
                            <div className="space-y-1 md:space-y-2">
                              <Label
                                htmlFor="phoneNumber"
                                className="text-xs md:text-sm font-medium"
                              >
                                Phone Number
                              </Label>
                              <SimplePhoneInput
                                value={formData.phoneNumber}
                                onChange={handlePhoneChange}
                                disabled={!isEditing || isSaving}
                                className="transition-all duration-300 h-8 md:h-10 text-xs md:text-sm [&_input]:text-xs [&_input]:md:text-sm [&_input]:font-mono [&_input]:tracking-wide"
                              />
                            </div>
                          </div>
                          
                          {/* Desktop: Show email help text below the grid */}
                          <div className="hidden md:block">
                            <p className="text-xs text-muted-foreground">
                              Email cannot be changed directly. Contact support for assistance.
                            </p>
                          </div>

                          {isEditing && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex justify-end gap-2 md:gap-3 pt-2 md:pt-4"
                            >
                              <Button
                                variant="default"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full md:w-auto h-8 md:h-auto text-xs md:text-sm"
                              >
                                {isSaving ? (
                                  <>
                                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1 md:mr-2" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                                    Save Changes
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border border-border/40 shadow-sm overflow-hidden">
                        <CardHeader className="pb-2 md:pb-4 p-3 md:p-6">
                          <div className="flex items-center gap-2">
                            <BellRing className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            <CardTitle className="text-base md:text-xl">Notification Preferences</CardTitle>
                          </div>
                          <CardDescription className="text-xs md:text-sm">
                            Choose how you want to be notified
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3 md:pb-6 p-3 md:p-6">
                          <div className="space-y-3 md:space-y-5">
                            <div className="flex items-center justify-between py-2 md:py-3 border-b">
                              <div className="space-y-0.5">
                                <Label
                                  htmlFor="email-notifications"
                                  className="text-xs md:text-sm font-medium"
                                >
                                  Email Notifications
                                </Label>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                  Receive booking confirmations and updates via
                                  email
                                </p>
                              </div>
                              <Switch
                                id="email-notifications"
                                checked={formData.notifications.email}
                                onCheckedChange={(checked: boolean) =>
                                  handleSwitchChange("email", checked)
                                }
                                disabled={!isEditing}
                              />
                            </div>
                            <div className="flex items-center justify-between py-2 md:py-3">
                              <div className="space-y-0.5">
                                <Label
                                  htmlFor="sms-notifications"
                                  className="text-xs md:text-sm font-medium"
                                >
                                  SMS Notifications
                                </Label>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                  Receive text messages about your bookings
                                </p>
                              </div>
                              <Switch
                                id="sms-notifications"
                                checked={formData.notifications.sms}
                                onCheckedChange={(checked: boolean) =>
                                  handleSwitchChange("sms", checked)
                                }
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={tabContentVariants}
                  >
                    <TabsContent
                      value="security"
                      className="space-y-3 md:space-y-6 mt-0"
                    >
                      <Card className="border border-border/40 shadow-sm overflow-hidden">
                        <CardHeader className="pb-2 md:pb-4 p-3 md:p-6">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            <CardTitle className="text-base md:text-xl">Password & Security</CardTitle>
                          </div>
                          <CardDescription className="text-xs md:text-sm">
                            Manage your password and security settings
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 md:space-y-6 pb-3 md:pb-6 p-3 md:p-6">
                          <div className="bg-muted/40 p-3 md:p-5 rounded-lg">
                            <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-lg">
                              Authentication Method
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal text-xs md:text-sm">
                                {user?.authProvider === "google"
                                  ? "Google Account"
                                  : "Email & Password"}
                              </Badge>
                              {user?.authProvider === "google" ? (
                                <p className="text-xs md:text-sm text-muted-foreground">
                                  You&apos;re signed in with Google. Password
                                  change not required.
                                </p>
                              ) : (
                                <p className="text-xs md:text-sm text-muted-foreground">
                                  Your account uses email and password
                                  authentication.
                                </p>
                              )}
                            </div>
                          </div>

                          {user?.authProvider !== "google" && (
                            <div className="grid grid-cols-1 gap-4 pt-2">
                              <Button
                                variant="outline"
                                className="w-full md:w-auto h-8 md:h-auto text-xs md:text-sm"
                              >
                                Change Password
                              </Button>
                            </div>
                          )}

                          <div className="pt-2 md:pt-4 border-t">
                            <h3 className="font-medium mb-2 md:mb-4 text-sm md:text-lg">
                              Two-Factor Authentication
                            </h3>
                            <div className="flex items-start gap-3 md:gap-6 bg-muted/30 p-3 md:p-5 rounded-lg">
                              <div className="p-2 md:p-3 bg-primary/10 rounded-full shrink-0">
                                <Shield className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-xs md:text-base">
                                  Enhance Your Account Security
                                </h4>
                                <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">
                                  Add an extra layer of security by enabling
                                  two-factor authentication. This feature uses
                                  your phone to verify your identity when you
                                  sign in, providing maximum protection for your
                                  account.
                                </p>
                                <Button
                                  variant="outline"
                                  className="mt-2 md:mt-4 h-7 md:h-auto text-xs md:text-sm"
                                  disabled
                                >
                                  Coming Soon
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 md:pt-4 border-t">
                            <h3 className="font-medium mb-2 md:mb-4 text-sm md:text-lg">
                              Active Sessions
                            </h3>
                            <div className="bg-muted/30 p-3 md:p-5 rounded-lg space-y-2 md:space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 md:gap-4">
                                  <div className="bg-primary/10 p-1.5 md:p-2 rounded-full relative">
                                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500 rounded-full absolute top-0.5 right-0.5 md:top-1 md:right-1"></div>
                                    <User className="h-3 w-3 md:h-5 md:w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-xs md:text-sm">
                                      Current Session
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date().toLocaleString()} -{" "}
                                      {navigator.userAgent.indexOf("Mac") !== -1
                                        ? "macOS"
                                        : "Windows"}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-green-500/10 text-green-500 border-green-500/20 text-xs"
                                >
                                  Active
                                </Badge>
                              </div>
                            </div>
                            <div className="flex justify-end mt-2 md:mt-4">
                              <Button
                                variant="outline"
                                className="text-destructive h-7 md:h-auto text-xs md:text-sm"
                              >
                                <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                Sign Out All Devices
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
