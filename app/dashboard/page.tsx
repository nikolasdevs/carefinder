"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, firestore, storage } from "../firebase/config";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { fetchStates } from "../lib/fetchStates";
import Papa from "papaparse";
import Navbar from "../Navbar";
import Image from "next/image";
import location from "../../public/locationImage.jpg";
import Link from "next/link";
import {
  FacebookLogo,
  InstagramLogo,
  MagnifyingGlass,
  NotePencil,
  XLogo,
} from "@phosphor-icons/react/dist/ssr";
import {
  fetchHospitalData,
  filterHospitalsByAddress,
  filterHospitalsByState,
  Hospital,
  Type,
} from "../lib/fetchHospital";
import { useDebouncedCallback } from "use-debounce";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownIt from "markdown-it";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MdEditor from "react-markdown-editor-lite";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import ReactMarkdown from "react-markdown";
import { NotebookPenIcon } from "lucide-react";

export const DashboardPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [state, setState] = useState<string>("");
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(
    null
  );
  const [addressQuery, setAddressQuery] = useState<string>("");
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [markdown, setMarkdown] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null
  );
  const [file, setFile] = useState<File | null>(null);
  const [shareableLink, setShareableLink] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredHospitals.slice(firstItemIndex, lastItemIndex);

  const mdParser = new MarkdownIt();

  const handleEditorChange = ({ text }: { text: string }) => {
    setMarkdown(text);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchHospitalData(state, addressQuery, "");
      if (data) {
        setHospitals(data);
        setFilteredHospitals(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [state]);

  useEffect(() => {
    const loadStates = async () => {
      setLoading(true);
      const fetchedStates = await fetchStates();
      const statesData = fetchedStates.map((state) => ({
        id: state,
        name: state,
      }));
      setStates(statesData);
      setLoading(false);
    };
    loadStates();
  }, []);

  const handleFilter = useDebouncedCallback(() => {
    let filtered = hospitals;

    if (state) {
      filtered = filterHospitalsByState(filtered, state);
    }

    if (addressQuery) {
      filtered = filterHospitalsByAddress(filtered, addressQuery);
    }

    setFilteredHospitals(filtered);
  }, 300);

  const handleResetFilters = () => {
    setState("");
    setAddressQuery("");
    setFilteredHospitals(hospitals);
  };

  const handleChangePassword = () => {
    router.push("/changePassword");
  };

  const exportToCSV = () => {
    const csvData = filteredHospitals.map((hospital) => ({
      Name: hospital.name,
      Address: hospital.address,
      Phone: hospital.phone_number,
      State: hospital.state,
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "hospitals.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditClick = (hospital: Hospital | null) => {
    if (hospital) {
      const hospitalMarkdown = `
    ## ${hospital.name}
    **Address:** ${hospital.address}
    **Phone Number:** ${hospital.phone_number}
      `;
      setMarkdown(hospitalMarkdown);
      setSelectedHospital(hospital);
      setModalVisible(true);
      setIsImageUpload(false);
    }
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
        setIsImageUpload(false);
        //setModalVisible(false);
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
        const img = document.createElement("img");
        img.width = 800;
        img.height = 600;
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
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error("Canvas is empty"));
            }
          }, file.type);
        };

        img.onerror = (error: any) => reject(error);
      };

      reader.onerror = (error) => reject(error);
    });
  };

  const generateShareableLink = async (markdownContent: string) => {
    try {
      // Generate a unique document ID (e.g., using a timestamp or a UUID library)
      const docId = new Date().getTime().toString(); // Simple unique ID (consider using a UUID library for production)
      const docRef = doc(collection(firestore, "markdown_contents"), docId);
      await setDoc(docRef, { content: markdownContent });

      const shareableLink = `${window.location.origin}/view/${docId}`;

      return shareableLink;
    } catch (error) {
      console.error("Error generating shareable link:", error);
      throw new Error("Failed to generate shareable link");
    }
  };

  const handlePreview = async () => {
    setIsPreview(true);
    try {
      const link = await generateShareableLink(markdown);
      setShareableLink(link);
    } catch (error) {
      console.error("Error generating shareable link:", error);
    }
  };

  const handleBackToEdit = () => {
    setIsPreview(false);
  };

  const handleShare = async () => {
    const link = await generateShareableLink(markdown);
    setShareableLink(link);
  };

  return (
    <div className="h-screen mx-auto p-4 text-neutral-800">
      <div>
        <Navbar />
      </div>
      <main className=" flex flex-col items-center justify-center">
        <div className=" w-full  mt-10 flex flex-col gap-5 items-center justify-center">
          <h1 className="text-2xl font-semibold">
            Search Hospitals within your locality
          </h1>
          <div className="mb-4 flex flex-col md:flex-row gap-5 justify-center items-center w-full md:w-1/2">
            <Select value={state} onValueChange={(value) => setState(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.name}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder="Search by address"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
            />

            <Button onClick={handleFilter}>Search</Button>

            <Button onClick={handleResetFilters}>Reset</Button>
          </div>
        </div>

        {loading && <p>Loading hospitals...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {hospitals.length > 0 && (
          <div className="mt-10  w-full sm:p-10 p-4 ">
            <h2 className="text-xl mb-8 font-semibold w-full text-center">
              Hospital Results
            </h2>
            <ul className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentItems.map((hospital, index) => (
                <Card className=" h-[280px]  flex flex-col justify-between hover:bg-gray-100 cursor-pointer">
                  <div className="flex flex-col ">
                    {" "}
                    <CardHeader>
                      <CardTitle className="text-base font-semibold text-primary-dark">
                        {" "}
                        {hospital.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col ">
                      {" "}
                      <p className="text-sm text-neutral-500 flex items-center gap-2">
                        {" "}
                        <span>
                          <MapPinIcon width={16} />
                        </span>{" "}
                        {hospital.address}
                      </p>
                      <p className=" text-neutral-400 text-sm flex items-center gap-2 mt-2">
                        <span>
                          <PhoneIcon width={16} />
                        </span>{" "}
                        {hospital.phone_number}
                      </p>
                    </CardContent>{" "}
                  </div>
                  <CardFooter className=" w-full h-fit">
                    <div
                      className="border border-gray-300 hover:border-none hover:bg-gray-200  h-10 w-10 flex items-center justify-center rounded-full"
                      onClick={() => handleEditClick(hospital)}
                    >
                      <NotePencil size={16} />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </ul>

            <Dialog open={modalVisible} onOpenChange={setModalVisible}>
              <DialogTrigger asChild>
                <Button variant="outline" style={{ display: "none" }}>
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[50%]">
                <DialogHeader>
                  <DialogTitle>
                    {isPreview ? "Preview Content" : "Edit Hospital Details"}
                  </DialogTitle>
                </DialogHeader>
                {isPreview ? (
                  <>
                    <ReactMarkdown>{markdown}</ReactMarkdown>
                    <DialogFooter>
                      <Button type="button" onClick={handleBackToEdit}>
                        Back to Edit
                      </Button>
                      {shareableLink && (
                        <p>
                          Shareable Link:{" "}
                          <a
                            href={shareableLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {shareableLink}
                          </a>
                        </p>
                      )}
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    {isImageUpload ? (
                      <>
                        <Input type="file" onChange={handleFileChange} />
                        <DialogFooter>
                          <Button type="submit" onClick={handleImageUpload}>
                            Upload Image
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setIsImageUpload(false)}
                          >
                            Back to Editor
                          </Button>
                        </DialogFooter>
                      </>
                    ) : (
                      <>
                        <MdEditor
                          value={markdown}
                          style={{ height: "300px" }}
                          renderHTML={(text) => mdParser.render(text)}
                          onChange={handleEditorChange}
                        />
                        <Button
                          onClick={() => setIsImageUpload(true)}
                          style={{ marginTop: "10px" }}
                        >
                          Add Image
                        </Button>
                        <Button
                          onClick={handlePreview}
                          style={{ marginTop: "10px" }}
                        >
                          Preview
                        </Button>
                        <DialogFooter>
                          <Button
                            type="button"
                            onClick={() => setModalVisible(false)}
                          >
                            Close
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </>
                )}
              </DialogContent>
            </Dialog>

            <Button className="my-8" onClick={exportToCSV}>
              Export to CSV
            </Button>

            <PaginationSection
              totalItems={filteredHospitals.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </main>
      <div className="w-full flex md:flex-row flex-col md:h-[500px] mt-10">
        <Image src={location} alt="location" className="md:w-1/2 w-full" />
        <div className=" md:w-1/2 w-full  bg-black flex md:items-center justify-center flex-col text-neutral-100 gap-4 md:text-4xl text-2xl px-4 font-medium py-8">
          <p className="">Do not ever get stranded ... </p>
          <p> Locate medical facilities in your area</p>
        </div>
      </div>
      <div className="flex md:flex-row flex-col w-full items-center justify-center bg-black mt-10  p-10 text-neutral-100">
        <div className=" flex md:flex-row flex-col md:my-10 my-5 gap-8 items-center">
          <div className="flex flex-col w-full">
            <p className=" text-[2rem] font-semibold">Join our newsletter</p>{" "}
            <p>Get regular updates and inspiring customer stories.</p>
          </div>
          <form
            action=""
            className="flex items-center justify-between w-full text-neutral-400 rounded-lg bg-neutral-100"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="outline-none px-4 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-e-none"
            />
            <Button className=" rounded-e-lg rounded-s-none">Subscribe</Button>
          </form>
        </div>
      </div>
      <div className="bg-neutral-300 h-[1px] w-full my-10"></div>
      <div className="flex items-center justify-between md:p-10 pt-0 ">
        <div className="flex md:items-center gap-4 md:flex-row flex-col text-sm w-full">
          <p>Terms</p>
          <p> Privacy </p>
          <p>© 2024 CareFinder. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#">
            <FacebookLogo />{" "}
          </Link>
          <Link href="#">
            <XLogo />
          </Link>
          <Link href="#">
            <InstagramLogo />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

function PaginationSection({
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}: {
  totalItems: any;
  itemsPerPage: any;
  currentPage: any;
  setCurrentPage: any;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxPagesToShow = 6;
  let pages = [];

  const startPage = Math.max(currentPage - Math.floor(maxPagesToShow / 2), 1);
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            isActive={currentPage === 1}
            onClick={handlePrevPage}
          />
        </PaginationItem>

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={currentPage === page}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            isActive={currentPage === totalPages}
            onClick={handleNextPage}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
