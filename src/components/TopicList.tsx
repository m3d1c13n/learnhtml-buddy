import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TopicForm from "./TopicForm";
import TopicView from "./TopicView";
import { toast } from "sonner";

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

const TopicList = ({ mode, studentName }: TopicListProps) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [viewingTopic, setViewingTopic] = useState<Topic | null>(null);
  const [progress, setProgress] = useState<any>({});

  useEffect(() => {
    loadTopics();
    if (mode === "student" && studentName) {
      loadProgress();
    }
  }, [mode, studentName]);

  const loadTopics = () => {
    const savedTopics = localStorage.getItem("topics");
    if (savedTopics) {
      setTopics(JSON.parse(savedTopics));
    } else {
      // Initialize with default topics
      const defaultTopics: Topic[] = [
        {
          id: "1",
          title: "HTML Basics",
          description: "Learn the fundamental HTML tags and structure",
          content: "HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using elements and tags.\n\nBasic HTML structure:\n- <!DOCTYPE html>: Declaration\n- <html>: Root element\n- <head>: Meta information\n- <body>: Visible content",
          example: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>This is my first HTML page.</p>\n</body>\n</html>',
          questions: [
            {
              id: "q1",
              question: "What does HTML stand for?",
              options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks Text Mark Language"],
              correctAnswer: 0
            }
          ]
        },
        {
          id: "2",
          title: "HTML Tables",
          description: "Create and style tables in HTML",
          content: "HTML tables allow you to arrange data in rows and columns. Tables are defined with the <table> tag.\n\nKey table elements:\n- <tr>: Table row\n- <td>: Table data cell\n- <th>: Table header cell\n- <thead>: Groups header content\n- <tbody>: Groups body content",
          example: '<table border="1">\n  <thead>\n    <tr>\n      <th>Name</th>\n      <th>Age</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>John</td>\n      <td>25</td>\n    </tr>\n    <tr>\n      <td>Jane</td>\n      <td>30</td>\n    </tr>\n  </tbody>\n</table>',
          questions: [
            {
              id: "q2",
              question: "Which tag is used to create a table row?",
              options: ["<td>", "<tr>", "<table>", "<th>"],
              correctAnswer: 1
            }
          ]
        },
        {
          id: "3",
          title: "HTML Lists",
          description: "Learn about ordered and unordered lists",
          content: "HTML provides two main types of lists:\n\n1. Unordered Lists (<ul>): Items marked with bullets\n2. Ordered Lists (<ol>): Items marked with numbers\n\nList items are defined with <li> tag.\n\nYou can also nest lists within lists for complex structures.",
          example: '<!-- Unordered List -->\n<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>\n\n<!-- Ordered List -->\n<ol>\n  <li>First Step</li>\n  <li>Second Step</li>\n  <li>Third Step</li>\n</ol>',
          questions: [
            {
              id: "q3",
              question: "Which tag creates an unordered list?",
              options: ["<ol>", "<ul>", "<list>", "<li>"],
              correctAnswer: 1
            }
          ]
        }
      ];
      localStorage.setItem("topics", JSON.stringify(defaultTopics));
      setTopics(defaultTopics);
    }
  };

  const loadProgress = () => {
    const savedProgress = localStorage.getItem(`progress_${studentName}`);
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  };

  const saveTopics = (newTopics: Topic[]) => {
    localStorage.setItem("topics", JSON.stringify(newTopics));
    setTopics(newTopics);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this topic?")) {
      const newTopics = topics.filter(t => t.id !== id);
      saveTopics(newTopics);
      toast.success("Topic deleted successfully");
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
  };

  const handleView = (topic: Topic) => {
    setViewingTopic(topic);
  };

  const handleUpdateProgress = (updatedProgress: any) => {
    setProgress(updatedProgress);
    if (studentName) {
      localStorage.setItem(`progress_${studentName}`, JSON.stringify(updatedProgress));
    }
  };

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
