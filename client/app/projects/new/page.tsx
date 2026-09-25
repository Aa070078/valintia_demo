"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  SquaresFour,
  User,
  CheckCircle,
} from "@phosphor-icons/react";
import { StepPropertyType } from "@/features/projects/components/steps/step-01-property-type";
import { StepStyleDiscovery } from "@/features/projects/components/steps/step-02-style-discovery";
import { StepSpaces } from "@/features/projects/components/steps/step-03-spaces";
import { StepPropertyInfo } from "@/features/projects/components/steps/step-04-property-info";
import { StepCustomerLocation } from "@/features/projects/components/steps/step-05-customer-location";
import { StepRepresentative } from "@/features/projects/components/steps/step-06-representative";
import { StepScope } from "@/features/projects/components/steps/step-07-scope";
import { StepBudget } from "@/features/projects/components/steps/step-08-budget";
import { StepTimeline } from "@/features/projects/components/steps/step-09-timeline";
import { StepDrawings } from "@/features/projects/components/steps/step-10-drawings";
import { StepReviewSubmit } from "@/features/projects/components/steps/step-11-review-submit";
import { useCreateProject } from "@/features/projects/hooks/use-projects";
import { projectsApi } from "@/features/projects/api/projects.api";
import { useAuth } from "@/features/auth/context/auth-context";
import { SignInModal } from "@/features/auth/components/sign-in-modal";
import type {
  PropertyType,
  PropertyEntity,
  SpaceEntity,
  PendingStyleSelection,
  CustomerLocation,
  AuthorizedRepresentative,
  ProjectScope,
  ProjectBudget,
  TargetCompletion,
  ProjectDocument,
} from "@/features/projects/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

const FUNNEL_STEPS = [
  { id: 1, code: "01", labelKey: "lifecycle.step_property", defaultEn: "Typology", defaultAr: "النمط المعماري" },
  { id: 2, code: "02", labelKey: "lifecycle.step_style", defaultEn: "Style & Mood", defaultAr: "الطراز والمواد" },
  { id: 3, code: "03", labelKey: "lifecycle.step_spaces", defaultEn: "Spaces", defaultAr: "الفراغات المعمارية" },
  { id: 4, code: "04", labelKey: "lifecycle.step_property_info", defaultEn: "Property Specs", defaultAr: "بيانات العقار" },
  { id: 5, code: "05", labelKey: "lifecycle.step_location", defaultEn: "Your Location", defaultAr: "موقع الإقامة" },
  { id: 6, code: "06", labelKey: "lifecycle.step_representative", defaultEn: "Representative", defaultAr: "الممثل بمصر" },
  { id: 7, code: "07", labelKey: "lifecycle.step_scope", defaultEn: "Scope of Work", defaultAr: "نطاق العمل" },
  { id: 8, code: "08", labelKey: "lifecycle.step_budget", defaultEn: "Budget", defaultAr: "الميزانية" },
  { id: 9, code: "09", labelKey: "lifecycle.step_timeline", defaultEn: "Timeline", defaultAr: "الموعد المستهدف" },
  { id: 10, code: "10", labelKey: "lifecycle.step_drawings", defaultEn: "Drawings", defaultAr: "المخططات" },
  { id: 11, code: "11", labelKey: "lifecycle.step_review", defaultEn: "Review & Submit", defaultAr: "المراجعة والاعتماد" },
];

function CreateProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language, toggleLanguage, isRTL } = useLanguage();
  const { user } = useAuth();
  const [isSignInOpen, setIsSignInOpen] = React.useState(false);

  const stepQuery = Number(searchParams.get("step"));
  const [internalStep, setInternalStep] = React.useState<number>(1);
  const currentStep = stepQuery >= 1 && stepQuery <= 11 ? stepQuery : internalStep;

  // 11 Step Form State
  const [propertyType, setPropertyType] = React.useState<PropertyType>("villa");
  const [primaryStyleId, setPrimaryStyleId] = React.useState("japandi");
  const [pendingStyles, setPendingStyles] = React.useState<PendingStyleSelection[]>([
    {
      targetSpaceKey: "general",
      styleId: "japandi",
      styleName: "Japandi & Warm Minimal",
      referenceImages: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      ],
      notes: "",
    },
  ]);

  const [spaces, setSpaces] = React.useState<SpaceEntity[]>([
    { id: "living", spaceType: "living", customName: "Living Room & Salon", included: true, quantity: 1 },
    { id: "dining", spaceType: "dining", customName: "Formal Dining Area", included: true, quantity: 1 },
    { id: "kitchen", spaceType: "kitchen", customName: "Chef Kitchen & Pantry", included: true, quantity: 1 },
    { id: "master_bedroom", spaceType: "master_bedroom", customName: "Master Suite", included: true, quantity: 1 },
    { id: "guest_bedrooms", spaceType: "guest_bedrooms", customName: "Guest Bedrooms", included: true, quantity: 3 },
    { id: "bathrooms", spaceType: "bathrooms", customName: "Bathrooms & Spa", included: true, quantity: 4 },
    { id: "terrace", spaceType: "terrace", customName: "Private Terrace & Loggia", included: true, quantity: 2 },
    { id: "office", spaceType: "office", customName: "Home Office & Library", included: false, quantity: 0 },
  ]);

  const [property, setProperty] = React.useState<PropertyEntity>({
    propertyType: "villa",
    compound: "Palm Hills Golf Extensions",
    city: "New Cairo",
    areaSqm: 480,
    floors: 2,
    condition: "semi_finished",
    accessibilityNotes: "",
  });

  const [customerLocation, setCustomerLocation] = React.useState<CustomerLocation>({
    country: "Egypt",
    city: "Cairo",
    timezone: "Africa/Cairo (GMT+2)",
  });

  const [representative, setRepresentative] = React.useState<AuthorizedRepresentative>({
    hasRepresentative: false,
    valentiaManagedDirectly: true,
  });

  const [scope, setScope] = React.useState<ProjectScope>({
    scopeType: "full_fitout",
    customDetails: "",
  });

  const [budget, setBudget] = React.useState<ProjectBudget>({
    budgetType: "range",
    minAmount: 2500000,
    maxAmount: 4500000,
    currency: "EGP",
  });

  const [timeline, setTimeline] = React.useState<TargetCompletion>({
    deadlineType: "duration",
    durationDescription: "6 Months (Standard)",
  });

  const [documents, setDocuments] = React.useState<ProjectDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const createMutation = useCreateProject();

  const goToStep = (stepNumber: number) => {
    const clamped = Math.max(1, Math.min(11, stepNumber));
    setInternalStep(clamped);
    router.replace(`/projects/new?step=${clamped}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (currentStep < 11) {
      goToStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    } else {
      router.push("/projects");
    }
  };

  const reconcileSpacesWithStyles = (): SpaceEntity[] => {
    return spaces.map((space) => {
      const specific = pendingStyles.find((p) => p.targetSpaceKey === space.id);
      const fallback = pendingStyles.find((p) => p.targetSpaceKey === "general");
      const matched = specific || fallback;

      if (matched) {
        return {
          ...space,
          stylePreference: {
            styleId: matched.styleId,
            styleName: matched.styleName,
            referenceImages: matched.referenceImages,
            notes: matched.notes,
          },
        };
      }
      return space;
    });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const reconciledSpaces = reconcileSpacesWithStyles();
      const projectTitle = property.compound
        ? `${property.compound} Residence`
        : `${property.city} Architectural Fit-Out`;

      const created = await createMutation.mutateAsync({
        title: projectTitle,
        property: {
          ...property,
          propertyType,
        },
        spaces: reconciledSpaces,
        pendingStyles,
        customerLocation,
        representative,
        scope,
        budget,
        timeline,
        documents,
      });

      // Confirm transition to 'submitted' lifecycle status
      await projectsApi.submitProject(created.id);
      router.push(`/projects/${created.id}`);
    } catch (err) {
      console.error("Failed to commission project", err);
      // Fallback local ID redirect to preserve smooth flow
      router.push(`/projects`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8 lg:px-10">
          {/* Brand Lockup */}
          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground border border-border shadow-2xs">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 stroke-current"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 20L12 4L20 20" />
                  <path d="M8 14L16 14" opacity="0.35" />
                </svg>
              </div>
              <span className={cn(
                "text-xs font-bold text-foreground transition-colors",
                isRTL ? "tracking-normal font-sans" : "font-sans tracking-[0.24em]"
              )}>
                {isRTL ? "فالنتيا • استوديو التصميم المعماري" : "VALENTIA INTERIOR ATELIER"}
              </span>
            </Link>
          </div>

          {/* Center Pill Badge */}
          <div className="hidden md:flex items-center rounded-full border border-border bg-secondary/70 px-4 py-1.5 shadow-2xs">
            <span className={cn(
              "text-[10px] font-semibold text-[#503C2C] dark:text-[#FAF7F2]",
              isRTL ? "tracking-normal font-sans font-bold" : "font-mono uppercase tracking-[0.18em]"
            )}>
              {t("nav.fitout_commission") || "FIT-OUT COMMISSION • SPECIFICATION FLOW"}
            </span>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground shadow-2xs hover:bg-secondary active:scale-95 transition-all cursor-pointer"
              title={language === "en" ? "تغيير للعربية" : "Switch to English"}
            >
              <span className={cn(language === "en" ? "font-bold text-foreground" : "text-muted-foreground")}>
                EN
              </span>
              <span className="text-border">|</span>
              <span className={cn(language === "ar" ? "font-bold text-foreground" : "text-muted-foreground")}>
                عربي
              </span>
            </button>

            {/* User Profile Button */}
            <button
              type="button"
              onClick={() => setIsSignInOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xs hover:opacity-90 transition-opacity"
              title={user ? user.name : "Sign In"}
            >
              {user ? (
                <span className="text-xs font-bold font-mono">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User size={14} weight="bold" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Atelier Container */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left Sidebar (Desktop) / Top Horizontal Steps (Mobile) */}
        <aside
          className={cn(
            "w-full lg:w-72 lg:shrink-0 border-b lg:border-b-0 bg-sidebar p-4 sm:p-6 flex flex-col justify-between",
            isRTL
              ? "lg:border-l lg:border-sidebar-border lg:order-last"
              : "lg:border-r lg:border-sidebar-border"
          )}
        >
          <div>
            <div className="pb-3 flex items-center justify-between">
              <span className={cn(
                "text-[10px] font-bold text-foreground/80",
                isRTL ? "tracking-normal text-xs text-[#503C2C]" : "font-mono uppercase tracking-[0.2em]"
              )}>
                {t("lifecycle.title") || "PROJECT LIFECYCLE"}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#B88460]">
                {currentStep} / 11
              </span>
            </div>

            {/* Steps List */}
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
              {FUNNEL_STEPS.map((step) => {
                const isCurrent = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goToStep(step.id)}
                    className={cn(
                      "group flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-all duration-150 cursor-pointer select-none text-start",
                      isCurrent
                        ? "bg-sidebar-accent font-bold text-foreground shadow-2xs"
                        : "text-[#5A4F45] hover:bg-secondary/60 hover:text-foreground font-medium"
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[10px] transition-colors",
                        isCurrent
                          ? "font-bold text-foreground"
                          : isCompleted
                          ? "text-[#B88460] font-bold"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.code}
                    </span>
                    <span className={cn("truncate", isRTL ? "font-sans font-semibold text-xs" : "font-medium")}>
                      {t(step.labelKey) || (isRTL ? step.defaultAr : step.defaultEn)}
                    </span>
                    {isCompleted && (
                      <CheckCircle
                        weight="fill"
                        className="w-3.5 h-3.5 text-[#B88460] ms-auto shrink-0 hidden lg:block"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom link to Projects Dashboard */}
          <div className="hidden lg:block border-t border-sidebar-border pt-4">
            <Link
              href="/projects"
              className={cn(
                "flex items-center gap-2 text-xs font-semibold text-foreground/75 hover:text-foreground transition-colors",
                isRTL && "font-sans font-bold"
              )}
            >
              <SquaresFour size={15} />
              <span>{t("lifecycle.dashboard") || (isRTL ? "لوحة المشاريع" : "Projects Dashboard")}</span>
            </Link>
          </div>
        </aside>

        {/* Main Stage Content */}
        <main className="flex-1 min-w-0 flex flex-col justify-between p-5 sm:p-8 lg:p-12">
          <div className="mx-auto w-full max-w-4xl flex-1 flex flex-col">
            {/* STEP 01: Typology */}
            {currentStep === 1 && (
              <StepPropertyType
                selectedType={propertyType}
                onSelectType={setPropertyType}
              />
            )}

            {/* STEP 02: Style Discovery */}
            {currentStep === 2 && (
              <StepStyleDiscovery
                pendingStyles={pendingStyles}
                onChangePendingStyles={setPendingStyles}
                primaryStyleId={primaryStyleId}
                onChangePrimaryStyleId={setPrimaryStyleId}
              />
            )}

            {/* STEP 03: Spaces */}
            {currentStep === 3 && (
              <StepSpaces
                spaces={spaces}
                onChangeSpaces={setSpaces}
                pendingStyles={pendingStyles}
                areaSqm={property.areaSqm}
              />
            )}

            {/* STEP 04: Property Specs */}
            {currentStep === 4 && (
              <StepPropertyInfo
                property={property}
                onChangeProperty={setProperty}
              />
            )}

            {/* STEP 05: Client Location */}
            {currentStep === 5 && (
              <StepCustomerLocation
                location={customerLocation}
                onChangeLocation={setCustomerLocation}
              />
            )}

            {/* STEP 06: Local Representative */}
            {currentStep === 6 && (
              <StepRepresentative
                representative={representative}
                onChangeRepresentative={setRepresentative}
              />
            )}

            {/* STEP 07: Scope of Work */}
            {currentStep === 7 && (
              <StepScope
                scope={scope}
                onChangeScope={setScope}
              />
            )}

            {/* STEP 08: Budget */}
            {currentStep === 8 && (
              <StepBudget
                budget={budget}
                onChangeBudget={setBudget}
              />
            )}

            {/* STEP 09: Timeline */}
            {currentStep === 9 && (
              <StepTimeline
                timeline={timeline}
                onChangeTimeline={setTimeline}
              />
            )}

            {/* STEP 10: Drawings & CAD */}
            {currentStep === 10 && (
              <StepDrawings
                documents={documents}
                onChangeDocuments={setDocuments}
                onProceedWithoutDrawings={() => goToStep(11)}
              />
            )}

            {/* STEP 11: Review & Submit */}
            {currentStep === 11 && (
              <StepReviewSubmit
                propertyType={propertyType}
                primaryStyleId={primaryStyleId}
                pendingStyles={pendingStyles}
                spaces={spaces}
                property={property}
                customerLocation={customerLocation}
                representative={representative}
                scope={scope}
                budget={budget}
                timeline={timeline}
                documents={documents}
                onJumpToStep={goToStep}
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {/* Sticky / Fixed Navigation Footer for Steps 1 - 10 */}
          {currentStep < 11 && (
            <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card text-xs font-bold text-foreground hover:bg-secondary transition-all cursor-pointer shadow-2xs",
                  isRTL ? "tracking-normal font-sans" : "uppercase tracking-wider font-semibold"
                )}
              >
                {isRTL ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
                <span>{t("wizard.back") || "Back"}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className={cn(
                  "flex items-center gap-2 px-7 py-2.5 rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer",
                  isRTL ? "tracking-normal font-sans" : "uppercase tracking-wider font-semibold"
                )}
              >
                <span>{t("wizard.next") || "Next Step"}</span>
                {isRTL ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Sign-In & Role Boundary Modal */}
      <SignInModal
        open={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
    </div>
  );
}

export default function CreateProjectPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#F4EEE5]">
          <div className="font-serif text-lg text-[#503C2C]">VALENTIA ATELIER...</div>
        </div>
      }
    >
      <CreateProjectContent />
    </React.Suspense>
  );
}
