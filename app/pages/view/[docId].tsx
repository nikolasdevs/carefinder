import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/app/firebase/config"; // Adjust path as per your project structure
import ReactMarkdown from "react-markdown";

const ViewPage = () => {
  const router = useRouter();
  const { docId } = router.query;
  const [markdownContent, setMarkdownContent] = useState<string>("");

  useEffect(() => {
    const fetchMarkdownContent = async () => {
      try {
        const docRef = doc(firestore, "markdown_contents", docId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMarkdownContent(docSnap.data().content);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    if (docId) {
      fetchMarkdownContent();
    }
  }, [docId]);

  return (
    <div>
      <h1>Shared Content</h1>
      <ReactMarkdown>{markdownContent}</ReactMarkdown>
    </div>
  );
};

export default ViewPage;
