"use client";
import Image from "next/image";
import Link from "next/link";

export default function HOME() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-10 py-20 max-w-7xl mx-auto">
      {/* LEFT CONTENT */}
      <div className="md:w-1/2 space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Let’s <span className="text-gray-900">Connect</span>
          <br /> with Your Customer
          <br /> in <span className="text-gray-900">Real Time</span>
        </h1>

        <p className="text-gray-500 text-lg leading-relaxed">
          Lore Issue is simply dummy text of the printing and typesetting industry.
          Lore Issue has been the industry's standard dummy.
        </p>

        <div className="flex items-center gap-6">
          <Link
            href="/chat"
            className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold px-6 py-3 rounded-full shadow hover:opacity-90 transition"
          >
            Start Chatting Now
          </Link>

          <svg
            className="w-16 h-10 text-orange-400 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 48 24"
          >
            <path d="M2 12h44M34 2l10 10-10 10" />
          </svg>
        </div>

        {/* Stats Section */}
        <div className="flex items-center gap-10 mt-10">
          {/* Avatars */}
          <div className="flex -space-x-3">
            <Image
              src="/avatars/user1.jpg"
              alt="user1"
              width={40}
              height={40}
              className="rounded-full border-2 border-white"
            />
            <Image
              src="/avatars/user2.jpg"
              alt="user2"
              width={40}
              height={40}
              className="rounded-full border-2 border-white"
            />
            <Image
              src="/avatars/user3.jpg"
              alt="user3"
              width={40}
              height={40}
              className="rounded-full border-2 border-white"
            />
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-900">1500</p>
            <p className="text-gray-500 text-sm">Happy Customers</p>
          </div>

          <div>
            <p className="text-xl font-semibold text-gray-900">4.8/5</p>
            <p className="text-gray-500 text-sm">⭐ Happy Customers</p>
          </div>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="relative mt-10 md:mt-0 md:w-1/2 flex justify-center">
        {/* Orange Circle Background */}
        <div className="absolute top-0 w-[350px] h-[350px] bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full -z-10"></div>

        {/* Hero Image */}
        <Image
          src="/hero.png"
          alt="hero image"
          width={400}
          height={400}
          className="rounded-2xl object-cover"
        />

        {/* Chat Bubble 1 */}
        <div className="absolute bottom-10 left-0 bg-white rounded-lg shadow-lg px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
          <Image
            src="/avatars/user2.jpg"
            alt="chat avatar"
            width={30}
            height={30}
            className="rounded-full"
          />
          <p>Lore Issue is simply dummy text of the printing...</p>
        </div>

        {/* Chat Bubble 2 */}
        <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
          <Image
            src="/avatars/user3.jpg"
            alt="chat avatar"
            width={30}
            height={30}
            className="rounded-full"
          />
          <p>Lore Issue is simply dummy text of the printing...</p>
        </div>
      </div>
    </section>
  );
}
