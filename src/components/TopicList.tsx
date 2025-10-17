import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TopicForm from "./TopicForm";
import TopicView from "./TopicView";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Topic {
  id: string;
  title: string;
  description: string;
  content: string;
  example: string;
  questions: Question[];
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface TopicListProps {
  mode: "admin" | "student";
  studentName?: string;
}

// Generate a consistent user ID from student name
const getUserId = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hashStr = Math.abs(hash).toString(16).padStart(32, '0');
  return `${hashStr.slice(0,8)}-${hashStr.slice(8,12)}-${hashStr.slice(12,16)}-${hashStr.slice(16,20)}-${hashStr.slice(20,32)}`;
};

const TopicList = ({ mode, studentName }: TopicListProps) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [viewingTopic, setViewingTopic] = useState<Topic | null>(null);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
    if (mode === "student" && studentName) {
      loadProgress();
    }
  }, [mode, studentName]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTopics((data as any) || []);
    } catch (error: any) {
      toast.error("Failed to load topics: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!studentName) return;
    
    try {
      const userId = getUserId(studentName);
      const { data, error } = await supabase
        .from("student_progress")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const progressMap: any = {};
      data?.forEach(p => {
        progressMap[p.topic_id] = {
          completed: p.completed,
          examPassed: p.score ? p.score >= 70 : false,
          score: p.score
        };
      });
      setProgress(progressMap);
    } catch (error: any) {
      console.error("Failed to load progress:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    
    try {
      const { error } = await supabase
        .from("topics")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setTopics(topics.filter(t => t.id !== id));
      toast.success("Topic deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete topic: " + error.message);
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic as any);
  };

  const handleView = (topic: Topic) => {
    setViewingTopic(topic);
  };

  const handleUpdateProgress = async (updatedProgress: any) => {
    setProgress(updatedProgress);
    
    if (!studentName) return;
    
    // Save to Supabase
    const userId = getUserId(studentName);
    for (const [topicId, progressData] of Object.entries(updatedProgress)) {
      const data: any = progressData;
      try {
        await supabase
          .from("student_progress")
          .upsert({
            user_id: userId,
            topic_id: topicId,
            completed: data.completed || false,
            score: data.score || null,
            completed_at: data.completed ? new Date().toISOString() : null
          }, {
            onConflict: "user_id,topic_id"
          });
      } catch (error: any) {
        console.error("Failed to save progress:", error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading topics...</div>;
  }

  if (topics.length === 0 && mode === "admin") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No topics yet. Add your first topic!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => {
          const topicProgress = progress[topic.id] || {};
          const isCompleted = topicProgress.completed;
          
          return (
            <Card key={topic.id} className="topic-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {topic.title}
                      {isCompleted && mode === "student" && (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">{topic.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {mode === "admin" ? (
                    <>
                      <Button onClick={() => handleEdit(topic)} variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button onClick={() => handleDelete(topic.id)} variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => handleView(topic)} className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      {isCompleted ? "Review" : "Learn"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editingTopic} onOpenChange={() => setEditingTopic(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
          </DialogHeader>
          <TopicForm
            topic={editingTopic || undefined}
            onSuccess={() => {
              setEditingTopic(null);
              loadTopics();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingTopic} onOpenChange={() => setViewingTopic(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingTopic?.title}</DialogTitle>
          </DialogHeader>
          {viewingTopic && (
            <TopicView
              topic={viewingTopic}
              studentName={studentName || ""}
              progress={progress}
              onUpdateProgress={handleUpdateProgress}
              onClose={() => setViewingTopic(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TopicList;
