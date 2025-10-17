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
  const [progress, setProgress] = useState<any>({});
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mode = localStorage.getItem("userMode");
    const name = localStorage.getItem("studentName");
    
    if (mode !== "student" || !name) {
      navigate("/");
      return;
    }
    
    setStudentName(name);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("*")
        .order("created_at", { ascending: false });

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);
    } catch (error: any) {
      toast.error("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userMode");
    localStorage.removeItem("studentName");
    navigate("/");
  };

  const completedTopics = Object.values(progress).filter((p: any) => p?.completed).length;
  const totalTopics = topics.length;
  const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

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
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
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

              <TopicList mode="student" studentName={studentName} />
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
                      {Object.values(progress).filter((p: any) => p?.examPassed).length}
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
                      const topicProgress = progress[topic.id] || {};
                      return (
                        <div key={topic.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">{topic.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {topicProgress.examPassed ? "Exam passed" : topicProgress.completed ? "Completed" : "Not started"}
                            </p>
                          </div>
                          {topicProgress.examPassed && (
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
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
