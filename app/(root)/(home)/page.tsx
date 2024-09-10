"use client";
import Loader from "@/components/Loader";
import MeetingCard from "@/components/MeetingCard";
import MeetingTypeList from "@/components/MeetingTypeList";
import { useGetCalls } from "@/hooks/useGetCalls";
import { formatDateTime } from "@/lib/utils";
import { Call } from "@stream-io/video-react-sdk";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Home = () => {
  const router = useRouter();
  const { upcomingCalls, isLoading } = useGetCalls();
  const [timeLeft, setTimeLeft] = useState<string>("");

  const sortedUpcomingCalls =
    upcomingCalls?.sort((a: Call, b: Call) => {
      const dateA = a.state?.startsAt
        ? new Date(a.state?.startsAt).getTime()
        : 0;
      const dateB = b.state?.startsAt
        ? new Date(b.state?.startsAt).getTime()
        : 0;
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

  // Helper function to check if a date is today
  const isToday = (dateString: Date | string | undefined) => {
    if (!dateString) return false;

    const meetingDate = new Date(dateString);
    const today = new Date();

    // Check if meeting is today (ignoring time)
    return (
      meetingDate.getFullYear() === today.getFullYear() &&
      meetingDate.getMonth() === today.getMonth() &&
      meetingDate.getDate() === today.getDate()
    );
  };

  // Filter only today's meetings
  const todaysMeetings = sortedUpcomingCalls.filter((meeting: Call) =>
    isToday(meeting.state?.startsAt?.toString())
  ).slice(0, 2);


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
      <div className="flex w-full flex-col text-white">
        <div className="flex w-full items-center justify-between mb-5">
          <h2 className="text-[16px] font-bold tracking-wide lg:text-[20px]">
            Today's Upcoming Meetings
          </h2>
          <Link href="/upcoming" className="text-[16px] font-bold tracking-wide lg:text-[20px] cursor-pointer hover:text-orange-1">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {todaysMeetings && todaysMeetings.length > 0 ? (
            todaysMeetings.map((meeting: Call) => (
              <MeetingCard
                key={(meeting as Call).id}
                icon="/icons/upcoming.svg"
                title={(meeting as Call).state?.custom?.description}
                date={formatDateTime(
                  (meeting as Call).state?.startsAt?.toLocaleString()
                )}
                isPreviousMeeting={false}
                link={`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${
                  (meeting as Call).id
                }`}
                buttonIcon1={undefined}
                buttonText={"Start"}
                handleClick={() =>
                  router.push(`/meeting/${(meeting as Call).id}`)
                }
              />
            ))
          ) : (
            <h1 className="text-2xl font-bold text-white">
              No Upcoming Meeting found Today's
            </h1>
          )}
        </div>
      </div>
    </section>
  );
};

export default Home;
