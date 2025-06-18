import React from "react"
import { CheckCircle } from "lucide-react"

export const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="progress-steps">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className={`step ${currentStep >= index ? "active" : ""} ${currentStep > index ? "completed" : ""}`}>
            <div className="step-circle">{currentStep > index ? <CheckCircle size={16} /> : step.number}</div>
            <div className="step-label">{step.label}</div>
          </div>
          {index < steps.length - 1 && <div className="step-line"></div>}
        </React.Fragment>
      ))}
    </div>
  )
}
