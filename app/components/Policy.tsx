import {
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  AlertTriangle,
  Wrench,
  CloudRain,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Footer from "../components/Footer";
import Link from "next/link";

const Policy = () => {
  return (
    <main className="min-h-screen bg-black">
      {/* --- HERO SECTION --- */}
      <section className="relative py-20 px-6 md:px-12 lg:px-24 border-b border-red-900/30 bg-gradient-to-b from-black to-neutral-900">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#dc143c]"></div>
            <div className="w-2 h-2 rotate-45 bg-[#dc143c]"></div>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#dc143c]"></div>
          </div>

          <h1 className="font-russo text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] lg:leading-[1.1] tracking-tight">
            Precision. Passion. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] via-red-500 to-[#dc143c] bg-[length:200%_auto] animate-gradient">
              Perfection.
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Thank you for choosing{" "}
            <span className="font-russo text-[#dc143c] font-bold">
              Red Line
            </span>
            . We deliver an elite, showroom-quality finish — your car protected,
            flawless, and looking its absolute best. No shortcuts. No
            compromise.
          </p>
        </div>
      </section>

      {/* --- CONTENT GRID --- */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 border-b border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 1. Availability */}
          <PolicyCard
            icon={<Calendar className="w-9 h-9 text-[#dc143c]" />}
            title="Availability & Schedule"
            content={
              <p>
                Our services are
                <Highlight text=" currently available on weekends" />, with
                <Highlight text=" limited availability during selected holidays" />
                . We operate <Highlight text="by appointment only" /> to ensure
                each vehicle receives our full attention. Early booking is
                highly recommended as slots are extremely limited.
              </p>
            }
          />

          {/* 2. Advance Booking */}
          <PolicyCard
            icon={<Clock className="w-9 h-9 text-[#dc143c]" />}
            title="Advance Booking Requirement"
            content={
              <p>
                Appointments must be scheduled{" "}
                <Highlight text=" at least 24 hours prior" />. Once submitted,
                we review, verify availability, and confirm service details.{" "}
                <Highlight
                  text=" Your appointment is not officially confirmed until you
                receive our notice"
                />
                .
              </p>
            }
          />

          {/* 3. Reservation Fee (Highlighted) */}
          <PolicyCard
            icon={<CreditCard className="w-9 h-9 text-[#dc143c]" />}
            title="Reservation Fee"
            content={
              <p>
                A <Highlight text="non-refundable reservation fee of 50% " />
                to secure your exclusive slot.
                <Highlight
                  text=" This fee is deducted from your total service
                cost"
                />
                . Failure to submit within the timeframe results in automatic
                cancellation.
              </p>
            }
          />

          {/* 4. Travel Policy */}
          <PolicyCard
            icon={<MapPin className="w-9 h-9 text-[#dc143c]" />}
            title="Travel & Distance Policy"
            content={
              <p>
                For areas outside our standard{" "}
                <Highlight text="5km service radius" />, a{" "}
                <Highlight
                  text="travel fee
                applies based on distance"
                />
                . Travel distance is calculated from our base location using
                Google Maps driving distance and{" "}
                <Highlight
                  text="will be
                added to your total service cost"
                />
                .
              </p>
            }
          />

          {/* 5. Cancellation */}
          <PolicyCard
            icon={<AlertTriangle className="w-9 h-9 text-[#dc143c]" />}
            title="Cancellation & Rescheduling"
            content={
              <p>
                Rescheduling must be requested{" "}
                <Highlight text="at least 24 hours before your appointment" />.
                Late cancellations or no-shows result in the
                <Highlight text=" forfeiture of the reservation fee" />.
              </p>
            }
          />

          {/* 6. Service Conditions */}
          <PolicyCard
            icon={<Wrench className="w-9 h-9 text-[#dc143c]" />}
            title="Service Conditions"
            content={
              <p>
                To ensure optimal results, we require
                <Highlight
                  text=" access to electricity and
                water, as well as a dedicated work area "
                />
                that is safe and clear of obstacles. We do not provide services
                on sidewalks.
              </p>
            }
          />

          {/* 7. Weather */}
          <PolicyCard
            icon={<CloudRain className="w-9 h-9 text-[#dc143c]" />}
            title="Weather Considerations"
            content={
              <p>
                Severe weather may affect appointments.{" "}
                <Highlight text="We may reschedule" /> to maintain quality and
                safety, <Highlight text="or offer a full refund of your " />
                reservation fee if rescheduling is not possible.
              </p>
            }
          />

          {/* 8. Pricing Disclaimer */}
          <PolicyCard
            icon={<DollarSign className="w-9 h-9 text-[#dc143c]" />}
            title="Pricing Disclaimer"
            content={
              <p>
                <Highlight text="Rates are fixed" /> according to vehicle size.
                <Highlight text=" Additional charges may apply depending on vehicle conditions" />
                . Any adjustments are communicated and approved before service
                begins.
              </p>
            }
          />

          {/* 9. Add-Ons */}
          <PolicyCard
            icon={<PlusCircle className="w-9 h-9 text-[#dc143c]" />}
            title="Add-On Services"
            content={
              <p>
                You may request additional services during your appointment.
                <Highlight text=" Quick add-ons are provided on the spot" />,
                while
                <Highlight
                  text=" more extensive
                requests will be reviewed beforehand"
                />
                , as they may affect the timing of other appointments.
              </p>
            }
          />

          {/* 10. Satisfaction Guarantee */}
          <PolicyCard
            icon={<CheckCircle2 className="w-9 h-9 text-[#dc143c]" />}
            title="Satisfaction Guarantee"
            content={
              <p>
                <Highlight text="Your satisfaction is our top priority" />. If
                you are not completely satisfied with our work,
                <Highlight text=" we will reassess and correct it" /> — no
                questions asked.
              </p>
            }
          />

          {/* 12. Commitment */}
          <div className="md:col-span-2 bg-neutral-900 border border-red-900/30 p-8 md:p-12 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#dc143c]"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl text-white mb-2 font-russo">
                  Our Commitment to Excellence
                </h3>
                <p className="text-gray-400 font-poppins">
                  Precision in Every Detail. Passion in Every Stroke. Perfection
                  in Every Finish.
                </p>
              </div>
              <Link
                href="/booking"
                className="group bg-[#dc143c] hover:bg-red-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-xl transition duration-300 shadow-[0_0_30px_rgba(220,20,60,0.3)] hover:shadow-[0_0_40px_rgba(220,20,60,0.5)] flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
              >
                Book With Confidence
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

// --- REUSABLE COMPONENT ---
function PolicyCard({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div className="group relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 lg:p-10 hover:border-[#dc143c]/50 transition-all duration-700 hover:-translate-y-3">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`p-2 rounded-sm bg-neutral-800 group-hover:bg-red-900/20 transition-colors`}
        >
          {icon}
        </div>
        <h3 className="font-russo relative text-xl lg:text-xl font-bold text-white leading-[1.1] lg:leading-[1.1] tracking-tight group-hover:text-[#dc143c] transition-colors duration-300">
          {title}
        </h3>
      </div>

      <div className="relative text-gray-400 text-base max-w-3xl  leading-loose tracking-wide">
        {content}
      </div>
    </div>
  );
}

function Highlight({ text }: { text: string }) {
  return <strong className="text-[#dc143c]">{text}</strong>;
}

export default Policy;
