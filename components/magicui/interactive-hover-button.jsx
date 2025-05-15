"use client";
import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_FILL_COLOR = "#1C2D4A";
const DEFAULT_INITIAL_TEXT_COLOR_CLASS = "text-[#1C2D4A]";
const DEFAULT_HOVER_TEXT_COLOR_CLASS = "text-[#F4C542]"; // Golden yellow
const DEFAULT_INITIAL_BG_COLOR_CLASS = "bg-transparent";
const DEFAULT_BORDER_COLOR_CLASS = "border-gray-300";

export const InteractiveHoverButton = React.forwardRef(
  (
    {
      children,
      className,
      fillColor = DEFAULT_FILL_COLOR,
      initialTextColorClass = DEFAULT_INITIAL_TEXT_COLOR_CLASS,
      hoverTextColorClass = DEFAULT_HOVER_TEXT_COLOR_CLASS,
      initialBgColorClass = DEFAULT_INITIAL_BG_COLOR_CLASS,
      borderColorClass = DEFAULT_BORDER_COLOR_CLASS,
      showArrow = true,
      icon: InitialIconProp,
      hoverIcon: HoverIconProp,
      ...props
    },
    ref
  ) => {
    const renderIcon = (IconSource, iconProps = {}) => {
      if (!IconSource) return null;
      // Handle simple functional components returning JSX directly,
      // as well as standard class components or React.forwardRef components.
      if (typeof IconSource === 'function' && (!IconSource.prototype || !IconSource.prototype.isReactComponent)) {
        return IconSource(iconProps); // Call as a function
      }
      const IconComponent = IconSource; // Treat as a standard React component
      return <IconComponent {...iconProps} />;
    };
    
    const commonIconClasses = "h-5 w-5";

    return (
      <button
        ref={ref}
        className={cn(
          "group relative w-auto cursor-pointer overflow-hidden rounded-lg border px-6 py-3 text-center font-semibold",
          initialBgColorClass,
          borderColorClass,
          className // Allows additional classes to be passed
        )}
        style={{
          minHeight: '48px', // Ensure consistent button height
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        {...props}
      >
        {/* Background wipe animation div */}
        <div
          className="absolute left-0 top-0 z-0 h-full w-0 rounded-lg transition-all duration-300 ease-out group-hover:w-full"
          style={{ backgroundColor: fillColor }}
        />
        {/* Content container for text and icons */}
        <div
          className={cn(
            "relative z-10 flex items-center gap-2",
            initialTextColorClass, // Initial text color
            `group-hover:${hoverTextColorClass}`, // Target hover text color. Example: "group-hover:text-[#F4C542]"
            "transition-colors duration-200 ease-out" // **MODIFIED**: Added for smooth text/icon color transition.
                                                     // Duration should ideally be <= background wipe duration (300ms).
          )}
        >
          {/* Initial Icon (if provided) */}
          {InitialIconProp && (
            <span className={cn("inline-block", { "group-hover:hidden": !!HoverIconProp })}>
              {renderIcon(InitialIconProp, { className: commonIconClasses })}
            </span>
          )}

          {/* Hover Icon (if provided, replaces InitialIcon on hover) */}
          {HoverIconProp && (
            <span className="hidden group-hover:inline-block">
              {renderIcon(HoverIconProp, { className: commonIconClasses })}
            </span>
          )}

          {/* Text content */}
          <span>{children}</span>

          {/* Default Arrow Icon Logic */}
          {showArrow && (!HoverIconProp || (HoverIconProp && !InitialIconProp)) && ( 
            <ArrowRight
              className={cn(
                commonIconClasses,
                // **MODIFIED**: Changed "transition-all" to specific transitions.
                // Color is inherited from parent and transitioned by parent's "transition-colors".
                "transition-transform duration-300 ease-out", // For the translate-x effect
                (InitialIconProp && HoverIconProp) 
                  ? "opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-opacity" // Handles opacity if both icons are present
                  : "group-hover:translate-x-1" // Default arrow behavior
              )}
            />
          )}
        </div>
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";