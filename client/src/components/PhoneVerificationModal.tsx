// src/components/PhoneVerificationModal.tsx
import React, { RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Phone,
  Shield,
  X,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Clock,
  RotateCcw,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PhoneVerificationProps {
  /* visibility */
  showPhoneVerification: boolean;
  /* phone state */
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  /* otp state */
  otp: string;
  setOtp: (v: string) => void;
  otpInputRefs: RefObject<(HTMLInputElement | null)[]>;
  otpTimer: number;
  /* phase flags */
  showOTPInput: boolean;
  setShowOTPInput: (v: boolean) => void; 
  isVerifyingPhone: boolean;
  isVerifyingOTP: boolean;
  /* handlers */
  handlePhoneVerification: (e: React.FormEvent) => Promise<boolean>;
  handleOTPVerification: (e: React.FormEvent) => Promise<boolean>;
  handleResendOTP: () => Promise<void>;
  resetPhoneVerification: () => void;
}



const PhoneVerificationModal: React.FC<PhoneVerificationProps> = ({
  showPhoneVerification,
  phoneNumber,
  setPhoneNumber,
  otp,
  setOtp,
  otpInputRefs,
  otpTimer,
  showOTPInput,
  setShowOTPInput,
  isVerifyingPhone,
  isVerifyingOTP,
  handlePhoneVerification,
  handleOTPVerification,
  handleResendOTP,
  resetPhoneVerification,
}) => {
  return (
    <AnimatePresence>
          {showPhoneVerification && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
              onClick={() =>
                !isVerifyingPhone && !isVerifyingOTP && resetPhoneVerification()
              }
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                className="bg-white w-full max-w-sm mx-auto rounded-3xl shadow-2xl border border-gray-100 max-h-[96vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Compact Header */}
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white px-4 py-5 sm:px-6 sm:py-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                        {!showOTPInput ? (
                          <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold mb-0.5 tracking-tight leading-tight">
                          {!showOTPInput ? "Verify Phone" : "Enter Code"}
                        </h2>
                        <p className="text-white/80 text-xs sm:text-sm font-medium">
                          {!showOTPInput ? "Secure checkout" : "Almost done"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-white/10 text-white border border-white/20 backdrop-blur-sm transition-all duration-200 flex-shrink-0"
                      onClick={() =>
                        !isVerifyingPhone &&
                        !isVerifyingOTP &&
                        resetPhoneVerification()
                      }
                      disabled={isVerifyingPhone || isVerifyingOTP}
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>


                {/* Optimized Content */}
                <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                  {!showOTPInput ? (
                    // Phone Number Input - Mobile Optimized
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
                          <Phone className="w-8 h-8 sm:w-9 sm:h-9 text-blue-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">
                          Enter Mobile Number
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed px-2">
                          We'll verify your number for secure checkout
                        </p>
                      </div>


                      <form
                        onSubmit={handlePhoneVerification}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="phoneNumber"
                            className="text-sm font-semibold text-gray-800 flex items-center gap-2"
                          >
                            <Phone className="w-4 h-4 text-blue-600" />
                            Mobile Number *
                          </Label>
                          <div className="relative group">
                            <Input
                              id="phoneNumber"
                              type="tel"
                              placeholder="Enter 10-digit mobile number"
                              value={phoneNumber}
                              onChange={(e) => {
                                const value = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 10);
                                setPhoneNumber(value);
                              }}
                              required
                              className="h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 rounded-2xl transition-all duration-200 bg-gray-50 focus:bg-white group-hover:border-gray-300 text-center tracking-wide font-medium"
                              maxLength={10}
                            />
                            {phoneNumber.length === 10 && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                          {phoneNumber && phoneNumber.length !== 10 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="bg-red-50 border border-red-200 rounded-xl p-3"
                            >
                              <p className="text-red-600 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>Please enter all 10 digits</span>
                              </p>
                            </motion.div>
                          )}
                        </div>


                        <Button
                          type="submit"
                          disabled={
                            isVerifyingPhone || phoneNumber.length !== 10
                          }
                          className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isVerifyingPhone ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Verifying...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <Shield className="w-5 h-5" />
                              <span>Send Verification Code</span>
                            </div>
                          )}
                        </Button>


                        {/* Trust Badges - Mobile Optimized */}
                        <div className="flex items-center justify-center gap-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Secure</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Fast</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Private</span>
                          </div>
                        </div>
                      </form>
                    </div>
                  ) : (
                    // OTP Input - Mobile Optimized
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-emerald-50 to-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                          <MessageSquare className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">
                          Enter Verification Code
                        </h3>
                        <p className="text-gray-600 mb-3 text-sm leading-relaxed px-2">
                          4-digit code sent to your mobile
                        </p>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-2xl border border-gray-200 inline-block">
                          <p className="font-bold text-gray-800 text-base">
                            {phoneNumber.replace(/(\d{5})(\d{5})/, "$1-$2")}
                          </p>
                        </div>
                      </div>


                      <form
                        onSubmit={handleOTPVerification}
                        className="space-y-5"
                      >
                        <div className="space-y-3">
                          <Label
                            htmlFor="otp"
                            className="text-sm font-semibold text-gray-800 flex items-center gap-2 justify-center"
                          >
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            Verification Code *
                          </Label>


                          {/* Mobile-Optimized OTP Input */}
                          <div className="flex justify-center gap-2 sm:gap-3">
                            {[...Array(4)].map((_, index) => (
                              <input
                                key={index}
                                ref={(el) => {
                                  otpInputRefs.current[index] = el;
                                }}
                                type="text"
                                value={otp[index] || ""}
                                onChange={(e) => {
                                  const value = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 1);
                                  const newOtp = otp.split("");
                                  newOtp[index] = value;
                                  const updatedOtp = newOtp
                                    .join("")
                                    .slice(0, 4);
                                  setOtp(updatedOtp);


                                  // Auto-focus next input
                                  if (
                                    value &&
                                    index < 3 &&
                                    otpInputRefs.current[index + 1]
                                  ) {
                                    otpInputRefs.current[index + 1]?.focus();
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Backspace" &&
                                    !otp[index] &&
                                    index > 0 &&
                                    otpInputRefs.current[index - 1]
                                  ) {
                                    otpInputRefs.current[index - 1]?.focus();
                                  }
                                }}
                                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200"
                                maxLength={1}
                                inputMode="numeric"
                              />
                            ))}
                          </div>


                          {otp && otp.length > 0 && otp.length !== 4 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="bg-amber-50 border border-amber-200 rounded-xl p-3"
                            >
                              <p className="text-amber-700 text-sm flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>{4 - otp.length} more digits needed</span>
                              </p>
                            </motion.div>
                          )}
                        </div>


                        <Button
                          type="submit"
                          disabled={isVerifyingOTP || otp.length !== 4}
                          className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                        >
                          {isVerifyingOTP ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Verifying...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              <span>Complete Verification</span>
                            </div>
                          )}
                        </Button>


                        {/* Mobile-Optimized Resend Section */}
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                          <div className="text-center space-y-3">
                            {otpTimer > 0 ? (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                  Didn't receive the code?
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-semibold text-blue-600">
                                    Resend in {otpTimer}s
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                  Didn't receive the code?
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResendOTP}
                                    disabled={isVerifyingPhone}
                                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 font-semibold rounded-xl"
                                  >
                                    {isVerifyingPhone ? (
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Sending...</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Resend Code</span>
                                      </div>
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setShowOTPInput(false);
                                      setOtp("");
                                    }}
                                    className="text-gray-600 border-gray-200 hover:bg-gray-50 rounded-xl"
                                  >
                                    <ArrowLeft className="w-3 h-3 mr-1" />
                                    <span>Change Number</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>


                {/* Compact Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>Secure & encrypted</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
  );
};

export default PhoneVerificationModal;
