import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import LoginImg from "../../assets/images/nature.jpg"; 

const { width, height } = Dimensions.get('window');

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const { control, handleSubmit, formState: { errors } } = useForm();

    const checkAuthentication = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                navigation.replace("MainApp");
            }
        } catch (error) {
            console.error("Auth check error:", error);
        }
    };

    useEffect(() => {
        checkAuthentication();
    }, []);

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            const response = await axios.post("http://localhost:8000/api/v1/auth/login", data);
            
            if (response.data.success) {
                await AsyncStorage.setItem("token", response.data.jwtToken);
                await AsyncStorage.setItem("name", response.data.name);
                await AsyncStorage.setItem("email", response.data.email);
                await AsyncStorage.setItem("userId", response.data.userId);
                navigation.replace("MainApp");
            }
        } catch (error) {
            Alert.alert(
                "Login Failed", 
                error.response?.data?.message || "Please check your credentials and try again"
            );
        } finally {
            setIsLoading(false);
        }
    };

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
                    
                    {/* Login Card */}
                    <View style={styles.formCard}>
                        <Text style={styles.heading}>Welcome Back</Text>
                        <Text style={styles.subheading}>Login to your account</Text>
                        
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIconContainer}>
                                <Ionicons name="mail-outline" size={20} color="#1E3A8A" />
                            </View>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        style={[
                                            styles.input, 
                                            errors.email && styles.errorInput
                                        ]}
                                        placeholder="Email"
                                        placeholderTextColor="#9E9E9E"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                                name="email"
                                rules={{
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Enter a valid email address",
                                    },
                                }}
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
                                name="password"
                                rules={{
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    },
                                }}
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
                        
                        {/* Forgot Password Link */}
                        {/* <TouchableOpacity 
                            style={styles.forgotPasswordButton} 
                            onPress={() => Alert.alert("Forgot Password", "Reset functionality coming soon")}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity> */}
                        
                        {/* Login Button */}
                        <TouchableOpacity 
                            style={styles.submitButton} 
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={['#1E3A8A', '#1e40af']}
                                start={[0, 0]}
                                end={[1, 0]}
                                style={styles.gradientButton}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#ffffff" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Log In</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                        
                        {/* OR Divider */}
                        {/* <View style={styles.orContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.orText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View> */}
                        
                        {/* Social Login */}
                        {/* <View style={styles.socialButtonsContainer}>
                            <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
                                <Ionicons name="logo-google" size={18} color="#DB4437" />
                                <Text style={styles.socialButtonText}>Google</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
                                <Ionicons name="logo-facebook" size={18} color="#4267B2" />
                                <Text style={styles.socialButtonText}>Facebook</Text>
                            </TouchableOpacity>
                        </View> */}
                        
                        {/* Sign Up Link */}
                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                                <Text style={styles.signupLink}>Sign up</Text>
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
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#7C4DFF',
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    gradientButton: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 12,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    orText: {
        paddingHorizontal: 16,
        color: '#757575',
        fontSize: 14,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    googleButton: {
        borderColor: '#DB4437',
        backgroundColor: 'rgba(219, 68, 55, 0.05)',
    },
    facebookButton: {
        borderColor: '#4267B2',
        backgroundColor: 'rgba(66, 103, 178, 0.05)',
    },
    socialButtonText: {
        marginLeft: 8,
        fontWeight: '500',
        fontSize: 14,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signupText: {
        fontSize: 14,
        color: '#757575',
    },
    signupLink: {
        fontSize: 14,
        color: '#1E3A8A',
        fontWeight: 'bold',
    },
});

export default Login;