// src/hooks/useUserTour.ts
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const useUserTour = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024; // matches your 'lg' breakpoint
  const startTour = () => {
    const driverObj = driver({
      stagePadding: 5,
      popoverOffset: 12,
      showProgress: true,
      animate: true,
      // Customizing for your Lime/Black theme
      popoverClass: 'driverjs-theme', 
      steps: [
        { 
          element: '#feed-tab-all', 
          popover: { 
            title: 'Available Tasks', 
            description: 'Check out all the latest social tasks here. New ones appear daily!',
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '.engage-button', 
          popover: { 
            title: 'Step 1: Engage', 
            description: 'Click this to open X and perform the action (Like, Retweet, etc.).',
            side: "top" 
          } 
        },
        { 
          element: '.verify-button', 
          popover: { 
            title: 'Step 2: Verify', 
            description: 'Once done, upload your screenshot proof here to claim your credits.',
            side: "top" 
          } 
        },
        // { 
        //   element: '#nav-activity', 
        //   popover: { 
        //     title: 'Track Earnings', 
        //     description: 'Monitor your pending approvals and see your history here.',
        //     side: "bottom" 
        //   } 
        // },
        {
            element: isMobile ? '#mobile-nav-activity' : '#desktop-nav-activity',
            popover: {
            title: 'Track Activity',
            description: 'Check your pending and approved tasks here.',
            side: isMobile ? "top" : "right", // Show above on mobile, to the side on desktop
            align: 'end'
            },
        },
      ]
    });

    driverObj.drive();
  };

  return { startTour };
};