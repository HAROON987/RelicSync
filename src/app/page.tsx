"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useStore, UserRole } from "@/lib/db";
import { LogIn, UserPlus, PackageSearch, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const router = useRouter();
  const { login } = useStore();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Student");
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    router.push(role === 'Admin' ? '/dashboard/admin' : '/dashboard/student');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Reset Link Sent",
      description: `If an account exists for ${forgotEmail}, you will receive a reset link shortly.`
    });
    setForgotEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
              <PackageSearch className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl font-headline">
            RelicSync
          </h1>
          <p className="text-muted-foreground text-lg">
            Reuniting you with your lost treasures.
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" /> Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@university.edu" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" size="sm" className="px-0 font-normal h-auto">
                            Forgot password?
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <KeyRound className="h-5 w-5" /> Forgot Password
                            </DialogTitle>
                            <DialogDescription>
                              Enter your email address and we'll send you a link to reset your password.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleForgotPassword}>
                            <div className="py-4 space-y-2">
                              <Label htmlFor="forgot-email">Email Address</Label>
                              <Input 
                                id="forgot-email" 
                                type="email" 
                                placeholder="name@university.edu" 
                                required 
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                              />
                            </div>
                            <DialogFooter>
                              <Button type="submit">Send Reset Link</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Login as</Label>
                    <div className="flex gap-4">
                      <Button 
                        type="button" 
                        variant={role === 'Student' ? 'default' : 'outline'} 
                        className="flex-1"
                        onClick={() => setRole('Student')}
                      >
                        Student
                      </Button>
                      <Button 
                        type="button" 
                        variant={role === 'Admin' ? 'default' : 'outline'} 
                        className="flex-1"
                        onClick={() => setRole('Admin')}
                      >
                        Admin
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full h-11 text-lg">Sign In</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Join our community to help find lost items.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input id="reg-name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email address</Label>
                    <Input id="reg-email" type="email" placeholder="name@university.edu" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Phone Number</Label>
                    <Input id="reg-phone" placeholder="01234567890" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Register as</Label>
                    <div className="flex gap-4">
                      <Button 
                        type="button" 
                        variant={role === 'Student' ? 'default' : 'outline'} 
                        className="flex-1"
                        onClick={() => setRole('Student')}
                      >
                        Student
                      </Button>
                      <Button 
                        type="button" 
                        variant={role === 'Admin' ? 'default' : 'outline'} 
                        className="flex-1"
                        onClick={() => setRole('Admin')}
                      >
                        Admin
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full h-11 text-lg">Create Account</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
