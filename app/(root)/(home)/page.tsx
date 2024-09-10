"use client";
import Loader from "@/components/Loader";
import MeetingTypeList from "@/components/MeetingTypeList";
import { useGetCalls } from "@/hooks/useGetCalls";
import { Call } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

const Home = () => {
  const { upcomingCalls, isLoading } = useGetCalls();
  const [timeLeft, setTimeLeft] = useState<string>("");

const sortedUpcomingCalls = upcomingCalls?.sort((a: Call, b: Call) => {
  const dateA = a.state?.startsAt ? new Date(a.state?.startsAt).getTime() : 0;
  const dateB = b.state?.startsAt ? new Date(b.state?.startsAt).getTime() : 0;
  return dateA - dateB;
}) || [];


const firstMeeting =
  sortedUpcomingCalls && sortedUpcomingCalls.length > 0
    ? sortedUpcomingCalls[0]
    : null;

  // Timer logic to calculate the time left for the first meeting
  useEffect(() => {
    if (firstMeeting) {
      const meetingStartTimeRaw = firstMeeting.state?.startsAt;

      // Check if meetingStartTimeRaw is valid before creating a Date object
      if (!meetingStartTimeRaw) {
        console.error("Meeting start time is undefined.");
        return;
      }

      // Create a valid Date object only if meetingStartTimeRaw is not undefined
      const meetingStartTime = new Date(meetingStartTimeRaw);

      if (isNaN(meetingStartTime.getTime())) {
        console.error("Invalid date format for meeting start time.");
        return;
      }

      const updateTimer = () => {
        const now = new Date();
        const timeDiff = meetingStartTime.getTime() - now.getTime();

        if (timeDiff <= 0) {
          setTimeLeft("Meeting started");
          return;
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      };

      const timerInterval = setInterval(updateTimer, 1000);
      updateTimer(); // Call immediately to avoid 1s delay

      return () => clearInterval(timerInterval); // Clean up on unmount
    }
  }, [firstMeeting]);

  if (isLoading) return <Loader />;

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <div className=" relative h-[300px] w-full rounded-[20px] bg-hero bg-cover">
        <div className="flex h-full flex-col justify-between px-5 py-8 lg:p-11">
          <div className="flex w-full items-center justify-start max-sm:flex-col max-sm:items-start gap-2">
          <h2 className="glassmorphism max-w-[270px] rounded py-2 px-2 text-center text-base font-normal">
            {firstMeeting
              ? `Upcoming Meeting at ${(
                  firstMeeting as Call
                ).state?.startsAt?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}`
              : "No Upcoming Meeting"}
          </h2>
          <h1 className=" text-xl font-bold tracking-wider lg:text-1xl lg:ml-3">
            {timeLeft || ""}
          </h1>
          </div>
          
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">
              {firstMeeting
                ? firstMeeting.state?.startsAt?.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "Schedule a meeting"}
            </h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">
              {firstMeeting
                ? firstMeeting.state?.startsAt?.toLocaleDateString([], {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Explore seamless experience"}
            </p>
          </div>
        </div>
      </div>
      <MeetingTypeList />
    </section>
  );
};

export default Home;
