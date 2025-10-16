import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Code, Trophy, LogOut, BarChart } from "lucide-react";
import TopicList from "@/components/TopicList";
import CodeEditor from "@/components/CodeEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [topics, setTopics] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is student
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (!roleData || roleData.role !== "student") {
        toast.error("You don't have student access");
        navigate("/");
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", session.user.id)
        .single();

      setStudentName(profile?.display_name || "Student");
      setUserId(session.user.id);

      // Load topics and progress
      await loadData(session.user.id);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const loadData = async (userId: string) => {
    // Load topics
    const { data: topicsData } = await supabase
      .from("topics")
      .select("*")
      .order("created_at", { ascending: true });

    setTopics(topicsData || []);

    // Load progress
    const { data: progressData } = await supabase
      .from("student_progress")
      .select("*")
      .eq("user_id", userId);

    setProgress(progressData || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const completedTopics = progress.filter((p: any) => p.completed).length;
  const totalTopics = topics.length;
  const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Code className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">HTML Learning Hub</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {studentName}!</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="topics" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="topics">
              <BookOpen className="w-4 h-4 mr-2" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="editor">
              <Code className="w-4 h-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="progress">
              <BarChart className="w-4 h-4 mr-2" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Learning Progress</CardTitle>
                <CardDescription>
                  {completedTopics} of {totalTopics} topics completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progressPercentage} className="h-2" />
              </CardContent>
            </Card>

            <TopicList mode="student" studentName={studentName} userId={userId} onProgressUpdate={loadData} />
          </TabsContent>

          <TabsContent value="editor">
            <Card>
              <CardHeader>
                <CardTitle>Practice HTML Code</CardTitle>
                <CardDescription>Try writing HTML code and see the live preview</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Topics Completed</CardTitle>
                  <Trophy className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTopics}</div>
                  <p className="text-xs text-muted-foreground">out of {totalTopics} topics</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                  <BarChart className="h-4 w-4 text-info" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
                  <Progress value={progressPercentage} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Exams Passed</CardTitle>
                  <Trophy className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {progress.filter((p: any) => p.score && p.score >= 70).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Keep learning!</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Detailed Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topics.map((topic: any) => {
                    const topicProgress = progress.find((p: any) => p.topic_id === topic.id);
                    const examPassed = topicProgress?.score && topicProgress.score >= 70;
                    return (
                      <div key={topic.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{topic.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {examPassed ? `Exam passed (${topicProgress.score}%)` : topicProgress?.completed ? "Completed" : "Not started"}
                          </p>
                        </div>
                        {examPassed && (
                          <Trophy className="w-5 h-5 text-success" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
