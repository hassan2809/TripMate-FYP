import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons";

const RoomListing = ({ route, navigation }) => {
    const { roomId } = route.params || {};
    const isEditing = !!roomId;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roomType, setRoomType] = useState('');
    const [furnished, setFurnished] = useState('');
    const [images, setImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(isEditing);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            price: '',
            roomType: '',
            location: '',
            amenities: '',
            furnished: '',
        },
    });

    // Request permission for images
    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload images!');
                }
            }
        })();
    }, []);

    // Fetch room data if editing
    useEffect(() => {
        const fetchRoomData = async () => {
            if (isEditing && roomId) {
                try {
                    setLoading(true);
                    const currentUserEmail = await AsyncStorage.getItem('email');
                    const response = await axios.get(
                        `http://localhost:8000/api/v1/roomListing/getRoomById/${roomId}`
                    );
                    
                    if (response.data.success) {
                        const roomData = response.data.data;
                        
                        // Check if current user is the owner
                        if (roomData.user.email !== currentUserEmail) {
                            Alert.alert("Unauthorized", "You are not authorized to edit this room");
                            navigation.goBack();
                            return;
                        }

                        setValue("title", roomData.title);
                        setValue("description", roomData.description);
                        setValue("price", roomData.price.toString());
                        setValue("location", roomData.location);
                        setValue("amenities", roomData.amenities);
                        setValue("furnished", roomData.furnished);
                        setRoomType(roomData.roomType);
                        setFurnished(roomData.furnished);
                        
                        if (roomData.images && Array.isArray(roomData.images)) {
                            setImages(roomData.images);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching room details:", error);
                    Alert.alert("Error", "Failed to load room details");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchRoomData();
    }, [roomId, isEditing, setValue]);

    // Image picker function
    const pickImages = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,  // Changed from MediaType to MediaTypeOptions
                allowsMultipleSelection: true,
                quality: 0.7,
            });
    
            if (!result.canceled) {
                // Add selected images to state
                const newImageFiles = result.assets.map(asset => {
                    return {
                        uri: asset.uri,
                        type: 'image/jpeg',
                        name: `image-${Date.now()}.jpg`,
                    };
                });
    
                // Set image files for upload
                setImageFiles([...imageFiles, ...newImageFiles]);
                
                // Set image URIs for display
                const newImageUris = result.assets.map(asset => asset.uri);
                setImages([...images, ...newImageUris]);
            }
        } catch (error) {
            console.error("Error picking images:", error);
            Alert.alert("Error", "Failed to pick images");
        }
    };
    // Remove image function
    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        // Only remove from imageFiles if we're adding new files
        if (imageFiles.length > 0) {
            const newImageFiles = [...imageFiles];
            newImageFiles.splice(index, 1);
            setImageFiles(newImageFiles);
        }
    };

    const onSubmit = async (data) => {
        if (!roomType) {
            Alert.alert("Error", "Please select a room type");
            return;
        }
        
        if (!furnished) {
            Alert.alert("Error", "Please select furnishing option");
            return;
        }

        try {
            setIsSubmitting(true);
            const token = await AsyncStorage.getItem('token');
            
            if (!token) {
                Alert.alert("Authentication Error", "You need to be logged in to post a room listing");
                return;
            }

            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('price', data.price);
            formData.append('roomType', roomType);
            formData.append('location', data.location);
            formData.append('amenities', data.amenities);
            formData.append('furnished', furnished);
            
            // Add image files for new uploads
            if (isEditing) {
                // For editing, we only append new images
                imageFiles.forEach((file) => {
                    formData.append('images', file);
                });
            } else {
                // For new listing, append all images
                imageFiles.forEach((file) => {
                    formData.append('images', file);
                });
            }

            const url = isEditing
                ? `http://localhost:8000/api/v1/roomListing/updateRoomListing/${roomId}`
                : "http://localhost:8000/api/v1/roomListing/postRoomListing";

            const response = await axios({
                method: isEditing ? 'put' : 'post',
                url: url,
                data: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                Alert.alert(
                    "Success", 
                    isEditing ? "Room updated successfully" : "Room listed successfully",
                    [
                        {
                            text: "OK", 
                            onPress: () => {
                                const newRoomId = isEditing ? roomId : response.data.roomId;
                                navigation.navigate("AccommodationDetails", { id: newRoomId });
                            }
                        }
                    ]
                );
                
                reset();
                setRoomType('');
                setFurnished('');
                setImages([]);
                setImageFiles([]);
            }
        } catch (error) {
            console.error("Error submitting room listing:", error);
            Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to submit room listing"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.loadingText}>Loading room details...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.formTitle}>
                    {isEditing ? "Update Room Listing" : "List Your Room"}
                </Text>

                {/* Room Title */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Room Title*</Text>
                    <Controller
                        control={control}
                        name="title"
                        rules={{ 
                            required: 'Title is required', 
                            minLength: { 
                                value: 5, 
                                message: 'Title must be at least 5 characters long' 
                            } 
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={styles.input}
                                placeholder="Cozy Studio in Johar Town"
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
                </View>

                {/* Description */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Description*</Text>
                    <Controller
                        control={control}
                        name="description"
                        rules={{ 
                            required: 'Description is required', 
                            minLength: { 
                                value: 20, 
                                message: 'Description must be at least 20 characters long' 
                            } 
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe your room and its unique features..."
                                multiline
                                value={value}
                                onChangeText={onChange}
                                textAlignVertical="top"
                            />
                        )}
                    />
                    {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
                </View>

                {/* Price */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Price per Night (Rs)*</Text>
                    <Controller
                        control={control}
                        name="price"
                        rules={{ 
                            required: 'Price is required', 
                            min: { 
                                value: 1, 
                                message: 'Price must be at least 1' 
                            } 
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={styles.input}
                                placeholder="1000"
                                keyboardType="numeric"
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                    {errors.price && <Text style={styles.errorText}>{errors.price.message}</Text>}
                </View>

                {/* Room Type */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Room Type*</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={roomType}
                            onValueChange={(itemValue) => setRoomType(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select room type" value="" />
                            <Picker.Item label="Entire Place" value="entire" />
                            <Picker.Item label="Private Room" value="private" />
                            <Picker.Item label="Shared Room" value="shared" />
                        </Picker>
                    </View>
                </View>

                {/* Location */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Location*</Text>
                    <Controller
                        control={control}
                        name="location"
                        rules={{ 
                            required: 'Location is required', 
                            minLength: { 
                                value: 5, 
                                message: 'Location must be at least 5 characters long' 
                            } 
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={styles.input}
                                placeholder="City, State, Country"
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                    {errors.location && <Text style={styles.errorText}>{errors.location.message}</Text>}
                </View>

                {/* Amenities */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Amenities</Text>
                    <Controller
                        control={control}
                        name="amenities"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={styles.input}
                                placeholder="WiFi, Kitchen, Air Conditioning, etc."
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </View>

                {/* Furnishing */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Furnishing*</Text>
                    <View style={styles.radioContainer}>
                        <TouchableOpacity 
                            style={styles.radioOption} 
                            onPress={() => setFurnished('furnished')}
                        >
                            <View style={[
                                styles.radio, 
                                furnished === 'furnished' ? styles.radioSelected : {}
                            ]}>
                                {furnished === 'furnished' && <View style={styles.radioDot} />}
                            </View>
                            <Text style={styles.radioLabel}>Furnished</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.radioOption} 
                            onPress={() => setFurnished('unfurnished')}
                        >
                            <View style={[
                                styles.radio, 
                                furnished === 'unfurnished' ? styles.radioSelected : {}
                            ]}>
                                {furnished === 'unfurnished' && <View style={styles.radioDot} />}
                            </View>
                            <Text style={styles.radioLabel}>Unfurnished</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Image Upload */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Room Images</Text>
                    
                    <TouchableOpacity 
                        style={styles.uploadButton}
                        onPress={pickImages}
                    >
                        <Ionicons name="camera-outline" size={24} color="#fff" />
                        <Text style={styles.uploadButtonText}>Select Images</Text>
                    </TouchableOpacity>

                    {/* Image Preview */}
                    {images.length > 0 && (
                        <View style={styles.imagePreviewContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {images.map((image, index) => (
                                    <View key={index} style={styles.imageContainer}>
                                        <Image
                                            source={{ uri: image }}
                                            style={styles.imagePreview}
                                        />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => removeImage(index)}
                                        >
                                            <Ionicons name="close-circle" size={24} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {isEditing ? "Update Room Listing" : "List Your Room"}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#4B5563',
    },
    formContainer: {
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E3A8A',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#4B5563',
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#F9FAFB',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    radioContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    radio: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    radioSelected: {
        borderColor: '#3B82F6',
    },
    radioDot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#3B82F6',
    },
    radioLabel: {
        fontSize: 16,
        color: '#4B5563',
    },
    uploadButton: {
        flexDirection: 'row',
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    imagePreviewContainer: {
        marginTop: 16,
    },
    imageContainer: {
        marginRight: 12,
        position: 'relative',
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 0,
        zIndex: 20
    },
    submitButton: {
        backgroundColor: '#1E3A8A',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginTop: 4,
    },
});

export default RoomListing;