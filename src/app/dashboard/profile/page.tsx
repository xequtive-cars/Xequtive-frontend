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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

  // Load user data when available
  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        fullName: user.displayName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Profile updated successfully");
    setIsEditing(false);
    setIsSaving(false);
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
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Loading your profile...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-6xl h-[calc(100vh-6rem)] py-6 overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Left sidebar with profile card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border border-border/40 shadow-md overflow-hidden bg-gradient-to-b from-background to-background/95">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group mb-4">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                      {user?.photoURL ? (
                        <AvatarImage
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                        />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
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
                      <Camera className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>

                  <h2 className="text-xl font-bold mt-2 flex items-center justify-center gap-2">
                    {user?.displayName || "User"}
                    {user?.role === "admin" && (
                      <Badge variant="outline" className="ml-1 font-normal">
                        Admin
                      </Badge>
                    )}
                  </h2>

                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{user?.email}</span>
                    </div>
                    {user?.phoneNumber && (
                      <div className="flex items-center justify-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{user.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <Badge variant="secondary" className="text-sm">
                      {user?.authProvider === "google"
                        ? "Google Account"
                        : "Email Account"}
                    </Badge>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-3 mt-6 w-full">
                    {statItems.map((item, i) => (
                      <div
                        key={i}
                        className="bg-muted/50 rounded-lg px-3 py-2 text-center"
                      >
                        <div className="flex justify-center mb-1">
                          {item.icon}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sign out button */}
                  <Button
                    variant="outline"
                    className="w-full mt-6 border-dashed"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
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
            className="w-full h-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <TabsList className="grid grid-cols-2 gap-2 mb-6">
                <TabsTrigger
                  value="personal"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>Personal Information</span>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Security & Privacy</span>
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <div className="h-[calc(100vh-14rem)]">
              <AnimatePresence mode="wait">
                {/* Personal Information Tab */}
                {activeTab === "personal" && (
                  <motion.div
                    key="personal"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={tabContentVariants}
                    className="h-full flex flex-col"
                  >
                    <TabsContent
                      value="personal"
                      className="space-y-6 mt-0 flex-1"
                    >
                      <Card className="border border-border/40 shadow-sm overflow-hidden">
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle>Personal Information</CardTitle>
                              <CardDescription>
                                Update your personal details
                              </CardDescription>
                            </div>
                            <Button
                              variant={isEditing ? "outline" : "default"}
                              onClick={() => setIsEditing(!isEditing)}
                              disabled={isSaving}
                              size="sm"
                            >
                              {isEditing ? "Cancel" : "Edit Profile"}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pb-6">
                          <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-2">
                              <Label
                                htmlFor="fullName"
                                className="text-sm font-medium"
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
                                className="transition-all duration-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="email"
                                className="text-sm font-medium"
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
                                className="transition-all duration-300"
                              />
                              <p className="text-xs text-muted-foreground">
                                Email cannot be changed directly. Contact
                                support for assistance.
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="phoneNumber"
                                className="text-sm font-medium"
                              >
                                Phone Number
                              </Label>
                              <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                placeholder="+44 7123 456789"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                disabled={!isEditing || isSaving}
                                className="transition-all duration-300"
                              />
                            </div>
                          </div>

                          {isEditing && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex justify-end gap-3 pt-4"
                            >
                              <Button
                                variant="default"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full md:w-auto"
                              >
                                {isSaving ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Save Changes
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border border-border/40 shadow-sm overflow-hidden">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-2">
                            <BellRing className="h-5 w-5 text-primary" />
                            <CardTitle>Notification Preferences</CardTitle>
                          </div>
                          <CardDescription>
                            Choose how you want to be notified
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-6">
                          <div className="space-y-5">
                            <div className="flex items-center justify-between py-3 border-b">
                              <div className="space-y-0.5">
                                <Label
                                  htmlFor="email-notifications"
                                  className="text-sm font-medium"
                                >
                                  Email Notifications
                                </Label>
                                <p className="text-sm text-muted-foreground">
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
                            <div className="flex items-center justify-between py-3">
                              <div className="space-y-0.5">
                                <Label
                                  htmlFor="sms-notifications"
                                  className="text-sm font-medium"
                                >
                                  SMS Notifications
                                </Label>
                                <p className="text-sm text-muted-foreground">
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
                    className="h-full"
                  >
                    <TabsContent
                      value="security"
                      className="space-y-6 mt-0 h-full"
                    >
                      <Card className="border border-border/40 shadow-sm overflow-hidden">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            <CardTitle>Password & Security</CardTitle>
                          </div>
                          <CardDescription>
                            Manage your password and security settings
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pb-6">
                          <div className="bg-muted/40 p-5 rounded-lg">
                            <h3 className="font-medium mb-2 text-lg">
                              Authentication Method
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                {user?.authProvider === "google"
                                  ? "Google Account"
                                  : "Email & Password"}
                              </Badge>
                              {user?.authProvider === "google" ? (
                                <p className="text-sm text-muted-foreground">
                                  You&apos;re signed in with Google. Password
                                  change not required.
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground">
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
                                className="w-full md:w-auto"
                              >
                                Change Password
                              </Button>
                            </div>
                          )}

                          <div className="pt-4 border-t">
                            <h3 className="font-medium mb-4 text-lg">
                              Two-Factor Authentication
                            </h3>
                            <div className="flex items-start gap-6 bg-muted/30 p-5 rounded-lg">
                              <div className="p-3 bg-primary/10 rounded-full shrink-0">
                                <Shield className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-base">
                                  Enhance Your Account Security
                                </h4>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Add an extra layer of security by enabling
                                  two-factor authentication. This feature uses
                                  your phone to verify your identity when you
                                  sign in, providing maximum protection for your
                                  account.
                                </p>
                                <Button
                                  variant="outline"
                                  className="mt-4"
                                  disabled
                                >
                                  Coming Soon
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t">
                            <h3 className="font-medium mb-4 text-lg">
                              Active Sessions
                            </h3>
                            <div className="bg-muted/30 p-5 rounded-lg space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="bg-primary/10 p-2 rounded-full relative">
                                    <div className="h-2 w-2 bg-green-500 rounded-full absolute top-1 right-1"></div>
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">
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
                                  className="bg-green-500/10 text-green-500 border-green-500/20"
                                >
                                  Active
                                </Badge>
                              </div>
                            </div>
                            <div className="flex justify-end mt-4">
                              <Button
                                variant="outline"
                                className="text-destructive"
                              >
                                <LogOut className="h-4 w-4 mr-2" />
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
