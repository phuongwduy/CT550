function CheckoutSteps({ currentStep = 1 }) {
  const steps = [
    { label: "GIỎ HÀNG", number: 1 },
    { label: "ĐẶT HÀNG", number: 2 },
    { label: "THANH TOÁN VÀ XÁC NHẬN", number: 3 },
  ];

  return (
    <div className="flex justify-center items-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Vòng tròn số bước */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                currentStep === step.number
                  ? "bg-orange-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {step.number}
            </div>
            <span
              className={`mt-2 text-xs font-medium text-center ${
                currentStep === step.number ? "text-orange-600" : "text-gray-600"
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Đường kẻ nối giữa các bước */}
          {index < steps.length - 1 && (
            <div className="w-10 h-[2px] bg-gray-300 mx-4"></div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CheckoutSteps;
