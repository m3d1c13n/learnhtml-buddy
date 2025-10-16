import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  content: string;
  example: string;
  questions: Question[];
}

interface TopicFormProps {
  topic?: Topic;
  onSuccess: () => void;
}

const TopicForm = ({ topic, onSuccess }: TopicFormProps) => {
  const [title, setTitle] = useState(topic?.title || "");
  const [description, setDescription] = useState(topic?.description || "");
  const [content, setContent] = useState(topic?.content || "");
  const [example, setExample] = useState(topic?.example || "");
  const [questions, setQuestions] = useState<Question[]>(
    topic?.questions || [
      {
        id: "1",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]
  );

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, idx) =>
                idx === optionIndex ? value : opt
              ),
            }
          : q
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !content) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newTopic: Topic = {
      id: topic?.id || Date.now().toString(),
      title,
      description,
      content,
      example,
      questions: questions.filter((q) => q.question.trim() !== ""),
    };

    const savedTopics = localStorage.getItem("topics");
    const topics: Topic[] = savedTopics ? JSON.parse(savedTopics) : [];

    if (topic?.id) {
      const index = topics.findIndex((t) => t.id === topic.id);
      topics[index] = newTopic;
    } else {
      topics.push(newTopic);
    }

    localStorage.setItem("topics", JSON.stringify(topics));
    toast.success(topic ? "Topic updated successfully" : "Topic added successfully");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Topic Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., HTML Tables"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the topic"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Detailed explanation of the topic"
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="example">Code Example</Label>
          <Textarea
            id="example"
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="HTML code example"
            rows={8}
            className="font-mono text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Exam Questions</h3>
          <Button type="button" onClick={addQuestion} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Question {qIndex + 1}
                {questions.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(question.id, "question", e.target.value)
                  }
                  placeholder="Enter your question"
                />
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) =>
                        updateOption(question.id, oIndex, e.target.value)
                      }
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={question.correctAnswer === oIndex}
                      onChange={() =>
                        updateQuestion(question.id, "correctAnswer", oIndex)
                      }
                      className="w-4 h-4"
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Select the radio button for the correct answer
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="submit" className="w-full">
        {topic ? "Update Topic" : "Add Topic"}
      </Button>
    </form>
  );
};

export default TopicForm;
