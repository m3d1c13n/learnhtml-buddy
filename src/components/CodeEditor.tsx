import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CodeEditorProps {
  initialCode?: string;
}

const CodeEditor = ({ initialCode = "" }: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode || '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>Start editing to see live preview</p>\n</body>\n</html>');

  return (
    <Tabs defaultValue="editor" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="editor">Code Editor</TabsTrigger>
        <TabsTrigger value="preview">Live Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="editor" className="space-y-4">
        <Card className="code-editor p-4">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono text-sm min-h-[400px] bg-transparent border-0 focus-visible:ring-0 resize-none"
            placeholder="Write your HTML code here..."
          />
        </Card>
      </TabsContent>

      <TabsContent value="preview">
        <Card className="p-4 min-h-[400px] bg-white">
          <iframe
            srcDoc={code}
            title="preview"
            className="w-full h-[400px] border-0 bg-white"
            sandbox="allow-scripts"
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CodeEditor;
