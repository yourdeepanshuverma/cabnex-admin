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
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import * as XLSX from "xlsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ManualDataFetchTable({
  searchText,
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
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(dateRange);

  const [refetch, { data, isLoading, isFetching }] = fetchFunc();
  const [exportTrigger, { isLoading: isExporting }] = fetchFunc();

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

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      refetch({
        search,
        page: pagination.pageIndex + 1,
        resultPerPage: pagination.pageSize,
        status,
        startDate: dateRange[0].startDate
          ? dateRange[0].startDate.toISOString()
          : undefined,
        endDate: dateRange[0].endDate
          ? dateRange[0].endDate.toISOString()
          : undefined,
      });
    }, 1000);

    return () => {
      clearTimeout(timeOutId);
    };
  }, [pagination.pageIndex, pagination.pageSize, search, status]);

  const handleExport = async () => {
    const result = await exportTrigger({
      search,
      status,
      startDate: dateRange[0].startDate
        ? dateRange[0].startDate.toISOString()
        : undefined,
      endDate: dateRange[0].endDate
        ? dateRange[0].endDate.toISOString()
        : undefined,
      page: 1,
      resultPerPage: 10000, // A large number to fetch all data
    });

    if (result.data?.data?.data?.length > 0) {
      const allData = result.data.data.data;
      const worksheet = XLSX.utils.json_to_sheet(allData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      let fileName = "exported-data";
      const start = dateRange[0].startDate;
      const end = dateRange[0].endDate;

      if (start && end) {
        const formattedStart = start.toLocaleDateString("en-CA"); // YYYY-MM-DD
        const formattedEnd = end.toLocaleDateString("en-CA");     // YYYY-MM-DD
        if (formattedStart === formattedEnd) {
          fileName = `data-${formattedStart}`;
        } else {
          fileName = `data-${formattedStart}_to_${formattedEnd}`;
        }
      } else {
        fileName = "data-all-time";
      }

      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } else {
      toast.error("No data to export");
    }
  };

  const handleDateRangeApply = () => {
    setDateRange(tempDateRange);
    setIsDatePopoverOpen(false);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    refetch({
      search,
      page: 1, // pageIndex will be 0, so page is 1
      resultPerPage: pagination.pageSize,
      status,
      startDate: tempDateRange[0].startDate
        ? tempDateRange[0].startDate.toISOString()
        : undefined,
      endDate: tempDateRange[0].endDate
        ? tempDateRange[0].endDate.toISOString()
        : undefined,
    });
  };

  const handleDateRangeCancel = () => {
    setIsDatePopoverOpen(false);
  };

  const onPopoverOpenChange = (open) => {
    if (open) {
      setTempDateRange(dateRange);
    }
    setIsDatePopoverOpen(open);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder={searchText || "Search across all fields..."}
          value={search ?? ""}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Popover open={isDatePopoverOpen} onOpenChange={onPopoverOpenChange}>
            <PopoverTrigger asChild>
              <Button>Select Date Range</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <div>
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) => setTempDateRange([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={tempDateRange}
                />
                <div className="flex justify-end gap-2 p-2">
                  <Button
                    variant="outline"
                    onClick={handleDateRangeCancel}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleDateRangeApply}>
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export to Excel"}
          </Button>
        </div>
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
                            header.getContext()
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
                        cell.getContext()
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
        <div className="flex-1 text-sm text-muted-foreground"></div>
        <div className="space-x-2">
          <div className="text-muted-foreground inline-block text-sm">
            Page {pagination.pageIndex + 1} of {data?.data?.totalPages ?? 0} page(s)
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
