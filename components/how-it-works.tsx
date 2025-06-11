import React from "react";

interface HowItWorksStepProps {
  number: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const HowItWorksStep = ({ number, title, description, icon }: HowItWorksStepProps) => {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-light-purple/20 flex items-center justify-center text-light-purple font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2 text-white flex items-center gap-2">
          {title}
          {icon && <span className="text-light-purple">{icon}</span>}
        </h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
};

export default HowItWorksStep;
