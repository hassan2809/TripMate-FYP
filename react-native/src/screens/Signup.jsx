import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  FlatList
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';

// Import background image
import LoginImg from "../../assets/images/nature.jpg";

const { width, height } = Dimensions.get('window');

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycDocuments, setKycDocuments] = useState([]);
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  // Handle file selection
  const handleDocumentPicker = async () => {
    try {
      if (kycDocuments.length >= 3) {
        Alert.alert("Limit Reached", "You can upload maximum 3 documents");
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert("File Too Large", "Please upload files smaller than 5MB");
          return;
        }

        const newDocument = {
          id: Date.now() + Math.random(),
          uri: file.uri,
          name: file.name,
          size: file.size,
          type: file.mimeType,
        };

        setKycDocuments(prev => [...prev, newDocument]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  // Remove document
  const removeDocument = (id) => {
    setKycDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const onSubmit = async (data) => {
    // Validate KYC documents
    if (kycDocuments.length === 0) {
      Alert.alert("Documents Required", "Please upload at least one KYC document");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();

      // Append form fields (exclude confirmPassword)
      Object.keys(data).forEach((key) => {
        if (key !== "confirmPassword") {
          formData.append(key, data[key]);
        }
      });

      // Append KYC documents
      kycDocuments.forEach((doc, index) => {
        const fileExtension = doc.name.split('.').pop();
        formData.append('kycDocuments', {
          uri: doc.uri,
          type: doc.type,
          name: doc.name || `document_${index}.${fileExtension}`,
        });
      });

      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/signup",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        Alert.alert(
          "Account Created Successfully!",
          "Your account has been created and is pending admin approval. You'll receive an email notification once approved.",
          [
            {
              text: "Go to Login",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || "Please try again later"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDocumentItem = ({ item }) => (
    <View style={styles.documentItem}>
      <View style={styles.documentInfo}>
        <View style={styles.documentIcon}>
          <Ionicons name="document-outline" size={20} color="#1E3A8A" />
        </View>
        <View style={styles.documentDetails}>
          <Text style={styles.documentName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.documentSize}>
            {formatFileSize(item.size)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removeDocument(item.id)}
        style={styles.removeButton}
      >
        <Ionicons name="close-circle" size={24} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Image with Overlay */}
      <Image 
        source={LoginImg} 
        style={styles.backgroundImage} 
        blurRadius={2}
      />
      <View style={styles.overlay} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Header */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>TripMate</Text>
            <View style={styles.logoUnderline} />
          </View>
          
          {/* Signup Card */}
          <View style={styles.formCard}>
            <Text style={styles.heading}>Create Account</Text>
            <Text style={styles.subheading}>Join us and start your journey with verified travelers</Text>
            
            {/* Personal Information Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="person-outline" size={20} color="#1E3A8A" />
                </View>
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>

              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="person-outline" size={20} color="#1E3A8A" />
                </View>
                <Controller
                  control={control}
                  name="fullName"
                  rules={{ required: "Full name is required" }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[
                        styles.input, 
                        errors.fullName && styles.errorInput
                      ]}
                      placeholder="Full Name"
                      placeholderTextColor="#9E9E9E"
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.fullName && (
                <Text style={styles.errorText}>
                  <Ionicons name="alert-circle" size={14} color="#FF5252" />{" "}
                  {errors.fullName.message}
                </Text>
              )}
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="mail-outline" size={20} color="#1E3A8A" />
                </View>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "Please enter a valid email address",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[
                        styles.input, 
                        errors.email && styles.errorInput
                      ]}
                      placeholder="Email Address"
                      placeholderTextColor="#9E9E9E"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>
                  <Ionicons name="alert-circle" size={14} color="#FF5252" />{" "}
                  {errors.email.message}
                </Text>
              )}
              
              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#1E3A8A" />
                </View>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[
                        styles.input, 
                        errors.password && styles.errorInput
                      ]}
                      placeholder="Password"
                      placeholderTextColor="#9E9E9E"
                      secureTextEntry={!showPassword}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color="#1E3A8A" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>
                  <Ionicons name="alert-circle" size={14} color="#FF5252" />{" "}
                  {errors.password.message}
                </Text>
              )}
              
              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#1E3A8A" />
                </View>
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[
                        styles.input, 
                        errors.confirmPassword && styles.errorInput
                      ]}
                      placeholder="Confirm Password"
                      placeholderTextColor="#9E9E9E"
                      secureTextEntry={!showConfirmPassword}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color="#1E3A8A" 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>
                  <Ionicons name="alert-circle" size={14} color="#FF5252" />{" "}
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>

            {/* Identity Verification Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#059669" />
                </View>
                <Text style={styles.sectionTitle}>Identity Verification</Text>
              </View>

              <Text style={styles.sectionDescription}>
                Upload your identity documents to verify your account. This helps us maintain a safe and trusted community.
              </Text>

              {/* Accepted Documents Info */}
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Accepted Documents:</Text>
                <Text style={styles.infoCardText}>
                  Passport • National ID Card • Driver's License • Government-issued Photo ID
                </Text>
              </View>

              {/* Upload Button */}
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handleDocumentPicker}
                disabled={kycDocuments.length >= 3}
              >
                <View style={styles.uploadButtonContent}>
                  <View style={styles.uploadIcon}>
                    <Ionicons name="cloud-upload-outline" size={32} color="#1E3A8A" />
                  </View>
                  <Text style={styles.uploadButtonTitle}>Upload Your Documents</Text>
                  <Text style={styles.uploadButtonDescription}>
                    Tap to select files from your device
                  </Text>
                  <View style={styles.uploadLimits}>
                    <Text style={styles.uploadLimitText}>Max 3 files • 5MB each • JPG, PNG, PDF</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Uploaded Documents List */}
              {kycDocuments.length > 0 && (
                <View style={styles.documentsContainer}>
                  <Text style={styles.documentsHeader}>
                    Uploaded Documents ({kycDocuments.length}/3)
                  </Text>
                  <FlatList
                    data={kycDocuments}
                    renderItem={renderDocumentItem}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>
            
            {/* Signup Button */}
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#1E3A8A', '#1e40af']}
                start={[0, 0]}
                end={[1, 0]}
                style={styles.gradientButton}
              >
                {isSubmitting ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>
                      Creating Account...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Note */}
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                <Text style={styles.noteTextBold}>Note:</Text> Your account will be reviewed by our team after registration. You'll receive an email notification once your account is approved.
              </Text>
            </View>
            
            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  logoUnderline: {
    width: 50,
    height: 3,
    backgroundColor: '#1E3A8A',
    marginTop: 8,
    borderRadius: 3,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    backgroundColor: '#EBF8FF',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
  },
  inputIconContainer: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#424242',
  },
  errorInput: {
    borderColor: '#FF5252',
  },
  eyeIcon: {
    padding: 12,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  uploadButtonContent: {
    alignItems: 'center',
  },
  uploadIcon: {
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  uploadButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  uploadButtonDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    textAlign: 'center',
  },
  uploadLimits: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadLimitText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  documentsContainer: {
    marginTop: 8,
  },
  documentsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    backgroundColor: '#EBF8FF',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  documentSize: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  removeButton: {
    padding: 4,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  noteContainer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 18,
  },
  noteTextBold: {
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#757575',
  },
  loginLink: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
});

export default Signup;