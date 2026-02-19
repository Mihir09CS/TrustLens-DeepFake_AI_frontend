import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Sparkles,
  Upload,
  Cpu,
  FileBarChart2,
  Share2,
  Star,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

const toolCards = [
  { title: "Social Media Profile", score: "89%Deepfake", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=70" },
  { title: "Parade images", score: "45%Deepfake", img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=70" },
  { title: "Financial Document", score: "31%Deepfake", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=70" },
  { title: "Video Calls", score: "67%Deepfake", img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=900&q=70" },
  { title: "News Media", score: "15%Deepfake", img: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=70" },
  { title: "Scam Calls", score: "22%Deepfake", img: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=70" },
];

const howToSteps = [
  {
    title: 'Step 1: Upload Your File',
    icon: <Upload size={16} className="text-cyan-300" />,
    text: `Click the "Upload" button and choose the file you want to check. You can upload images, videos, or audio. We support most formats—JPEG, MP4, MP3, PNG, and more. No sign-up, no fuss. Just pick a file from your device.`,
  },
  {
    title: "Step 2: Let AI Do the Work",
    icon: <Cpu size={16} className="text-cyan-300" />,
    text: "Once your file is uploaded, our AI-powered system starts analyzing it. We use deep learning and neural networks to scan for signs of deepfake manipulation. It usually takes just 5 seconds. I actually timed it—faster than brewing tea.",
  },
  {
    title: "Step 3: View the Results",
    icon: <FileBarChart2 size={16} className="text-cyan-300" />,
    text: `Boom—results appear! You'll see a clear score showing how "real" or "fake" your file is. There's also a simple summary and a detailed report for deep dives. You even get some cultural insights if the image matches historical data. Kinda cool, right?`,
  },
  {
    title: "Step 4: Download or Share",
    icon: <Share2 size={16} className="text-cyan-300" />,
    text: 'Want to save or share your results? Easy. Click "Download" for a full report or "Copy Link" to share your deepfake check with friends or your team. And yes—totally free, always. No paywall surprises.',
  },
];

const stories = [
  {
    title: "Teachers Spotting Fake Historical Photos",
    img: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=70",
    text: 'History teachers often use our AI deepfake detection tool in class to show students how to spot fake images. They upload a picture, get an instant authenticity score, and use the result to explain how digital media can be misleading. One teacher even told us, "I like how fast it is—it lets us jump right into discussion." It\'s a smart way to blend tech with education—and honestly, it\'s a bit fun, too.',
  },
  {
    title: "Journalists Verifying Viral Videos",
    img: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=70",
    text: 'News reporters use our tool to check if viral videos online are real or digitally altered. Before publishing anything, they upload the clip, run the AI check, and download the detailed report for their editorial team. One journalist said, "This saved me from reporting a fake." When the news moves fast, real-time deepfake detection makes all the difference.',
  },
  {
    title: "Creators Protecting Their Online Content",
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=70",
    text: 'Some YouTubers and streamers use our platform to check if their face or voice is being copied online. Just upload a video, get the AI analysis, and see if someone\'s deepfaking your identity. One creator told us, "I found a fake version of me promoting a scam—this helped me shut it down." That\'s a serious win for digital safety.',
  },
  {
    title: "Families Checking Deepfake Scam Calls",
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=70",
    text: 'A dad uploaded an audio message that sounded like his daughter asking for help. It was fake. Deepfake voice scams are scary, but tools like ours help families protect themselves. Upload the clip, see the voice authenticity report, and breathe easy. As he said, "I almost fell for it. I\'m glad I checked."',
  },
];

const trustPoints = [
  {
    title: "Simple & Free to Use",
    text: "Just upload and go. There's no sign-up, no ads, and no limits. Whether you're a teacher, journalist, or just curious, you'll get fast results with zero hassle. It works on all devices and it's completely free—forever. I use it weekly and still can't believe it's this easy.",
  },
  {
    title: "Natural, Accurate Results",
    text: "Our AI deepfake detector doesn't just flag fakes—it explains them. You'll get three result types, including a clear score and side-by-side comparisons. The results are readable, well-formatted, and make perfect sense. I love how it feels like reading plain English, not a tech manual.",
  },
  {
    title: "See Words in Real-World Use",
    text: "This tool doesn't just tell you what's fake—it shows you where and how that fake content would appear. From newsrooms to classrooms, you'll see context and meaning in action. It's a real eye-opener, and honestly, it makes spotting AI-generated stuff kinda fun.",
  },
  {
    title: "Your Privacy Stays Private",
    text: "We don't save your files. Period. All analysis is done securely, and nothing leaves your screen without your say. No creepy tracking, no hidden data grabs. I've checked—this is one of the most respectful tools I've ever used.",
  },
];

const faqItems = [
  "What is deepfake detection?",
  "How does deepfake detection work?",
  "How does deepfake detection work (again)?",
  "Which platforms specialize in real-time deepfake detection?",
  "How do deepfake detection tools integrate with phishing protection?",
  "How effective are current deepfake detection tools?",
  "How effective are deepfake detection tools in real-world scenarios?",
  "How does Reality Defender ensure the accuracy of its deepfake detection?",
  "What are the limitations of current deepfake detection technologies?",
  "What are the latest advancements in deepfake detection?",
  "What are the latest innovations in deepfake detection technology?",
  "What's on the horizon for deepfake detection?",
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-slate-100">
      <style>{`
        @keyframes gridPulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.5; }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0) rotateX(0deg); }
          50% { transform: translateY(-10px) rotateX(3deg); }
        }
        @keyframes beam {
          0% { transform: translateX(-120%); opacity: 0; }
          20% { opacity: 0.3; }
          100% { transform: translateX(220%); opacity: 0; }
        }
      `}</style>

      <div className="absolute inset-0 cyber-grid" style={{ animation: "gridPulse 6s ease-in-out infinite" }} />
      <div className="pointer-events-none absolute -top-20 left-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-100 p-6 text-slate-900 shadow-2xl md:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                <Shield size={13} />
                TrustLens AI
              </div>

              <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 sm:text-6xl">
                AI Deepfake
                <br />
                Detection Online
                <br />
                Free
              </h2>

              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Threat Intelligence Platform
              </p>

              <p className="mt-6 max-w-xl text-lg leading-9 text-slate-800">
                Use our AI deepfake detection tool to quickly check if an image, video, or voice is real or fake.
                You'll get fast results, clear reports, and even cultural insights-all for free.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 max-w-xl">
                <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-cyan-700">Threat Score</p>
                  <p className="mt-1 text-2xl font-black text-cyan-800">82 / 100</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-emerald-700">System Status</p>
                  <p className="mt-1 text-sm font-bold text-emerald-800">Operational</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full border border-slate-300 bg-white px-3 py-1">Image Model Ready</span>
                <span className="rounded-full border border-slate-300 bg-white px-3 py-1">Audio Model Ready</span>
                <span className="rounded-full border border-slate-300 bg-white px-3 py-1">Video Model Ready</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-300">
              <div className="grid grid-cols-2">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=70"
                    alt="Manipulated media example"
                    className="h-[520px] w-full object-cover"
                  />
                  <span className="absolute bottom-4 left-4 rounded bg-slate-900/70 px-3 py-1 text-sm font-semibold text-white">
                    Suspected Fake
                  </span>
                </div>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=1200&q=70"
                    alt="Authentic media example"
                    className="h-[520px] w-full object-cover"
                  />
                  <span className="absolute bottom-4 left-4 rounded bg-slate-900/70 px-3 py-1 text-sm font-semibold text-white">
                    Authentic
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14" id="about">
          <h3 className="text-3xl font-black text-white">Different Deepfake Detection Online</h3>
          <p className="mt-3 max-w-4xl text-slate-300">
            Whether it's for education, research, or just peace of mind-people love using our AI deepfake detection tool.
            Discover how it helps creators, researchers, and families stay safe and informed.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolCards.map((card) => (
              <div key={card.title} className="group overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/65 transition-all hover:-translate-y-1 hover:border-cyan-500/45">
                <img src={card.img} alt={card.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <p className="text-xs text-slate-400">{card.title}</p>
                  <p className="mt-1 text-lg font-black text-cyan-300">{card.score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-slate-800 bg-slate-900/55 p-8">
          <h3 className="text-3xl font-black text-white">How to Use Deepfake Detection</h3>
          <p className="mt-2 text-slate-300">
            It's super easy. Just follow these steps to check if an image, video, or voice is real-or totally fake.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {howToSteps.map((step) => (
              <div key={step.title} className="rounded-xl border border-slate-700/70 bg-slate-950/70 p-5">
                <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  {step.icon}
                  {step.title}
                </p>
                <p className="text-sm text-slate-300">{step.text}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm text-cyan-300">How to use Deepfake Detection tool - step by step guide</p>
          <Link to="/scanner" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20">
            Try Deepfake Detection Now
          </Link>
        </div>

        <div className="mt-14 space-y-6">
          {stories.map((item) => (
            <div key={item.title} className="grid gap-5 rounded-2xl border border-slate-800 bg-slate-900/45 p-5 md:grid-cols-[250px_1fr]">
              <img src={item.img} alt={item.title} className="h-44 w-full rounded-xl object-cover" />
              <div>
                <h4 className="text-xl font-bold text-white">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-300">{item.text}</p>
                <Link to="/scanner" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                  Try Deepfake Detection
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h3 className="text-3xl font-black text-white">Why Thousands Trust Our Deepfake Detection Tool</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {trustPoints.map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-700/70 bg-slate-900/65 p-5">
                <p className="text-lg font-bold text-cyan-300">{item.title}</p>
                <p className="mt-2 text-sm text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6">
          <p className="text-slate-100">
            "I used Deepfake Detection during a lesson on WWII photography. My students uploaded "real" images from the web-and were shocked by how many were fake. The results came fast, and the reports were easy enough for my 10th graders to understand. I now use it in every media literacy unit."
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Emily Harper</p>
              <p className="text-sm text-slate-300">High School History Teacher</p>
            </div>
            <div className="inline-flex items-center gap-1 text-amber-300">
              <Star size={14} className="fill-amber-300" />
              <span className="font-semibold">5.0</span>
            </div>
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          <h3 className="text-3xl font-black text-white">Frequently Asked Questions</h3>
          <div className="mt-5 space-y-2">
            {faqItems.map((q, idx) => {
              const open = openFaq === idx;
              return (
                <div key={q} className="overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950/70">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : idx)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="text-sm text-slate-200">{q}</span>
                    <ChevronDown size={15} className={`text-slate-400 transition-transform ${open ? "rotate-180 text-cyan-300" : ""}`} />
                  </button>
                  {open && (
                    <p className="px-4 pb-4 text-sm text-slate-400">
                      This answer is generated by TrustLens knowledge assistant. It explains detection methods, limitations, and best practices in practical language.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-8 text-center">
          <h3 className="text-3xl font-black text-white">Free Online Deepfake Detection at Your Fingertips</h3>
          <p className="mt-2 text-slate-200">
            Start using our deepfake detection tool online free today. It's fast, accurate, and made for everyone.
          </p>
          <Link to="/scanner" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400">
            Try Deepfake Detection Now
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="mb-3 inline-flex items-center gap-2 text-lg font-bold text-white">
              <Shield size={18} className="text-cyan-300" />
              Deepfake Detection Logo
            </div>
            <p className="text-sm text-slate-300">
              Deepfake Detection is a free AI-powered tool that helps you identify manipulated images, videos, and audio files to protect against misinformation and fraud.
            </p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-cyan-300">Deepfake Detection Tools</p>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>Deepfake Image Detection</li>
              <li>Deepfake Video Detection</li>
              <li>Deepfake Voice Detection</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-cyan-300">About</p>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>About Us</li>
              <li>Privacy Policy</li>
              <li>Contact</li>
              <li>hello@deepfakedetection.io</li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">© 2026 Deepfake Detection. All rights reserved.</p>
      </div>
    </section>
  );
}
