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
  questions: any[];
}

interface TopicListProps {
  mode: "admin" | "student";
  studentName?: string;
  userId?: string;
  onProgressUpdate?: (userId: string) => void;
}

const TopicList = ({ mode, studentName, userId, onProgressUpdate }: TopicListProps) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [viewingTopic, setViewingTopic] = useState<Topic | null>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
    if (mode === "student" && userId) {
      loadProgress();
    }
  }, [mode, userId]);

  const loadTopics = async () => {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading topics:", error);
      toast.error("Failed to load topics");
    } else {
      // Convert questions from Json to array
      const formattedTopics = (data || []).map(topic => ({
        ...topic,
        questions: (topic.questions as any) || []
      }));
      setTopics(formattedTopics);
    }
    setLoading(false);
  };

  const loadProgress = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("student_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error loading progress:", error);
    } else {
      setProgress(data || []);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this topic?")) {
      const { error } = await supabase
        .from("topics")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Failed to delete topic");
      } else {
        toast.success("Topic deleted successfully");
        loadTopics();
      }
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
  };

  const handleView = (topic: Topic) => {
    setViewingTopic(topic);
  };

  const handleProgressUpdate = async () => {
    await loadProgress();
    if (onProgressUpdate && userId) {
      onProgressUpdate(userId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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
          const topicProgress = progress.find(p => p.topic_id === topic.id);
          const isCompleted = topicProgress?.completed;
          
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
          {viewingTopic && userId && (
            <TopicView
              topic={viewingTopic}
              userId={userId}
              onProgressUpdate={handleProgressUpdate}
              onClose={() => setViewingTopic(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TopicList;
