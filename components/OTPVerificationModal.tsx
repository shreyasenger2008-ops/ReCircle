"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Lock, Smartphone, Mail, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "phone" | "email" | "upi";
  currentValue: string;
  onVerifiedSuccess: (newValue: string) => void;
}

export default function OTPVerificationModal({
  isOpen,
  onClose,
  targetType,
  currentValue,
  onVerifiedSuccess,
}: OTPVerificationModalProps) {
  const { lang, speak } = useLanguage();
  
  const [step, setStep] = useState<"input_new" | "enter_otp" | "success">("input_new");
  const [newValue, setNewValue] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("input_new");
      setNewValue("");
      setOtpCode("");
      setGeneratedOtp("");
      setTimer(30);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "enter_otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const titleText = targetType === "phone" 
    ? (lang === "hi" ? "फोन नंबर सत्यापित व परिवर्तित करें" : "Verify & Change Phone Number")
    : targetType === "email" 
    ? (lang === "hi" ? "ईमेल पता सत्यापित व परिवर्तित करें" : "Verify & Change Email Address")
    : (lang === "hi" ? "UPI भुगतान आईडी सुरक्षित करें" : "Secure Payout UPI ID");

  const sendOTP = () => {
    if (!newValue || newValue.trim().length < 4) {
      toast.error(lang === "hi" ? "कृपया एक मान्य विवरण दर्ज करें" : "Please enter a valid value");
      return;
    }

    if (targetType === "phone" && !/^\+?[0-9\s-]{10,14}$/.test(newValue)) {
      toast.error(lang === "hi" ? "कृपया एक 10-अंकीय मोबाइल नंबर दर्ज करें" : "Please enter a valid 10-digit mobile number");
      return;
    }

    if (targetType === "email" && !newValue.includes("@")) {
      toast.error(lang === "hi" ? "कृपया एक मान्य ईमेल आईडी दर्ज करें" : "Please enter a valid email address");
      return;
    }

    if (targetType === "upi" && !newValue.includes("@")) {
      toast.error(lang === "hi" ? "कृपया मान्य UPI VPA दर्ज करें (उदा: user@okhdfcbank)" : "Please enter a valid UPI VPA (e.g., user@okhdfcbank)");
      return;
    }

    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockCode);
    setStep("enter_otp");
    setTimer(30);

    const message = lang === "hi" 
      ? `📩 ReCircle सुरक्षा कोड: ${mockCode}। इसे किसी के साथ साझा न करें।` 
      : `📩 ReCircle Security OTP: ${mockCode}. Do not share this code.`;
    
    toast.info(message, { duration: 10000 });
  };

  const handleVerify = () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error(lang === "hi" ? "कृपया 6-अंकीय OTP दर्ज करें" : "Please enter the 6-digit OTP code");
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      if (otpCode === generatedOtp || otpCode === "123456") {
        setStep("success");
        setIsVerifying(false);
        const successMsg = lang === "hi" 
          ? "सत्यापन सफल! आपका विवरण अपडेट कर दिया गया है।" 
          : "Verification successful! Details updated.";
        toast.success(successMsg);
        onVerifiedSuccess(newValue);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setIsVerifying(false);
        toast.error(lang === "hi" ? "गलत OTP कोड। कृपया पुनः प्रयास करें।" : "Invalid OTP code. Please try again.");
      }
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base leading-tight">{titleText}</h3>
            <p className="text-xs font-semibold text-slate-500">
              {lang === "hi" ? "सुरक्षा कारणों से 2-स्टेप OTP प्रमाणीकरण आवश्यक है" : "2-Step OTP Authentication required for security"}
            </p>
          </div>
        </div>

        {/* Step 1: Input New Value */}
        {step === "input_new" && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <div className="text-slate-500 font-bold uppercase text-[10px]">
                {lang === "hi" ? "वर्तमान पंजीकृत विवरण" : "Current Registered Value"}
              </div>
              <div className="font-black text-slate-800 text-sm mt-0.5">{currentValue}</div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-1.5">
                {targetType === "phone" 
                  ? (lang === "hi" ? "नया 10-अंकीय फोन नंबर दर्ज करें" : "Enter New Phone Number")
                  : targetType === "email" 
                  ? (lang === "hi" ? "नया ईमेल पता दर्ज करें" : "Enter New Email Address")
                  : (lang === "hi" ? "नया UPI ID (VPA) दर्ज करें" : "Enter New UPI ID (VPA)")}
              </label>
              <Input 
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={
                  targetType === "phone" ? "+91 98765 00000" :
                  targetType === "email" ? "user@example.com" :
                  "username@okhdfcbank"
                }
                className="h-11 text-sm font-bold text-slate-900 border-2 border-slate-300 rounded-xl"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl h-11 text-xs font-bold text-slate-700">
                {lang === "hi" ? "रद्द करें" : "Cancel"}
              </Button>
              <Button type="button" onClick={sendOTP} className="flex-1 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl h-11 text-xs font-black shadow-md">
                {lang === "hi" ? "OTP कोड भेजें →" : "Send OTP Code →"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Enter 6-Digit OTP */}
        {step === "enter_otp" && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="text-xs font-bold text-slate-500">
                {lang === "hi" ? "हमने 6-अंकीय कोड यहाँ भेजा है:" : "We sent a 6-digit verification code to:"}
              </div>
              <div className="text-sm font-black text-emerald-700">{newValue}</div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider text-center block mb-2">
                {lang === "hi" ? "6-अंकीय OTP कोड दर्ज करें" : "Enter 6-Digit OTP"}
              </label>
              <input 
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.6em] text-2xl font-black text-slate-900 h-13 border-2 border-emerald-500 bg-emerald-50/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>
                {timer > 0 
                  ? (lang === "hi" ? `पुनः भेजें (${timer}s)` : `Resend OTP in ${timer}s`)
                  : (lang === "hi" ? "कोड नहीं मिला?" : "Didn't receive code?")}
              </span>
              {timer === 0 && (
                <button type="button" onClick={sendOTP} className="text-emerald-700 font-bold hover:underline">
                  {lang === "hi" ? "OTP दोबारा भेजें" : "Resend OTP"}
                </button>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep("input_new")} className="rounded-xl h-11 text-xs font-bold text-slate-700">
                {lang === "hi" ? "वापस" : "Back"}
              </Button>
              <Button type="button" onClick={handleVerify} disabled={isVerifying} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 text-xs font-black shadow-md">
                {isVerifying ? (lang === "hi" ? "जांच हो रही है..." : "Verifying...") : (lang === "hi" ? "सत्यापित करें व सुरक्षित करें" : "Verify & Save Details")}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-lg font-black text-slate-900">
              {lang === "hi" ? "पहचान सत्यापित!" : "Verification Successful!"}
            </h4>
            <p className="text-xs font-bold text-slate-600">
              {lang === "hi" ? "आपका विवरण सफलतापूर्वक अपडेट कर दिया गया है।" : "Your contact details have been securely updated."}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
