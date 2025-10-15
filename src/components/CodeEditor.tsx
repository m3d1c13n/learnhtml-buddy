import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface CodeEditorProps {
  initialCode?: string;
}

const CodeEditor = ({ initialCode = "" }: CodeEditorProps) => {
  const defaultCode = initialCode || '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>Start editing to see live preview</p>\n</body>\n</html>';
  
  const [code, setCode] = useState(defaultCode);
  const [lineNumbers, setLineNumbers] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    updateLineNumbers();
  }, [code]);

  const updateLineNumbers = () => {
    const lines = code.split('\n').length;
    const numbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    setLineNumbers(numbers);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const handleReset = () => {
    setCode(defaultCode);
    toast.success("Code reset to default!");
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <Tabs defaultValue="editor" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="editor">Code Editor</TabsTrigger>
        <TabsTrigger value="preview">Live Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="editor" className="space-y-4">
        <div className="flex gap-2 justify-end">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleCopy} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy Code
          </Button>
        </div>
        
        <Card className="overflow-hidden code-editor-container">
          <div className="code-editor-header">
            <div className="code-editor-dot red"></div>
            <div className="code-editor-dot yellow"></div>
            <div className="code-editor-dot green"></div>
            <span className="text-xs text-muted-foreground ml-2">index.html</span>
          </div>
          
          <ScrollArea className="h-[500px]">
            <div className="flex">
              <pre className="code-editor-line-numbers">
                {lineNumbers}
              </pre>
              
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="code-editor-textarea"
                  placeholder="Write your HTML code here..."
                  spellCheck="false"
                  style={{ 
                    paddingLeft: '1rem'
                  }}
                />
              </div>
            </div>
          </ScrollArea>
        </Card>
      </TabsContent>

      <TabsContent value="preview">
        <Card className="code-preview-frame overflow-hidden">
          <div className="bg-muted px-4 py-2 border-b">
            <p className="text-xs text-muted-foreground">Live Preview</p>
          </div>
          <div className="bg-white p-4">
            <iframe
              srcDoc={code}
              title="preview"
              className="w-full h-[450px] border-0 bg-white rounded"
              sandbox="allow-scripts"
            />
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CodeEditor;
