import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Spinner from "./ui/spinner";

export default function ManualDataFetchTable({
  fetchFunc,
  status,
  columns,
  deleteSelected,
}) {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [refetch, { data, isLoading, isFetching }] = fetchFunc({
    status,
  });

  const table = useReactTable({
    data: data?.data?.data || [],
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: data?.data?.totalPages,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  // useEffect(() => {
  //   refetch({
  //     search,
  //     page: pagination.pageIndex + 1,
  //     resultPerPage: pagination.pageSize,
  //   });
  // }, []);

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      refetch({
        search,
        page: pagination.pageIndex + 1,
        resultPerPage: pagination.pageSize,
        status,
      });
    }, 1000);

    return () => {
      clearTimeout(timeOutId);
    };
  }, [pagination.pageIndex, pagination.pageSize, search]);

  const selectedRows = table
    .getSelectedRowModel()
    .flatRows.map((row) => row.original);

  const handleExport = () => {
    if (selectedRows.length === 0) {
      toast.error("No rows selected");
      return;
    }
    const json = JSON.stringify(selectedRows, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "package-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // const handleDeleteSelected = () => {
  //   if (selectedRows.length === 0) {
  //     toast.error("No rows selected to delete");
  //     return;
  //   }
  //   deleteSelected(selectedRows);
  // };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search across all fields..."
          value={search ?? ""}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-chart-1">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={columns?.length}
                  className="h-24 text-center"
                >
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.{" "}
        </div>
        <div className="space-x-2">
          <div className="text-muted-foreground inline-block text-sm">
            Total {table.getPageCount()} page(s)
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex - 1,
              }))
            }
            disabled={pagination.pageIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex + 1,
              }))
            }
            disabled={pagination.pageIndex + 1 >= data?.data?.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
