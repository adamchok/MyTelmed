import { Doctor, BookingType } from "@/app/props";
import dummyFacilities from "./dummyFacilities";

const generateAvailability = (dateRange?: { start: Date; end: Date }) => {
  const startDate = dateRange?.start || new Date();
  const endDate = dateRange?.end || new Date(startDate);
  if (!dateRange) {
    endDate.setDate(startDate.getDate() + 13);
  }

  const dateStrings: string[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const month = currentDate.toLocaleString("en-US", { month: "short" });
    const day = currentDate.getDate();
    dateStrings.push(`${month} ${day}`);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateStrings;
};

// Generate default availability for next 14 days
const defaultDateStrings = generateAvailability();

const dummyDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Aisyah Rahman",
    specialty: "Cardiology",
    facility: dummyFacilities[0], // Hospital Ampang
    image: "/icons/doctors/aisyah-rahman.png",
    phone: "03-4289 5001",
    email: "aisyah.rahman@ampanghospital.my",
    description: "Experienced cardiologist with 10+ years in interventional cardiology and patient care.",
    availability: defaultDateStrings.map((date, index) => {
      const weekend = index % 7 > 4;
      const booking: BookingType = weekend ? "none" : index % 3 === 0 ? "both" : index % 3 === 1 ? "video" : "physical";
      const count = booking === "none" ? 0 : (index % 5) + (index % 2 === 0 ? 4 : 0);
      return { date, count, booking };
    }),
  },
  {
    id: 2,
    name: "Dr. Lim Wei Ming",
    specialty: "Pediatrics",
    facility: dummyFacilities[1], // Hospital Banting
    image: "/icons/doctors/lim-wei-ming.png",
    phone: "03-4289 5002",
    email: "lim.weiming@bantinghospital.my",
    description: "Pediatrician passionate about child health, immunization, and family education.",
    availability: defaultDateStrings.map((date, index) => {
      const hasAvailability = index % 4 < 3;
      const booking: BookingType = !hasAvailability
        ? "none"
        : index % 3 === 0
        ? "both"
        : index % 3 === 1
        ? "video"
        : "physical";
      const count = booking === "none" ? 0 : (index % 3) + 1;
      return { date, count, booking };
    }),
  },
  {
    id: 3,
    name: "Dr. Siti Nurhaliza",
    specialty: "Dermatology",
    facility: dummyFacilities[2], // Clinic Kota Damansara
    image: "/icons/doctors/siti-nurhaliza.png",
    phone: "03-6140 1026",
    email: "siti.nurhaliza@kotadamansaraclinic.my",
    description: "Dermatologist specializing in skin disorders, cosmetic dermatology, and laser therapy.",
    availability: defaultDateStrings.map((date, index) => {
      const hasAvailability = index % 5 < 2;
      const booking: BookingType = !hasAvailability ? "none" : index % 2 === 0 ? "video" : "physical";
      const count = booking === "none" ? 0 : (index % 2) + 1;
      return { date, count, booking };
    }),
  },
  {
    id: 4,
    name: "Dr. Rajesh Kumar",
    specialty: "Orthopedics",
    facility: dummyFacilities[3], // Hospital Kuala Kubu Bharu
    image: "/icons/doctors/rajesh-kumar.png",
    phone: "03-4289 5003",
    email: "rajesh.kumar@kkbhospital.my",
    description: "Orthopedic surgeon with expertise in joint replacement and sports injuries.",
    availability: defaultDateStrings.map((date, index) => {
      const weekday = index % 7 < 5;
      const booking: BookingType = !weekday ? "none" : index % 3 === 1 ? "both" : index % 2 === 0 ? "video" : "physical";
      const count = booking === "none" ? 0 : 1 + (index % 2);
      return { date, count, booking };
    }),
  },
  {
    id: 5,
    name: "Dr. Noraini Hassan",
    specialty: "Family Medicine",
    facility: dummyFacilities[4], // Clinic Ijok
    image: "/icons/doctors/noraini-hassan.png",
    phone: "03-3279 1167",
    email: "noraini.hassan@ijokclinic.my",
    description: "Family physician providing comprehensive care for all ages.",
    availability: defaultDateStrings.map((date, index) => {
      const midWeek = index % 7 >= 2 && index % 7 <= 4;
      const booking: BookingType = !midWeek ? "none" : index % 3 === 0 ? "both" : index % 2 === 0 ? "video" : "physical";
      const count = booking === "none" ? 0 : 2;
      return { date, count, booking };
    }),
  },
  {
    id: 6,
    name: "Dr. Ahmad Zahir",
    specialty: "Neurology",
    facility: dummyFacilities[5], // Hospital Kuala Lumpur
    image: "/icons/doctors/aisyah-rahman.png",
    phone: "03-5562 3390",
    email: "ahmad.zahir@kl-hospital.my",
    description: "Neurologist specializing in stroke prevention, headache treatment, and neurological disorders.",
    availability: defaultDateStrings.map((date, index) => {
      const weekEndOnly = index % 7 > 4;
      const booking: BookingType = !weekEndOnly ? "none" : index % 2 === 0 ? "physical" : "both";
      const count = booking === "none" ? 0 : 3 + (index % 3);
      return { date, count, booking };
    }),
  },
  {
    id: 7,
    name: "Dr. Priya Sharma",
    specialty: "Gynecology",
    facility: dummyFacilities[2], // Using Clinic Kota Damansara
    image: "/icons/doctors/siti-nurhaliza.png",
    phone: "03-7723 1854",
    email: "priya.sharma@whclinic.my",
    description: "Gynecologist with expertise in women's reproductive health and prenatal care.",
    availability: defaultDateStrings.map((date, index) => {
      const evenDaysOnly = index % 2 === 0;
      const booking: BookingType = !evenDaysOnly ? "none" : index % 3 === 0 ? "both" : "video";
      const count = booking === "none" ? 0 : 2 + (index % 4);
      return { date, count, booking };
    }),
  },
  {
    id: 8,
    name: "Dr. Tan Wei Chen",
    specialty: "Dermatology",
    facility: dummyFacilities[7], // Subang Jaya Medical Centre
    image: "/icons/doctors/lim-wei-ming.png",
    phone: "03-5639 1212",
    email: "tan.weichen@sjmc.my",
    description: "Dermatologist focusing on acne treatment, eczema, and cosmetic dermatology.",
    availability: defaultDateStrings.map((date, index) => {
      const weekdayOnly = index % 7 < 5;
      const booking: BookingType = !weekdayOnly ? "none" : index % 4 === 0 ? "both" : index % 4 === 1 ? "video" : "physical";
      const count = booking === "none" ? 0 : 1 + (index % 3);
      return { date, count, booking };
    }),
  },
  {
    id: 9,
    name: "Dr. Amir Ibrahim",
    specialty: "Psychiatry",
    facility: dummyFacilities[2], // Using Clinic Kota Damansara
    image: "/icons/doctors/rajesh-kumar.png",
    phone: "03-4265 8900",
    email: "amir.ibrahim@mentalwellness.my",
    description: "Psychiatrist specializing in anxiety disorders, depression, and behavioral therapy.",
    availability: defaultDateStrings.map((date, index) => {
      const oddDaysOnly = index % 2 !== 0;
      const booking: BookingType = !oddDaysOnly ? "none" : index % 3 === 1 ? "both" : "video";
      const count = booking === "none" ? 0 : 4 - (index % 3);
      return { date, count, booking };
    }),
  },
  {
    id: 10,
    name: "Dr. Sarah Abdullah",
    specialty: "Pediatrics",
    facility: dummyFacilities[9], // Klinik Pergigian Ampang
    image: "/icons/doctors/noraini-hassan.png",
    phone: "03-8912 4567",
    email: "sarah.abdullah@kpa.my",
    description: "Pediatrician specializing in childhood development and preventive healthcare.",
    availability: defaultDateStrings.map((date, index) => {
      const threeDayRotation = index % 3 === 0;
      const booking: BookingType = !threeDayRotation ? "none" : index % 2 === 0 ? "physical" : "both";
      const count = booking === "none" ? 0 : 3;
      return { date, count, booking };
    }),
  },
  {
    id: 11,
    name: "Dr. Mei Lin Wong",
    specialty: "Cardiology",
    facility: dummyFacilities[8], // Pantai Hospital Kuala Lumpur
    image: "/icons/doctors/siti-nurhaliza.png",
    phone: "03-2617 8200",
    email: "mei.lin@pantaihospital.my",
    description: "Cardiologist with expertise in heart failure management and cardiac rehabilitation.",
    availability: defaultDateStrings.map((date, index) => {
      const alternatingDays = index % 3 === 1;
      const booking: BookingType = !alternatingDays ? "none" : index % 2 === 0 ? "video" : "both";
      const count = booking === "none" ? 0 : 2 + (index % 3);
      return { date, count, booking };
    }),
  },
  {
    id: 12,
    name: "Dr. Jason Koh",
    specialty: "Orthopedics",
    facility: dummyFacilities[2], // Using Clinic Kota Damansara
    image: "/icons/doctors/lim-wei-ming.png",
    phone: "03-8996 7654",
    email: "jason.koh@sportsmedicine.my",
    description: "Orthopedic surgeon specializing in sports injuries and joint reconstruction.",
    availability: defaultDateStrings.map((date, index) => {
      const weekdaysOnly = index % 7 < 5;
      const booking: BookingType = !weekdaysOnly
        ? "none"
        : index % 4 === 0
        ? "both"
        : index % 4 === 1
        ? "physical"
        : "video";
      const count = booking === "none" ? 0 : 1 + (index % 4);
      return { date, count, booking };
    }),
  },
  {
    id: 13,
    name: "Dr. Rajiv Menon",
    specialty: "Internal Medicine",
    facility: dummyFacilities[10], // Gleneagles Hospital
    image: "/icons/doctors/rajesh-kumar.png",
    phone: "03-7118 2345",
    email: "rajiv.menon@gleneagles.my",
    description: "Internal medicine specialist focusing on preventive care and chronic disease management.",
    availability: defaultDateStrings.map((date, index) => {
      const everyOtherDay = index % 2 === 0;
      const booking: BookingType = !everyOtherDay ? "none" : index % 3 === 0 ? "both" : "physical";
      const count = booking === "none" ? 0 : 2 + (index % 2);
      return { date, count, booking };
    }),
  },
  {
    id: 14,
    name: "Dr. Nur Azizah",
    specialty: "Family Medicine",
    facility: dummyFacilities[14], // Klinik Kesihatan Selayang
    image: "/icons/doctors/aisyah-rahman.png",
    phone: "03-6241 9876",
    email: "nur.azizah@selayang-clinic.my",
    description: "Family physician providing comprehensive and continuous care for patients of all ages.",
    availability: defaultDateStrings.map((date, index) => {
      const weekdaysOnly = index % 7 < 5;
      const booking: BookingType = !weekdaysOnly
        ? "none"
        : index % 3 === 0
        ? "video"
        : index % 3 === 1
        ? "physical"
        : "both";
      const count = booking === "none" ? 0 : 3;
      return { date, count, booking };
    }),
  },
  {
    id: 15,
    name: "Dr. Lee Chong Wei",
    specialty: "Neurology",
    facility: dummyFacilities[7], // Subang Jaya Medical Centre
    image: "/icons/doctors/lim-wei-ming.png",
    phone: "03-8734 5612",
    email: "lee.chongwei@sjmc.my",
    description: "Neurologist specializing in movement disorders, epilepsy, and headache treatment.",
    availability: defaultDateStrings.map((date, index) => {
      const patternedSchedule = index % 4 === 2 || index % 4 === 3;
      const booking: BookingType = !patternedSchedule ? "none" : index % 3 === 0 ? "both" : "video";
      const count = booking === "none" ? 0 : 2 + (index % 3);
      return { date, count, booking };
    }),
  },
];

const generateDummyDoctors = (dateRange?: { start: Date; end: Date }): Doctor[] => {
  const availability = generateAvailability(dateRange);

  return dummyDoctors.map((doctor) => {
    const doctorAvailability = availability.map((date, index) => {
      const doctorId = doctor.id;
      let booking: BookingType = "none";
      let count = 0;

      switch (doctorId % 5) {
        case 0: // Weekend specialists
          booking = index % 7 > 4 ? (index % 2 === 0 ? "physical" : "both") : "none";
          break;
        case 1: // Weekday only
          booking = index % 7 < 5 ? (index % 3 === 0 ? "both" : index % 3 === 1 ? "video" : "physical") : "none";
          break;
        case 2: // Every other day
          booking = index % 2 === 0 ? (index % 3 === 0 ? "both" : "video") : "none";
          break;
        case 3: // Three day rotation
          booking = index % 3 === 0 ? (index % 2 === 0 ? "physical" : "both") : "none";
          break;
        case 4: // Mid-week specialist
          booking = index % 7 >= 2 && index % 7 <= 4 ? (index % 2 === 0 ? "video" : "physical") : "none";
          break;
      }

      if (booking !== "none") {
        count = 1 + (index % 4) + (doctorId % 3);
      }

      return { date, count, booking };
    });

    return {
      ...doctor,
      availability: doctorAvailability,
    };
  });
};

export { generateDummyDoctors };
