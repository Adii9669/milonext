"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, AlertTriangle } from "lucide-react";
import { PlanStepNavigation } from "./PlanStepNavigation";
import { PlanDetailsStep } from "./PlanDetailsStep";
import { PlanTimePlaceStep } from "./PlanTimePlaceStep";
import { PlanParticipantsStep } from "./PlanParticipantsStep";
import { PlanReviewStep } from "./PlanReviewStep";
import { PlanModalFooter } from "./PlanModalFooter";
import { CreatePlanInput, Plan } from "@/src/features/Chat/types/plans";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlan?: (data: CreatePlanInput) => Promise<Plan | null | void>;
  conversationName?: string;
}

export function CreatePlanModal({
  isOpen,
  onClose,
  onCreatePlan,
  conversationName,
}: CreatePlanModalProps) {
  // Navigation State (1: Details, 2: Time & Place, 3: Participants, 4: Review)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1 Form State (Details)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  // Step 2 Form State (Time & Place)
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [startTime, setStartTime] = useState(""); // HH:mm
  const [endTime, setEndTime] = useState(""); // HH:mm
  const [location, setLocation] = useState("");

  const [dateError, setDateError] = useState<string | null>(null);
  const [startTimeError, setStartTimeError] = useState<string | null>(null);
  const [endTimeError, setEndTimeError] = useState<string | null>(null);
  const [isStep2Completed, setIsStep2Completed] = useState(false);

  // Step 3 Form State (Participants)
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [isStep3Completed, setIsStep3Completed] = useState(false);

  // Step 4 Form State (Review & Submission)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Discard Confirmation Dialog State
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Focus reference
  const modalRef = useRef<HTMLDivElement>(null);

  // Has the user entered any data across Step 1, Step 2, or Step 3?
  const hasUnsavedChanges = Boolean(
    title.trim() ||
    description.trim() ||
    category !== null ||
    date ||
    startTime ||
    endTime ||
    location.trim() ||
    selectedParticipantIds.length > 0
  );

  // Reset form state cleanly
  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps([]);

    setTitle("");
    setDescription("");
    setCategory(null);
    setTitleError(null);

    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setDateError(null);
    setStartTimeError(null);
    setEndTimeError(null);
    setIsStep2Completed(false);

    setSelectedParticipantIds([]);
    setIsStep3Completed(false);

    setIsSubmitting(false);
    setSubmitError(null);
    setShowDiscardConfirm(false);
  }, []);

  // Safe Close Request (prompts if unsaved changes exist)
  const handleRequestClose = useCallback(() => {
    if (hasUnsavedChanges && !showDiscardConfirm) {
      setShowDiscardConfirm(true);
      return;
    }
    resetForm();
    onClose();
  }, [hasUnsavedChanges, showDiscardConfirm, resetForm, onClose]);

  // Confirm Discard
  const handleConfirmDiscard = () => {
    resetForm();
    onClose();
  };

  // Keep Editing
  const handleCancelDiscard = () => {
    setShowDiscardConfirm(false);
  };

  // Step 1 Validation & Next
  const handleNextStep1 = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError("Title is required and cannot be empty.");
      const input = document.getElementById("plan-title-input");
      input?.focus();
      return;
    }

    if (title.length > 100) {
      setTitleError("Title cannot exceed 100 characters.");
      return;
    }

    setTitleError(null);
    setCompletedSteps((prev) => Array.from(new Set([...prev, 1])));
    setCurrentStep(2);
  };

  // Step 2 Validation & Next
  const handleNextStep2 = () => {
    let hasError = false;

    // 1. Date Validation
    if (!date) {
      setDateError("Please select a date.");
      hasError = true;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDay = new Date(`${date}T00:00:00`);
      if (selectedDay < today) {
        setDateError("Date cannot be in the past.");
        hasError = true;
      } else {
        setDateError(null);
      }
    }

    // 2. Start Time Validation
    if (!startTime) {
      setStartTimeError("Start time is required.");
      hasError = true;
    } else if (date) {
      const startObj = new Date(`${date}T${startTime}`);
      if (Number.isNaN(startObj.getTime()) || startObj <= new Date()) {
        setStartTimeError("Start time must be in the future.");
        hasError = true;
      } else {
        setStartTimeError(null);
      }
    }

    // 3. End Time Validation (Optional)
    if (endTime) {
      if (!startTime) {
        setEndTimeError("Select a start time first.");
        hasError = true;
      } else if (date) {
        const startObj = new Date(`${date}T${startTime}`);
        const endObj = new Date(`${date}T${endTime}`);
        if (Number.isNaN(endObj.getTime()) || endObj <= startObj) {
          setEndTimeError("End time must be later than start time.");
          hasError = true;
        } else {
          setEndTimeError(null);
        }
      }
    } else {
      setEndTimeError(null);
    }

    if (hasError) return;

    // Step 2 is valid
    setCompletedSteps((prev) => Array.from(new Set([...prev, 1, 2])));
    setIsStep2Completed(true);
    setCurrentStep(3);
  };

  // Step 3 Validation & Next
  const handleNextStep3 = () => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, 1, 2, 3])));
    setIsStep3Completed(true);
    setCurrentStep(4);
  };

  // Step 4: Final Plan Creation
  const handleCreatePlanSubmit = async () => {
    if (!title.trim() || !date || !startTime) {
      setSubmitError("Please ensure title, date, and start time are provided.");
      return;
    }

    const startObj = new Date(`${date}T${startTime}`);
    if (Number.isNaN(startObj.getTime()) || startObj <= new Date()) {
      setSubmitError("Start time must be in the future.");
      return;
    }

    let endObj: Date | undefined;
    if (endTime) {
      endObj = new Date(`${date}T${endTime}`);
      if (Number.isNaN(endObj.getTime()) || endObj <= startObj) {
        setSubmitError("End time must be later than start time.");
        return;
      }
    }

    const payload: CreatePlanInput = {
      title: title.trim(),
      startAt: startObj.toISOString(),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(endObj ? { endAt: endObj.toISOString() } : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (onCreatePlan) {
        await onCreatePlan(payload);
      }
      resetForm();
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to create plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Master Next router
  const handleNext = () => {
    if (currentStep === 1) {
      handleNextStep1();
    } else if (currentStep === 2) {
      handleNextStep2();
    } else if (currentStep === 3) {
      handleNextStep3();
    } else if (currentStep === 4) {
      handleCreatePlanSubmit();
    }
  };

  // Back Button handler
  const handleBack = () => {
    if (currentStep === 2) {
      setDateError(null);
      setStartTimeError(null);
      setEndTimeError(null);
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setSubmitError(null);
      setCurrentStep(3);
    }
  };

  // Edit action jump directly to specific step while preserving state
  const handleEditStep = (stepNumber: number) => {
    setSubmitError(null);
    setCurrentStep(stepNumber);
  };

  // Field change handlers that clear corresponding error
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (titleError && val.trim()) setTitleError(null);
  };

  const handleDateChange = (val: string) => {
    setDate(val);
    if (dateError) setDateError(null);
    if (startTimeError && val && startTime) {
      const startObj = new Date(`${val}T${startTime}`);
      if (startObj > new Date()) setStartTimeError(null);
    }
  };

  const handleStartTimeChange = (val: string) => {
    setStartTime(val);
    if (startTimeError) setStartTimeError(null);
    if (endTime && endTimeError && date) {
      const startObj = new Date(`${date}T${val}`);
      const endObj = new Date(`${date}T${endTime}`);
      if (endObj > startObj) setEndTimeError(null);
    }
  };

  const handleEndTimeChange = (val: string) => {
    setEndTime(val);
    if (endTimeError) setEndTimeError(null);
  };

  // Keyboard navigation: Escape key closes or triggers confirmation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (showDiscardConfirm) {
          setShowDiscardConfirm(false);
        } else {
          handleRequestClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showDiscardConfirm, handleRequestClose]);

  // Focus modal on open
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in-50 duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-plan-modal-title"
    >
      {/* Background click to request close */}
      <div
        className="fixed inset-0 -z-10"
        onClick={handleRequestClose}
        aria-hidden="true"
      />

      {/* Main Modal Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-[780px] h-[640px] max-h-[92vh] rounded-2xl bg-[#101012] border border-[#25252b] shadow-2xl flex flex-col overflow-hidden outline-none animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#25252b] bg-[#101012] shrink-0">
          <div className="flex items-center gap-2">
            <h2
              id="create-plan-modal-title"
              className="text-base font-semibold text-[#f4f4f5]"
            >
              Create Plan
            </h2>
          </div>

          <button
            type="button"
            onClick={handleRequestClose}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#17171b] transition-colors focus:outline-none focus:ring-1 focus:ring-[#6E53CC] cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Content (Step Nav on Left + Form Content on Right) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Step 1 to 4 Navigation */}
          <PlanStepNavigation
            currentStep={currentStep}
            completedSteps={completedSteps}
            onSelectStep={(step) => {
              if (
                step >= 1 &&
                step <= 4 &&
                (completedSteps.includes(step) || step <= currentStep)
              ) {
                setSubmitError(null);
                setCurrentStep(step);
              }
            }}
          />

          {/* Step Form Router */}
          {currentStep === 1 ? (
            <PlanDetailsStep
              title={title}
              onTitleChange={handleTitleChange}
              titleError={titleError}
              description={description}
              onDescriptionChange={setDescription}
              category={category}
              onCategoryChange={setCategory}
              isStep1Completed={completedSteps.includes(1)}
            />
          ) : currentStep === 2 ? (
            <PlanTimePlaceStep
              date={date}
              onDateChange={handleDateChange}
              dateError={dateError}
              startTime={startTime}
              onStartTimeChange={handleStartTimeChange}
              startTimeError={startTimeError}
              endTime={endTime}
              onEndTimeChange={handleEndTimeChange}
              endTimeError={endTimeError}
              location={location}
              onLocationChange={setLocation}
              isStep2Completed={isStep2Completed}
            />
          ) : currentStep === 3 ? (
            <PlanParticipantsStep
              selectedParticipantIds={selectedParticipantIds}
              onSelectParticipantIds={setSelectedParticipantIds}
              isStep3Completed={isStep3Completed}
            />
          ) : (
            <PlanReviewStep
              title={title}
              description={description}
              category={category}
              date={date}
              startTime={startTime}
              endTime={endTime}
              location={location}
              selectedParticipantIds={selectedParticipantIds}
              conversationName={conversationName}
              onEdit={handleEditStep}
              submitError={submitError}
            />
          )}
        </div>

        {/* Footer Actions (Cancel/Next or Back/Create Plan) */}
        <PlanModalFooter
          currentStep={currentStep}
          onCancel={handleRequestClose}
          onBack={handleBack}
          onNext={handleNext}
          isSubmitting={isSubmitting}
          isNextDisabled={isSubmitting}
        />

        {/* Unsaved Changes Discard Confirmation Dialog */}
        {showDiscardConfirm && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xs animate-in fade-in-50 duration-150"
            role="alertdialog"
            aria-labelledby="discard-title"
            aria-describedby="discard-desc"
          >
            <div className="w-full max-w-sm rounded-xl bg-[#17171b] border border-[#25252b] p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 id="discard-title" className="text-sm font-semibold text-[#f4f4f5]">
                    Discard plan?
                  </h3>
                  <p id="discard-desc" className="text-xs text-[#a1a1aa] mt-0.5">
                    You have unsaved details. Closing now will discard your progress.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelDiscard}
                  className="px-3.5 py-1.5 rounded-lg bg-[#202026] hover:bg-[#282830] text-[#f4f4f5] text-xs font-semibold border border-[#25252b] transition-colors cursor-pointer"
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
