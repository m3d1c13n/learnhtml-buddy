import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Code, FileQuestion, CheckCircle } from "lucide-react";
import CodeEditor from "./CodeEditor";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

interface TopicViewProps {
  topic: Topic;
  userId: string;
  onProgressUpdate: () => void;
  onClose: () => void;
}

const TopicView = ({ topic, userId, onProgressUpdate, onClose }: TopicViewProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    if (!showResults) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: answerIndex,
      });
    }
  };

  const handleSubmitExam = async () => {
    if (Object.keys(selectedAnswers).length < topic.questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setShowResults(true);
    
    const correctAnswers = topic.questions.filter(
      (q) => selectedAnswers[q.id] === q.correctAnswer
    ).length;
    
    const percentage = Math.round((correctAnswers / topic.questions.length) * 100);
    const passed = percentage >= 70;

    try {
      // Check if progress exists
      const { data: existingProgress } = await supabase
        .from("student_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("topic_id", topic.id)
        .single();

      if (existingProgress) {
        // Update existing progress
        await supabase
          .from("student_progress")
          .update({
            completed: true,
            score: percentage,
            completed_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("topic_id", topic.id);
      } else {
        // Insert new progress
        await supabase
          .from("student_progress")
          .insert({
            user_id: userId,
            topic_id: topic.id,
            completed: true,
            score: percentage,
            completed_at: new Date().toISOString(),
          });
      }

      onProgressUpdate();
      setExamCompleted(true);

      if (passed) {
        toast.success(`Congratulations! You passed with ${percentage}%`);
      } else {
        toast.error(`You scored ${percentage}%. Need 70% to pass. Try again!`);
      }
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast.error("Failed to save progress");
    }
  };

  const handleRetakeExam = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setExamCompleted(false);
  };

  const handleMarkComplete = async () => {
    try {
      // Check if progress exists
      const { data: existingProgress } = await supabase
        .from("student_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("topic_id", topic.id)
        .single();

      if (existingProgress) {
        // Update existing progress
        await supabase
          .from("student_progress")
          .update({
            completed: true,
          })
          .eq("user_id", userId)
          .eq("topic_id", topic.id);
      } else {
        // Insert new progress
        await supabase
          .from("student_progress")
          .insert({
            user_id: userId,
            topic_id: topic.id,
            completed: true,
          });
      }

      onProgressUpdate();
      toast.success("Topic marked as completed!");
    } catch (error: any) {
      console.error("Error saving progress:", error);
      toast.error("Failed to save progress");
    }
  };

  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="content">
          <BookOpen className="w-4 h-4 mr-2" />
          Content
        </TabsTrigger>
        <TabsTrigger value="example">
          <Code className="w-4 h-4 mr-2" />
          Example
        </TabsTrigger>
        <TabsTrigger value="exam">
          <FileQuestion className="w-4 h-4 mr-2" />
          Exam
        </TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{topic.content}</p>
            </div>
            <Button onClick={handleMarkComplete} className="mt-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="example" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Code Example</CardTitle>
          </CardHeader>
          <CardContent>
            {topic.example ? (
              <CodeEditor initialCode={topic.example} />
            ) : (
              <p className="text-muted-foreground">No example available for this topic.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="exam" className="space-y-4">
        {topic.questions.length > 0 ? (
          <>
            {topic.questions.map((question, qIndex) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Question {qIndex + 1}: {question.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => {
                      const isSelected = selectedAnswers[question.id] === oIndex;
                      const isCorrect = question.correctAnswer === oIndex;
                      const showCorrect = showResults && isCorrect;
                      const showIncorrect = showResults && isSelected && !isCorrect;

                      return (
                        <div
                          key={oIndex}
                          onClick={() => handleAnswerSelect(question.id, oIndex)}
                          className={`exam-option ${isSelected ? "selected" : ""} ${
                            showCorrect ? "correct" : ""
                          } ${showIncorrect ? "incorrect" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? "border-primary bg-primary" : "border-border"
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span>{option}</span>
                            {showCorrect && (
                              <CheckCircle className="w-5 h-5 text-success ml-auto" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-2">
              {!examCompleted ? (
                <Button onClick={handleSubmitExam} className="flex-1">
                  Submit Exam
                </Button>
              ) : (
                <Button onClick={handleRetakeExam} variant="outline" className="flex-1">
                  Retake Exam
                </Button>
              )}
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No exam questions available for this topic.</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default TopicView;
