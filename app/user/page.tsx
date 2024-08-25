"use client";
import { Button } from "@/components/ui/button";
import React, { Suspense, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, firestore, storage } from "../firebase/config";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { fetchStates } from "../lib/fetchStates";
import Papa from "papaparse";
import { motion } from "framer-motion";
import Image from "next/image";
import location from "../../public/locationImage.jpg";
import Link from "next/link";
import {
  Backspace,
  FacebookLogo,
  Hospital as HospitalIcon,
  InstagramLogo,
  MapPin,
  MapPinArea,
  NotePencil,
  Phone,
  Share,
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
import "react-markdown-editor-lite/lib/index.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import PaginationSection from "@/components/PaginationSection";
import "react-quill/dist/quill.snow.css";
import { RotatingSquare } from "react-loader-spinner";

const DashboardPage = () => {
  // User and Auth State
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Navigation and Router
  const router = useRouter();

  // Hospital Data
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null
  );

  // Filtering and Searching
  const [state, setState] = useState<string>("");
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [addressQuery, setAddressQuery] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredHospitals.slice(firstItemIndex, lastItemIndex);

  // Loading State
  const [loading, setLoading] = useState(false);

  // Markdown Editor
  const [markdown, setMarkdown] = useState("");
  const mdParser = new MarkdownIt();
  const handleEditorChange = ({ text }: { text: string }) => setMarkdown(text);

  // const [content, setContent] = useState("");
  // const handleEditorChange = (value: string) => {
  //   setContent(value);
  // }
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [mVisible, setMVisible] = useState(false);

  // Image Upload
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Preview and Sharing
  const [shareableLink, setShareableLink] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  // Effect Hooks (User Authentication, Data Fetching, etc.)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
        }
      } else {
        setLoading(true);
        router.push("/user/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchHospitalData(state, addressQuery, "");
        if (data) {
          setHospitals(data);
          setFilteredHospitals(data);
        }
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [state, addressQuery]);

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

  // Filtering Logic
  const handleFilter = useDebouncedCallback(() => {
    let filtered = hospitals;

    if (state) {
      filtered = filterHospitalsByState(filtered, state);
    }

    if (addressQuery) {
      filtered = filterHospitalsByAddress(filtered, addressQuery);
    }

    setFilteredHospitals(filtered);
  }, 800);

  const handleResetFilters = () => {
    setState("");
    setAddressQuery("");
    setFilteredHospitals(hospitals);
  };

  // CSV Export
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

  // Image Upload Logic
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

  // Edit and Preview Logic
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
      setMVisible(false);
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

  const handleBackToEdit = () => setIsPreview(false);

  const handleHospitalPreview = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setMVisible(true);
  };

  const generateShareableLink = async (markdownContent: string) => {
    try {
      const docId = new Date().getTime().toString();
      const docRef = doc(collection(firestore, "markdown_contents"), docId);
      await setDoc(docRef, { content: markdownContent });
      const shareableLink = `${window.location.origin}/view/${docId}`;
      return shareableLink;
    } catch (error) {
      console.error("Error generating shareable link:", error);
      throw new Error("Failed to generate shareable link");
    }
  };

  const handleShare = () => {
    const email = "recipient@example.com";
    const subject = "Shared Hospital Details";
    const body = encodeURIComponent(markdown);
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  const isLocation = selectedHospital?.location;

  return (
    <div className="h-screen mx-auto p-4 ">
      <div>
        <Navbar />
      </div>
      <main className=" flex flex-col items-center justify-center">
        <div className=" w-full  mt-10 flex flex-col gap-5 items-center justify-center">
          <h1 className="text-2xl font-semibold">
            Search Hospitals within your locality
          </h1>
          <div className="mb-4 flex flex-col md:flex-row gap-4 justify-center items-center w-full md:w-full lg:w-1/2 md:px-10 lg:px-0">
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
            <div className="flex gap-4 items-center w-full justify-center">
              <Button className="w-full" onClick={handleFilter}>
                Search
              </Button>

              <Button
                className="w-full"
                variant={"outline"}
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        <>
          {loading ? (
            <div className="flex items-center justify-center h-[500px]">
              <RotatingSquare
                visible={true}
                height="100"
                width="100"
                color="#003DF5"
                ariaLabel="rotating-square-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            </div>
          ) : (
            <>
              {error && <p className="text-red-500">{error}</p>}
              {hospitals.length > 0 && (
                <div className="mt-10  w-full sm:p-10 p-4 ">
                  <h2 className="text-xl mb-8 font-semibold w-full text-center">
                    Hospital Results
                  </h2>
                  <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {currentItems.map((hospital) => (
                      <motion.div
                        key={hospital.id}
                        whileHover={{
                          scale: 1.05,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <Card
                          key={hospital.id}
                          className=" h-[280px]  flex flex-col justify-between cursor-pointer"
                        >
                          <div className="flex flex-col ">
                            {" "}
                            <CardHeader>
                              <CardTitle
                                onClick={() => handleHospitalPreview(hospital)}
                                className="hover:underline  text-lg"
                              >
                                {" "}
                                {hospital.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col ">
                              {" "}
                              <p className="text-sm  flex items-center gap-2">
                                {" "}
                                <span>
                                  <MapPinIcon width={16} />
                                </span>{" "}
                                {hospital.address}
                              </p>
                              <p className="  text-sm flex items-center gap-2 mt-2">
                                <span>
                                  <PhoneIcon width={16} />
                                </span>{" "}
                                {hospital.phone_number}
                              </p>
                            </CardContent>{" "}
                          </div>
                          <CardFooter className=" w-full h-fit">
                            <div
                              className="hover:border    h-10 w-10 flex items-center justify-center rounded-full z-50"
                              onClick={() => handleEditClick(hospital)}
                            >
                              <NotePencil size={16} />
                            </div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  <Dialog open={modalVisible} onOpenChange={setModalVisible}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {isPreview
                            ? "Preview Content"
                            : "Edit Hospital Details"}
                        </DialogTitle>
                      </DialogHeader>
                      {isPreview ? (
                        <>
                          <div className=" max-w-full overflow-auto p-4 ">
                            <ReactMarkdown className="">
                              {markdown}
                            </ReactMarkdown>
                          </div>
                          <div className="flex gap-4">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    onClick={handleBackToEdit}
                                  >
                                    <Backspace />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p> Back to Edit</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleShare}
                                  >
                                    <Share />
                                  </Button>
                                </TooltipTrigger>{" "}
                                <TooltipContent>
                                  <p>Share</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className=" h-auto flex"></div>
                        </>
                      ) : (
                        <>
                          {isImageUpload ? (
                            <>
                              <Input type="file" onChange={handleFileChange} />
                              <DialogFooter className="flex items-center justify-between w-full">
                                <Button
                                  type="submit"
                                  onClick={handleImageUpload}
                                >
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
                                renderHTML={(text) => mdParser.render(text)}
                                onChange={handleEditorChange}
                                config={{
                                  view: {
                                    menu: true,
                                    md: true,
                                    html: true,
                                    fullScreen: true,
                                    hideMenu: false,
                                  },
                                }}
                                style={{
                                  width: "100%", // Adjust width to 100% of the parent container
                                  maxWidth: "600px", // Set a maximum width for larger screens
                                  height: "300px",
                                  overflow: "auto",
                                }}
                              />
                              <div className="flex justify-between w-full  p-2 mt-2 rounded-lg">
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
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  {selectedHospital && (
                    <Dialog open={mVisible} onOpenChange={setMVisible}>
                      <DialogTrigger asChild>
                        <Button variant="outline" style={{ display: "none" }}>
                          View
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-[50%]">
                        <DialogHeader>
                          <DialogTitle>{selectedHospital.name}</DialogTitle>
                        </DialogHeader>
                        <p className=" text-sm flex items-center gap-2 mt-2">
                          <span>
                            <HospitalIcon width={16} />
                          </span>
                          {selectedHospital.type.name}
                        </p>
                        <p className="text-sm  flex items-center gap-2">
                          <span>
                            <MapPin width={16} />
                          </span>
                          {selectedHospital.address}
                        </p>
                        <p className="text-sm  flex items-center gap-2">
                          <span>
                            <MapPinArea width={16} />
                          </span>
                          {isLocation ? selectedHospital.location : "N/A"}
                        </p>
                        <p className=" text-sm flex items-center gap-2 mt-2">
                          <span>
                            <Phone width={16} />
                          </span>
                          {selectedHospital.phone_number}
                        </p>
                      </DialogContent>
                    </Dialog>
                  )}

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
            </>
          )}
        </>
      </main>

      <div>
        <div className="w-full flex md:flex-row flex-col md:h-[500px] mt-10">
          <Image src={location} alt="location" className="md:w-1/2 w-full" />
          <div className=" md:w-1/2 w-full flex md:items-center justify-center text-center flex-col  gap-4 md:text-6xl text-3xl px-8  py-8 bg-black text-gray-200">
            <div className="flex flex-col w-full gap-4">
              <p className="leading-tight font-bold"> Do not get stranded </p>
              <p className="md:text-2xl text-xl font tracking-wide">
                {" "}
                Locate and share medical facilities in your area
              </p>
            </div>
          </div>
        </div>
        <div></div>
        <div className="flex md:flex-row flex-col w-full items-center justify-center  mt-10  p-10 ">
          <div className=" flex md:flex-row flex-col md:my-10 my-5 gap-8 items-center">
            <div className="flex flex-col w-full">
              <p className=" text-[2rem] font-semibold">Join our newsletter</p>{" "}
              <p>Get regular updates on hospitals around you.</p>
            </div>
            <form
              action=""
              className="flex items-center justify-between w-full  rounded-lg "
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="outline-none px-4 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-e-none"
              />
              <Button className=" rounded-e-lg rounded-s-none">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        <div className=" h-[1px] w-full my-10"></div>
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
    </div>
  );
};

export default DashboardPage;
