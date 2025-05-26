import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { RootState } from "@/store";
import {
  setPassengers,
  setCheckedLuggage,
  setMediumLuggage,
  setHandLuggage,
} from "@/store/slices/bookingSlice";
import { PassengerLuggageForm } from "./passenger-luggage-form";
import { handleBackToForm } from "@/store/slices/uiSlice";

const PassengerLuggageFormContainer = () => {
  const dispatch = useAppDispatch();
  const { passengers, checkedLuggage, mediumLuggage, handLuggage } =
    useAppSelector((state: RootState) => state.booking);

  const handlePassengersChange = (value: number) => {
    dispatch(setPassengers(value));
  };

  const handleCheckedLuggageChange = (value: number) => {
    dispatch(setCheckedLuggage(value));
  };

  const handleMediumLuggageChange = (value: number) => {
    dispatch(setMediumLuggage(value));
  };

  const handleHandLuggageChange = (value: number) => {
    dispatch(setHandLuggage(value));
  };

  const handleBack = () => {
    dispatch(handleBackToForm());
  };

  return (
    <PassengerLuggageForm
      passengers={passengers}
      onPassengersChange={handlePassengersChange}
      checkedLuggage={checkedLuggage}
      onCheckedLuggageChange={handleCheckedLuggageChange}
      mediumLuggage={mediumLuggage}
      onMediumLuggageChange={handleMediumLuggageChange}
      handLuggage={handLuggage}
      onHandLuggageChange={handleHandLuggageChange}
      onBack={handleBack}
    />
  );
};

export default PassengerLuggageFormContainer;
