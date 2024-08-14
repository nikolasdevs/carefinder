"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { auth, firestore } from "../firebase/config";
import AdminNavbar from "../../components/AdminNavbar";
import {
  fetchHospitalData,
  filterHospitalsByState,
  Hospital,
  Type,
} from "../lib/fetchHospital";
import { fetchStates } from "../lib/fetchStates";
import MarkdownEditor from "../EditHospital";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DotsThreeVertical } from "@phosphor-icons/react/dist/ssr";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Delete, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function isHospital(data: any): data is Hospital {
  return (
    typeof data === "object" &&
    typeof data.id === "string" &&
    typeof data.name === "string" &&
    typeof data.address === "string" &&
    typeof data.phone_number === "string" &&
    typeof data.location === "string" &&
    typeof data.state === "object" &&
    typeof data.type === "object"
  );
}

const AdminPage = () => {
  const [admin, setAdmin] = useState<User | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] =
    useState<Hospital[]>(hospitals);
  const [state, setState] = useState<string>("");
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false); // State to control the dialog
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredHospitals.slice(firstItemIndex, lastItemIndex);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (admin) => {
      if (admin) {
        setAdmin(admin);
        const userDoc = await getDoc(doc(firestore, "users", admin.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
        }
      } else {
        router.push("/admin/adminLogin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchHospitalData("", state, "");
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

  useEffect(() => {
    const loadTypes = async () => {
      setLoading(true);
      try {
        const typesCollection = collection(firestore, "types");
        const typesSnapshot = await getDocs(typesCollection);
        const typesList = typesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Type[];
        setTypes(typesList);
      } catch (error) {
        console.error("Error fetching types:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTypes();
  }, []);

  const handleFilterByState = () => {
    const filtered = filterHospitalsByState(hospitals, state);
    setFilteredHospitals(filtered);
  };

  const handleResetFilters = () => {
    setState("");
    setFilteredHospitals(hospitals);
  };

  const handleAddNew = () => {
    setSelectedHospitalId(null);
    setDialogOpen(true);
  };

  const handleAddHospital = async (newHospital: Hospital) => {
    try {
      const hospitalRef = collection(firestore, "hospitals");
      const newHospitalRef = await addDoc(hospitalRef, newHospital);
      setHospitals([...hospitals, { ...newHospital, id: newHospitalRef.id }]);
      setFilteredHospitals([
        ...filteredHospitals,
        { ...newHospital, id: newHospitalRef.id },
      ]);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding hospital:", error);
    }
  };

  const handleUpdateHospital = async (updatedHospital: Hospital) => {
    if (!isHospital(updatedHospital)) {
      throw new Error("Invalid hospital data");
    }

    try {
      const hospitalRef = doc(firestore, "hospitals", updatedHospital.id);
      const updatedHospitalData = {
        ...updatedHospital,
      };
      await updateDoc(hospitalRef, updatedHospitalData);
      const updatedList = hospitals.map((hospital) =>
        hospital.id === updatedHospital.id ? updatedHospital : hospital
      );
      setHospitals(updatedList);
      setFilteredHospitals(updatedList);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error updating hospital:", error);
    }
  };

  const handleEdit = (id: string | null) => {
    setSelectedHospitalId(id);
    setDialogOpen(true);
  };

  const handleSave = (hospital: Hospital) => {
    if (hospital.id) {
      handleUpdateHospital(hospital);
    } else {
      handleAddHospital(hospital);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedHospitalId(null);
  };

  const handleDelete = async (id: string | null | undefined) => {
    if (id) {
      try {
        await deleteDoc(doc(firestore, "hospitals", id));
        setHospitals(hospitals.filter((hospital) => hospital.id !== id));
        setFilteredHospitals(
          filteredHospitals.filter((hospital) => hospital.id !== id)
        );
        setDialogOpen(false);
        setSelectedHospitalId(null);
      } catch (error) {
        console.error("Error deleting hospital:", error);
      }
    }
  };

  const selectedHospital =
    hospitals.find((hospital) => hospital.id === selectedHospitalId) ||
    undefined;

  return (
    <div className="w-full">
      <AdminNavbar />
      <div className="w-full h-[calc(100%-3rem)] flex flex-col px-8">
        <div className="w-full flex items-center gap-2 my-5">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <Select value={state} onValueChange={(value) => setState(value)}>
                <SelectTrigger className=" w-40">
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
              <div className="flex w-full gap-4 items-center justify-between">
                <div className="flex gap-2 items-center">
                  <Button className="" onClick={handleFilterByState}>
                    Filter
                  </Button>
                  <Button className="" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                </div>
                <Button className="" onClick={handleAddNew}>
                  Add New Hospital
                </Button>
              </div>
            </>
          )}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center mb-3">
                {selectedHospitalId ? "Edit Hospital" : "Add New Hospital"}
              </DialogTitle>
            </DialogHeader>
            <MarkdownEditor
              hospitalData={selectedHospital}
              onSave={(hospital) => {
                handleSave(hospital);
                setDialogOpen(false);
              }}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        <div className=" w-full overflow-y-auto rounded-lg border border-solid border-gray-300">
          <table className=" text-sm w-full table-fixed">
            <thead className="sticky top-0 bg-gray-100">
              <tr className="h-10 text-left">
                <th className="px-4 border-b border-solid border-gray-300 w-1/6 truncate">
                  Name
                </th>
                <th className="px-4 border-b border-solid border-gray-300 w-1/4 truncate">
                  Address
                </th>
                <th className="px-4 border-b border-solid border-gray-300 w-1/6 truncate">
                  Phone Number
                </th>
                <th className="px-4 border-b border-solid border-gray-300 w-1/6 truncate">
                  Location
                </th>
                <th className="px-4 border-b border-solid border-gray-300 w-1/12 truncate">
                  State
                </th>
                <th className="px-4 border-b border-solid border-gray-300 w-1/12 truncate">
                  Type
                </th>
                <th className="px-4 border-b border-solid border-gray-300 w-1/12 truncate">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((hospital) => (
                <tr key={hospital.id} className="h-12">
                  <td className="px-4 border-b border-solid border-gray-300 truncate">
                    {hospital.name}
                  </td>
                  <td className="px-4 border-b border-solid border-gray-300 truncate">
                    {hospital.address}
                  </td>
                  <td className="px-4 border-b border-solid border-gray-300 truncate">
                    {hospital.phone_number}
                  </td>
                  <td className="px-4 border-b border-solid border-gray-300 truncate">
                    {hospital.location}
                  </td>
                  <td className="px-4 border-b border-solid border-gray-300 truncate">
                    {hospital.state?.name || "N/A"}
                  </td>
                  <td className="px-4 border-b border-solid border-gray-300 truncate">
                    {hospital.type?.name || "N/A"}
                  </td>
                  <td className="px-4 border-b border-solid border-gray-300 truncate">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <DotsThreeVertical className="w-6 h-6" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="">
                        <DropdownMenuItem
                          onClick={() => handleEdit(hospital.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span> Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(hospital.id)}
                        >
                          <Delete className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>{" "}
        <div className="mt-3 mb-6">
          <PaginationSection
            totalItems={filteredHospitals.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

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
