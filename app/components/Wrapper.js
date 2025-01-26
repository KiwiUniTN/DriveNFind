"use client";
// Necessario in quanto le componenti di Clerk vengono renderizzate solo sul client 
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("./Navbar"), { ssr: false });
const ParkingMap = dynamic(() => import("./ParkingMap"), { ssr: false });

const wrapper =  ({spots}) => {
    
  return(
    <>
        <Navbar className='h-1/6 w-screen' />;
        <ParkingMap parkingSpots={spots} />
    </>
  )
}

export default wrapper