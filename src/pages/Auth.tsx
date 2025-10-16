import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleStudentLogin = () => {
    if (!studentName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    localStorage.setItem("userMode", "student");
    localStorage.setItem("studentName", studentName);
    toast.success(`Welcome, ${studentName}!`);
    navigate("/student");
  };

  const handleAdminLogin = () => {
    if (adminPassword === "admin123") {
      localStorage.setItem("userMode", "admin");
      toast.success("Admin login successful");
      navigate("/admin");
    } else {
      toast.error("Invalid admin password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-lg">
              <Code className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">HTML Learning Hub</CardTitle>
          <CardDescription>Learn HTML with interactive tutorials and examples</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" onClick={() => setIsAdmin(false)}>Student</TabsTrigger>
              <TabsTrigger value="admin" onClick={() => setIsAdmin(true)}>Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="student" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Your Name</Label>
                <Input
                  id="studentName"
                  placeholder="Enter your name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStudentLogin()}
                />
              </div>
              <Button onClick={handleStudentLogin} className="w-full">
                Start Learning
              </Button>
            </TabsContent>
            
            <TabsContent value="admin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Admin Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                />
              </div>
              <Button onClick={handleAdminLogin} className="w-full">
                Admin Login
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
