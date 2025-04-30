"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

/*Logic for countdown*/

// Static target date (replace with desired date)
const TARGET_DATE = new Date("2025-07-30T00:00:00");

// Function to calculate the time remaining
const calculateTimeRemaining = (targetDate: Date) => {
  // Set current time
  const currentTime = new Date();
  // Set the time difference from current to target date
  // Math.max() returns the larger of the two numbers
  // First number is a differnce = target date - current time
  // Second number = 0.
  // First number keeps ticking until it gets to second number and then it stops at the second number.
  // Wrap the date in Number() to convert into milli-seconds
  const timeDifference = Math.max(Number(targetDate) - Number(currentTime), 0);
  // Return an object with Days, Hours, Minutes and Seconds
  // Use Math.floor() to round the numbers into whole numbers
  return {
    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ),
    minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
  };
};

const DealCountdown = () => {
  // Set some state
  const [time, setTime] = useState<ReturnType<typeof calculateTimeRemaining>>();

  // Run useEffect() when this component mounts
  useEffect(() => {
    // Calculate initial time on client
    setTime(calculateTimeRemaining(TARGET_DATE));
    // Create timer
    const timerInterval = setInterval(() => {
      // Every 1 second (1000ms) get new time
      const newTime = calculateTimeRemaining(TARGET_DATE);
      // Set time to new time.
      setTime(newTime);
      // Clear the count down if it's over
      if (
        newTime.days === 0 &&
        newTime.hours === 0 &&
        newTime.minutes === 0 &&
        newTime.seconds === 0
      ) {
        clearInterval(timerInterval);
      }

      // Return a function to return clearInterval. This will clean up on the component unmount
      return () => clearInterval(timerInterval);
    }, 1000);
  }, []);

  // If there's no time set then return a loader
  if (!time) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-20">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">Loading Countdown...</h3>
        </div>
      </section>
    );
  }

  // If the deal reaches the target date then show deal is no longer available
  if (
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0
  ) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-20">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">Deal Has Ended</h3>
          <p>
            This deal is no longer available. Check out our latest promotions!
          </p>
          <div className="text-center">
            <Button asChild>
              <Link href="/search">View Products</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <Image
            src="/images/promo.jpg"
            alt="promotion"
            width={300}
            height={200}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 my-20">
      <div className="flex flex-col gap-2 justify-center">
        <h3 className="text-3xl font-bold">Deal Of The Month</h3>
        <p>
          Get ready for a shopping experience like never before with our Deals
          of the Month! Every purchase comes with exclusive perks and offers,
          making this month a celebration of savvy choices and amazing deals.
          Don&apos;t miss out!
        </p>
        <ul className="grid grid-cols-4">
          <StatBox label="Days" value={time.days} />
          <StatBox label="Hours" value={time.hours} />
          <StatBox label="Minutes" value={time.minutes} />
          <StatBox label="Seconds" value={time.seconds} />
        </ul>
        <div className="text-center">
          <Button asChild>
            <Link href="/search">View Products</Link>
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <Image
          src="/images/promo.jpg"
          alt="promotion"
          width={300}
          height={200}
        />
      </div>
    </section>
  );
};

// Create StatBox component

type StatBoxProps = {
  label: string;
  value: number;
};
const StatBox = ({ label, value }: StatBoxProps) => (
  <li className="p-4 w-full text-center">
    <p className="text-3xl font-bold">{value}</p>
    <p>{label}</p>
  </li>
);

export default DealCountdown;
