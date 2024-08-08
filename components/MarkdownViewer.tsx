import { firestore } from "@/app/firebase/config";
import { doc, getDoc } from "@firebase/firestore";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export const MarkdownViewer = ({ match }: { match: any }) => {
  const [markdown, setMarkdown] = useState("");
  const { docId } = match.params;

  useEffect(() => {
    const fetchMarkdownContent = async () => {
      try {
        const docRef = doc(firestore, "markdown_contents", docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMarkdown(docSnap.data().content);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchMarkdownContent();
  }, [docId]);

  return (
    <div className="markdown-body">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};
