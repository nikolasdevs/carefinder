import React, { useState } from "react";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/app/firebase/config";

const mdParser = new MarkdownIt();

function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleEditorChange = ({ text }: { text: string }) => {
    setMarkdown(text);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] as File | null;
    setFile(selectedFile);
  };
  const handleImageUpload = async () => {
    if (file) {
      try {
        // Resize the image
        const resizedImage = await resizeImage(file);

        const storageRef = ref(storage, file.name);
        const metadata = {
          contentType: file.type,
        };

        const uploadResult = await uploadBytes(
          storageRef,
          resizedImage,
          metadata
        );
        const imageUrl = await getDownloadURL(uploadResult.ref);
        const imageMarkdown = `![Image](${imageUrl})`;
        setMarkdown(markdown + "\n" + imageMarkdown);
        setFile(null);
        setModalVisible(false);
      } catch (error) {
        console.error("Error uploading file to Firebase Storage:", error);
      }
    }
  };

  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(
                new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                })
              );
            } else {
              reject(new Error("Canvas is empty"));
            }
          }, file.type);
        };

        img.onerror = (error) => {
          reject(error);
        };
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };
  return (
    <div>
      <MdEditor
        value={markdown}
        style={{ height: "500px" }}
        renderHTML={(text) => mdParser.render(text)}
        onChange={handleEditorChange}
      />

      <Button
        onClick={() => setModalVisible(true)}
        style={{ marginTop: "10px" }}
      >
        Add Image
      </Button>

      <Dialog open={modalVisible} onOpenChange={setModalVisible}>
        <DialogTrigger asChild>
          <Button variant="outline" style={{ display: "none" }}>
            Add Image
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <Input type="file" onChange={handleFileChange} />
          <DialogFooter>
            <Button type="submit" onClick={handleImageUpload}>
              Upload Image
            </Button>
           
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h2>Preview:</h2>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}

export default MarkdownEditor;
