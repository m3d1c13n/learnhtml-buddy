import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code, LogOut, Plus } from "lucide-react";
import TopicList from "@/components/TopicList";
import TopicForm from "@/components/TopicForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  useEffect(() => {
    const mode = localStorage.getItem("userMode");
    if (mode !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userMode");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Code className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage HTML topics and content</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddingTopic} onOpenChange={setIsAddingTopic}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Topic
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Topic</DialogTitle>
                </DialogHeader>
                <TopicForm onSuccess={() => setIsAddingTopic(false)} />
              </DialogContent>
            </Dialog>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <TopicList mode="admin" />
      </main>
    </div>
  );
};

export default AdminDashboard;
