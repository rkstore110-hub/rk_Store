import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/utils/axiosConfig";

export const usePhoneVerification = () => {
  const { toast } = useToast();
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOTP, setCanResendOTP] = useState(false);
  const [verificationId, setVerificationId] = useState("");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((timer) => timer - 1);
      }, 1000);
    } else if (otpTimer === 0 && showOTPInput) {
      setCanResendOTP(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer, showOTPInput]);

  const handlePhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    if (
      !cleanNumber ||
      cleanNumber.length !== 10 ||
      (!cleanNumber.startsWith("6") &&
        !cleanNumber.startsWith("7") &&
        !cleanNumber.startsWith("8") &&
        !cleanNumber.startsWith("9"))
    ) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVerifyingPhone(true);
      const checkResponse = await axiosInstance.post(
        "/api/verify/check-phone",
        {
          phoneNumber: phoneNumber,
        }
      );

      if (checkResponse.data.success && checkResponse.data.isVerified) {
        setPhoneVerified(true);
        setShowPhoneVerification(false);
        toast({
          title: "Phone Verified! 📱",
          description:
            "Phone number found in our records. Proceeding to checkout.",
          variant: "default",
        });
        return true;
      } else {
        const otpResponse = await axiosInstance.post("/api/verify/send", {
          countryCode: "91",
          mobileNumber: phoneNumber.replace(/\D/g, ""),
        });

        if (otpResponse.data.success) {
          setVerificationId(otpResponse.data.verificationId);
          setShowOTPInput(true);
          setOtpTimer(otpResponse.data.timeout || 60);
          setCanResendOTP(false);
          toast({
            title: "OTP Sent! 📲",
            description: `Verification code sent to ${phoneNumber}`,
            variant: "default",
          });
        }
      }
    } catch (error: any) {
      console.error("Phone verification error:", error);
      toast({
        title: "Verification Failed",
        description:
          error.response?.data?.message || "Failed to verify phone number",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPhone(false);
    }
    return false;
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 4-digit OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVerifyingOTP(true);
      const response = await axiosInstance.post("/api/verify/verify", {
        countryCode: "91",
        mobileNumber: phoneNumber.replace(/\D/g, ""),
        verificationId: verificationId,
        code: otp,
      });

      if (response.data.success) {
        setPhoneVerified(true);
        setShowPhoneVerification(false);
        setShowOTPInput(false);
        toast({
          title: "Phone Verified Successfully! ✅",
          description:
            "Your phone number has been verified. Proceeding to checkout.",
          variant: "default",
        });
        return true;
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        title: "Invalid OTP",
        description:
          error.response?.data?.message || "Please enter the correct OTP",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingOTP(false);
    }
    return false;
  };

  const handleResendOTP = async () => {
    try {
      setIsVerifyingPhone(true);
      const response = await axiosInstance.post("/api/verify/send", {
        countryCode: "91",
        mobileNumber: phoneNumber.replace(/\D/g, ""),
      });

      if (response.data.success) {
        setVerificationId(response.data.verificationId);
        setOtpTimer(response.data.timeout || 60);
        setCanResendOTP(false);
        setOtp("");
        toast({
          title: "OTP Resent! 📲",
          description: `New verification code sent to ${phoneNumber}`,
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast({
        title: "Failed to Resend",
        description: error.response?.data?.message || "Failed to resend OTP",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const resetPhoneVerification = () => {
    setShowPhoneVerification(false);
    setShowOTPInput(false);
    setPhoneNumber("");
    setOtp("");
    setPhoneVerified(false);
    setOtpTimer(0);
    setCanResendOTP(false);
  };

  return {
    // State
    showPhoneVerification,
    phoneNumber,
    isVerifyingPhone,
    showOTPInput,
    otp,
    isVerifyingOTP,
    phoneVerified,
    otpTimer,
    canResendOTP,
    otpInputRefs,

    // Actions
    setShowPhoneVerification,
    setPhoneNumber,
    setOtp,
    setShowOTPInput,
    handlePhoneVerification,
    handleOTPVerification,
    handleResendOTP,
    resetPhoneVerification,
  };
};
