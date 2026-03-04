import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Filter,
  Save,
  X,
  UserPlus,
  CalendarIcon,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import axios from "axios";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { format } from "date-fns";
// import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar as DateCalendar } from "@/components/ui/calendar";

const ToursList = () => {
  const [tours, setTours] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [transportFilter, setTransportFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [tourDialogOpen, setTourDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTour, setCurrentTour] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [transportModes, setTransportModes] = useState([
    "bus",
    "car",
    "flight",
    "train",
  ]);
  const [companionDialogOpen, setCompanionDialogOpen] = useState(false);
  const [currentTourCompanions, setCurrentTourCompanions] = useState([]);
  const [newCompanionName, setNewCompanionName] = useState("");
  const [newCompanionEmail, setNewCompanionEmail] = useState("");
  const token = localStorage.getItem("token");

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      destination: "",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      transportMode: "bus",
      travelCost: 0,
      foodCost: 0,
      accommodationCost: 0,
      miscellaneousCost: 0,
      companions: [],
      itinerary: [{ activity: "", date: new Date(), details: "" }],
    },
  });

  // Field arrays
  const { fields, append, remove } = useFieldArray({
    control,
    name: "itinerary",
  });

  const {
    fields: companionFields,
    append: appendCompanion,
    remove: removeCompanion,
  } = useFieldArray({
    control,
    name: "companions",
  });

  // Fetch all tours
  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/v1/admin/getAllTours"
      );
      if (response.data.success) {
        setTours(response.data.tours);

        // Extract unique destinations for filter
        const uniqueDestinations = [
          ...new Set(response.data.tours.map((tour) => tour.destination)),
        ];
        setDestinations(uniqueDestinations);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tours:", error);
      toast.error("Failed to load tours");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  // Filter tours based on search term and filters
  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tour.createdBy &&
        tour.createdBy.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDestination =
      destinationFilter === "" ||
      tour.destination.toLowerCase().includes(destinationFilter.toLowerCase());

    const matchesTransport =
      transportFilter === "" ||
      tour.transportMode.toLowerCase() === transportFilter.toLowerCase();

    return matchesSearch && matchesDestination && matchesTransport;
  });

  // Delete tour handler
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/admin/deleteTour/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Remove tour from local state
        setTours(tours.filter((tour) => tour._id !== id));

        // Show success toast
        toast.success(response.data.message || "Tour deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting tour:", error);
      toast.error(error.response?.data?.message || "Error deleting tour");
    }
  };

  // Open dialog for adding new tour
  const handleAddTour = () => {
    setIsEditing(false);
    setCurrentTour(null);
    reset({
      destination: "",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      transportMode: "bus",
      travelCost: 0,
      foodCost: 0,
      accommodationCost: 0,
      miscellaneousCost: 0,
      companions: [],
      itinerary: [{ activity: "", date: new Date(), details: "" }],
    });
    setTourDialogOpen(true);
  };

  // Open dialog for editing tour
  const handleEditTour = (tour) => {
    setIsEditing(true);
    setCurrentTour(tour);

    // Set form values
    setValue("destination", tour.destination);
    setValue("startDate", new Date(tour.startDate));
    setValue("endDate", new Date(tour.endDate));
    setValue("transportMode", tour.transportMode);
    setValue("travelCost", tour.travelCost);
    setValue("foodCost", tour.foodCost);
    setValue("accommodationCost", tour.accommodationCost);
    setValue("miscellaneousCost", tour.miscellaneousCost || 0);

    // Set companions if they exist
    if (tour.companions && tour.companions.length > 0) {
      setValue("companions", tour.companions);
    } else {
      setValue("companions", []);
    }

    // Set itinerary if it exists
    if (tour.itinerary && tour.itinerary.length > 0) {
      setValue(
        "itinerary",
        tour.itinerary.map((item) => ({
          activity: item.activity,
          date: new Date(item.date),
          details: item.details || "",
        }))
      );
    } else {
      setValue("itinerary", [{ activity: "", date: new Date(), details: "" }]);
    }

    setTourDialogOpen(true);
  };

  // View companions dialog
  const handleViewCompanions = (tour) => {
    setCurrentTourCompanions(tour.companions || []);
    setCurrentTour(tour);
    setCompanionDialogOpen(true);
  };

  // Add companion
  const handleAddCompanion = async () => {
    if (!newCompanionName || !newCompanionEmail) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedCompanions = [
        ...currentTourCompanions,
        { name: newCompanionName, email: newCompanionEmail },
      ];

      const response = await axios.put(
        `http://localhost:8000/api/v1/admin/updateTour/${currentTour._id}`,
        { companions: updatedCompanions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update tour in local state
        setTours(
          tours.map((tour) =>
            tour._id === currentTour._id
              ? { ...tour, companions: updatedCompanions }
              : tour
          )
        );

        setCurrentTourCompanions(updatedCompanions);
        setNewCompanionName("");
        setNewCompanionEmail("");
        toast.success("Companion added successfully");
      }
    } catch (error) {
      console.error("Error adding companion:", error);
      toast.error("Failed to add companion");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove companion
  const handleRemoveCompanion = async (index) => {
    try {
      setIsSubmitting(true);
      const updatedCompanions = [...currentTourCompanions];
      updatedCompanions.splice(index, 1);

      const response = await axios.put(
        `http://localhost:8000/api/v1/admin/updateTour/${currentTour._id}`,
        { companions: updatedCompanions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        // Update tour in local state
        setTours(
          tours.map((tour) =>
            tour._id === currentTour._id
              ? { ...tour, companions: updatedCompanions }
              : tour
          )
        );

        setCurrentTourCompanions(updatedCompanions);
        toast.success("Companion removed successfully");
      }
    } catch (error) {
      console.error("Error removing companion:", error);
      toast.error("Failed to remove companion");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate days between two dates
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Including both start and end days
  };

  // Calculate total budget
  const calculateTotalBudget = (
    travelCost,
    foodCost,
    accommodationCost,
    miscellaneousCost
  ) => {
    return (
      Number(travelCost || 0) +
      Number(foodCost || 0) +
      Number(accommodationCost || 0) +
      Number(miscellaneousCost || 0)
    );
  };

  // Form submission handler
  const onSubmit = async (data) => {
    const numberOfDays = calculateDays(data.startDate, data.endDate);
    const totalBudget = calculateTotalBudget(
      data.travelCost,
      data.foodCost,
      data.accommodationCost,
      data.miscellaneousCost
    );

    // Prepare data for API
    const tourData = {
      ...data,
      numberOfDays,
      totalBudget,
      itinerary: data.itinerary.map((item) => ({
        activity: item.activity,
        date: item.date,
        details: item.details || "",
      })),
    };

    setIsSubmitting(true);

    try {
      let response;

      if (isEditing) {
        // Update existing tour
        response = await axios.put(
          `http://localhost:8000/api/v1/admin/updateTour/${currentTour._id}`,
          tourData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Update tour in local state
          setTours(
            tours.map((tour) =>
              tour._id === currentTour._id
                ? { ...tour, ...response.data.tour }
                : tour
            )
          );

          toast.success("Tour updated successfully");
        }
      } else {
        // Create new tour
        const token = localStorage.getItem("token");
        response = await axios.post(
          "http://localhost:8000/api/v1/admin/createTour",
          tourData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Add new tour to local state
          setTours([...tours, response.data.tour]);
          toast.success("Tour created successfully");
        }
      }

      // Close dialog and reset form
      setTourDialogOpen(false);
      reset();
    } catch (error) {
      console.error("Error saving tour:", error);
      toast.error(error.response?.data?.message || "Error saving tour");
    } finally {
      setIsSubmitting(false);
    }
  };

  // For form calculations
  const watchedValues = watch();

  function DatePicker({ date, onSelect }) {
    const today = new Date();
    return (
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DateCalendar
              mode="single"
              selected={date}
              onSelect={onSelect}
              initialFocus
              disabled={{
                before: today,
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tours Management
          </h1>
          <p className="text-muted-foreground">
            Manage all tour packages and itineraries
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleAddTour}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Tour
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tours..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={destinationFilter}
                onValueChange={setDestinationFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Destinations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  {destinations.map((dest, index) => (
                    <SelectItem key={index} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={transportFilter}
                onValueChange={setTransportFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Transport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transport</SelectItem>
                  {transportModes.map((mode, index) => (
                    <SelectItem key={index} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tours Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-6">Loading tours...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destination</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Transport</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Companions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTours.length > 0 ? (
                  filteredTours.map((tour) => (
                    <TableRow key={tour._id}>
                      <TableCell className="font-medium">
                        {tour.destination}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="text-sm">
                            {new Date(tour.startDate).toLocaleDateString()} -{" "}
                            {new Date(tour.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{tour.numberOfDays} days</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                          <span className="font-medium">
                            {tour.totalBudget}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          {tour.transportMode}
                        </Badge>
                      </TableCell>
                      <TableCell>{tour.createdBy}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center hover:bg-blue-50"
                          onClick={() => handleViewCompanions(tour)}
                        >
                          <Users className="h-4 w-4 mr-1 text-purple-500" />
                          <span>{tour.companions?.length || 0}</span>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditTour(tour)}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(tour._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-6"
                    >
                      No tours found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{filteredTours.length}</span> of{" "}
            <span className="font-medium">{tours.length}</span> tours
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      {/* Tour Form Dialog */}
      <Dialog open={tourDialogOpen} onOpenChange={setTourDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Tour" : "Add New Tour"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update tour details below"
                : "Fill in the details to create a new tour"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  {...register("destination", {
                    required: "Destination is required",
                  })}
                  placeholder="Enter destination"
                />
                {errors.destination && (
                  <p className="text-sm text-red-500">
                    {errors.destination.message}
                  </p>
                )}
              </div>

              {/* Transport Mode */}
              <div className="space-y-2">
                <Label htmlFor="transportMode">Transport Mode</Label>
                <Controller
                  name="transportMode"
                  control={control}
                  rules={{ required: "Transport mode is required" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="transportMode">
                        <SelectValue placeholder="Select transport mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {transportModes.map((mode, index) => (
                          <SelectItem key={index} value={mode}>
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.transportMode && (
                  <p className="text-sm text-red-500">
                    {errors.transportMode.message}
                  </p>
                )}
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: "Start date is required" }}
                  render={({ field }) => (
                    <DatePicker date={field.value} onSelect={field.onChange} />
                  )}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{
                    required: "End date is required",
                    validate: (value) =>
                      new Date(value) >= new Date(watchedValues.startDate) ||
                      "End date must be after start date",
                  }}
                  render={({ field }) => (
                    <DatePicker date={field.value} onSelect={field.onChange} />
                  )}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              {/* Travel Cost */}
              <div className="space-y-2">
                <Label htmlFor="travelCost">Travel Cost</Label>
                <Input
                  id="travelCost"
                  type="number"
                  {...register("travelCost", {
                    required: "Travel cost is required",
                    min: { value: 0, message: "Cost cannot be negative" },
                  })}
                  placeholder="Enter travel cost"
                />
                {errors.travelCost && (
                  <p className="text-sm text-red-500">
                    {errors.travelCost.message}
                  </p>
                )}
              </div>

              {/* Food Cost */}
              <div className="space-y-2">
                <Label htmlFor="foodCost">Food Cost</Label>
                <Input
                  id="foodCost"
                  type="number"
                  {...register("foodCost", {
                    required: "Food cost is required",
                    min: { value: 0, message: "Cost cannot be negative" },
                  })}
                  placeholder="Enter food cost"
                />
                {errors.foodCost && (
                  <p className="text-sm text-red-500">
                    {errors.foodCost.message}
                  </p>
                )}
              </div>

              {/* Accommodation Cost */}
              <div className="space-y-2">
                <Label htmlFor="accommodationCost">Accommodation Cost</Label>
                <Input
                  id="accommodationCost"
                  type="number"
                  {...register("accommodationCost", {
                    required: "Accommodation cost is required",
                    min: { value: 0, message: "Cost cannot be negative" },
                  })}
                  placeholder="Enter accommodation cost"
                />
                {errors.accommodationCost && (
                  <p className="text-sm text-red-500">
                    {errors.accommodationCost.message}
                  </p>
                )}
              </div>

              {/* Miscellaneous Cost */}
              <div className="space-y-2">
                <Label htmlFor="miscellaneousCost">Miscellaneous Cost</Label>
                <Input
                  id="miscellaneousCost"
                  type="number"
                  {...register("miscellaneousCost", {
                    required: "Miscellaneous cost is required",
                    min: { value: 0, message: "Cost cannot be negative" },
                  })}
                  placeholder="Enter other costs"
                />
                {errors.miscellaneousCost && (
                  <p className="text-sm text-red-500">
                    {errors.miscellaneousCost.message}
                  </p>
                )}
              </div>
            </div>

            {/* Total Budget Summary */}
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">
                  {calculateDays(
                    watchedValues.startDate,
                    watchedValues.endDate
                  )}{" "}
                  days
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Budget:</span>
                <span className="font-medium">
                  {calculateTotalBudget(
                    watchedValues.travelCost,
                    watchedValues.foodCost,
                    watchedValues.accommodationCost,
                    watchedValues.miscellaneousCost
                  )}
                </span>
              </div>
            </div>

            {/* Companions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Companions</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendCompanion({ name: "", email: "" })}
                >
                  <UserPlus className="h-4 w-4 mr-1" /> Add Companion
                </Button>
              </div>

              {companionFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Companion {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCompanion(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`companions.${index}.name`}>Name</Label>
                      <Input
                        id={`companions.${index}.name`}
                        {...register(`companions.${index}.name`, {
                          required: "Name is required",
                        })}
                        placeholder="Enter companion name"
                      />
                      {errors.companions?.[index]?.name && (
                        <p className="text-sm text-red-500">
                          {errors.companions[index].name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`companions.${index}.email`}>Email</Label>
                      <Input
                        id={`companions.${index}.email`}
                        type="email"
                        {...register(`companions.${index}.email`, {
                          required: "Email is required",
                        })}
                        placeholder="Enter companion email"
                      />
                      {errors.companions?.[index]?.email && (
                        <p className="text-sm text-red-500">
                          {errors.companions[index].email.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {companionFields.length === 0 && (
                <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                  No companions added yet. Click the button above to add
                  companions.
                </div>
              )}
            </div>

            {/* Itinerary */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Itinerary</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ activity: "", date: new Date(), details: "" })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`itinerary.${index}.activity`}>
                        Activity
                      </Label>
                      <Input
                        id={`itinerary.${index}.activity`}
                        placeholder="Enter activity name"
                      />
                      {errors.itinerary?.[index]?.activity && (
                        <p className="text-sm text-red-500">
                          {errors.itinerary[index].activity.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`itinerary.${index}.date`}>Date</Label>
                      <Controller
                        name={`itinerary.${index}.date`}
                        control={control}
                        rules={{ required: "Activity date is required" }}
                        render={({ field }) => (
                          <DatePicker
                            date={field.value}
                            onSelect={field.onChange}
                          />
                        )}
                      />
                      {errors.itinerary?.[index]?.date && (
                        <p className="text-sm text-red-500">
                          {errors.itinerary[index].date.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`itinerary.${index}.details`}>
                      Details (Optional)
                    </Label>
                    <Textarea
                      id={`itinerary.${index}.details`}
                      {...register(`itinerary.${index}.details`)}
                      placeholder="Enter activity details"
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                  No itinerary items added yet. Click the button above to add
                  items.
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setTourDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Tour"
                  : "Create Tour"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Companions Dialog */}
      <Dialog open={companionDialogOpen} onOpenChange={setCompanionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Companions for {currentTour?.destination}</DialogTitle>
            <DialogDescription>
              View and manage companions for this tour
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add new companion form */}
            <div className="border p-4 rounded-md space-y-4">
              <h3 className="font-medium">Add New Companion</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-companion-name">Name</Label>
                  <Input
                    id="new-companion-name"
                    value={newCompanionName}
                    onChange={(e) => setNewCompanionName(e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-companion-email">Email</Label>
                  <Input
                    id="new-companion-email"
                    type="email"
                    value={newCompanionEmail}
                    onChange={(e) => setNewCompanionEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <Button
                className="w-full mt-2"
                onClick={handleAddCompanion}
                disabled={isSubmitting}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Companion
              </Button>
            </div>

            {/* Companions list */}
            <div className="space-y-2">
              <h3 className="font-medium">Current Companions</h3>
              {currentTourCompanions.length > 0 ? (
                <div className="border rounded-md divide-y">
                  {currentTourCompanions.map((companion, index) => (
                    <div
                      key={index}
                      className="p-3 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {companion.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{companion.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {companion.email}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => handleRemoveCompanion(index)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                  No companions for this tour yet
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setCompanionDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ToursList;
