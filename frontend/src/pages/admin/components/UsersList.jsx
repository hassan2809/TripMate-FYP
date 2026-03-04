import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Mail,
  Save,
  X,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ZoomIn,
  File,
  Image as ImageIcon,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import axios from "axios";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // KYC and document viewing states
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("");

  // Add new state variables for the add user dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/v1/admin/getAllUsers"
      );
      if (response.data.success) {
        setUsers(response.data.users);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Helper function to determine if a URL is an image or PDF
  const getFileType = (url) => {
    const extension = url.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      return "image";
    } else if (extension === "pdf") {
      return "pdf";
    }
    return "unknown";
  };

  // Helper function to get file name from URL
  const getFileName = (url, index) => {
    try {
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      return fileName || `document_${index + 1}`;
    } catch (error) {
      return `document_${index + 1}`;
    }
  };

  // Filter users based on search term and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || user.accountStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status badge variant and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
        return {
          variant: "default",
          className: "bg-green-100 text-green-800 border-green-300",
          icon: CheckCircle,
          label: "Approved",
        };
      case "rejected":
        return {
          variant: "destructive",
          className: "bg-red-100 text-red-800 border-red-300",
          icon: XCircle,
          label: "Rejected",
        };
      case "pending":
      default:
        return {
          variant: "secondary",
          className: "bg-yellow-100 text-yellow-800 border-yellow-300",
          icon: Clock,
          label: "Pending",
        };
    }
  };

  // Open edit dialog
  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditDialogOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.put(
        `http://localhost:8000/api/v1/admin/updateUser/${editingUser._id}`,
        { name: editName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUsers(
          users.map((user) =>
            user._id === editingUser._id ? { ...user, name: editName } : user
          )
        );

        toast.success(response.data.message || "User updated successfully");
        setEditDialogOpen(false);
        setEditingUser(null);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Error updating user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete user handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axios.delete(
          `http://localhost:8000/api/v1/admin/deleteUser/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setUsers(users.filter((user) => user._id !== id));
          toast.success(response.data.message || "User deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(error.response?.data?.message || "Error deleting user");
      }
    }
  };

  // Open KYC review dialog
  const handleKycReview = (user) => {
    setViewingUser(user);
    setKycDialogOpen(true);
  };

  // Handle account status update
  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      setIsSubmitting(true);
      const response = await axios.put(
        `http://localhost:8000/api/v1/admin/updateAccountStatus/${userId}`,
        { accountStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, accountStatus: newStatus } : user
          )
        );

        toast.success(`Account ${newStatus} successfully`);
        setKycDialogOpen(false);
        setViewingUser(null);
      }
    } catch (error) {
      console.error("Error updating account status:", error);
      toast.error(
        error.response?.data?.message || "Error updating account status"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open document viewer
  const handleDocumentView = (documentUrl) => {
    setSelectedDocument(documentUrl);
    setDocumentViewerOpen(true);
  };

  // Download document
  const handleDocumentDownload = (documentUrl, index) => {
    const link = document.createElement("a");
    link.href = documentUrl;
    link.download = getFileName(documentUrl, index);
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add user handlers (keeping existing functionality)
  const handleAddClick = () => {
    setAddDialogOpen(true);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
  };

  const handleAddSubmit = async () => {
    if (!newUserName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!newUserEmail.trim()) {
      toast.error("Email cannot be empty");
      return;
    }
    if (!newUserPassword.trim()) {
      toast.error("Password cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        "http://localhost:8000/api/v1/admin/createUser",
        {
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUsers([...users, response.data.user]);
        toast.success(response.data.message || "User created successfully");
        setAddDialogOpen(false);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPassword("");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Error creating user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Manage users, review KYC documents, and update account status
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleAddClick}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-6">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>KYC Documents</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const statusInfo = getStatusInfo(user.accountStatus);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{user.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1 text-blue-500" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.className}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {user.kycDocuments?.length || 0} document(s)
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleKycReview(user)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Review
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditClick(user)}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDelete(user._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-6"
                    >
                      No users found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{filteredUsers.length}</span> of{" "}
            <span className="font-medium">{users.length}</span> users
          </div>
        </CardFooter>
      </Card>
      {/* KYC Review Dialog */}
      {viewingUser && (
        <Dialog open={kycDialogOpen} onOpenChange={setKycDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>KYC Document Review</DialogTitle>
              <DialogDescription>
                Review {viewingUser.name}'s identity documents and update
                account status
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">User Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{viewingUser.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{viewingUser.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Status:</span>
                    <Badge
                      className={
                        getStatusInfo(viewingUser.accountStatus).className
                      }
                    >
                      {getStatusInfo(viewingUser.accountStatus).label}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Role:</span>
                    <p className="font-medium capitalize">{viewingUser.role}</p>
                  </div>
                </div>
              </div>

              {/* KYC Documents */}
              <div>
                <h4 className="font-medium mb-3">Uploaded Documents</h4>
                {viewingUser.kycDocuments?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {viewingUser.kycDocuments.map((docUrl, index) => {
                      const fileType = getFileType(docUrl);
                      const fileName = getFileName(docUrl, index);

                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">
                                Document {index + 1}
                              </h5>
                              <Badge variant="outline" className="text-xs">
                                {fileType === "image" ? (
                                  <>
                                    <ImageIcon className="h-3 w-3 mr-1" />
                                    Image
                                  </>
                                ) : fileType === "pdf" ? (
                                  <>
                                    <File className="h-3 w-3 mr-1" />
                                    PDF
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-3 w-3 mr-1" />
                                    Document
                                  </>
                                )}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {fileType === "image" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDocumentView(docUrl)}
                                >
                                  <ZoomIn className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              )}
                              {fileType === "pdf" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(docUrl, "_blank")}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Open PDF
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDocumentDownload(docUrl, index)
                                }
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>

                          {/* Document Preview */}
                          <div className="bg-gray-100 rounded-lg overflow-hidden">
                            {fileType === "image" ? (
                              <img
                                src={docUrl}
                                alt={`Document ${index + 1}`}
                                className="w-full h-48 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleDocumentView(docUrl)}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : fileType === "pdf" ? (
                              <div className="w-full h-48 flex items-center justify-center bg-red-50 border-2 border-dashed border-red-200">
                                <div className="text-center">
                                  <File className="h-12 w-12 text-red-500 mx-auto mb-2" />
                                  <p className="text-sm text-red-700 font-medium">
                                    PDF Document
                                  </p>
                                  <p className="text-xs text-red-600">
                                    {fileName}
                                  </p>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() =>
                                      window.open(docUrl, "_blank")
                                    }
                                    className="text-red-600 hover:text-red-800 mt-2"
                                  >
                                    Click to open in new tab
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-48 flex items-center justify-center bg-gray-200">
                                <div className="text-center text-gray-500">
                                  <FileText className="h-12 w-12 mx-auto mb-2" />
                                  <p className="text-sm">
                                    Document preview not available
                                  </p>
                                  <p className="text-xs">{fileName}</p>
                                </div>
                              </div>
                            )}

                            {/* Fallback for broken images */}
                            <div
                              className="w-full h-48 items-center justify-center bg-gray-200"
                              style={{ display: "none" }}
                            >
                              <div className="text-center text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-2" />
                                <p className="text-sm">
                                  Unable to preview document
                                </p>
                                <p className="text-xs">{fileName}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No documents uploaded
                  </p>
                )}
              </div>

              {/* Status Update Actions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Update Account Status</h4>
                <div className="flex gap-3">
                  <Button
                    onClick={() =>
                      handleStatusUpdate(viewingUser._id, "approved")
                    }
                    disabled={
                      isSubmitting || viewingUser.accountStatus === "approved"
                    }
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    onClick={() =>
                      handleStatusUpdate(viewingUser._id, "rejected")
                    }
                    disabled={
                      isSubmitting || viewingUser.accountStatus === "rejected"
                    }
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() =>
                      handleStatusUpdate(viewingUser._id, "pending")
                    }
                    disabled={
                      isSubmitting || viewingUser.accountStatus === "pending"
                    }
                    variant="outline"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Set Pending
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setKycDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Document Viewer Dialog - Only for Images */}
      <Dialog open={documentViewerOpen} onOpenChange={setDocumentViewerOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Document Viewer</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {selectedDocument && getFileType(selectedDocument) === "image" && (
              <img
                src={selectedDocument}
                alt="Document"
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDocumentViewerOpen(false)}
            >
              Close
            </Button>
            <Button onClick={() => handleDocumentDownload(selectedDocument, 0)}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog (keeping existing) */}
      {editingUser && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Make changes to the user's name below. The email cannot be
                changed.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right">
                  Email
                </label>
                <Input
                  id="email"
                  value={editingUser.email}
                  className="col-span-3"
                  disabled
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleEditSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add User Dialog (keeping existing) */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account by filling out the form below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-name" className="text-right">
                Name
              </label>
              <Input
                id="new-name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="col-span-3"
                placeholder="Enter user name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-email" className="text-right">
                Email
              </label>
              <Input
                id="new-email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="col-span-3"
                placeholder="Enter user email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="new-password" className="text-right">
                Password
              </label>
              <Input
                id="new-password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="col-span-3"
                placeholder="Enter user password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleAddSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersList;
