import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Plane,
  Users,
  Calendar,
  CreditCard,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
import { format, isAfter, isBefore, isWithinInterval } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

export function DatePicker({
  label,
  selectedDate,
  onChange,
  placeholder,
  minDate,
  maxDate,
  error,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              error && "border-red-500 focus:ring-red-500"
            )}
          >
            <CalendarIcon className="mr-2" />
            {selectedDate ? (
              format(selectedDate, "PPP")
            ) : (
              <span>{placeholder || "Pick a date"}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DateCalendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            initialFocus
            disabled={(date) => {
              if (isBefore(date, today)) {
                return true;
              }

              if (minDate && isBefore(date, minDate)) {
                return true;
              }

              if (maxDate && isAfter(date, maxDate)) {
                return true;
              }

              return false;
            }}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-red-500 flex items-center text-sm mt-2">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}
const TourPlan = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    trigger,
  } = useForm({
    defaultValues: {
      startingPoint: "",
      accommodationType: "",
      travelCost: 0,
      foodCost: 0,
      miscellaneousCost: 0,
      accommodationCost: 0,
    },
  });

  const { id } = useParams();
  const isEditing = !!id;

  // Watch start and end dates to validate them
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const [dateError, setDateError] = useState("");
  const [itineraryDateError, setItineraryDateError] = useState("");

  // Reset date error when dates change
  useEffect(() => {
    if (startDate && endDate) {
      if (isAfter(startDate, endDate)) {
        setDateError("End date must be after start date");
      } else {
        setDateError("");
      }
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const fetchTourData = async () => {
      const currentUserEmail = localStorage.getItem("email");
      if (isEditing && id) {
        try {
          const response = await axios.get(
            `http://localhost:8000/api/v1/tour/getTourPackage/${id}`
          );
          if (
            response.data.success &&
            response.data.data.createdBy === currentUserEmail
          ) {
            const tourData = response.data.data;
            setValue("startingPoint", tourData.startingPoint);
            setValue("accommodationType", tourData.accommodationType);
            setValue("destination", tourData.destination);
            setValue("transportMode", tourData.transportMode);
            setValue("travelCost", tourData.travelCost);
            setValue("foodCost", tourData.foodCost);
            setValue("accommodationCost", tourData.accommodationCost);
            setValue("miscellaneousCost", tourData.miscellaneousCost);
            setValue("startDate", new Date(tourData.startDate));
            setValue("endDate", new Date(tourData.endDate));
            setCompanions(tourData.companions || []);
            setItinerary(
              tourData.itinerary.map((item) => ({
                ...item,
                date: new Date(item.date),
              })) || []
            );
          } else {
            toast.error("You are not authorized to edit this tour.", {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
          }
        } catch (error) {
          toast.error("Error fetching tour details", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
      }
    };

    fetchTourData();
  }, [id, isEditing, setValue]);

  useEffect(() => {
    if (!id) {
      reset({
        startingPoint: "",
        accommodationType: "",
        travelCost: 0,
        foodCost: 0,
        miscellaneousCost: 0,
        accommodationCost: 0,
        destination: "",
        transportMode: "",
        startDate: null,
        endDate: null,
      });
      setCompanions([]);
      setItinerary([]);
    }
  }, [id, reset]);

  const travelCost = watch("travelCost") || 0;
  const foodCost = watch("foodCost") || 0;
  const accommodationCost = watch("accommodationCost") || 0;
  const miscellaneousCost = watch("miscellaneousCost") || 0;
  const totalBudget =
    parseFloat(travelCost) +
    parseFloat(foodCost) +
    parseFloat(accommodationCost) +
    parseFloat(miscellaneousCost);

  const handlePositiveNumberInput = (e, fieldName) => {
    let value = e.target.value;

    if (value.length > 1 && value.startsWith("0")) {
      value = value.replace(/^0+/, "");
    }

    if (value === "" || parseFloat(value) >= 0) {
      setValue(fieldName, value === "" ? "0" : value);
    }
  };

  const [companions, setCompanions] = useState([]);
  const [companionName, setCompanionName] = useState("");
  const [companionEmail, setCompanionEmail] = useState("");

  const [itinerary, setItinerary] = useState([]);
  const [activity, setActivity] = useState("");
  const [itineraryDate, setItineraryDate] = useState(null);
  const [itineraryDetails, setItineraryDetails] = useState("");

  const handleCompanionSave = (e) => {
    e.preventDefault();
    if (companionName && companionEmail) {
      setCompanions([
        ...companions,
        { name: companionName, email: companionEmail },
      ]);
    }
    setCompanionName("");
    setCompanionEmail("");
  };

  const handleCompanionDelete = (index) => {
    setCompanions(companions.filter((key, i) => i !== index));
  };

  // Validate if itinerary date is within trip dates
  const validateItineraryDate = (date) => {
    if (!startDate || !endDate) {
      setItineraryDateError("Please select trip start and end dates first");
      return false;
    }

    if (!date) {
      setItineraryDateError("Please select a date for this activity");
      return false;
    }

    if (!isWithinInterval(date, { start: startDate, end: endDate })) {
      setItineraryDateError(
        "Activity date must be between trip start and end dates"
      );
      return false;
    }

    setItineraryDateError("");
    return true;
  };

  const handleItinerarySave = (e) => {
    e.preventDefault();

    if (!validateItineraryDate(itineraryDate)) {
      return;
    }

    if (!activity) {
      toast.error("Please enter an activity name");
      return;
    }

    setItinerary([
      ...itinerary,
      { activity, date: itineraryDate, details: itineraryDetails },
    ]);

    setActivity("");
    setItineraryDate(null);
    setItineraryDetails("");
    setItineraryDateError("");
  };

  const handleItineraryDelete = (index) => {
    setItinerary(itinerary.filter((key, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (startDate && endDate && isAfter(startDate, endDate)) {
      setDateError("End date must be after start date");
      return;
    }

    try {
      const { startDate, endDate } = data;
      const numberOfDays =
        differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1;
      const createdBy = localStorage.getItem("email");
      const formData = {
        ...data,
        companions,
        itinerary,
        numberOfDays,
        totalBudget,
        createdBy,
      };

      const token = localStorage.getItem("token");
      const url = isEditing
        ? `http://localhost:8000/api/v1/tour/updateTour/${id}`
        : "http://localhost:8000/api/v1/tour/postTourPlan";

      const response = await axios[isEditing ? "put" : "post"](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      reset();
      if (response.data.success) {
        toast.success(response.data.message);
        setCompanions([]);
        setItinerary([]);
        navigate(`/tour/${isEditing ? id : response.data.tourId}`);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl">
      <div className="container mx-auto p-4 space-y-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="bg-blue-50 border-b border-gray-200">
            <CardTitle className="flex items-center text-blue-900">
              <MapPin className="mr-2" />
              Trip Starting Point & Group Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Point
                </label>
                <Input
                  placeholder="From where will you start your journey? (e.g., Lahore, Karachi)"
                  {...register("startingPoint", {
                    required: "Starting point is required",
                  })}
                  className="focus:border-blue-500"
                />
                {errors.startingPoint && (
                  <p className="text-red-500 flex items-center text-sm mt-2">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.startingPoint.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accommodation Type
                </label>
                <Controller
                  name="accommodationType"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Accommodation type is required" }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger className="focus:border-blue-500">
                        <SelectValue placeholder="What type of accommodation do you prefer?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="resort">Resort</SelectItem>
                        <SelectItem value="guesthouse">Guest House</SelectItem>
                        <SelectItem value="hostel">Hostel</SelectItem>
                        <SelectItem value="camping">Camping</SelectItem>
                        <SelectItem value="homestay">Homestay</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.accommodationType && (
                  <p className="text-red-500 flex items-center text-sm mt-2">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.accommodationType.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Destination Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="bg-blue-50 border-b border-gray-200">
            <CardTitle className="flex items-center text-blue-900">
              <MapPin className="mr-2" />
              Destination Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Input
              placeholder="Enter destination (e.g., Islamabad, Muree, Kashmir)"
              {...register("destination", {
                required: "Destination is required",
              })}
              className="focus:border-blue-500"
            />
            {errors.destination && (
              <p className="text-red-500 flex items-center text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.destination.message}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Controller
                  name="startDate"
                  control={control}
                  defaultValue={null}
                  rules={{ required: "Start date is required" }}
                  render={({ field }) => (
                    <DatePicker
                      label="Start Date"
                      selectedDate={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                        if (endDate && isAfter(date, endDate)) {
                          setValue("endDate", null);
                          setDateError("End date must be after start date");
                        } else {
                          setDateError("");
                        }
                      }}
                      placeholder="When does your trip begin?"
                      error={errors.startDate?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  name="endDate"
                  control={control}
                  defaultValue={null}
                  rules={{
                    required: "End date is required",
                    validate: (value) =>
                      !startDate ||
                      isAfter(value, startDate) ||
                      "End date must be after start date",
                  }}
                  render={({ field }) => (
                    <DatePicker
                      label="End Date"
                      selectedDate={field.value}
                      onChange={field.onChange}
                      placeholder="When does your trip end?"
                      minDate={startDate || undefined}
                      error={errors.endDate?.message || dateError}
                    />
                  )}
                />
              </div>
            </div>

            {/* Trip duration info */}
            {startDate && endDate && !dateError && (
              <div className="flex items-center bg-blue-50 p-3 rounded-md text-blue-800">
                <Info className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">
                  Trip duration:{" "}
                  {differenceInCalendarDays(endDate, startDate) + 1} days
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Travel Details Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="bg-blue-50 border-b border-gray-200">
            <CardTitle className="flex items-center text-blue-900">
              <Plane className="mr-2" />
              Travel Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Mode
              </label>
              <Controller
                name="transportMode"
                control={control}
                defaultValue=""
                rules={{ required: "Transport mode is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger className="focus:border-blue-500">
                      <SelectValue placeholder="How will you travel?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flight">Flight</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.transportMode && (
                <p className="text-red-500 flex items-center text-sm mt-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.transportMode.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Cost (Rs)
              </label>
              <Input
                type="number"
                min="0"
                placeholder="Enter estimated travel cost"
                {...register("travelCost", {
                  required: "Travel cost is required",
                  min: { value: 0, message: "Cost cannot be negative" },
                })}
                value={travelCost}
                onChange={(e) => handlePositiveNumberInput(e, "travelCost")}
                className="focus:border-blue-500"
              />
              {errors.travelCost && (
                <p className="text-red-500 flex items-center text-sm mt-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.travelCost.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Travel Companions Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="bg-blue-50 border-b border-gray-200">
            <CardTitle className="flex items-center text-blue-900">
              <Users className="mr-2" />
              Travel Companions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Enter companion name"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                className="focus:border-blue-500"
              />
              <Input
                type="email"
                placeholder="Enter companion email"
                value={companionEmail}
                onChange={(e) => setCompanionEmail(e.target.value)}
                className="focus:border-blue-500"
              />
            </div>
            <Button
              className="mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={handleCompanionSave}
            >
              Add Companion
            </Button>
            {/* Companions Table */}
            {companions.length > 0 && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companions.map((companion, index) => (
                      <TableRow key={index}>
                        <TableCell>{companion.name}</TableCell>
                        <TableCell>{companion.email}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCompanionDelete(index)}
                            title="Remove companion"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Itinerary Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="bg-blue-50 border-b border-gray-200">
            <CardTitle className="flex items-center text-blue-900">
              <Calendar className="mr-2" />
              Trip Itinerary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Input
              placeholder="Enter activity or event (e.g., Beach visit, Museum tour)"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="focus:border-blue-500"
            />
            <DatePicker
              label="Activity Date"
              selectedDate={itineraryDate}
              onChange={(date) => {
                setItineraryDate(date);
                validateItineraryDate(date);
              }}
              placeholder="When will this activity take place?"
              minDate={startDate || undefined}
              maxDate={endDate || undefined}
              error={itineraryDateError}
            />
            {!startDate || !endDate ? (
              <div className="flex items-center bg-amber-50 p-3 rounded-md text-amber-800">
                <Info className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">
                  Please set trip start and end dates first to schedule
                  activities
                </p>
              </div>
            ) : null}
            <Textarea
              placeholder="Add details about this activity (e.g., meeting point, duration, what to bring)"
              value={itineraryDetails}
              onChange={(e) => setItineraryDetails(e.target.value)}
              className="focus:border-blue-500 min-h-[100px]"
            />
            <Button
              onClick={handleItinerarySave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!startDate || !endDate}
              title={
                !startDate || !endDate ? "Please set trip dates first" : ""
              }
            >
              Add Itinerary Item
            </Button>
            {itinerary.length > 0 && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Activity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itinerary.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.activity}
                        </TableCell>
                        <TableCell>{format(item.date, "PPP")}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.details}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleItineraryDelete(index)}
                            title="Remove activity"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="bg-blue-50 border-b border-gray-200">
            <CardTitle className="flex items-center text-blue-900">
              <CreditCard className="mr-2" />
              Budget Planning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Travel Cost (Rs):
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Transportation expenses"
                  {...register("travelCost", { min: 0 })}
                  value={travelCost}
                  onChange={(e) => handlePositiveNumberInput(e, "travelCost")}
                  className="focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Food Cost (Rs):
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Meals and dining expenses"
                  {...register("foodCost", { min: 0 })}
                  value={foodCost}
                  onChange={(e) => handlePositiveNumberInput(e, "foodCost")}
                  className="focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Accommodation Cost (Rs):
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Hotel/lodging expenses"
                  {...register("accommodationCost", { min: 0 })}
                  value={accommodationCost}
                  onChange={(e) =>
                    handlePositiveNumberInput(e, "accommodationCost")
                  }
                  className="focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Miscellaneous Cost (Rs):
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Activities, souvenirs, etc."
                  {...register("miscellaneousCost", { min: 0 })}
                  value={miscellaneousCost}
                  onChange={(e) =>
                    handlePositiveNumberInput(e, "miscellaneousCost")
                  }
                  className="focus:border-blue-500"
                />
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-gray-600 text-sm mb-1">
                Total Estimated Budget
              </div>
              <div className="font-bold text-2xl text-blue-900">
                Rs {totalBudget.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white py-6 px-8 rounded-lg text-lg shadow-md"
            // disabled={dateError ? true : false}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Tour..." : "Finalize Tour Plan"}

            {/* {isEditing ? } */}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TourPlan;
