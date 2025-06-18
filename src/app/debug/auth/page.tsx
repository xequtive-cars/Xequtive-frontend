"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AuthDebugPage() {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [cookies, setCookies] = useState<string>("");
  const [userAgent, setUserAgent] = useState<string>("");

  useEffect(() => {
    // Get client-side info
    setCookies(document.cookie);
    setUserAgent(navigator.userAgent);
  }, []);

  const testApiCall = async () => {
    try {
      const userData = await authService.checkAuthStatus();
      setApiResponse({ success: true, data: userData });
    } catch (error) {
      setApiResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testDirectApiCall = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      setApiResponse({ 
        success: response.ok, 
        status: response.status,
        data: response.ok ? data : null,
        error: !response.ok ? data : null 
      });
    } catch (error) {
      setApiResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Authentication Debug Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AuthContext State */}
        <Card>
          <CardHeader>
            <CardTitle>AuthContext State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Is Authenticated:</span>
              <Badge variant={isAuthenticated ? "default" : "destructive"}>
                {isAuthenticated ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Is Loading:</span>
              <Badge variant={isLoading ? "secondary" : "default"}>
                {isLoading ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Is Initialized:</span>
              <Badge variant={isInitialized ? "default" : "secondary"}>
                {isInitialized ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="font-semibold">User Data:</p>
              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Browser Information */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-semibold">Cookies:</p>
              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                {cookies || "No cookies found"}
              </pre>
            </div>
            <div>
              <p className="font-semibold">User Agent:</p>
              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                {userAgent}
              </pre>
            </div>
            <div>
              <p className="font-semibold">Current URL:</p>
              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                {typeof window !== 'undefined' ? window.location.href : 'N/A'}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* API Test */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>API Authentication Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testApiCall}>
                Test Auth Service
              </Button>
              <Button onClick={testDirectApiCall} variant="outline">
                Test Direct API Call
              </Button>
            </div>
            
            {apiResponse && (
              <div>
                <p className="font-semibold">API Response:</p>
                <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-semibold">Node Environment:</p>
                <Badge>{process.env.NODE_ENV}</Badge>
              </div>
              <div>
                <p className="font-semibold">API URL:</p>
                <pre className="text-xs bg-muted p-2 rounded mt-1">
                  {process.env.NEXT_PUBLIC_API_URL || 'Not set'}
                </pre>
              </div>
              <div>
                <p className="font-semibold">Domain:</p>
                <pre className="text-xs bg-muted p-2 rounded mt-1">
                  {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 