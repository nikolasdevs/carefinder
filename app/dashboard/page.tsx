"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, firestore } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredHospitals.slice(firstItemIndex, lastItemIndex);

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

  const handleAddNew = () => {
    setSelectedHospitalId(null);
    setShowForm(true);
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
          <div className="mt-10  w-full md:p-10 p-4 ">
            <h2 className="text-xl mb-8 font-semibold w-full text-center">
              Hospital Results
            </h2>
            <ul className=" flex gap-4 items-center flex-wrap w-full justify-center">
              {currentItems.map((hospital, index) => (
                <Card className="w-[350px] h-[250px]">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-primary-dark">
                      {" "}
                      {hospital.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
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
                  </CardContent>
                </Card>
              ))}
            </ul>
            <Button className="my-8" onClick={exportToCSV}>Export to CSV</Button>
            
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
