import React, { Suspense } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

type PaginationProps = {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

const PaginationSection: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxPagesToShow = 6;
  const pages = [];

  const startPage = Math.max(currentPage - Math.floor(maxPagesToShow / 2), 1);
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Pagination>
        <PaginationPrevious
          onClick={() => setCurrentPage(currentPage - 1)}
          className={currentPage === 1 ? "disabled" : ""}
        >
          Previous
        </PaginationPrevious>

        <PaginationContent>
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                className={page === currentPage ? "active" : ""}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>

        <PaginationNext
          onClick={() => setCurrentPage(currentPage + 1)}
          className={currentPage === totalPages ? "disabled" : ""}
        >
          Next
        </PaginationNext>
      </Pagination>
    </Suspense>
  );
};

export default PaginationSection;
